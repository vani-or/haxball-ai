from multiprocessing.dummy import Pool

from baselines.a2c.a2c import Model
import time
import functools
import tensorflow as tf

from baselines import logger

from baselines.common import set_global_seeds, explained_variance
from baselines.common import tf_util
from baselines.common.policies import build_policy


from baselines.a2c.utils import Scheduler, find_trainable_variables
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
        self.save = functools.partial(tf_util.save_variables, sess=sess)
        self.load = functools.partial(tf_util.load_variables, sess=sess)
        tf.global_variables_initializer().run(session=sess)


class MultimodelRunner(AbstractEnvRunner):
    def __init__(self, env, models, nsteps=5, gamma=0.99):
        super().__init__(env=env, model=models[0], nsteps=nsteps)
        self.models = models
        self.m = len(models)
        self.gamma = gamma
        self.batch_action_shape = [x if x is not None else -1 for x in models[0].train_model.action.shape.as_list()]
        self.ob_dtype = models[0].train_model.X.dtype.as_numpy_dtype
        self.tp = Pool(len(self.models))

        self.models_indexes = [[] for _ in range(self.m)]
        l = 0
        for k in range(self.m ** 2):
            i = k // self.m
            j = k % self.m
            if i == j:
                continue
            self.models_indexes[i].append(l)
            self.models_indexes[j].append(l)
            l += 1

    def model_step(self, args):
        model, obs, states, dones = args
        return model.step(obs, S=states, M=dones)

    def run(self):
        # We initialize the lists that will contain the mb of experiences
        mb_obs, mb_rewards, mb_actions, mb_values, mb_dones = [], [], [], [], []
        mb_states = self.states
        epinfos = []
        for n in range(self.nsteps):
            # Given observations, take action and value (V(s))
            # We already have self.obs because Runner superclass run self.obs[:] = env.reset() on init
            actions, values, states, _ = self.tp.map(self.model_step, zip(self.models, self.obs, self.states, self.dones))
            # actions, values, states, _ = self.model.step(self.obs, S=self.states, M=self.dones)

            # Append the experiences
            mb_obs.append(np.copy(self.obs))
            mb_actions.append(actions)
            mb_values.append(values)
            mb_dones.append(self.dones)

            # Take actions in env and look the results
            obs, rewards, dones, infos = self.env.step(actions)
            for info in infos:
                maybeepinfo = info.get('episode')
                if maybeepinfo: epinfos.append(maybeepinfo)
            self.states = states
            self.dones = dones
            self.obs = obs
            mb_rewards.append(rewards)
        mb_dones.append(self.dones)

        # Batch of steps to batch of rollouts
        mb_obs = np.asarray(mb_obs, dtype=self.ob_dtype).swapaxes(1, 0).reshape(self.batch_ob_shape)
        mb_rewards = np.asarray(mb_rewards, dtype=np.float32).swapaxes(1, 0)
        mb_actions = np.asarray(mb_actions, dtype=self.model.train_model.action.dtype.name).swapaxes(1, 0)
        mb_values = np.asarray(mb_values, dtype=np.float32).swapaxes(1, 0)
        mb_dones = np.asarray(mb_dones, dtype=np.bool).swapaxes(1, 0)
        mb_masks = mb_dones[:, :-1]
        mb_dones = mb_dones[:, 1:]

        if self.gamma > 0.0:
            # Discount/bootstrap off value fn
            last_values = self.model.value(self.obs, S=self.states, M=self.dones).tolist()
            for n, (rewards, dones, value) in enumerate(zip(mb_rewards, mb_dones, last_values)):
                rewards = rewards.tolist()
                dones = dones.tolist()
                if dones[-1] == 0:
                    rewards = discount_with_dones(rewards + [value], dones + [0], self.gamma)[:-1]
                else:
                    rewards = discount_with_dones(rewards, dones, self.gamma)

                mb_rewards[n] = rewards

        mb_actions = mb_actions.reshape(self.batch_action_shape)

        mb_rewards = mb_rewards.flatten()
        mb_values = mb_values.flatten()
        mb_masks = mb_masks.flatten()
        return mb_obs, mb_states, mb_rewards, mb_masks, mb_actions, mb_values, epinfos


if __name__ == '__main__':
    # Round-robin
    num_players = 4
    game_max_duration = 3  # minuti
    gamma = 0.99
    nsteps = 1
    total_timesteps = int(15e6)

    num_fields = 2 * (num_players - 1)
    env = HaxballSubProcVecEnv(num_fields=num_fields, max_ticks=int(60 * game_max_duration * (1 / 0.1)))
    # env = make_vec_env(env_id='PongNoFrameskip-v4', env_type=None, num_env=nenvs, seed=0)
    # policy = build_policy(env=env, policy_network='lstm')#, num_layers=4, num_hidden=128)
    policy = build_policy(env=env, policy_network='mlp', num_layers=4, num_hidden=256)

    models = []
    runners = []
    for i in range(num_players):
        m = A2CModel(policy, env=env, model_name="p"+str(i), nsteps=nsteps, ent_coef=0.05, total_timesteps=total_timesteps)
        # runner = Runner(env, m, nsteps=nsteps, gamma=gamma)
        # runners.append(runner)
        models.append(m)

    runner = MultimodelRunner(env, models, nsteps=nsteps, gamma=gamma)
    # Calculate the batch_size
    nbatch = num_fields * nsteps

    for update in range(1, total_timesteps // nbatch + 1):
        # Get mini batch of experiences
        obs, states, rewards, masks, actions, values, epinfos = runner.run()

        for runner, model in zip(runners, models):
            obs, states, rewards, masks, actions, values, epinfos = runner.run()

            # invert
            inv_obs = env.invert_states(obs)
            obs = np.vstack((obs, inv_obs))
            rewards = np.hstack((rewards, rewards))
            masks = np.hstack((masks, masks))
            inv_actions = env.invert_actions(actions)
            actions = np.hstack((actions, inv_actions))
            values = np.hstack((values, values))

            # policy_loss, value_loss, policy_entropy = model.train(inv_obs, states, rewards, masks, inv_actions, values)
            policy_loss, value_loss, policy_entropy = model.train(obs, states, rewards, masks, actions, values)
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
            logger.record_tabular("policy_entropy", float(policy_entropy))
            logger.record_tabular("value_loss", float(value_loss))
            logger.record_tabular("explained_variance", float(ev))
            logger.record_tabular("eprewmean", safemean([epinfo['r'] for epinfo in epinfobuf]))
            logger.record_tabular("eplenmean", safemean([epinfo['l'] for epinfo in epinfobuf]))
            logger.dump_tabular()
        if update % 500 == 0:
            model.save(load_path)