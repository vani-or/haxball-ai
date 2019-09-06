import math
import random
import sys
from copy import copy
from threading import Thread
from typing import Optional

import pygame
from gym.core import Env
from gym.spaces import Discrete, Box
from simulator import create_start_conditions, Vector, GamePlay
from simulator.visualizer import draw_frame
import numpy as np


class Haxball(Env):
    """
    Gli input sono:
        0:  posizione x del giocatore
        1:  posizione y del giocatore
        2:  velocità x del giocatore
        3:  velocità y del giocatore
        4:  posizione x del avversario
        5:  posizione y del avversario
        6:  velocità x del avversario
        7:  velocità y del avversario
        8:  posizione x della palla
        9:  posizione y della palla
        10: velocità x della palla
        11: velocità y della palla
        12: distanza dal giocatore alla palla
        13: campo bloccato (1 se l'avversario deve ancora toccare la palla, 0 - se lo deve il giocatore o la partita è già iniziata)

    Output (Azioni):
        0: NULL (aspettare / non fare niente)
        1: Premere UP
        2: Premere UP & RIGHT
        3: Premere RIGHT
        4: Premere RIGHT & DOWN
        5: Premere DOWN
        6: Premere DOWN & LEFT
        7: Premere LEFT
        8: Premere LEFT & UP
        9: Premere SPACE (fino a t+1)
    """

    def __init__(self, gameplay: Optional[GamePlay]=None, max_ticks=600) -> None:
        self.action_space = Discrete(10)
        self.observation_space = Box(low=-5000, high=5000, shape=(14, ))
        self.reward_range = (-10_000, 10_000)

        self._red_player_read_index = 5
        self._blue_player_read_index = 6
        self._red_player_write_index = 1
        self._blue_player_write_index = 2
        self._action_2_button = {
            1: ('up',),
            2: ('up', 'right'),
            3: ('right',),
            4: ('right', 'down'),
            5: ('down',),
            6: ('down', 'left'),
            7: ('left',),
            8: ('left', 'up'),
            9: ('space',),
        }
        self.max_ticks = max_ticks
        self._ticks = 0
        self.rendered = False

        if gameplay:
            self.gameplay = gameplay
        else:
            self.gameplay = create_start_conditions()

        self.last_red_obs_tick = 0
        self.last_blue_obs_tick = 0

        self.reset()

    def prepare_input(self, action, red_team: bool):
        keys_to_press = []
        if action in self._action_2_button:
            for key in self._action_2_button[action]:
                if red_team:
                    if key == 'up':
                        key = 'down'
                    elif key == 'down':
                        key = 'up'
                    elif key == 'left':
                        key = 'right'
                    elif key == 'right':
                        key = 'left'
                keys_to_press.append(key)

        write_index = self._red_player_write_index if red_team else self._blue_player_write_index
        self.gameplay.Pa.D[write_index].mb = 0
        self.gameplay.Pa.D[write_index].bc = 0
        for key in keys_to_press:
            if key == 'up':
                self.gameplay.Pa.D[write_index].mb |= 1
            elif key == 'down':
                self.gameplay.Pa.D[write_index].mb |= 2
            elif key == 'left':
                self.gameplay.Pa.D[write_index].mb |= 4
            elif key == 'right':
                self.gameplay.Pa.D[write_index].mb |= 8
            elif key == 'space':
                self.gameplay.Pa.D[write_index].mb |= 16
                self.gameplay.Pa.D[write_index].bc = 1  # TODO: correggere

    @classmethod
    def prodotto_scalare(cls, a, b):
        lung_a = max(1e-5, cls.lung(a))
        lung_b = max(1e-5, cls.lung(b))
        return (a[0] * b[0] + a[1] * b[1]) / lung_a / lung_b

    @classmethod
    def lung(cls, a):
        return math.sqrt(a[0] ** 2 + a[1] ** 2)

    @staticmethod
    def ball_position_rew(x, y):
        x1 = x
        return -25 * x1 * math.exp(-((y ** 2) / (x1 ** 2))) + 25

    def get_observation(self, red_team: bool, state_only=False, reward_function=None):
        # Lettura degli stati
        cur_read_index = self._red_player_read_index if red_team else self._blue_player_read_index
        opponent_read_index = self._blue_player_read_index if red_team else self._red_player_read_index

        ball_pos_x = self.gameplay.wa.K[0].a.x
        ball_pos_y = self.gameplay.wa.K[0].a.y
        ball_vel_x = self.gameplay.wa.K[0].M.x
        ball_vel_y = self.gameplay.wa.K[0].M.y
        player_pos_x = self.gameplay.wa.K[cur_read_index].a.x
        player_pos_y = self.gameplay.wa.K[cur_read_index].a.y
        player_vel_x = self.gameplay.wa.K[cur_read_index].M.x
        player_vel_y = self.gameplay.wa.K[cur_read_index].M.y
        opponent_pos_x = self.gameplay.wa.K[opponent_read_index].a.x
        opponent_pos_y = self.gameplay.wa.K[opponent_read_index].a.y
        opponent_vel_x = self.gameplay.wa.K[opponent_read_index].M.x
        opponent_vel_y = self.gameplay.wa.K[opponent_read_index].M.y

        deve_cominciare = False
        if red_team:
            ball_pos_x *= -1
            ball_pos_y *= -1
            ball_vel_x *= -1
            ball_vel_y *= -1
            player_pos_x *= -1
            player_pos_y *= -1
            player_vel_x *= -1
            player_vel_y *= -1
            opponent_pos_x *= -1
            opponent_pos_y *= -1
            opponent_vel_x *= -1
            opponent_vel_y *= -1
            campo_bloccato = (self.gameplay.Jd.o == 'Blue') and self.gameplay.zb == 0
            deve_cominciare = (self.gameplay.Jd.o == 'Red') and self.gameplay.zb == 0
        else:
            campo_bloccato = (self.gameplay.Jd.o == 'Red') and self.gameplay.zb == 0
            deve_cominciare = (self.gameplay.Jd.o == 'Blue') and self.gameplay.zb == 0

        # # # # # REWARD # # # # #
        reward = 0

        # self.gameplay.U.Ed - meta' lunghezza

        # La distanza dalla palla alla porta dell'avversario (penalità)
        # palla_porta_max_dist = math.sqrt(self.gameplay.U.Dd**2 + 4*self.gameplay.U.Ed**2)
        # distanza_palla_porta_avversario = math.sqrt((ball_pos_x + self.gameplay.U.Ed) ** 2 + ball_pos_y ** 2)
        # reward += -1 * distanza_palla_porta_avversario / palla_porta_max_dist

        # La distanza dalla palla alla porta del giocatore (premio piccolo)
        # reward += 0.1 * math.sqrt((self.gameplay.U.Ed - ball_pos_x) ** 2 + ball_pos_y ** 2)
        # reward += 0.1 * ((self.gameplay.U.Ed - ball_pos_x) ** 2 + ball_pos_y ** 2)

        # Distanza dal giocatore alla palla (divisa per due) (penalità)
        distanza_alla_palla = math.sqrt((ball_pos_x - player_pos_x) ** 2 + (ball_pos_y - player_pos_y) ** 2)
        reward -= 0.5 * distanza_alla_palla

        # if abs(ball_pos_x) >= 1:
        #    norm_x = ball_pos_x / self.gameplay.U.Ed
        #    norm_y = -ball_pos_y / self.gameplay.U.Dd
        #    # gr = -25 * norm_x * math.exp(-((norm_y**2)/(norm_x**2))) - 25
        #    gr = self.ball_position_rew(norm_x, norm_y)
        #    reward += gr

        # reward += player_vel_x ** 2 + player_vel_y ** 2

        # Velocità della palla verso la porta dell'avversario (però, va pensato bene, forse si deve contare solo i casi quando è il giocatore che tocca la palla, ma non l'avversario)
        if abs(ball_vel_x) > 0.01 or abs(ball_vel_y) > 0.01:
            vett_palla_porta = (self.gameplay.U.Ed + ball_pos_x, ball_pos_y)
            ps = self.prodotto_scalare(vett_palla_porta, (-ball_vel_x, ball_vel_y))
            velocita_palla = math.sqrt(ball_vel_x ** 2 + ball_vel_y ** 2)
            # if ps < 0:
            #     ps /= 2
            reward += 500 * ps * velocita_palla
            # print(50 * ps * velocita_palla)

        # reward += 50 * velocita_palla

        # Velocità troppo bassa (penalità)
        if not campo_bloccato:
            velocita_palla = math.sqrt(ball_vel_x ** 2 + ball_vel_y ** 2)
            reward -= 2000 * max(0.0, 0.1 - velocita_palla)

        # Penalità se il giocatore e' "davanti" alla palla
        # if player_pos_x < ball_pos_x:
        #     reward -= (ball_pos_x - player_pos_x)

        # Se il giocatore deve cominciare la partità facciamo la penalità incrementale
        # if game_info['player']['team'] == game_info['init']['team'] and not game_info['init']['started']:
        #     reward -= 0.25 * self.not_started_yet
        #     self.not_started_yet += 1
        # else:
        #     self.not_started_yet = 0

        # if not campo_bloccato and ball_pos_y == 0 and ball_pos_x == 0:
        #     reward -= 10

        # if campo_bloccato:
        #     reward = -0.5 * distanza_alla_palla

        done = False
        goal_reward = 0
        score = None
        if self.gameplay.red_scored:
            if red_team:
                print('goal from red')
                goal_reward = 50_000
                score = 1
            else:
                goal_reward = -5_000
                score = 0
            done = True
        elif self.gameplay.blue_scored:
            if red_team:
                goal_reward = -5_000
                score = 0
            else:
                print('goal from blue')
                goal_reward = 50_000
                score = 1
            done = True

        reward += goal_reward

        # if red_team:
        #     tick_passed_from_last_obs = self._ticks - self.last_red_obs_tick
        #     self.last_red_obs_tick = self._ticks
        # else:
        #     tick_passed_from_last_obs = self._ticks - self.last_blue_obs_tick
        #     self.last_blue_obs_tick = self._ticks

        state = [
            player_pos_x,
            player_pos_y,
            player_vel_x,
            player_vel_y,
            opponent_pos_x,
            opponent_pos_y,
            opponent_vel_x,
            opponent_vel_y,
            ball_pos_x,
            ball_pos_y,
            ball_vel_x,
            ball_vel_y,
            distanza_alla_palla,
            # ((self.max_ticks // 8 - self._ticks)) / (self.max_ticks // 8) if deve_cominciare else -1,
            # tick_passed_from_last_obs,
            int(campo_bloccato)
        ]

        if not done:
            if self._ticks >= self.max_ticks:
                done = True
                score = 0.5
                # reward -= 20_000
                if red_team:
                    print('draw')
            elif self._ticks >= self.max_ticks // 8:
                if deve_cominciare:
                    reward -= 5_000
                    score = 0
                    print('lost by doing nothing')
                    done = True
                elif campo_bloccato:
                    score = 1
                    done = True

        if state_only:
            return state

        return state, reward/1000, done, {'score': score}

    def step(self, action):
        # Invio degli input
        self.prepare_input(action, red_team=True)

        # Il tempo che corre
        for i in range(3):
            self.gameplay.step(1)

        # if self.rendered:
        #     draw_frame(self.screen, self.gameplay)
        #     pygame.display.flip()
        #     # self.clock.tick(20)

        self._ticks += 1

        return self.get_observation(red_team=True)

    def step_async(self, action, red_team):
        self.prepare_input(action, red_team)
        # Il tempo che corre
        # for i in range(3):
        #     self.gameplay.step(1)
        # self._ticks += 1

    def step_wait(self, red_team, reward_function=None):
        return self.get_observation(red_team, reward_function=reward_function)

    def step_physics(self, virtual_steps=6):
        for i in range(virtual_steps):
            self.gameplay.step(1)
        self._ticks += virtual_steps

    def step_two_agents(self, actions: list):
        # Invio degli input
        for action, red_team in zip(actions, (True, False)):
            self.prepare_input(action, red_team)

        # Il tempo che corre
        for i in range(3):
            self.gameplay.step(1)

        # if self.rendered:
        #     draw_frame(self.screen, self.gameplay)
        #     # pygame.display.flip()
        #     # self.clock.tick(20)

        self._ticks += 1

        obs = [self.get_observation(red_team) for red_team in (True, False)]
        return obs

    def reset(self, reward_functions=(None, None)):
        self.gameplay.reset()
        self._ticks = 0
        self.last_red_obs_tick = 0
        self.last_blue_obs_tick = 0

        obs = [self.get_observation(red_team, state_only=True, reward_function=reward_functions[i]) for i, red_team in ((0, True), (1, False))]

        return obs[0]

    def render(self, mode='human'):
        if mode == 'disable':
            self.rendered = False
        elif mode == 'human':
            size = width, height = 900, 520
            center = (width // 2, height // 2 + 30)
            black = 105, 150, 90

            pygame.init()
            self.clock = pygame.time.Clock()
            self.screen = pygame.display.set_mode(size)

            self.rendered = True
        elif mode == 'rgb_array':
            size = width, height = 900, 520
            center = (width // 2, height // 2 + 30)
            black = 105, 150, 90

            pygame.init()
            self.clock = pygame.time.Clock()
            self.screen = pygame.display.set_mode(size)

            self.rendered = True

            # surf = pygame.surfarray.make_surface(size)
            # self.screen.blit(surf, (0, 0))
            # image = pygame.Surface(size)
            # image.blit(self.screen, (0, 0), ((0, 0), size))
            img = pygame.Surface(size)
            draw_frame(img, self.gameplay)
            arr = pygame.surfarray.array3d(img)
            arr = np.swapaxes(arr, 0, 1)
            return arr

    def invert_state(self, state):
        new_state = copy(state)
        new_state[1] *= -1  # ['player']['position']['y']
        new_state[3] *= -1  # ['player']['velocity']['y']
        new_state[5] *= -1  # ['opponent']['position']['y']
        new_state[7] *= -1  # ['opponent']['velocity']['y']
        new_state[9] *= -1  # ['ball']['position']['y']
        new_state[11] *= -1  # ['ball']['velocity']['y']
        return new_state

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

