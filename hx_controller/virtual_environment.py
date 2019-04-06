import math
from copy import copy

from hx_controller import HXEnvironment
from simulator import GamePlay


class VirtualEnvironment(HXEnvironment):
    def __init__(self, gameplay: GamePlay, squadra_rossa:bool=False) -> None:
        self.gameplay = gameplay
        self.squadra_rossa = squadra_rossa
        self.player_read_index = 5 if squadra_rossa else 6
        self.opponent_read_index = 5 + 6 - self.player_read_index
        self.player_write_index = 1 if squadra_rossa else 2
        self.action_2_button = {
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

    def prepare_input(self, action):
        keys_to_press = []
        if action in self.action_2_button:
            for key in self.action_2_button[action]:
                if self.squadra_rossa:
                    if key == 'up':
                        key = 'down'
                    elif key == 'down':
                        key = 'up'
                    elif key == 'left':
                        key = 'right'
                    elif key == 'right':
                        key = 'left'
                keys_to_press.append(key)

        self.gameplay.Pa.D[self.player_write_index].mb = 0
        self.gameplay.Pa.D[self.player_write_index].bc = 0
        for key in keys_to_press:
            if key == 'up':
                self.gameplay.Pa.D[self.player_write_index].mb |= 1
            elif key == 'down':
                self.gameplay.Pa.D[self.player_write_index].mb |= 2
            elif key == 'left':
                self.gameplay.Pa.D[self.player_write_index].mb |= 4
            elif key == 'right':
                self.gameplay.Pa.D[self.player_write_index].mb |= 8
            elif key == 'space':
                self.gameplay.Pa.D[self.player_write_index].mb |= 16
                self.gameplay.Pa.D[self.player_write_index].bc = 1  # TODO: correggere

    def get_step_results(self):
        # Se è necessario inverto subito tutte le coordinate per giocare sempre la stessa squadra (Blue)
        ball_pos_x = self.gameplay.wa.K[0].a.x
        ball_pos_y = self.gameplay.wa.K[0].a.y
        ball_vel_x = self.gameplay.wa.K[0].M.x
        ball_vel_y = self.gameplay.wa.K[0].M.y
        player_pos_x = self.gameplay.wa.K[self.player_read_index].a.x
        player_pos_y = self.gameplay.wa.K[self.player_read_index].a.y
        player_vel_x = self.gameplay.wa.K[self.player_read_index].M.x
        player_vel_y = self.gameplay.wa.K[self.player_read_index].M.y
        opponent_pos_x = self.gameplay.wa.K[self.opponent_read_index].a.x
        opponent_pos_y = self.gameplay.wa.K[self.opponent_read_index].a.y
        opponent_vel_x = self.gameplay.wa.K[self.opponent_read_index].M.x
        opponent_vel_y = self.gameplay.wa.K[self.opponent_read_index].M.y

        if self.squadra_rossa:
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
        else:
            campo_bloccato = (self.gameplay.Jd.o == 'Red') and self.gameplay.zb == 0

        # # # # # REWARD # # # # #
        reward = 0

        # self.gameplay.U.Ed - meta' lunghezza

        # La distanza dalla palla alla porta dell'avversario (penalità)
        reward -= math.sqrt((ball_pos_x + self.gameplay.U.Ed) ** 2 + ball_pos_y ** 2)

        # La distanza dalla palla alla porta del giocatore (premio piccolo)
        reward += 0.1 * math.sqrt((self.gameplay.U.Ed - ball_pos_x) ** 2 + ball_pos_y ** 2)

        # Distanza dal giocatore alla palla (divisa per due) (penalità)
        distanza_alla_palla = math.sqrt((ball_pos_x - player_pos_x) ** 2 + (ball_pos_y - player_pos_y) ** 2)
        reward -= distanza_alla_palla / 2

        # Velocità della palla verso la porta dell'avversario (però, va pensato bene, forse si deve contare solo i casi quando è il giocatore che tocca la palla, ma non l'avversario)
        # vett_palla_porta = (game_info['field_size'][0] + game_info['ball']['position']['x'], game_info['ball']['position']['y'])
        # reward += self.prodotto_scalare(vett_palla_porta, (-game_info['ball']['velocity']['x'], game_info['ball']['velocity']['y']))

        # Velocità troppo bassa (penalità)
        if not campo_bloccato:
            velocita_palla = math.sqrt(ball_vel_x ** 2 + ball_vel_y ** 2)
            reward -= 100 * max(0.0, 0.5 - velocita_palla)

        # Penalità se il giocatore e "davanti" alla palla
        if player_pos_x < ball_pos_x:
            reward -= (ball_pos_x - player_pos_x)

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
        goal_reward = 0
        if self.gameplay.red_scored:
            if self.squadra_rossa:
                goal_reward = 500
            else:
                goal_reward = -200
            done = True
        elif self.gameplay.blue_scored:
            if self.squadra_rossa:
                goal_reward = -200
            else:
                goal_reward = 500
            done = True

        reward += goal_reward

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
