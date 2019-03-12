import math
import time
from copy import copy

from pychrome.tab import Tab
from hx_controller import HXController


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
            12: bottone LEFT premuto (bool)
            13: bottone RIGHT premuto (bool)
            14: bottone UP premuto (bool)
            15: bottone DOWN premuto (bool)
            16: bottone SPACE premuto (bool)

            # 12: distanza dal giocatore alla palla
            17: campo bloccato (1 se l'avversario deve ancora toccare la palla, 0 - se lo deve il giocatore o la partita è già iniziata)

        Output (Azioni):
            0: NULL (aspettare / non fare niente)
            1: Cambiare lo stato del bottone LEFT
            2: Cambiare lo stato del bottone RIGHT
            3: Cambiare lo stato del bottone UP
            4: Cambiare lo stato del bottone DOWN
            5: Cambiare lo stato del bottone SPACE
            # 1: premere LEFT per 100ms
            # 2: premere RIGHT per 100ms
            # 3: premere UP per 100ms
            # 4: premere DOWN per 100ms
            # 5: premere SPACE per 100ms
    """
    def __init__(self, browser_tab: Tab, username: str) -> None:
        super().__init__(browser_tab, username)
        self.action_2_button = {
            1: 'left',
            2: 'right',
            3: 'up',
            4: 'down',
            5: 'space',
        }
        initial_info = None
        while initial_info is None or not initial_info['player']:
            initial_info = self._get_game_info()
            time.sleep(0.5)

        self.score = initial_info['score']
        self.red_team = initial_info['player']['team'] == 'Red'
        self.not_started_yet = 0

    @classmethod
    def prodotto_scalare(cls, a, b):
        return (a[0] * b[0] + a[1] * b[1]) / cls.lung(a) / cls.lung(b)

    @classmethod
    def lung(cls, a):
        return math.sqrt(a[0] ** 2 + a[1] ** 2)

    def step(self, action):
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
            self.send_button(key, self._buttons_state[key])

        time.sleep(0.04)

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
            campo_bloccato = game_info['init']['team'] == 'Red' and not game_info['init']['started']
        else:
            campo_bloccato = game_info['init']['team'] == 'Blue' and not game_info['init']['started']

        reward = 0
        # La distanza dalla palla alla porta dell'avversario
        reward -= math.sqrt((game_info['ball']['position']['x'] + game_info['field_size'][0]) ** 2 + game_info['ball']['position']['y'] ** 2)

        # Distanza dal giocatore alla palla (divisa per due)
        reward -= math.sqrt((game_info['ball']['position']['x'] - game_info['player']['position']['x']) ** 2 + (game_info['ball']['position']['y'] - game_info['player']['position']['y']) ** 2) / 2

        # Velocità della palla verso la porta dell'avversario (però, va pensato bene, forse si deve contare solo i casi quando è il giocatore tocca la palla, ma non l'avversario)
        # vett_palla_porta = (game_info['field_size'][0] + game_info['ball']['position']['x'], game_info['ball']['position']['y'])
        # reward += self.prodotto_scalare(vett_palla_porta, (-game_info['ball']['velocity']['x'], game_info['ball']['velocity']['y']))

        # Penalità se il giocatore e "davanti" alla palla
        if game_info['player']['position']['x'] < game_info['ball']['position']['x']:
            reward -= (game_info['ball']['position']['x'] - game_info['player']['position']['x'])

        # Se il giocatore deve cominciare la partità facciamo la penalità incrementale
        if game_info['player']['team'] == game_info['init']['team'] and not game_info['init']['started']:
            reward -= 0.25 * self.not_started_yet
            self.not_started_yet += 1
        else:
            self.not_started_yet = 0

        done = False
        # Anche qua, forse non va aggiunto sempre
        goal_reward = 0
        if game_info['score'][0] != 0 or game_info['score'][1] != 0:
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
            game_info['opponent']['position']['x'],
            game_info['opponent']['position']['y'],
            game_info['opponent']['velocity']['x'],
            game_info['opponent']['velocity']['y'],
            game_info['ball']['position']['x'],
            game_info['ball']['position']['y'],
            game_info['ball']['velocity']['x'],
            game_info['ball']['velocity']['y'],
            int(self._buttons_state['left']) if not self.red_team else int(self._buttons_state['right']),
            int(self._buttons_state['right']) if not self.red_team else int(self._buttons_state['left']),
            int(self._buttons_state['up']) if not self.red_team else int(self._buttons_state['down']),
            int(self._buttons_state['down']) if not self.red_team else int(self._buttons_state['up']),
            int(self._buttons_state['space']),
            # distanza_alla_palla,
            int(campo_bloccato)
        ]

        return state, reward, done

    def invert_state(self, state):
        new_state = copy(state)
        new_state[1] *= -1  # ['player']['position']['y']
        new_state[3] *= -1  # ['player']['velocity']['y']
        new_state[5] *= -1  # ['opponent']['position']['y']
        new_state[7] *= -1  # ['opponent']['velocity']['y']
        new_state[9] *= -1  # ['ball']['position']['y']
        new_state[11] *= -1  # ['ball']['velocity']['y']
        t = new_state[14]
        new_state[14] = new_state[15]  # self._buttons_state['up']
        new_state[15] = t  # self._buttons_state['down']

        return new_state

    def invert_action(self, action):
        if action == 3:
            return 4
        elif action == 4:
            return 3
        return action
