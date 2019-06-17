import json
import multiprocessing
import os
import random
from multiprocessing.dummy import Pool

from baselines.a2c.a2c import Model
import time
import functools
import tensorflow as tf

from baselines import logger

from baselines.common import set_global_seeds, explained_variance
from baselines.common import tf_util
from baselines.common.policies import build_policy


from baselines.a2c.utils import Scheduler, find_trainable_variables, discount_with_dones
from baselines.a2c.runner import Runner
from baselines.common.runners import AbstractEnvRunner
from baselines.ppo2.ppo2 import safemean
from collections import deque
import numpy as np
from tensorflow import losses

from hx_controller.haxball_vecenv import HaxballSubProcVecEnv


class A2CModel(object):

    """
    We use this class to :
        __init__:
        - Creates the step_model
        - Creates the train_model

        train():
        - Make the training part (feedforward and retropropagation of gradients)

        save/load():
        - Save load the model
    """
    def __init__(self, policy, env, nsteps, model_name="a2c_model",
            ent_coef=0.01, vf_coef=0.5, max_grad_norm=0.5, lr=7e-4,
            alpha=0.99, epsilon=1e-5, total_timesteps=int(80e6), lrschedule='linear'):

        self.model_name = model_name
        self.lr = lr

        sess = tf_util.get_session()
        nenvs = env.num_envs
        nbatch = nenvs*nsteps


        with tf.variable_scope(model_name, reuse=tf.AUTO_REUSE):
            # step_model is used for sampling
            step_model = policy(None, 1, sess)

            # train_model is used to train our network
            train_model = policy(None, nsteps, sess)

        A = tf.placeholder(train_model.action.dtype, train_model.action.shape)
        ADV = tf.placeholder(tf.float32, (None, ))
        R = tf.placeholder(tf.float32, (None, ))
        LR = tf.placeholder(tf.float32, [])

        # Calculate the loss
        # Total loss = Policy gradient loss - entropy * entropy coefficient + Value coefficient * value loss

        # Policy loss
        neglogpac = train_model.pd.neglogp(A)
        # L = A(s,a) * -logpi(a|s)
        pg_loss = tf.reduce_mean(ADV * neglogpac)

        # Entropy is used to improve exploration by limiting the premature convergence to suboptimal policy.
        entropy = tf.reduce_mean(train_model.pd.entropy())

        # Value loss
        # vf_loss = losses.mean_squared_error(tf.squeeze(train_model.vf), R)
        vf_loss = losses.mean_squared_error(train_model.vf, R)

        loss = pg_loss - entropy*ent_coef + vf_loss * vf_coef

        # Update parameters using loss
        # 1. Get the model parameters
        params = find_trainable_variables(model_name)

        # 2. Calculate the gradients
        grads = tf.gradients(loss, params)
        if max_grad_norm is not None:
            # Clip the gradients (normalize)
            grads, grad_norm = tf.clip_by_global_norm(grads, max_grad_norm)
        grads = list(zip(grads, params))
        # zip aggregate each gradient with parameters associated
        # For instance zip(ABCD, xyza) => Ax, By, Cz, Da

        # 3. Make op for one policy and value update step of A2C
        trainer = tf.train.RMSPropOptimizer(learning_rate=LR, decay=alpha, epsilon=epsilon)

        _train = trainer.apply_gradients(grads)

        lr = Scheduler(v=lr, nvalues=total_timesteps, schedule=lrschedule)

        def train(obs, states, rewards, masks, actions, values):
            # Here we calculate advantage A(s,a) = R + yV(s') - V(s)
            # rewards = R + yV(s')
            advs = rewards - values
            for step in range(len(obs)):
                cur_lr = lr.value()

            td_map = {train_model.X:obs, A:actions, ADV:advs, R:rewards, LR:cur_lr}
            if states is not None:
                td_map[train_model.S] = states
                td_map[train_model.M] = masks
            policy_loss, value_loss, policy_entropy, _ = sess.run(
                [pg_loss, vf_loss, entropy, _train],
                td_map
            )
            return policy_loss, value_loss, policy_entropy

        self.train = train
        self.train_model = train_model
        self.step_model = step_model
        self.step = step_model.step
        self.value = step_model.value
        self.initial_state = step_model.initial_state
        self.save = functools.partial(tf_util.save_variables, sess=sess, variables=params)
        self.load = functools.partial(tf_util.load_variables, sess=sess, variables=params)
        tf.global_variables_initializer().run(session=sess)

    def add_noise(self, mean=0.0, stddev=0.01):
        sess = tf_util.get_session()
        params = find_trainable_variables(self.model_name)
        for param in params:
            variables_shape = tf.shape(param)
            noise = tf.random_normal(
                variables_shape,
                mean=mean,
                stddev=stddev,
                dtype=tf.float32,
            )
            sess.run(tf.assign_add(param, noise))

    def load_variables_from_another_model(self, another_model_name):
        sess = tf_util.get_session()
        params = find_trainable_variables(self.model_name)
        another_params = find_trainable_variables(another_model_name)
        for pair in zip(params, another_params):
            sess.run(tf.assign(pair[0], pair[1]))


