import random
from abc import ABC, abstractmethod
from typing import Tuple

from pychrome.tab import Tab
import json


class HXController(object):
    def __init__(self, browser_tab: Tab, username: str) -> None:
        self.browser_tab = browser_tab
        self._buttons_state = {
            'left': False,
            'right': False,
            'up': False,
            'down': False,
            'space': False
        }
        self.username = username

    def get_game_info(self):
        exec_result = self.browser_tab.Runtime.evaluate(expression='JSON.stringify(getHxInfo(%s))' % repr(self.username))
        if 'result' in exec_result and 'value' in exec_result['result']:
            result = json.loads(exec_result['result']['value'])
            return result
        return None

    def send_button(self, key, up):
        event = 'keyup' if up else 'keydown'

        if key == 'left':
            comb = ('ArrowLeft', 'ArrowLeft', 37)
        elif key == 'right':
            comb = ('ArrowRight', 'ArrowRight', 39)
        elif key == 'down':
            comb = ('ArrowDown', 'ArrowDown', 40)
        elif key == 'up':
            comb = ('ArrowUp', 'ArrowUp', 38)
        elif key == 'space':
            comb = (' ', 'Space', 32)
        else:
            raise ValueError('Unknown key: %s' % key)

        self._buttons_state[key] = not up

        cmd = 'sendHxCommand("' + event + '", "%s", "%s", %d)' % comb
        self.browser_tab.Runtime.evaluate(expression=cmd)

    def get_possible_actions(self):
        return [(b, pressed) for b, pressed in self._buttons_state.items()]

    def get_best_move(self):
        actions = self.get_possible_actions()
        return random.choice(actions)


class HXEnvironment(ABC):
    @abstractmethod
    def prepare_input(self, action: int):
        ...

    @abstractmethod
    def get_step_results(self) -> Tuple[list, float, bool]:
        ...

    @abstractmethod
    def invert_state(self, state: list) -> list:
        ...

    @abstractmethod
    def invert_action(self, action: int) -> int:
        ...
