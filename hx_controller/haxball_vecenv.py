import logging
from copy import copy
from typing import List

from baselines.common.vec_env import VecEnv
import numpy as np
from baselines.common.vec_env.util import obs_space_info
from simulator import create_start_conditions
from simulator.simulator.cenv import Vector as CVector, create_start_conditions as Ccreate_start_conditions
from hx_controller.haxball_gym import Haxball
from multiprocessing import Process, Pipe, cpu_count
from multiprocessing.connection import Connection


class HaxballVecEnv(VecEnv):
    def __init__(self, num_fields, max_ticks=2400):
        self.num_fields = num_fields
        self.num_envs = num_fields * 2
        self.envs = []
        for i in range(num_fields):
            gameplay = Ccreate_start_conditions()
            env = Haxball(gameplay=gameplay, max_ticks=max_ticks)
            self.envs.append(env)

        env = self.envs[0]

        self.observation_space = env.observation_space
        self.action_space = env.action_space
        self.keys, shapes, dtypes = obs_space_info(self.observation_space)

        self.buf_obs = {k: np.zeros((self.num_envs,) + tuple(shapes[k]), dtype=dtypes[k]) for k in self.keys}
        self.buf_dones = np.zeros((self.num_envs,), dtype=np.bool)
        self.buf_rews = np.zeros((self.num_envs,), dtype=np.float32)
        self.buf_infos = [{} for _ in range(self.num_envs)]
        self.actions = None
        self.spec = self.envs[0].spec

    def reset(self):
        print('reset_all')
        all_results = []
        for e in range(self.num_fields):
            obs = self.envs[e].reset()
            all_results.append(obs)
            all_results.append(obs)
            # all_results.append(obs)
            # all_results.append(obs)
            # all_results.append(self.envs[e].invert_state(obs))
            # all_results.append(self.envs[e].invert_state(obs))
        return np.stack(all_results)
            # self._save_obs(e, obs)
        # return self._obs_from_buf()

    def _save_obs(self, e, obs):
        for k in self.keys:
            if k is None:
                self.buf_obs[k][e] = obs
            else:
                self.buf_obs[k][e] = obs[k]

    def _obs_from_buf(self):
        # return dict_to_obs(copy_obs_dict(self.buf_obs))
        return self.buf_obs

    def step(self, actions, *args, **kwargs):
        """
        Step the environments synchronously.

        This is available for backwards compatibility.
        """
        self.step_async(actions, *args, **kwargs)
        return self.step_wait()

    def step_async(self, actions, *args, **kwargs):
        for env, a1, a2 in zip(self.envs, actions[0::2], actions[1::2]):
            env.step_async(a1, red_team=True)
            env.step_async(a2, red_team=False)

    def step_wait(self):
        obss = []
        rews = []
        dones = []
        infos = []
        for env in self.envs:
            is_done = False
            for red_team in (True, False):
                obs, rew, done, info = env.step_wait(red_team=red_team)
                obss.append(obs)
                rews.append(rew)
                dones.append(done)
                infos.append(info)
                is_done |= done
            if is_done:
                env.reset()
        return obss, rews, dones, infos

    def get_images(self):
        return [env.render(mode='rgb_array') for env in self.envs]

    def render(self, mode='human'):
        if self.num_envs == 1:
            return self.envs[0].render(mode=mode)
        else:
            return super().render(mode=mode)

    def invert_state(self, state):
        new_state = copy(state)
        new_state[1] *= -1  # ['player']['position']['y']
        new_state[3] *= -1  # ['player']['velocity']['y']
        new_state[5] *= -1  # ['opponent']['position']['y']
        new_state[7] *= -1  # ['opponent']['velocity']['y']
        new_state[9] *= -1  # ['ball']['position']['y']
        new_state[11] *= -1  # ['ball']['velocity']['y']
        return new_state

    def invert_states(self, states: np.ndarray):
        new_states = np.array(states, copy=True)
        new_states[:, 1] *= -1  # ['player']['position']['y']
        new_states[:, 3] *= -1  # ['player']['velocity']['y']
        new_states[:, 5] *= -1  # ['opponent']['position']['y']
        new_states[:, 7] *= -1  # ['opponent']['velocity']['y']
        new_states[:, 9] *= -1  # ['ball']['position']['y']
        new_states[:, 11] *= -1  # ['ball']['velocity']['y']
        return new_states

    def invert_actions(self, actions: np.ndarray):
        new_actions = np.array(actions, copy=True)
        new_actions[actions == 1] = 5  # up -> down
        new_actions[actions == 5] = 1  # down -> up
        new_actions[actions == 2] = 4  # up-right -> down-right
        new_actions[actions == 4] = 2  # down-right -> up-right
        new_actions[actions == 6] = 8  # down-left -> up-left
        new_actions[actions == 8] = 6  # up-left -> down-left
        return new_actions

    def invert_action(self, action):
        if action == 1:  # up
            return 5  # down
        elif action == 2:  # up & right
            return 4  # right & down
        elif action == 4:
            return 2
        elif action == 5:
            return 1
        elif action == 6:  # down & left
            return 8  # left & up
        elif action == 8:
            return 6
        return action


