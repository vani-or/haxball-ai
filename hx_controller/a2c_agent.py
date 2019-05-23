import os
from keras.models import Sequential, Model, load_model
from keras.layers import Conv2D, Dense, Flatten, InputLayer, Input, Activation
import tensorflow as tf
import numpy as np

from hx_controller.haxball_gym import Haxball
from hx_controller.haxball_vecenv import HaxballSubProcVecEnv
from simulator import GamePlay


class Agent:
    def __init__(self, name, state_shape, n_actions, reuse=False):
        """A simple actor-critic agent"""

        with tf.variable_scope(name, reuse=reuse):
            # Prepare neural network architecture
            ### Your code here: prepare any necessary layers, variables, etc.
            if os.path.exists('model.h5'):
                self.model = load_model('model.h5')
            else:
                inp = Input(state_shape)
                dense0 = Dense(64, activation='tanh', kernel_initializer='ones', bias_initializer='ones')(inp)
                dense1 = Dense(256, activation='tanh', kernel_initializer='ones', bias_initializer='ones')(dense0)
                dense2 = Dense(128, activation='relu', kernel_initializer='ones', bias_initializer='ones')(dense1)
                dense3 = Dense(64, activation='relu', kernel_initializer='ones', bias_initializer='ones')(dense2)
                dense4 = Dense(32, activation='tanh', kernel_initializer='ones', bias_initializer='ones')(dense3)

                logits = Dense(n_actions, activation='linear', kernel_initializer='ones', bias_initializer='ones')(dense4)
                # probs = Activation('softmax')(logits)
                state_value = Dense(1, activation='linear', kernel_initializer='ones', bias_initializer='ones')(dense4)

                self.model = Model(inputs=inp, outputs=[logits, state_value])

            # prepare a graph for agent step
            self.state_t = tf.placeholder('float32', [None, ] + list(state_shape))
            self.agent_outputs = self.symbolic_step(self.state_t)

    def serialize(self):
        self.model.save('model.h5')

    def symbolic_step(self, state_t):
        """Takes agent's previous step and observation, returns next state and whatever it needs to learn (tf tensors)"""

        # Apply neural network
        logits, state_value = self.model(state_t)
        state_value = state_value[:, 0]

        # TODO: rimuovere
        # assert tf.is_numeric_tensor(state_value) and state_value.shape.ndims == 1, \
        #     "please return 1D tf tensor of state values [you got %s]" % repr(state_value)
        # assert tf.is_numeric_tensor(logits) and logits.shape.ndims == 2, \
        #     "please return 2d tf tensor of logits [you got %s]" % repr(logits)
        # hint: if you triggered state_values assert with your shape being [None, 1],
        # just select [:, 0]-th element of state values as new state values

        return logits, state_value

    def step(self, state_t):
        """Same as symbolic step except it operates on numpy arrays"""
        sess = tf.get_default_session()
        return sess.run(self.agent_outputs, {self.state_t: state_t})

    def sample_actions(self, agent_outputs):
        """pick actions given numeric agent outputs (np arrays)"""
        logits, state_values = agent_outputs
        policy = np.exp(logits) / np.sum(np.exp(logits), axis=-1, keepdims=True)
        return np.array([np.random.choice(len(p), p=p) for p in policy])


