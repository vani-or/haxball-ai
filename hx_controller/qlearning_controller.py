import logging
import math
import os
import random
import time
from threading import Lock

from brumium import ChromeTab
from hx_controller import HXController
import tensorflow as tf
import keras
import keras.layers as L
import numpy as np
from keras.models import load_model


class Singleton(type):
    _instances = {}

    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super(Singleton, cls).__call__(*args, **kwargs)
        return cls._instances[cls]


class Network(metaclass=Singleton):
    """
        Gli input sono:
            0:  posizione x del giocatore
            1:  posizione y del giocatore
            2:  velocità x del giocatore
            3:  velocità y del giocatore
            # 4:  posizione x del avversario
            # 5:  posizione y del avversario
            # 6:  velocità x del avversario
            # 7:  velocità y del avversario
            4:  posizione x della palla
            5:  posizione y della palla
            6: velocità x della palla
            7: velocità y della palla
            # 12: bottone LEFT premuto (bool)
            # 13: bottone RIGHT premuto (bool)
            # 14: bottone UP premuto (bool)
            # 15: bottone DOWN premuto (bool)
            # 16: bottone SPACE premuto (bool)

            8: distanza dal giocatore alla palla

        Output (Azioni):
            0: NULL (aspettare / non fare niente)
            # 1: Cambiare lo stato del bottone LEFT
            # 2: Cambiare lo stato del bottone RIGHT
            # 3: Cambiare lo stato del bottone UP
            # 4: Cambiare lo stato del bottone DOWN
            # 5: Cambiare lo stato del bottone SPACE
            1: premere LEFT per 100ms
            2: premere RIGHT per 100ms
            3: premere UP per 100ms
            4: premere DOWN per 100ms
            5: premere SPACE per 100ms
        """
    def __init__(self) -> None:
        super().__init__()
        self.train = True

        tf.reset_default_graph()
        self.graph = tf.get_default_graph()
        self.sess = tf.InteractiveSession()
        keras.backend.set_session(self.sess)

        self.n_inputs = 9
        self.n_actions = 6

        self.state_dim = (self.n_inputs,)

        self.network = keras.models.Sequential()
        self.network.add(L.InputLayer(self.state_dim))
        self.network.add(L.Dense(256, activation='relu'))
        self.network.add(L.Dense(512, activation='relu'))
        self.network.add(L.Dense(128, activation='relu'))
        self.network.add(L.Dense(self.n_actions, activation='linear'))

        if os.path.exists('model_weights.h5'):
            self.network.load_weights('model_weights.h5')

        # Create placeholders for the <s, a, r, s'> tuple and a special indicator for game end (is_done = True)
        self.states_ph = keras.backend.placeholder(dtype='float32', shape=(None,) + self.state_dim)
        self.actions_ph = keras.backend.placeholder(dtype='int32', shape=[None])
        self.rewards_ph = keras.backend.placeholder(dtype='float32', shape=[None])
        self.next_states_ph = keras.backend.placeholder(dtype='float32', shape=(None,) + self.state_dim)
        self.is_done_ph = keras.backend.placeholder(dtype='bool', shape=[None])

        # get q-values for all actions in current states
        predicted_qvalues = self.network(self.states_ph)

        # select q-values for chosen actions
        predicted_qvalues_for_actions = tf.reduce_sum(predicted_qvalues * tf.one_hot(self.actions_ph, self.n_actions),
                                                      axis=1)
        gamma = 0.99

        # compute q-values for all actions in next states
        predicted_next_qvalues = self.network(self.next_states_ph)

        # compute V*(next_states) using predicted next q-values
        next_state_values = tf.reduce_max(predicted_next_qvalues, axis=1)

        # compute "target q-values" for loss - it's what's inside square parentheses in the above formula.
        target_qvalues_for_actions = self.rewards_ph + gamma * next_state_values

        # at the last state we shall use simplified formula: Q(s,a) = r(s,a) since s' doesn't exist
        target_qvalues_for_actions = tf.where(self.is_done_ph, self.rewards_ph, target_qvalues_for_actions)

        # mean squared error loss to minimize
        loss = (predicted_qvalues_for_actions - tf.stop_gradient(target_qvalues_for_actions)) ** 2
        loss = tf.reduce_mean(loss)

        # training function that resembles agent.update(state, action, reward, next_state) from tabular agent
        self.train_step = tf.train.AdamOptimizer(1e-4).minimize(loss)
        self.access_lock = Lock()