def env_worker(conn: Connection, **env_kwargs):
    gameplay = Ccreate_start_conditions()
    env = Haxball(gameplay=gameplay, **env_kwargs)
    i = 0
    while True:
        cmd, data = conn.recv()

        if cmd == 'step':
            a1, a2 = data
            env.step_async(a1, red_team=True)
            env.step_async(a2, red_team=False)

            env.step_physics()

            obss = []
            rews = []
            dones = []
            infos = []
            is_done = False

            for red_team in (True, False):
                obs, rew, done, info = env.step_wait(red_team=red_team)
                obss.append(obs)
                rews.append(rew)
                dones.append(done)
                infos.append(info)
                is_done |= done
            if is_done:
                env.reset()

            res = np.array(obss), np.array(rews), np.array(dones), np.array(infos)
            conn.send(res)
        elif cmd == 'reset':
            ob = env.reset()
            conn.send([ob, ob])
        elif cmd == 'render':
            res = env.render(mode='rgb_array')
            conn.send(res)
        elif cmd == 'close':
            conn.close()
            break
        elif cmd == 'get_spaces_spec':
            conn.send((env.observation_space, env.action_space, env.spec))
        else:
            raise NotImplementedError


class HaxballSubProcVecEnv(HaxballVecEnv):
    def __init__(self, num_fields, max_ticks=2400):
        self.num_fields = num_fields
        self.num_envs = num_fields * 2
        self.max_ticks = max_ticks

        self.connections = []  # type: List[Pipe]
        self.processes = []  # type: List[Process]
        for i in range(self.num_fields):
            parent_conn, child_conn = Pipe()
            p = Process(
                target=env_worker,
                daemon=True,
                args=(child_conn, ),
                kwargs=dict(max_ticks=self.max_ticks)
            )
            p.start()
            self.connections.append(parent_conn)
            self.processes.append(p)

        # self.connections[0].send(('get_spaces_spec', None))
        tmp_env = Haxball()
        observation_space = tmp_env.observation_space
        action_space = tmp_env.action_space
        # spec = tmp_env.spec
        # observation_space, action_space, spec = self.connections[0].recv()

        self.observation_space = observation_space
        self.action_space = action_space
        self.keys, shapes, dtypes = obs_space_info(self.observation_space)
        self.waiting = False

    def set_num_fields(self, num_fields):
        self.num_fields = max(1, num_fields)
        self.num_envs = self.num_fields * 2

        for process in self.processes:
            process.terminate()

        self.connections = []  # type: List[Pipe]
        self.processes = []  # type: List[Process]
        for i in range(self.num_fields):
            parent_conn, child_conn = Pipe()
            p = Process(
                target=env_worker,
                daemon=True,
                args=(child_conn,),
                kwargs=dict(max_ticks=self.max_ticks)
            )
            p.start()
            self.connections.append(parent_conn)
            self.processes.append(p)

    def step_async(self, actions, *args, **kwargs):
        for remote, a1, a2 in zip(self.connections, actions[0::2], actions[1::2]):
            remote.send(('step', (a1, a2)))
        self.waiting = True

    def step_wait(self):
        obs = None
        rews = None
        dones = None
        infos = None
        for remote in self.connections:
            result = remote.recv()
            if obs is None:
                obs = result[0]
                rews = result[1]
                dones = result[2]
                infos = result[3]
            else:
                obs = np.vstack((obs, result[0]))
                rews = np.hstack((rews, result[1]))
                dones = np.hstack((dones, result[2]))
                infos = np.hstack((infos, result[3]))

        self.waiting = False
        return np.stack(obs), np.stack(rews), np.stack(dones), infos

    def reset(self):
        for remote in self.connections:
            remote.send(('reset', None))
        obs = []
        for remote in self.connections:
            obs += remote.recv()
        return np.stack(obs)

    def get_images(self):
        for pipe in self.connections:
            pipe.send(('render', None))
        imgs = [pipe.recv() for pipe in self.connections]
        return imgs