class MultimodelRunner(AbstractEnvRunner):
    def __init__(self, env, models, nsteps=5, gamma=0.99, ratings=None):
        super().__init__(env=env, model=models[0], nsteps=nsteps)
        self.models = models
        self.m = len(models)
        self.gamma = gamma
        self.batch_action_shape = [x if x is not None else -1 for x in models[0].train_model.action.shape.as_list()]
        self.ob_dtype = models[0].train_model.X.dtype.as_numpy_dtype
        self.tp = Pool(len(self.models))

        # self.models_indexes = [[] for _ in range(self.m)]
        # l = 0
        # for k in range(self.m ** 2):
        #     i = k // self.m
        #     j = k % self.m
        #     if i == j:
        #         continue
        #     self.models_indexes[i].append(l)
        #     self.models_indexes[j].append(l)
        #     l += 1

        self.models_indexes = [[] for _ in range(self.m)]
        self.players_indexs = {}
        l = 0
        for k in range(self.m ** 2):
            i = k // self.m
            j = k % self.m
            if i == j:
                continue
            self.players_indexs[l] = (i, j)
            el = l * 2
            self.models_indexes[i].append(el)
            self.models_indexes[j].append(el + 1)
            l += 1

        l = 2 * (self.m - 1)
        self.mb_models_indexes = np.zeros(shape=(self.m, self.nsteps * l), dtype=np.int16)
        for i in range(self.m):
            for nstep in range(self.nsteps):
                self.mb_models_indexes[i, nstep*l:(nstep+1)*l] = nstep * 2 * self.m * (self.m - 1) + np.array(self.models_indexes[i])

        if ratings is None:
            self.ratings = [1200] * self.m
        else:
            self.ratings = ratings

    def model_step(self, args):
        model, obs, states, dones = args
        return model.step(obs, S=states, M=dones)

    def model_train(self, args):
        model, obs, states, rewards, masks, actions, values = args
        return model.train(obs, states, rewards, masks, actions, values)

    def model_value(self, args):
        model, obs, states, dones = args
        return model.value(obs, S=states, M=dones).tolist()

    def do_model_train(self, obs, states, rewards, masks, actions, values, test):
        # obs_chunks = []
        # states_chunks = []
        # rewards_chunks = []
        # masks_chunks = []
        # actions_chunks = []
        # values_chunks = []
        train_results = []
        for i, model in enumerate(self.models):
            indexes = self.mb_models_indexes[i,:]

            obs_i = obs[indexes]
            inv_obs = self.env.invert_states(obs_i)
            obs_i = np.vstack((obs_i, inv_obs))
            # obs_chunks.append(obs_i)

            # states_chunks.append(None)

            rewards_i = rewards[indexes]
            rewards_i = np.hstack((rewards_i, rewards_i))
            # rewards_chunks.append(rewards_i)

            masks_i = masks[indexes]
            masks_i = np.hstack((masks_i, masks_i))
            # masks_chunks.append(masks_i)

            actions_i = actions[indexes]
            inv_actions = env.invert_actions(actions_i)
            actions_i = np.hstack((actions_i, inv_actions))
            # actions_chunks.append(actions_i)

            values_i = values[indexes]
            values_i = np.hstack((values_i, values_i))
            # values_chunks.append(values_i)

            train_results_tmp = model.train(obs_i, None, rewards_i, masks_i, actions_i, values_i)
            # train_results_tmp = self.tp.map(self.model_train, zip(self.models, obs_chunks, states_chunks, rewards_chunks, masks_chunks, actions_chunks, values_chunks))
            train_results.append(train_results_tmp)

        policy_loss, value_loss, policy_entropy = zip(*train_results)
        return policy_loss, value_loss, policy_entropy

    def process_winners(self, result_scores):
        for i, score in enumerate(result_scores):
            if score is not None:
                red_model_i, blue_model_i = self.players_indexs[i]
                exp_score = self.expected_score(self.ratings[red_model_i], self.ratings[blue_model_i])
                new_rating_red = self.ratings[red_model_i] + 32 * (score - exp_score)
                new_rating_blue = self.ratings[blue_model_i] + 32 * (-score + exp_score)
                # TODO: non è coretto, le partite sono sincrone, non devo aggiornare gli ELO sequenzialmente
                self.ratings[red_model_i] = new_rating_red
                self.ratings[blue_model_i] = new_rating_blue

    def expected_score(self, player_rating: int, opponent_rating: int) -> float:
        return 1 / (1 + 10 ** ((opponent_rating - player_rating) / 400))

    def run(self):
        # We initialize the lists that will contain the mb of experiences
        mb_obs, mb_rewards, mb_actions, mb_values, mb_dones = [], [], [], [], []
        # mb_test = []
        mb_states = self.states
        epinfos = []
        for n in range(self.nsteps):
            # Given observations, take action and value (V(s))
            # We already have self.obs because Runner superclass run self.obs[:] = env.reset() on init
            obs_chunks = []
            dones_chunks = []
            # l = 2 * self.m * (self.m - 1)
            # mb_test.append(list(range(n * l, (n + 1) * l)))
            for i in range(self.m):
                obs_tmp = self.obs[self.models_indexes[i]]
                dones_tmp = np.array(self.dones)[self.models_indexes[i]]
                obs_chunks.append(obs_tmp)
                dones_chunks.append(dones_tmp)

            models_results = []
            for i, model in enumerate(self.models):
                res = model.step(obs_chunks[i], S=[None], M=dones_chunks[i])
                models_results.append(res)
            # models_results = self.tp.map(self.model_step, zip(self.models, obs_chunks, [None]*self.m, dones_chunks))
            actions, values, states, _ = zip(*models_results)

            actions_to_send = np.zeros(shape=(2 * self.m * (self.m - 1)))
            values_to_send = np.zeros(shape=(2 * self.m * (self.m - 1)))
            for i in range(self.m):
                actions_to_send[self.models_indexes[i]] = actions[i]
                values_to_send[self.models_indexes[i]] = values[i]
            states = np.squeeze(states)

            # Append the experiences
            mb_obs.append(np.copy(self.obs))
            mb_actions.append(actions_to_send)
            mb_values.append(values_to_send)
            mb_dones.append(self.dones)

            # Take actions in env and look the results
            obs, rewards, dones, infos = self.env.step(actions_to_send)
            result_scores = [info['score'] for info in infos[::2]]
            self.process_winners(result_scores)
            # for info in infos:
            #     maybeepinfo = info.get('episode')
            #     if maybeepinfo: epinfos.append(maybeepinfo)
            self.states = states
            self.dones = dones
            self.obs = obs
            mb_rewards.append(rewards)
        mb_dones.append(self.dones)

        # Batch of steps to batch of rollouts
        mb_obs = np.asarray(mb_obs, dtype=self.ob_dtype).swapaxes(1, 0).reshape(self.batch_ob_shape)
        # mb_obs = np.concatenate(mb_obs)  # TODO: ho cambiato io
        mb_rewards = np.asarray(mb_rewards, dtype=np.float32).swapaxes(1, 0)
        mb_actions = np.asarray(mb_actions, dtype=self.model.train_model.action.dtype.name).swapaxes(1, 0)
        # mb_test = np.asarray(mb_test, dtype=self.model.train_model.action.dtype.name).swapaxes(1, 0)
        mb_values = np.asarray(mb_values, dtype=np.float32).swapaxes(1, 0)
        mb_dones = np.asarray(mb_dones, dtype=np.bool).swapaxes(1, 0)
        mb_masks = mb_dones[:, :-1]
        mb_dones = mb_dones[:, 1:]

        if self.gamma > 0.0:
            # Discount/bootstrap off value fn

            # obs_chunks = []
            # dones_chunks = []
            last_values = []
            for i, model in enumerate(self.models):
                obs_tmp = self.obs[self.models_indexes[i]]
                dones_tmp = np.array(self.dones)[self.models_indexes[i]]
                # obs_chunks.append(obs_tmp)
                # dones_chunks.append(dones_tmp)
                last_values_tmp = model.value(obs_tmp, S=[None], M=dones_tmp).tolist()
                last_values.append(last_values_tmp)
            # last_values = self.tp.map(self.model_value, zip(self.models, obs_chunks, [None]*self.m, dones_chunks))
            # actions, values, states, _ = zip(*models_results)
            last_values_to_send = np.zeros(shape=(2 * self.m * (self.m - 1)))
            for i in range(self.m):
                last_values_to_send[self.models_indexes[i]] = last_values[i]
            last_values = last_values_to_send.tolist()
            # last_values = self.model.value(self.obs, S=self.states, M=self.dones).tolist()

            for n, (rewards, dones, value) in enumerate(zip(mb_rewards, mb_dones, last_values)):
                rewards = rewards.tolist()
                dones = dones.tolist()
                if dones[-1] == 0:
                    rewards = discount_with_dones(rewards + [value], dones + [0], self.gamma)[:-1]
                else:
                    rewards = discount_with_dones(rewards, dones, self.gamma)

                mb_rewards[n] = rewards

        mb_actions = mb_actions.reshape(self.batch_action_shape)
        # mb_actions = mb_actions.T.flatten()  # TODO: ho cambiato io
        # mb_test = mb_test.T.flatten()  # TODO: ho cambiato io

        mb_rewards = mb_rewards.flatten()
        # mb_rewards = mb_rewards.T.flatten()  # TODO: ho cambiato io
        mb_values = mb_values.flatten()
        mb_masks = mb_masks.flatten()
        return mb_obs, mb_states, mb_rewards, mb_masks, mb_actions, mb_values, epinfos, mb_test


