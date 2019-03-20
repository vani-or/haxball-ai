# This code is shamelessly stolen from https://github.com/openai/baselines/blob/master/baselines/deepq/replay_buffer.py
import datetime
import os
import pickle

import numpy as np
import random


class ReplayBuffer(object):
    def __init__(self, size, observation_size: int, observation_dtype='float16', action_dtype='uint8', reward_dtype='float16'):
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

        self._obs_t = np.zeros(shape=(self._maxsize, self._observation_size), dtype=observation_dtype)
        self._obs_tp1 = np.zeros(shape=(self._maxsize, self._observation_size), dtype=observation_dtype)
        self._action = np.zeros(shape=(self._maxsize, ), dtype=action_dtype)
        self._reward = np.zeros(shape=(self._maxsize, ), dtype=reward_dtype)
        self._done = np.zeros(shape=(self._maxsize, ), dtype='uint8')

        self._next_idx = 0

        previous_buffers = sorted([x for x in os.listdir('buffers') if x.endswith('.npz')])
        if previous_buffers:
            fn = 'buffers/' + previous_buffers[-1]
            npzfile = np.load(fn)
            self._obs_t = npzfile['obs_t']
            self._obs_tp1 = npzfile['obs_tp1']
            self._action = npzfile['action']
            self._reward = npzfile['reward']
            self.done = npzfile['done']
            self._next_idx = npzfile['next_idx']

    def __len__(self):
        if self._filled_once:
            return self._maxsize
        else:
            return self._next_idx

    def add(self, obs_t, action, reward, obs_tp1, done):
        self._obs_t[self._next_idx] = obs_t
        self._action[self._next_idx] = action
        self._reward[self._next_idx] = reward
        self._obs_tp1[self._next_idx] = obs_tp1
        self._done[self._next_idx] = done

        if self._next_idx > 0 and self._next_idx == self._maxsize - 1:
            self.serialize()
            self._filled_once = True

        self._next_idx = (self._next_idx + 1) % self._maxsize

    def _encode_sample(self, idxes):
        obses_t = self._obs_t[idxes]
        actions = self._action[idxes]
        rewards = self._reward[idxes]
        obses_tp1 = self._obs_tp1[idxes]
        dones = self._done[idxes]

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
        if self._filled_once:
            idxes = np.random.randint(self._maxsize, size=batch_size)
        else:
            idxes = np.random.randint(self._next_idx, size=batch_size)
        return self._encode_sample(idxes)

    def serialize(self):
        filename = 'buffers/buffer_%s.npz' % datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        np.savez(
            filename,
            obs_t=self._obs_t,
            action=self._action,
            reward=self._reward,
            obs_tp1=self._obs_tp1,
            done=self._done,
            next_idx=self._next_idx
        )