def env_worker_multiple_envs(conn: Connection, **env_kwargs):
    envs = {}

    def get_env(field_id):
        if field_id in envs:
            return envs[field_id]
        else:
            gameplay = Ccreate_start_conditions()
            env = Haxball(gameplay=gameplay, **env_kwargs)
            envs[field_id] = env
            return env

    while True:
        cmd, data = conn.recv()

        if cmd == 'step':
            obss = []
            rews = []
            dones = []
            infos = []

            field_ids, a1s, a2s = zip(*data)
            players_i = []
            for i, field_id in enumerate(field_ids):
                field_id = field_ids[i]
                a1 = a1s[i]
                a2 = a2s[i]
                # rf1 = rf1s[i]
                # rf2 = rf2s[i]

                players_i.append(field_id * 2)
                players_i.append(field_id * 2 + 1)

                env = get_env(field_id)

                # Le azioni non sono immediate
                # steps_to_wait = max(1, np.random.poisson(lam=1))
                env.step_physics(3)

                env.step_async(a1, red_team=True)

                # env.step_physics(1)

                env.step_async(a2, red_team=False)

                env.step_physics(3)

                # Le misure di obs non sono immediate
                # steps_to_wait = max(1, np.random.poisson(lam=2))
                # steps_to_wait = 1
                # steps_to_wait = max(1, np.random.poisson(lam=1))
                # env.step_physics(steps_to_wait)

                is_done = False

                for red_team in (True, False):
                    obs, rew, done, info = env.step_wait(red_team=red_team)
                    obss.append(obs)
                    rews.append(rew)
                    dones.append(done)
                    info['field_id'] = field_id
                    info['players_i'] = field_id * 2 if red_team else field_id * 2 + 1
                    infos.append(info)
                    is_done |= done

                    # if red_team:
                    #     env.step_physics(1)
                if is_done:
                    env.reset()

            res = field_ids, players_i, np.array(obss), np.array(rews), np.array(dones), np.array(infos)
            conn.send(res)
        elif cmd == 'reset':
            field_id = data
            env = get_env(field_id)
            ob = env.reset()
            conn.send([ob, ob])
        elif cmd == 'render':
            field_id = data
            env = get_env(field_id)
            res = env.render(mode='rgb_array')
            conn.send(res)
        elif cmd == 'close':
            conn.close()
            break
        elif cmd == 'get_spaces_spec':
            field_id = data
            env = get_env(field_id)
            conn.send((env.observation_space, env.action_space, env.spec))
        else:
            raise NotImplementedError