if __name__ == '__main__':
    # Round-robin
    num_players = 4 if multiprocessing.cpu_count() <= 4 else 22
    game_max_duration = 2  # minuti
    gamma = 0.99
    nsteps = 1
    log_interval = 100
    load_path = None
    load_path = 'ciao.h5'
    total_timesteps = int(15e8)

    # la gliglia per torneo
    num_fields = num_players * (num_players - 1)
    env = HaxballSubProcVecEnv(num_fields=num_fields, max_ticks=int(60 * game_max_duration * (1 / 0.1)))
    # env = make_vec_env(env_id='PongNoFrameskip-v4', env_type=None, num_env=nenvs, seed=0)
    # policy = build_policy(env=env, policy_network='lstm')#, num_layers=4, num_hidden=128)
    policy = build_policy(env=env, policy_network='mlp', num_layers=4, num_hidden=256)

    models = []
    runners = []
    ratings = [1200] * num_players
    for i in range(num_players):
        fn = 'models/' + str(i) + '.params.json'
        if os.path.exists(fn):
            with open(fn, 'r') as fp:
                params = json.load(fp)
        else:
            params = {
                'lr': 7e-4,
                'ent_coef': 0.05,
            }
            if i < 2:
                params['lr'] = 0.0
            with open(fn, 'w') as fp:
                json.dump(params, fp)

        m = A2CModel(policy, env=env, model_name='a2c_model' if i == 0 else "p"+str(i), nsteps=nsteps, total_timesteps=total_timesteps, **params)
        # runner = Runner(env, m, nsteps=nsteps, gamma=gamma)
        # runners.append(runner)
        fn = 'models/' + str(i) + '.h5'
        if os.path.exists(fn):
            m.load(fn)
        fn = 'models/' + str(i) + '.rating.txt'
        if os.path.exists(fn):
            with open(fn, 'r') as fp:
                rating = float(fp.read().encode('utf-8'))
                ratings[i] = rating
        models.append(m)

    runner = MultimodelRunner(env, models, nsteps=nsteps, gamma=gamma, ratings=ratings)
    # Calculate the batch_size
    nbatch = num_fields * nsteps
    tstart = time.time()

    for update in range(1, total_timesteps // nbatch + 1):
        # Get mini batch of experiences
        obs, states, rewards, masks, actions, values, epinfos, test = runner.run()

        # policy_loss, value_loss, policy_entropy = model.train(inv_obs, states, rewards, masks, inv_actions, values)
        policy_loss, value_loss, policy_entropy = runner.do_model_train(obs, states, rewards, masks, actions, values, test)
        # policy_loss, value_loss, policy_entropy = model.train(obs, states, rewards, masks, actions, values)
        nseconds = time.time() - tstart

        # last_rewards += list(rewards)
        # last_rewards = last_rewards[-20000:]
        # Calculate the fps (frame per second)
        fps = int((update * nbatch) / nseconds)
        if update % log_interval == 0 or update == 1:
            # Calculates if value function is a good predicator of the returns (ev > 1)
            # or if it's just worse than predicting nothing (ev =< 0)
            ev = explained_variance(values, rewards)
            logger.record_tabular("nupdates", update)
            logger.record_tabular("total_timesteps", update * nbatch)
            logger.record_tabular('rewards', np.mean(rewards))
            logger.record_tabular('values', np.mean(values))
            logger.record_tabular("fps", fps)
            logger.record_tabular("policy_entropy", np.mean(policy_entropy))
            logger.record_tabular("value_loss", np.mean(value_loss))
            logger.record_tabular("explained_variance", float(ev))

            positions = list(map(int, reversed(np.argsort(runner.ratings))))
            logger.record_tabular("ELO top 1: %s" % positions[0], str(round(runner.ratings[positions[0]], 1)))
            logger.record_tabular("ELO top 2: %s" % positions[1], str(round(runner.ratings[positions[1]], 1)))
            logger.record_tabular("ELO top 3: %s" % positions[2], str(round(runner.ratings[positions[2]], 1)))
            logger.record_tabular("ELO top 4: %s" % positions[3], str(round(runner.ratings[positions[3]], 1)))
            logger.record_tabular("ELO worst: %s" % positions[-1], str(round(runner.ratings[positions[-1]], 1)))
            # logger.record_tabular("eprewmean", safemean([epinfo['r'] for epinfo in epinfobuf]))
            # logger.record_tabular("eplenmean", safemean([epinfo['l'] for epinfo in epinfobuf]))
            logger.dump_tabular()

            if update % 500 == 0 and update > 0:
                for i, model in enumerate(models):
                    model.save('models/' + str(i) + '.h5')
                    with open('models/' + str(i) + '.rating.txt', 'w') as fp:
                        fp.write(str(runner.ratings[i]))

            if update % 2000 == 0 and update > 0:
                sorted_ratings = list(reversed(sorted(runner.ratings)))
                if sorted_ratings[0] - sorted_ratings[-1] >= 200:
                    print('Modello %s sarà sostituito con %s' % (positions[-1], positions[0]))
                    models[positions[-1]].load_variables_from_another_model(models[positions[0]].model_name)
                    # models[positions[-1]].add_noise(0.0, stddev=0.001)
                    runner.ratings[positions[-1]] = runner.ratings[positions[0]]
