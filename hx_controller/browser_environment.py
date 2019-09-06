import math
import time
from copy import copy

from pychrome.tab import Tab

from config.config import settings
from hx_controller import HXController
from simulator import create_start_conditions
import numpy as np


class BrowserEnvironment(HXController):
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
            # 12: bottone LEFT premuto (bool)
            # 13: bottone RIGHT premuto (bool)
            # 14: bottone UP premuto (bool)
            # 15: bottone DOWN premuto (bool)
            # 16: bottone SPACE premuto (bool)

            12: distanza dal giocatore alla palla
            13: campo bloccato (1 se l'avversario deve ancora toccare la palla, 0 - se lo deve il giocatore o la partita è già iniziata)
            # 14: tempo passato (t)

        Output (Azioni):
            0: NULL (aspettare / non fare niente)
            # 1: Cambiare lo stato del bottone LEFT
            # 2: Cambiare lo stato del bottone RIGHT
            # 3: Cambiare lo stato del bottone UP
            # 4: Cambiare lo stato del bottone DOWN
            # 5: Cambiare lo stato del bottone SPACE
            # 1: premere LEFT per 100ms
            # 2: premere RIGHT per 100ms
            # 3: premere UP per 100ms
            # 4: premere DOWN per 100ms
            # 5: premere SPACE per 100ms
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
    def __init__(self, browser_tab: Tab, username: str) -> None:
        super().__init__(browser_tab, username)
        # self.action_2_button = {
        #     1: 'left',
        #     2: 'right',
        #     3: 'up',
        #     4: 'down',
        #     5: 'space',
        # }
        self.action_2_button = {
            1: ('up', ),
            2: ('up', 'right'),
            3: ('right', ),
            4: ('right', 'down'),
            5: ('down', ),
            6: ('down', 'left'),
            7: ('left', ),
            8: ('left', 'up'),
            9: ('space', ),
        }
        self.action_2_symbol = {
            0: ' ',
            1: '↑',
            2: '↗',
            3: '→',
            4: '↘',
            5: '↓',
            6: '↙',
            7: '←',
            8: '↖',
            9: 'S',
        }
        initial_info = None
        while initial_info is None or not initial_info['player']:
            initial_info = self.get_game_info()
            time.sleep(0.5)

        self.score = initial_info['score']
        self.red_team = initial_info['player']['team'] == 'Red'
        self.not_started_yet = 0
        self.game_finished = False
        self.tempo = 0
        self.prev_info_hash = -1
        self.prev_info = None

    @classmethod
    def prodotto_scalare(cls, a, b):
        lung_a = max(1e-5, cls.lung(a))
        lung_b = max(1e-5, cls.lung(b))
        return (a[0] * b[0] + a[1] * b[1]) / lung_a / lung_b

    @classmethod
    def get_all_dict_values(cls, d: dict) -> list:
        values = []
        if isinstance(d, dict):
            for v in d.values():
                if isinstance(v, dict):
                    sub_values = cls.get_all_dict_values(v)
                    for sv in sub_values:
                        values.append(sv)
                elif isinstance(v, list):
                    for sv in v:
                        values.append(sv)
                else:
                    values.append(v)
        return list(map(str, values))

    @classmethod
    def lung(cls, a):
        return math.sqrt(a[0] ** 2 + a[1] ** 2)

    def release_all_buttons(self):
        for key, pressed in self._buttons_state.items():
            if pressed:
                self.send_button(key, up=True)

    get_info_times = []
    press_buttons_times = []
    get_info_counter = 0
    press_buttons_counter = 0

    def step(self, action):
        # Capire quali bottoni da premere
        # st = time.time()
        keys_to_press = []
        if action in self.action_2_button:
            for key in self.action_2_button[action]:
                if self.red_team:
                    if key == 'up':
                        key = 'down'
                    elif key == 'down':
                        key = 'up'
                    elif key == 'left':
                        key = 'right'
                    elif key == 'right':
                        key = 'left'
                keys_to_press.append(key)

        # Lasciare lo spazio (in ogni caso)
        if self._buttons_state['space']:
            self.send_button('space', up=True)

        # Lasciare tutti (tranne quei che dobbiamo premere) i bottoni premuti
        for key, pressed in self._buttons_state.items():
            if pressed and key not in keys_to_press:
                self.send_button(key, up=True)

        # Premere i bottoni giusti
        for key in keys_to_press:
            if not self._buttons_state[key]:
                self.send_button(key, up=False)

        # Aspetto l'effeto dell'azione
        # time.sleep(settings['REWARD_WAIT_TIME'])
        # while time.time() - st < 0.0333:
        #     time.sleep(0.001)

        # Ottengo l'info del gioco dal JavaScript
        new_info_hash = 0
        game_info = None
        i = 0
        while game_info is None or new_info_hash == self.prev_info_hash:
            game_info = self.get_game_info()
            new_info_hash = sum(map(hash, sorted(self.get_all_dict_values(game_info))))
            i += 1
        print('hash is: %s' % i)
        self.prev_info = game_info
        self.prev_info_hash = new_info_hash

        if not game_info or not game_info['player'] or not game_info['opponent']:
            return

        # Se è necessario inverto subito tutte le coordinate per giocare sempre la stessa squadra (Blue)
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
            campo_bloccato = game_info['init']['team'] == 'Blue' and not game_info['init']['started']
        else:
            campo_bloccato = game_info['init']['team'] == 'Red' and not game_info['init']['started']

        if game_info['ball']['position']['x'] == 0 and game_info['ball']['position']['y'] == 0:
            self.game_finished = False

        # # # # # REWARD # # # # #
        reward = 0

        # La distanza dalla palla alla porta dell'avversario (penalità)
        # reward -= math.sqrt((game_info['ball']['position']['x'] + game_info['field_size'][0]) ** 2 + game_info['ball']['position']['y'] ** 2)

        # La distanza dalla palla alla porta del giocatore (premio piccolo)
        # reward += 0.1 * math.sqrt((game_info['field_size'][0] - game_info['ball']['position']['x']) ** 2 + game_info['ball']['position']['y'] ** 2)

        # Distanza dal giocatore alla palla (divisa per due) (penalità)
        distanza_alla_palla = math.sqrt((game_info['ball']['position']['x'] - game_info['player']['position']['x']) ** 2 + (game_info['ball']['position']['y'] - game_info['player']['position']['y']) ** 2)
        reward -= 0.5 * distanza_alla_palla

        ball_pos_x = game_info['ball']['position']['x']
        ball_pos_y = game_info['ball']['position']['y']
        ball_vel_x = game_info['ball']['velocity']['x']
        ball_vel_y = game_info['ball']['velocity']['y']
        field_half_width = game_info['field_size'][0]
        if abs(ball_vel_x) > 0.01 or abs(ball_vel_y) > 0.01:
            vett_palla_porta = (field_half_width + ball_pos_x, ball_pos_y)
            ps = self.prodotto_scalare(vett_palla_porta, (-ball_vel_x, ball_vel_y))
            velocita_palla = math.sqrt(ball_vel_x ** 2 + ball_vel_y ** 2)
            # if ps < 0:
            #     ps /= 2
            reward += 500 * ps * velocita_palla

        # Velocità della palla verso la porta dell'avversario (però, va pensato bene, forse si deve contare solo i casi quando è il giocatore che tocca la palla, ma non l'avversario)
        # vett_palla_porta = (game_info['field_size'][0] + game_info['ball']['position']['x'], game_info['ball']['position']['y'])
        # reward += self.prodotto_scalare(vett_palla_porta, (-game_info['ball']['velocity']['x'], game_info['ball']['velocity']['y']))

        # Velocità troppo bassa (penalità)
        if not campo_bloccato:
            velocita_palla = math.sqrt(game_info['ball']['velocity']['x'] ** 2 + game_info['ball']['velocity']['y'] ** 2)
            reward -= 2000 * max(0.0, 0.1 - velocita_palla)

        # Penalità se il giocatore e "davanti" alla palla
        # if game_info['player']['position']['x'] < game_info['ball']['position']['x']:
        #     reward -= (game_info['ball']['position']['x'] - game_info['player']['position']['x'])

        # Se il giocatore deve cominciare la partità facciamo la penalità incrementale
        # if game_info['player']['team'] == game_info['init']['team'] and not game_info['init']['started']:
        #     reward -= 0.25 * self.not_started_yet
        #     self.not_started_yet += 1
        # else:
        #     self.not_started_yet = 0

        # if not campo_bloccato:
        #     reward -= 0.25 * self.tempo
        #     self.tempo += 1

        done = False
        # Anche qua, forse non va aggiunto sempre
        goal_reward = 0
        if game_info['score'][0] != 0 or game_info['score'][1] != 0:
            score_index = 0 if self.red_team else 1
            if self.score[score_index] < game_info['score'][score_index]:
                # premio, abbiamo segnato
                goal_reward = 50_000
                self.game_finished = True
                done = True
            elif self.score[1 - score_index] < game_info['score'][1 - score_index]:
                # penalità, abbiamo subito
                goal_reward = -5_000
                self.game_finished = True
                done = True
        reward += goal_reward

        self.score = game_info['score']

        state = [
            game_info['player']['position']['x'],
            game_info['player']['position']['y'],
            game_info['player']['velocity']['x'],
            game_info['player']['velocity']['y'],
            game_info['opponent']['position']['x'],
            game_info['opponent']['position']['y'],
            game_info['opponent']['velocity']['x'],
            game_info['opponent']['velocity']['y'],
            game_info['ball']['position']['x'],
            game_info['ball']['position']['y'],
            game_info['ball']['velocity']['x'],
            game_info['ball']['velocity']['y'],
            distanza_alla_palla,
            int(campo_bloccato),
            # self.tempo
        ]

        return state, reward / 1000, done

    def invert_state(self, state):
        new_state = copy(state)
        new_state[1] *= -1  # ['player']['position']['y']
        new_state[3] *= -1  # ['player']['velocity']['y']
        new_state[5] *= -1  # ['opponent']['position']['y']
        new_state[7] *= -1  # ['opponent']['velocity']['y']
        new_state[9] *= -1  # ['ball']['position']['y']
        new_state[11] *= -1  # ['ball']['velocity']['y']
        # t = new_state[14]
        # new_state[14] = new_state[15]  # self._buttons_state['up']
        # new_state[15] = t  # self._buttons_state['down']

        return new_state

    def invert_action(self, action):
        # if action == 3:
        #     return 4
        # elif action == 4:
        #     return 3
        # return action
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