class HaxballProcPoolVecEnv(HaxballVecEnv):
    def __init__(self, num_fields, max_ticks=2400):
        self.num_fields = num_fields
        self.num_envs = num_fields * 2  # per 2 perché pre 2 giocatori su un singolo campo
        self.max_ticks = max_ticks

        # self.n_processes = min(self.num_fields, cpu_count())
        self.n_processes = cpu_count()
        self.n_active_connections = max(self.num_fields, self.n_processes)
        logging.debug('Starting processes pool with N=%s' % self.n_processes)

        self.connections = []
        for i in range(self.n_processes):
            parent_conn, child_conn = Pipe()
            p = Process(
                target=env_worker_multiple_envs,
                daemon=True,
                args=(child_conn,),
                kwargs=dict(max_ticks=max_ticks)
            )
            p.start()
            self.connections.append(parent_conn)

        self.connections[0].send(('get_spaces_spec', 0))
        self.observation_space, self.action_space, spec = self.connections[0].recv()

        # self.conditions = []
        # for i in range(self.num_fields):
        #     gp = create_start_conditions()
        #     self.conditions.append(gp.export_state())

    def set_num_fields(self, num_fields):
        self.num_fields = max(1, num_fields)
        self.num_envs = self.num_fields * 2
        self.n_active_connections = min(self.num_fields, self.n_processes)

    def step_async(self, actions, *args, **kwargs):
        inputs = {i: [] for i in range(self.n_active_connections)}
        # if 'reward_functions' not in kwargs:
        #     kwargs['reward_functions'] = [None] * len(actions)
        # assert len(actions) == 2*self.num_fields
        for field_id, a1, a2 in zip(range(self.num_fields), actions[0::2], actions[1::2]):
            i_process = field_id % self.n_active_connections
            inputs[i_process].append((field_id, a1, a2))
            # remote = self.connections[i_process]
            # remote.send(('step', (field_id, a1, a2)))
        for i_process, vals in inputs.items():
            # for i_process in range(self.n_processes):
            remote = self.connections[i_process]
            remote.send(('step', vals))

    def step_wait(self):
        obs = np.ndarray(shape=(2 * self.num_fields, self.observation_space.shape[0]))
        rews = np.ndarray(shape=(2 * self.num_fields, ))
        dones = np.ndarray(shape=(2 * self.num_fields, ))
        infos = np.ndarray(shape=(2 * self.num_fields, ), dtype=object)
        # players = np.ndarray(shape=(2 * self.num_fields, ), dtype=object)

        for i in range(self.n_active_connections):
            remote = self.connections[i]
            result = remote.recv()
            field_ids = result[0]
            players_is = result[1]
            obs[players_is] = result[2]
            rews[players_is] = result[3]
            dones[players_is] = result[4]
            infos[players_is] = result[5]
            # players[players_is] = players_is

        # prev_start = -1
        # for field_id in range(self.num_fields):
        #     i_process = field_id % self.n_processes
        #     remote = self.connections[i_process]
        #     # for remote in self.connections:
        #     result = remote.recv()
        #     # print('arrived %s' % result[0])
        #     field_id = result[0]
        #     start = field_id * 2
        #     prev_start = start
        #     end = field_id * 2 + 2
        #     obs[start:end] = result[1]
        #     rews[start:end] = result[2]
        #     dones[start:end] = result[3]
        #     infos[start:end] = result[4]

        return np.stack(obs), np.stack(rews), np.stack(dones), infos

    def reset(self):
        for field_id in range(self.num_fields):
            i_process = field_id % self.n_processes
            remote = self.connections[i_process]
            remote.send(('reset', field_id))
        obs = []
        for field_id in range(self.num_fields):
            i_process = field_id % self.n_processes
            remote = self.connections[i_process]
            obs += remote.recv()
        return np.stack(obs)

    # def get_images(self):
    #     for field_id in range(self.num_fields):
    #         i_process = field_id % self.n_processes
    #         remote = self.connections[i_process]
    #         remote.send(('render', field_id))
    #     imgs = [remote.recv() for remote in self.connections]
    #     return imgs


if __name__ == '__main__':
    import time
    n_fields = 10
    N_iters = 500
    hx_env = HaxballProcPoolVecEnv(n_fields, max_ticks=2400)
    hx_env.reset()
    started = time.time()
    for i in range(N_iters):
        res = hx_env.step([1] * n_fields * 2)
    print('ProcessPool', time.time() - started)

    hx_sub_env = HaxballSubProcVecEnv(n_fields, max_ticks=2400)
    # obs = hx_sub_env.reset()

    started = time.time()
    for i in range(N_iters):
        res = hx_sub_env.step([1] * n_fields * 2)
    print('N process pipes', time.time() - started)
