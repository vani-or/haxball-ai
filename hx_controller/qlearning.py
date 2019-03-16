import logging
import math
import os
import pickle
import random
import time
import traceback
from threading import Lock

from config.config import settings
from hx_controller import HXController
import tensorflow as tf
import keras
import keras.layers as L
import numpy as np
from keras.models import load_model

from hx_controller.browser_environment import BrowserEnvironment
from hx_controller.dqa import DQNAgent
from hx_controller.replay_buffer import ReplayBuffer


class Singleton(type):
    _instances = {}

    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super(Singleton, cls).__call__(*args, **kwargs)
        return cls._instances[cls]


class QLearning:
    def __init__(self, buffer_size=1e4) -> None:
        tf.reset_default_graph()
        self.graph = tf.get_default_graph()
        self.sess = tf.InteractiveSession()
        keras.backend.set_session(self.sess)

        self.n_inputs = 15
        self.n_actions = 10

        self.state_dim = (self.n_inputs,)

        self.agent = DQNAgent("dqn_agent", self.state_dim, self.n_actions, epsilon=settings['EPSILON_0'])
        self.target_network = DQNAgent("target_network", self.state_dim, self.n_actions)

        self.exp_replay = ReplayBuffer(buffer_size)

        # placeholders that will be fed with exp_replay.sample(batch_size)
        self.obs_ph = tf.placeholder(tf.float32, shape=(None,) + self.state_dim)
        self.actions_ph = tf.placeholder(tf.int32, shape=[None])
        self.rewards_ph = tf.placeholder(tf.float32, shape=[None])
        self.next_obs_ph = tf.placeholder(tf.float32, shape=(None,) + self.state_dim)
        self.is_done_ph = tf.placeholder(tf.float32, shape=[None])

        self.is_not_done = 1 - self.is_done_ph
        gamma = settings['GAMMA']

        current_qvalues = self.agent.get_symbolic_qvalues(self.obs_ph)
        current_action_qvalues = tf.reduce_sum(tf.one_hot(self.actions_ph, self.n_actions) * current_qvalues, axis=1)

        # compute q-values for NEXT states with target network
        next_qvalues_target = self.target_network.get_symbolic_qvalues(self.next_obs_ph)

        # compute state values by taking max over next_qvalues_target for all actions
        next_state_values_target = tf.reduce_max(next_qvalues_target, axis=-1)

        # compute Q_reference(s,a) as per formula above.
        reference_qvalues = self.rewards_ph + gamma * self.is_not_done * next_state_values_target
        # reference_qvalues = tf.where(is_done_ph > 0, rewards_ph, reference_qvalues)

        # Define loss function for sgd.
        self.td_loss = (current_action_qvalues - reference_qvalues) ** 2
        self.td_loss = tf.reduce_mean(self.td_loss)

        self.train_step = tf.train.AdamOptimizer(settings['ADAM_LEARNING_RATE']).minimize(self.td_loss, var_list=self.agent.weights)

        self.sess.run(tf.global_variables_initializer())
        self.saver = tf.train.Saver()

        # self.agent.load_model()
        # self.target_network.load_model()
        self.load()

        # Pretrain
        # if len(self.exp_replay) > 0:
        #     for i in range(len(self.exp_replay) // 128):
        #         _, loss_t = self.sess.run([self.train_step, self.td_loss],
        #                                   self.sample_batch(self.exp_replay, batch_size=128))
        #         logging.debug('Pretrain, loss: %s', repr(loss_t))

        self.step_number = 0
        self.rewards_history = []

        self.io_lock = Lock()

    # def save_model(self):
    #     with self.network.access_lock:
    #         self.network.network.save_weights('model_weights.h5')

    def serialize(self):
        # with open('weights.pkl', 'wb') as fp:
        #     pickle.dump([self.agent.weights, self.target_network.weights], fp)
        try:
            self.saver.save(self.sess, 'session.ckpt')
        except Exception as e:
            logging.error(traceback.format_exc())

    def load(self):
        if os.path.exists('session.ckpt.index'):
            # with open('weights.pkl', 'rb') as fp:
            #     agent_weights, target_network_weights = pickle.load(fp)
            #     self.sess.run([
            #         tf.assign(self.agent.weights, agent_weights, validate_shape=True),
            #         tf.assign(self.target_network.weights, target_network_weights, validate_shape=True),
            #     ])
            self.saver.restore(self.sess, "session.ckpt")

    def sample_batch(self, exp_replay, batch_size):
        obs_batch, act_batch, reward_batch, next_obs_batch, is_done_batch = self.exp_replay.sample(batch_size)
        return {
            self.obs_ph: obs_batch, self.actions_ph: act_batch, self.rewards_ph: reward_batch,
            self.next_obs_ph: next_obs_batch, self.is_done_ph: is_done_batch
        }

    def load_weigths_into_target_network(self, agent, target_network):
        """ assign target_network.weights variables to their respective agent.weights values. """
        assigns = []
        for w_agent, w_target in zip(agent.weights, target_network.weights):
            assigns.append(tf.assign(w_target, w_agent, validate_shape=True))
        self.sess.run(assigns)

    # def get_action(self, state, epsilon=0):
    #     """
    #     sample actions with epsilon-greedy policy
    #     recap: with p = epsilon pick random action, else pick action with highest Q(s,a)
    #     """
    #     with self.network.access_lock:
    #         with self.network.graph.as_default():
    #             q_values = self.network.network.predict(np.expand_dims(state, 0))[0]
    #
    #     n = len(q_values)
    #     if random.random() < epsilon:
    #         return random.randint(0, n - 1)
    #     else:
    #         return np.argmax(q_values)

    def one_step(self, prev_state, env: BrowserEnvironment):
        with self.io_lock:
            step_number = self.step_number
            self.step_number += 1

        qvalues = self.agent.get_qvalues(self.sess, [prev_state])
        action = self.agent.sample_actions(qvalues)[0]

        res = env.step(action)
        if not res:
            # with self.io_lock:
            #     self.exp_replay.serialize()
            return prev_state, None, None

        next_s, r, done = res

        # logging.debug('%s: Reward: %d, Action: %s, Done: %s' % ('RED' if env.red_team else 'BLUE', round(r, 1), action, done))

        with self.io_lock:
            self.rewards_history.append(r)
            self.exp_replay.add(prev_state, action, r, next_s, done)
            inverted_prev_state = env.invert_state(prev_state)
            inverted_action = env.invert_action(action)
            inverted_next_s = env.invert_state(next_s)
            self.exp_replay.add(inverted_prev_state, inverted_action, r, inverted_next_s, done)

        # train
        if step_number % settings['LEARNING_STEP_NUMBER'] == 0 and step_number > 0:
            _, loss_t = self.sess.run([self.train_step, self.td_loss], self.sample_batch(self.exp_replay, batch_size=settings['LEARNING_BATCH_SIZE']))
            try:
                logging.info('Step: %s, Training iteration, mean_reward: %d, loss: %s' % (self.step_number, round(np.mean(self.rewards_history)), loss_t))

            except:
                pass

        # td_loss_history.append(loss_t)

        # adjust agent parameters
        if step_number % settings['TARGET_Q_FUNCTION_UPDATE_STEP_NUMBER'] == 0:
            self.rewards_history = []
            self.load_weigths_into_target_network(self.agent, self.target_network)
            self.agent.epsilon = max(self.agent.epsilon * settings['EPSILON_DISCOUNT_COEF'], settings['EPSILON_MIN_VALUE'])
            logging.info('Aggiono la target Q-function, new epsilon: %s' % self.agent.epsilon)
            with self.io_lock:
                # self.agent.save_model()
                # self.target_network.save_model()
                self.serialize()
            # mean_rw_history.append(evaluate(make_env(), agent, n_games=3))


        # a = self.get_action(prev_state, epsilon=epsilon)
        # next_s, r, done = self.qlearning_step(a)
        # logging.debug('%s: Reward: %d, Action: %s, Done: %s' % ('RED' if self.red_team else 'BLUE', round(r, 1), a, done))
        #
        # if self.network.train:
        #     with self.network.access_lock:
        #         self.network.sess.run(self.network.train_step, {
        #             self.network.states_ph: [prev_state], self.network.actions_ph: [a], self.network.rewards_ph: [r],
        #             self.network.next_states_ph: [next_s], self.network.is_done_ph: [done]
        #         })

        return next_s, r, done
