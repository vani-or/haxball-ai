import base64
import logging
import os
import random
import time
import traceback
from queue import Queue
from threading import Thread, Lock

import names

from config.config import settings
from hx_controller.browser_environment import BrowserEnvironment
from hx_controller.chrome import Chrome
from hx_controller.qlearning import QLearning


def run_host(token: str, room_queue: Queue):
    br = Chrome(headless=True, port=get_next_port_number())
    print('Launching chrome...')
    br.launch()
    tab = br.get_chrome_tab()
    tab.Page.navigate(url='https://html5.haxball.com/headless')
    time.sleep(5)

    cur_path = os.path.dirname(os.path.realpath(__file__))
    with open(cur_path + '/host/init.js', 'r') as fp:
        js = fp.read().replace('__TOKEN__', token).replace('__PASSWORD__', settings['ROOM_PASSWORD'])
        tab.Runtime.evaluate(expression=js)

    while True:
        res = tab.Runtime.evaluate(expression='window.url')
        if 'result' in res and 'value' in res['result']:
            print('Room created!')
            # print('OK! Your room link is: %s' % res['result']['value'])
            room_queue.put(res['result']['value'])
            break
        time.sleep(0.25)


def inject(js):
    with open('js/game.js', 'r') as fp:
        return fp.read()


def requestIntercepted(tab):
    def handler(*args, **kwargs):
        resp = tab.Network.getResponseBodyForInterception(interceptionId=kwargs['interceptionId'])
        if resp['base64Encoded']:
            js = base64.standard_b64decode(resp['body'])
        else:
            js = resp['body']

        new_js = inject(js.decode('utf-8'))
        tab.Network.continueInterceptedRequest(
            interceptionId=kwargs['interceptionId'],
            rawResponse=base64.b64encode(new_js.encode('utf-8')).decode('utf-8')
        )
    return handler


def run_agent(room_url: str, players_queue: Queue):
    username = names.get_first_name(gender=random.choice(['male', 'female'])) + '_'

    print('Creating player %s...' % username)
    br = Chrome(port=get_next_port_number())
    br.launch()
    tab = br.get_chrome_tab('tab')
    tab.Network.enable()
    tab.Network.setRequestInterception(patterns=[{'urlPattern': '*game*.js', 'interceptionStage': 'HeadersReceived'}])
    tab.Network.requestIntercepted = requestIntercepted(tab)
    tab.Page.navigate(url=room_url)

    time.sleep(10)

    with open('js/injection.js', 'r') as fp:
        res = tab.Runtime.evaluate(expression=fp.read())

    while True:
        res = tab.Runtime.evaluate(expression="login('%s', '%s');" % (username, settings['ROOM_PASSWORD']))
        if 'result' in res and 'value' in res['result'] and res['result']['value']:
            break
        time.sleep(0.1)

    hx = BrowserEnvironment(tab, username)
    players_queue.put(hx)


port_number = 8000
port_lock = Lock()
def get_next_port_number():
    global port_number
    with port_lock:
        r = port_number
        port_number += 1
        return r


if __name__ == '__main__':
    logging.basicConfig('game.log', level=logging.DEBUG, format='%(levelname)s\t%(asctime)s (%(threadName)-9s) %(message)s')

    print('Please get tokens from here https://www.haxball.com/headlesstoken')
    print()

    token = ''
    tokens = []
    while len(tokens) == 0 or token != '':
        token = input('Please enter a token for a new room, [empty line to stop]: ').strip()
        if token:
            tokens.append(token)

    room_queue = Queue()
    n_rooms = len(tokens)

    # Creazione delle stanze
    threads = []
    for i in range(n_rooms):
        t = Thread(target=run_host, args=(tokens[i], room_queue))
        t.start()
        threads.append(t)
        time.sleep(0.5)

    # Waiting till rooms are created
    for t in threads:
        t.join()

    room_links = [room_queue.get() for i in range(n_rooms)]
    print('Ok, all rooms created, urls:\n' + '\n'.join(room_links))
    with open('rooms.txt', 'w') as fp:
        fp.write('\n'.join(room_links) + '\n')

    # Creazione degli agenti
    players_queue = Queue()
    threads = []
    for i in range(n_rooms * 2):
        room_url = room_links[i // 2]
        t = Thread(target=run_agent, args=(room_url, players_queue))
        t.start()
        threads.append(t)
        time.sleep(0.1)

    # Waiting till players are created
    for t in threads:
        t.join()

    players = [players_queue.get() for i in range(n_rooms * 2)]
    print('players are created!')

    qlearning = QLearning(buffer_size=settings['EXP_REPLAY_BUFFER_SIZE'])

    prev_states = None
    try:
        while True:
            # info = hx._get_game_info()
            if prev_states is None:
                try:
                    prev_states = [hx.step(0)[0] for hx in players]
                except:
                    logging.warning('hx.step restituisce None')
                    time.sleep(0.5)
                    continue

            if prev_states is not None:
                try:
                    next_states, rs, dones = zip(*qlearning.one_step(prev_states, players))
                    prev_states = next_states
                except:
                    prev_states = None
                # best_move = hx.get_best_move()
                # hx.send_button(*best_move)
                # time.sleep(10000)
    except Exception as e:
        logging.error(e)
        logging.error(traceback.format_exc())
        logging.info('Exiting... un momento solo, faccio seriliazzazione')
        qlearning.serialize()
        qlearning.exp_replay.serialize()
        logging.info('Ciao!')
        print('Ciao!')

