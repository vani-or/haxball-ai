import os

import tensorflow as tf
from keras.models import Sequential
from keras.layers import Dense, InputLayer
import numpy as np
from hx_controller import HXController


class DQNAgent:
    def __init__(self, name, state_shape, n_actions, epsilon=0, reuse=False):
        """A simple DQN agent"""
        self.n_actions = n_actions
        self.name = name
        self.filename = '%s.h5' % self.name

        with tf.variable_scope(name, reuse=reuse):
            self.model = Sequential()
            self.model.add(InputLayer(state_shape))
            self.model.add(Dense(256, activation='relu'))
            self.model.add(Dense(128, activation='relu'))
            self.model.add(Dense(64, activation='relu'))
            self.model.add(Dense(n_actions, activation='linear'))

            # prepare a graph for agent step
            self.state_t = tf.placeholder('float32', [None, ] + list(state_shape))
            self.qvalues_t = self.get_symbolic_qvalues(self.state_t)

        self.weights = tf.get_collection(tf.GraphKeys.TRAINABLE_VARIABLES, scope=name)
        self.epsilon = epsilon

    def get_symbolic_qvalues(self, state_t):
        """takes agent's observation, returns qvalues. Both are tf Tensors"""
        qvalues = self.model(state_t)

        assert tf.is_numeric_tensor(qvalues) and qvalues.shape.ndims == 2, \
            "please return 2d tf tensor of qvalues [you got %s]" % repr(qvalues)
        assert int(qvalues.shape[1]) == self.n_actions

        return qvalues

    def get_qvalues(self, session, state_t):
        """Same as symbolic step except it operates on numpy arrays"""
        return session.run(self.qvalues_t, {self.state_t: state_t})

    def sample_actions(self, qvalues):
        """pick actions given qvalues. Uses epsilon-greedy exploration strategy. """
        epsilon = self.epsilon
        batch_size, n_actions = qvalues.shape
        random_actions = np.random.choice(n_actions, size=batch_size)
        best_actions = qvalues.argmax(axis=-1)
        should_explore = np.random.choice([0, 1], batch_size, p=[1 - epsilon, epsilon])

        return np.where(should_explore, random_actions, best_actions)

    def save_model(self):
        self.model.save_weights(self.filename)

    def load_model(self):
        if os.path.exists(self.filename):
            self.model.load_weights(self.filename)