class QLearningController(HXController):
    def __init__(self, browser_tab: ChromeTab, username: str, train: bool = True) -> None:
        super().__init__(browser_tab, username)

        self.action_2_button = {
            1: 'left',
            2: 'right',
            3: 'up',
            4: 'down',
            5: 'space',
        }

        self.network = Network()

        initial_info = None
        while initial_info is None or not initial_info['player']:
            initial_info = self._get_game_info()
            time.sleep(0.5)

        self.score = initial_info['score']
        self.red_team = initial_info['player']['team'] == 'Red'

    def save_model(self):
        with self.network.access_lock:
            self.network.network.save_weights('model_weights.h5')

    def get_action(self, state, epsilon=0):
        """
        sample actions with epsilon-greedy policy
        recap: with p = epsilon pick random action, else pick action with highest Q(s,a)
        """
        with self.network.access_lock:
            with self.network.graph.as_default():
                q_values = self.network.network.predict(np.expand_dims(state, 0))[0]

        n = len(q_values)
        if random.random() < epsilon:
            return random.randint(0, n - 1)
        else:
            return np.argmax(q_values)

    def qlearning_step(self, action):
        if action in self.action_2_button:
            key = self.action_2_button[action]
            if self.red_team:
                if key == 'up':
                    key = 'down'
                elif key == 'down':
                    key = 'up'
                elif key == 'left':
                    key = 'right'
                elif key == 'right':
                    key = 'left'
            # up = self._buttons_state[key]
            self.send_button(key, False)
            time.sleep(0.1)
            self.send_button(key, True)
        else:
            time.sleep(0.1)

        game_info = self._get_game_info()
        if not game_info or not game_info['player'] or not game_info['opponent']:
            return

        self.red_team = game_info['player']['team'] == 'Red'
        if self.red_team:
            game_info['player']['position']['x'] *= -1
            game_info['player']['position']['y'] *= -1
            game_info['player']['velocity']['x'] *= -1
            game_info['player']['velocity']['y'] *= -1
            game_info['opponent']['position']['x'] *= -1
            game_info['opponent']['position']['y'] *= -1
            game_info['opponent']['velocity']['x'] *= -1
            game_info['opponent']['velocity']['y'] *= -1
            game_info['ball']['position']['x'] *= -1
            game_info['ball']['position']['y'] *= -1
            game_info['ball']['velocity']['x'] *= -1
            game_info['ball']['velocity']['y'] *= -1

        reward = -math.sqrt((game_info['ball']['position']['x'] + game_info['field_size'][0]) ** 2 + game_info['ball']['position']['y'] ** 2)
        distanza_alla_palla = math.sqrt((game_info['ball']['position']['x'] - game_info['player']['position']['x']) ** 2 + (game_info['ball']['position']['y'] - game_info['player']['position']['y']) ** 2)
        reward += -distanza_alla_palla/2
        # reward += -100 * game_info['ball']['velocity']['x']
        if game_info['player']['position']['x'] < game_info['ball']['position']['x']:
            reward -= (game_info['ball']['position']['x'] - game_info['player']['position']['x'])

        done = False
        goal_reward = 0
        if self.score[0] < game_info['score'][0]:
            goal_reward = -10000
            done = True
        elif self.score[1] < game_info['score'][1]:
            goal_reward = 10000
            done = True
        if self.red_team:
            goal_reward *= -1
        reward += goal_reward

        self.score = game_info['score']

        state = [
            game_info['player']['position']['x'],
            game_info['player']['position']['y'],
            game_info['player']['velocity']['x'],
            game_info['player']['velocity']['y'],
            # game_info['opponent']['position']['x'],
            # game_info['opponent']['position']['y'],
            # game_info['opponent']['velocity']['x'],
            # game_info['opponent']['velocity']['y'],
            game_info['ball']['position']['x'],
            game_info['ball']['position']['y'],
            game_info['ball']['velocity']['x'],
            game_info['ball']['velocity']['y'],
            # int(self._buttons_state['left']),
            # int(self._buttons_state['right']),
            # int(self._buttons_state['up']),
            # int(self._buttons_state['down']),
            # int(self._buttons_state['space']),
            distanza_alla_palla
        ]

        return state, reward, done

    def one_step(self, prev_state, epsilon):
        a = self.get_action(prev_state, epsilon=epsilon)
        next_s, r, done = self.qlearning_step(a)
        logging.debug('%s: Reward: %d, Action: %s, Done: %s' % ('RED' if self.red_team else 'BLUE', round(r, 1), a, done))

        if self.network.train:
            with self.network.access_lock:
                self.network.sess.run(self.network.train_step, {
                    self.network.states_ph: [prev_state], self.network.actions_ph: [a], self.network.rewards_ph: [r],
                    self.network.next_states_ph: [next_s], self.network.is_done_ph: [done]
                })

        return next_s, r, done
