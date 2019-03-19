# This code is shamelessly stolen from https://github.com/openai/baselines/blob/master/baselines/deepq/replay_buffer.py
import datetime
import os
import pickle

import numpy as np
import random


class ReplayBuffer(object):
    def __init__(self, size, observation_size: int):
        """Create Replay buffer.
        Parameters
        ----------
        size: int
            Max number of transitions to store in the buffer. When the buffer
            overflows the old memories are dropped.
        """
        self._maxsize = int(size)
        self._filled_once = False
        self._observation_size = observation_size
        # 2 * observation_size + 3  = serve per salvare |prev_s + action + reward + next_s + done| colonne
        self._storage = np.zeros(shape=(self._maxsize, 2 * self._observation_size + 3), dtype='float16')
        # indexes for sample matrix
        self._obs_t_columns_id = list(range(self._observation_size))
        self._action_columns_id = self._observation_size
        self._reward_columns_id = self._observation_size + 1
        self._obs_tp1_columns_id = list(range(self._observation_size + 2, 2 * self._observation_size + 2))
        self._done_columns_id = 2 * self._observation_size + 2

        self._next_idx = 0

        previous_buffers = sorted([x for x in os.listdir('buffers') if x.endswith('.npz')])
        if previous_buffers:
            fn = 'buffers/' + previous_buffers[-1]
            npzfile = np.load(fn)
            self._storage = npzfile['storage']
            self._next_idx = npzfile['next_idx']

    def __len__(self):
        return len(self._storage)

    def add(self, obs_t, action, reward, obs_tp1, done):
        # data = (obs_t, action, reward, obs_tp1, done)
        row = np.concatenate((obs_t, [action], [reward], obs_tp1, [done]))

        self._storage[self._next_idx] = row

        if self._next_idx > 0 and self._next_idx == self._maxsize - 1:
            self.serialize()
            self._filled_once = True

        self._next_idx = (self._next_idx + 1) % self._maxsize

    def _encode_sample(self, idxes):
        matrix = self._storage[idxes]
        obses_t = matrix[:, self._obs_t_columns_id]
        actions = matrix[:, self._action_columns_id]
        rewards = matrix[:, self._reward_columns_id]
        obses_tp1 = matrix[:, self._obs_tp1_columns_id]
        dones = matrix[:, self._done_columns_id]
        return obses_t, actions, rewards, obses_tp1, dones

    def sample(self, batch_size):
        """Sample a batch of experiences.
        Parameters
        ----------
        batch_size: int
            How many transitions to sample.
        Returns
        -------
        obs_batch: np.array
            batch of observations
        act_batch: np.array
            batch of actions executed given obs_batch
        rew_batch: np.array
            rewards received as results of executing act_batch
        next_obs_batch: np.array
            next set of observations seen after executing act_batch
        done_mask: np.array
            done_mask[i] = 1 if executing act_batch[i] resulted in
            the end of an episode and 0 otherwise.
        """
        # idxes = [random.randint(0, len(self._storage) - 1) for _ in range(batch_size)]
        if self._filled_once:
            idxes = np.random.randint(self._maxsize, size=batch_size)
        else:
            idxes = np.random.randint(self._next_idx, size=batch_size)
        return self._encode_sample(idxes)

    def serialize(self):
        filename = 'buffers/buffer_%s.npz' % datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        np.savez(filename, storage=self._storage, next_idx=self._next_idx)
