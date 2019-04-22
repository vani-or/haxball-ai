import os
from keras.models import Sequential, Model, load_model
from keras.layers import Conv2D, Dense, Flatten, InputLayer, Input, Activation
import tensorflow as tf
import numpy as np

from hx_controller.haxball_gym import Haxball
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
                # dense0 = Dense(64, activation='tanh')(inp)
                # dense1 = Dense(256, activation='tanh')(dense0)
                dense2 = Dense(128, activation='relu', kernel_initializer='zeros', bias_initializer='ones')(inp)
                dense3 = Dense(64, activation='sigmoid', kernel_initializer='zeros', bias_initializer='ones')(dense2)
                dense4 = Dense(32, activation='relu', kernel_initializer='zeros', bias_initializer='ones')(dense3)

                logits = Dense(n_actions, activation='linear', kernel_initializer='zeros', bias_initializer='ones')(dense4)
                # probs = Activation('softmax')(logits)
                state_value = Dense(1, activation='linear', kernel_initializer='zeros', bias_initializer='ones')(dense4)

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
    def make_env():
        gameplay = GamePlay()
        gameplay.reset()
        return Haxball(gameplay=gameplay)

    sess = tf.InteractiveSession()

    env = make_env()

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
        env.envs[0].render()
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
            game_rewards.append(total_reward / len(env.envs))
        env.envs[0].render('disable')
        return game_rewards

    # env.render()
    # evaluate(agent, env, n_games=3)

    class EnvBatch:
        def __init__(self, n_envs=10):
            """ Creates n_envs environments and babysits them for ya' """
            # self.envs = [make_env() for _ in range(n_envs)]
            assert n_envs % 2 == 0, 'non numero pari'

            self.envs = []
            for _ in range(n_envs // 2):
                gameplay = GamePlay()
                gameplay.reset()
                env = Haxball(gameplay=gameplay)
                # env.render()
                self.envs.append(env)
            # self.envs = [make_env() for _ in range(n_envs // 2)]

        def reset(self):
            """ Reset all games and return [n_envs, *obs_shape] observations """
            states = []
            for env in self.envs:
                states += env.reset()
            return np.squeeze(np.array(states))

        def step(self, actions):
            """
            Send a vector[batch_size] of actions into respective environments
            :returns: observations[n_envs, *obs_shape], rewards[n_envs], done[n_envs,], info[n_envs]
            # """
            # results = [env.step(a) for env, a in zip(self.envs, actions)]
            # new_obs, rewards, done, infos = map(np.array, zip(*results))
            #
            # # reset environments automatically
            # for i in range(len(self.envs)):
            #     if done[i]:
            #         new_obs[i] = self.envs[i].reset()
            #
            # return new_obs, rewards, done, infos
            all_results = []
            for env, a1, a2 in zip(self.envs, actions[0::2], actions[1::2]):
                results = env.step_two_agents([a1, a2])

                if results[0][2]:  # Done
                    new_obs = env.reset()
                    results[0] = (new_obs[0], *results[0][1:])
                    results[1] = (new_obs[1], *results[1][1:])

                all_results += results

            new_obs, rewards, done, infos = map(np.array, zip(*all_results))

            return new_obs, rewards, done, infos

    env_batch = EnvBatch(20)

    batch_states = env_batch.reset()

    batch_actions = agent.sample_actions(agent.step(batch_states))

    batch_next_states, batch_rewards, batch_done, _ = env_batch.step(batch_actions)

    print("State shape:", batch_states.shape)
    print("Actions:", batch_actions[:3])
    print("Rewards:", batch_rewards[:3])
    print("Done:", batch_done[:3])

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


    ### openai
    A = tf.placeholder(train_model.action.dtype, train_model.action.shape)
    ADV = tf.placeholder(tf.float32, [nbatch])
    R = tf.placeholder(tf.float32, [nbatch])
    LR = tf.placeholder(tf.float32, [])

    # Calculate the loss
    # Total loss = Policy gradient loss - entropy * entropy coefficient + Value coefficient * value loss

    probs = tf.nn.softmax(logits)  # [n_envs, n_actions]
    logprobs = tf.nn.log_softmax(logits)  # [n_envs, n_actions]

    # Policy loss
    # neglogpac = train_model.pd.neglogp(A)
    neglogpac = -logprobs
    # L = A(s,a) * -logpi(a|s)
    pg_loss = tf.reduce_mean(ADV * neglogpac)


    # Entropy
    a0 = logits - tf.reduce_max(logits, axis=-1, keepdims=True)
    ea0 = tf.exp(a0)
    z0 = tf.reduce_sum(ea0, axis=-1, keepdims=True)
    p0 = ea0 / z0
    entropy = tf.reduce_mean(tf.reduce_sum(p0 * (tf.log(z0) - a0), axis=-1))

    # Entropy is used to improve exploration by limiting the premature convergence to suboptimal policy.
    entropy = tf.reduce_mean(entropy)

    # Value loss
    # vf_loss = losses.mean_squared_error(tf.squeeze(train_model.vf), R)
    target_state_values = rewards_ph + gamma * next_state_values
    vf_loss = tf.reduce_mean((state_values - tf.stop_gradient(target_state_values)) ** 2)

    loss = pg_loss - entropy * 0.01 + vf_loss * 0.5
    ###

    # assert entropy.shape.ndims == 1, "please compute pointwise entropy vector of shape [n_envs,] "

    actor_loss = -tf.reduce_mean(logp_actions * tf.stop_gradient(advantage)) - 0.1 * tf.reduce_mean(entropy)

    # compute target state values using temporal difference formula. Use rewards_ph and next_step_values
    target_state_values = rewards_ph + gamma * next_state_values

    critic_loss = tf.reduce_mean((state_values - tf.stop_gradient(target_state_values)) ** 2)

    # train_step = tf.train.AdamOptimizer(1e-4).minimize(actor_loss + critic_loss)

    optimizer = tf.train.AdamOptimizer(1e-4)
    gradients, variables = zip(*optimizer.compute_gradients(-actor_loss - critic_loss))
    gradients, _ = tf.clip_by_global_norm(gradients, 0.01)
    train_step = optimizer.apply_gradients(zip(gradients, variables))

    sess.run(tf.global_variables_initializer())

    # Sanity checks to catch some errors. Specific to KungFuMaster in assignment's default setup.
    l_act, l_crit, adv, ent = sess.run([actor_loss, critic_loss, advantage, entropy], feed_dict={
        states_ph: batch_states,
        actions_ph: batch_actions,
        next_states_ph: batch_states,
        rewards_ph: batch_rewards,
        is_done_ph: batch_done,
    })

    # assert abs(l_act) < 100 and abs(l_crit) < 100, "losses seem abnormally large"
    # assert 0 <= ent.mean() <= np.log(n_actions), "impossible entropy value, double-check the formula pls"
    if ent.mean() < np.log(n_actions) / 2: print("Entropy is too low for untrained agent")
    print("You just might be fine!")

    from tqdm import trange
    from pandas import DataFrame

    ewma = lambda x, span=100: DataFrame({'x': np.asarray(x)}).x.ewm(span=span).mean().values

    env_batch = EnvBatch(20)
    batch_states = env_batch.reset()

    rewards_history = []
    entropy_history = []
    actor_loss_history = []
    critic_loss_history = []

    for i in trange(100_000_000):
        batch_actions = agent.sample_actions(agent.step(batch_states))
        batch_next_states, batch_rewards, batch_done, _ = env_batch.step(batch_actions)

        inverted_actions = [env_batch.envs[0].invert_action(a) for a in batch_actions]
        inverted_states = [env_batch.envs[0].invert_state(s) for s in batch_states]
        inverted_next_states = [env_batch.envs[0].invert_state(s) for s in batch_next_states]

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

        if i % 10000 == 0:
            if i % 10000 == 0:
                mean = np.mean(evaluate(agent, env_batch, n_games=1))
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