if __name__ == '__main__':
    # We scale rewards to avoid exploding gradients during optimization.
    reward_scale = 1.0

    sess = tf.InteractiveSession()

    nenvs = 100
    env = HaxballSubProcVecEnv(num_fields=nenvs, max_ticks=int(60 * 3 * (1 / 0.1)))

    obs_shape = env.observation_space.shape
    n_actions = env.action_space.n

    print("Observation shape:", obs_shape)
    print("Num actions:", n_actions)
    # print("Action names:", env.get_action_meanings())

    agent = Agent("agent", obs_shape, n_actions)
    sess.run(tf.global_variables_initializer())

    state = np.squeeze(np.array([env.reset()]))
    logits, value = agent.step(state)
    print("action logits:\n", logits)
    print("state values:\n", value)


    def evaluate(agent, env, n_games=1):
        """Plays an a game from start till done, returns per-game rewards """
        # env.render()
        game_rewards = []
        for _ in range(n_games):
            states = env.reset()

            total_reward = 0
            i = 0
            while True:
                i += 1
                actions = agent.sample_actions(agent.step(states))
                states, rewards, dones, infos = env.step(actions)
                total_reward += sum(rewards)
                if dones[0]:
                    break

            # We rescale the reward back to ensure compatibility
            # with other evaluations.
            game_rewards.append(total_reward / env.num_envs)
        # env.render('disable')
        return game_rewards

    # env.render()
    # evaluate(agent, env, n_games=3)

    # batch_states = env.reset()
    #
    # batch_actions = agent.sample_actions(agent.step(batch_states))
    #
    # batch_next_states, batch_rewards, batch_done, _ = env.step(batch_actions)
    #
    # print("State shape:", batch_states.shape)
    # print("Actions:", batch_actions[:3])
    # print("Rewards:", batch_rewards[:3])
    # print("Done:", batch_done[:3])

    #########################OPENAI#################################
    # nsteps = 1
    # nenvs = env.num_envs
    # nbatch = nenvs * nsteps
    #
    # with tf.variable_scope('a2c_model', reuse=tf.AUTO_REUSE):
    #     # step_model is used for sampling
    #     step_model = policy(None, 1, sess)
    #
    #     # train_model is used to train our network
    #     train_model = policy(None, nsteps, sess)
    #
    # A = tf.placeholder(train_model.action.dtype, train_model.action.shape)
    # ADV = tf.placeholder(tf.float32, (None,))
    # R = tf.placeholder(tf.float32, (None,))
    # LR = tf.placeholder(tf.float32, [])
    #
    # # Calculate the loss
    # # Total loss = Policy gradient loss - entropy * entropy coefficient + Value coefficient * value loss
    #
    # # Policy loss
    # neglogpac = train_model.pd.neglogp(A)
    # # L = A(s,a) * -logpi(a|s)
    # pg_loss = tf.reduce_mean(ADV * neglogpac)
    #
    # # Entropy is used to improve exploration by limiting the premature convergence to suboptimal policy.
    # entropy = tf.reduce_mean(train_model.pd.entropy())
    #
    # # Value loss
    # # vf_loss = losses.mean_squared_error(tf.squeeze(train_model.vf), R)
    # vf_loss = losses.mean_squared_error(train_model.vf, R)
    #
    # loss = pg_loss - entropy * ent_coef + vf_loss * vf_coef
    #
    # # Update parameters using loss
    # # 1. Get the model parameters
    # params = find_trainable_variables("a2c_model")
    #
    # # 2. Calculate the gradients
    # grads = tf.gradients(loss, params)
    # if max_grad_norm is not None:
    #     # Clip the gradients (normalize)
    #     grads, grad_norm = tf.clip_by_global_norm(grads, max_grad_norm)
    # grads = list(zip(grads, params))
    # # zip aggregate each gradient with parameters associated
    # # For instance zip(ABCD, xyza) => Ax, By, Cz, Da
    #
    # # 3. Make op for one policy and value update step of A2C
    # trainer = tf.train.RMSPropOptimizer(learning_rate=LR, decay=alpha, epsilon=epsilon)
    #
    # _train = trainer.apply_gradients(grads)
    #
    # lr = Scheduler(v=lr, nvalues=total_timesteps, schedule=lrschedule)
    #
    #
    # def train(obs, states, rewards, masks, actions, values):
    #     # Here we calculate advantage A(s,a) = R + yV(s') - V(s)
    #     # rewards = R + yV(s')
    #     advs = rewards - values
    #     for step in range(len(obs)):
    #         cur_lr = lr.value()
    #
    #     td_map = {train_model.X: obs, A: actions, ADV: advs, R: rewards, LR: cur_lr}
    #     if states is not None:
    #         td_map[train_model.S] = states
    #         td_map[train_model.M] = masks
    #     policy_loss, value_loss, policy_entropy, _ = sess.run(
    #         [pg_loss, vf_loss, entropy, _train],
    #         td_map
    #     )
    #     return policy_loss, value_loss, policy_entropy
    #########################OPENAI#################################

    # These placeholders mean exactly the same as in "Let's try it out" section above
    states_ph = tf.placeholder('float32', [None, ] + list(obs_shape))
    next_states_ph = tf.placeholder('float32', [None, ] + list(obs_shape))
    actions_ph = tf.placeholder('int32', (None,))
    rewards_ph = tf.placeholder('float32', (None,))
    is_done_ph = tf.placeholder('float32', (None,))

    # logits[n_envs, n_actions] and state_values[n_envs, n_actions]
    logits, state_values = agent.symbolic_step(states_ph)
    next_logits, next_state_values = agent.symbolic_step(next_states_ph)
    next_state_values = next_state_values * (1 - is_done_ph)

    # probabilities and log-probabilities for all actions
    probs = tf.nn.softmax(logits)  # [n_envs, n_actions]
    logprobs = tf.nn.log_softmax(logits)  # [n_envs, n_actions]

    # log-probabilities only for agent's chosen actions
    logp_actions = tf.reduce_sum(logprobs * tf.one_hot(actions_ph, n_actions), axis=-1)  # [n_envs,]

    # compute advantage using rewards_ph, state_values and next_state_values
    gamma = 0.99
    advantage = rewards_ph + gamma * next_state_values - state_values

    # assert advantage.shape.ndims == 1, "please compute advantage for each sample, vector of shape [n_envs,]"

    # compute policy entropy given logits_seq. Mind the "-" sign!
    entropy = -tf.reduce_sum(probs * logprobs, 1)

    # assert entropy.shape.ndims == 1, "please compute pointwise entropy vector of shape [n_envs,] "

    actor_loss = -tf.reduce_mean(logp_actions * tf.stop_gradient(advantage)) - 0.05 * tf.reduce_mean(entropy)

    # compute target state values using temporal difference formula. Use rewards_ph and next_step_values
    target_state_values = rewards_ph + gamma * next_state_values

    critic_loss = tf.reduce_mean((state_values - tf.stop_gradient(target_state_values)) ** 2)

    # train_step = tf.train.AdamOptimizer(1e-4).minimize(actor_loss + critic_loss)

    # optimizer = tf.train.AdamOptimizer(1e-4)
    # gradients, variables = zip(*optimizer.compute_gradients(actor_loss + critic_loss))
    # gradients, _ = tf.clip_by_global_norm(gradients, 0.5)
    # train_step = optimizer.apply_gradients(zip(gradients, variables))

    all_weights = tf.get_collection(tf.GraphKeys.TRAINABLE_VARIABLES)
    grads = tf.gradients(actor_loss + critic_loss, all_weights)
    grads, grad_norm = tf.clip_by_global_norm(grads, 0.5)
    grads = list(zip(grads, all_weights))
    # zip aggregate each gradient with parameters associated
    # For instance zip(ABCD, xyza) => Ax, By, Cz, Da

    # 3. Make op for one policy and value update step of A2C
    trainer = tf.train.RMSPropOptimizer(learning_rate=7e-4, decay=0.99, epsilon=1e-5)

    train_step = trainer.apply_gradients(grads)

    sess.run(tf.global_variables_initializer())

    # Sanity checks to catch some errors. Specific to KungFuMaster in assignment's default setup.
    # l_act, l_crit, adv, ent = sess.run([actor_loss, critic_loss, advantage, entropy], feed_dict={
    #     states_ph: batch_states,
    #     actions_ph: batch_actions,
    #     next_states_ph: batch_states,
    #     rewards_ph: batch_rewards,
    #     is_done_ph: batch_done,
    # })
    #
    # # assert abs(l_act) < 100 and abs(l_crit) < 100, "losses seem abnormally large"
    # # assert 0 <= ent.mean() <= np.log(n_actions), "impossible entropy value, double-check the formula pls"
    # if ent.mean() < np.log(n_actions) / 2: print("Entropy is too low for untrained agent")
    # print("You just might be fine!")

    from tqdm import trange
    from pandas import DataFrame

    ewma = lambda x, span=100: DataFrame({'x': np.asarray(x)}).x.ewm(span=span).mean().values

    batch_states = env.reset()

    rewards_history = []
    entropy_history = []
    actor_loss_history = []
    critic_loss_history = []

    for i in trange(100_000_000):
        batch_actions = agent.sample_actions(agent.step(batch_states))
        batch_next_states, batch_rewards, batch_done, _ = env.step(batch_actions)

        inverted_states = env.invert_states(batch_states)
        inverted_actions = env.invert_actions(batch_actions)
        inverted_next_states = env.invert_states(batch_next_states)
        # inverted_actions = [env_batch.envs[0].invert_action(a) for a in batch_actions]
        # inverted_states = [env_batch.envs[0].invert_state(s) for s in batch_states]
        # inverted_next_states = [env_batch.envs[0].invert_state(s) for s in batch_next_states]

        batch_states = np.vstack((batch_states, inverted_states))
        batch_next_states_feed = np.vstack((batch_next_states, inverted_next_states))
        batch_actions = np.hstack((batch_actions, inverted_actions))
        batch_rewards = np.hstack((batch_rewards, batch_rewards))
        batch_done = np.hstack((batch_done, batch_done))

        feed_dict = {
            states_ph: batch_states,
            actions_ph: batch_actions,
            next_states_ph: batch_next_states_feed,
            rewards_ph: batch_rewards,
            is_done_ph: batch_done,
        }
        batch_states = batch_next_states

        _, ent_t, a_loss, c_loss = sess.run([train_step, entropy, actor_loss, critic_loss], feed_dict)
        entropy_history.append(np.mean(ent_t))
        actor_loss_history.append(np.mean(a_loss))
        critic_loss_history.append(np.mean(c_loss))

        if i % 50 == 0:
            print(np.mean(ent_t))

        if i % 10000 == 0:
            if i % 10000 == 0:
                mean = np.mean(evaluate(agent, env, n_games=1))
                agent.serialize()
                rewards_history.append(mean)
                # if rewards_history[-1] >= 50:
                #     print("Your agent has earned the yellow belt")
                # if rewards_history[-1] >= 20000:
                #     print('Done, good enough')
                #     break

                print('Mean reward: %s, mean entropy: %s, mean actor_loss: %s, mean critic_loss: %s' % (round(mean, 1), np.mean(entropy_history[-500:]), np.mean(actor_loss_history[-500:]), np.mean(critic_loss_history[-500:])))
            # clear_output(True)
            # plt.figure(figsize=[8, 4])
            # plt.subplot(1, 2, 1)
            # plt.plot(rewards_history, label='rewards')
            # plt.plot(ewma(np.array(rewards_history), span=10), marker='.', label='rewards ewma@10')
            # plt.title("Session rewards")
            # plt.grid()
            # plt.legend()
            #
            # plt.subplot(1, 2, 2)
            # plt.plot(entropy_history, label='entropy')
            # plt.plot(ewma(np.array(entropy_history), span=1000), label='entropy ewma@1000')
            # plt.title("Policy entropy")
            # plt.grid()
            # plt.legend()
            # plt.show()
