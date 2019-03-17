import datetime
import os
import pickle

import numpy as np


class NaivePrioritizedBuffer(object):
    """
    Prioritized Experience Replay: https://arxiv.org/abs/1511.05952

    """
    def __init__(self, capacity, prob_alpha=0.6):
        self.prob_alpha = prob_alpha
        self.capacity = capacity
        self.buffer = []
        self.pos = 0
        self.priorities = np.zeros((capacity,), dtype=np.float32)

        previous_buffers = sorted([x for x in os.listdir('buffers') if '.pkl' in x])
        if previous_buffers:
            with open('buffers/' + previous_buffers[-1], 'rb') as fp:
                self.buffer, self.priorities, self.prob_alpha = pickle.load(fp)
                self.pos = len(self.buffer)

    def add(self, state, action, reward, next_state, done):
        state = np.expand_dims(state, 0)
        next_state = np.expand_dims(next_state, 0)

        max_prio = self.priorities.max() if self.buffer else 1.0

        if len(self.buffer) < self.capacity:
            self.buffer.append((state, action, reward, next_state, done))
        else:
            self.buffer[self.pos] = (state, action, reward, next_state, done)

        self.priorities[self.pos] = max_prio
        self.pos = (self.pos + 1) % self.capacity

        if self.pos > 0 and self.pos == self.capacity - 1:
            self.serialize()

    def sample(self, batch_size, beta=0.4):
        if len(self.buffer) == self.capacity:
            prios = self.priorities
        else:
            prios = self.priorities[:self.pos]

        probs = prios ** self.prob_alpha
        probs /= probs.sum()

        indices = np.random.choice(len(self.buffer), batch_size, p=probs)
        samples = [self.buffer[idx] for idx in indices]

        total = len(self.buffer)
        weights = (total * probs[indices]) ** (-beta)
        weights /= weights.max()
        weights = np.array(weights, dtype=np.float32)

        batch = list(zip(*samples))
        states = np.concatenate(batch[0])
        actions = batch[1]
        rewards = batch[2]
        next_states = np.concatenate(batch[3])
        dones = batch[4]

        return states, actions, rewards, next_states, dones, indices, weights

    def update_priorities(self, batch_indices, batch_priorities):
        for idx, prio in zip(batch_indices, batch_priorities):
            self.priorities[idx] = prio

    def __len__(self):
        return len(self.buffer)

    def serialize(self):
        filename = 'buffers/buffer_%s.pkl' % datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        with open(filename, 'wb') as fp:
            pickle.dump([self.buffer, self.priorities, self.prob_alpha], fp)
