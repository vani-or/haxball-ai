import logging
import random
import time
import base64
from threading import Thread

from config.config import settings
from hx_controller import HXController
import os
import names

from hx_controller.browser_environment import BrowserEnvironment
from hx_controller.chrome import Chrome
from hx_controller.qlearning import QLearning


def inject(js):
    # newjs = js.replace('RTCPeerConnection', 'myRTCPeerConnection')
    # newjs = newjs.replace('Dp:function(a){switch(a.G())', 'Dp:function(a){var _ga=a.G();console.log("Dp", _ga);switch(_ga)')
    # newjs = newjs.replace('a=this.Ol(a);', 'a=this.Ol(a);console.log("Ol(a)", a);')
    # newjs = newjs.replace('this.Uh.push(', 'console.log("a,b",a,b);this.Uh.push(')
    # newjs = newjs.replace('b.hd&&(b.Gl', 'console.log("a=", a);b.hd&&(b.Gl')
    # newjs = newjs.replace('xp:function(a,b){', 'xp:function(a,b){console.log("a,b", a, b);')
    # newjs = newjs.replace('c);return c', 'c);console.log("c", c);return c')
    # newjs = newjs.replace('this.Xf.Mr(this.S)', 'this.Xf.Mr(this.S);console.log("S", this.L.H.wa.K[0].M);') # this.L.D - giocatori

    with open('js/game.js', 'r') as fp:
        return fp.read()
        # newjs = fp.read() + newjs
    # return newjs


if __name__ == '__main__':
    logging.basicConfig(level=logging.DEBUG, format='%(levelname)s\t%(asctime)s (%(threadName)-9s) %(message)s')

    room_url = input('Please enter room url: ')

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

    tabs = []
    for i in range(1):
        br = Chrome(port=9223)
        br.launch()
        tab = br.get_chrome_tab('tab' + str(i))
        tab.Network.enable()
        tab.Network.setRequestInterception(patterns=[{'urlPattern': '*game*.js', 'interceptionStage': 'HeadersReceived'}])
        tab.Network.requestIntercepted = requestIntercepted(tab)
        tab.Page.navigate(url=room_url)
        tabs.append(tab)

    time.sleep(10)

    usernames = []
    for tab in tabs:
        with open('js/injection.js', 'r') as fp:
            res = tab.Runtime.evaluate(expression=fp.read())

        username = names.get_full_name(gender=random.choice(['male', 'female']))
        usernames.append(username)

        while True:
            res = tab.Runtime.evaluate(expression="login('%s', '%s');" % (username, settings['ROOM_PASSWORD']))
            if 'result' in res and 'value' in res['result'] and res['result']['value']:
                break
            time.sleep(0.1)

    hx_controllers = []
    for tab, username in zip(tabs, usernames):
        hx = BrowserEnvironment(tab, username)
        hx_controllers.append(hx)

    # Qlearning instance
    qlearning = QLearning(buffer_size=settings['EXP_REPLAY_BUFFER_SIZE'])

    def run_hx(hx: BrowserEnvironment):
        prev_state = None
        i = 0
        while True:
            i += 1
            # info = hx.get_game_info()
            if prev_state is None:
                prev_state = hx.step(0)
                if prev_state is not None:
                    prev_state = prev_state[0]

            if prev_state is not None:
                next_s, r, done = qlearning.one_step(prev_state, hx)
                prev_state = next_s
                # best_move = hx.get_best_move()
                # hx.send_button(*best_move)
                # time.sleep(10000)

            # if i % 1000 == 0:
            #     logging.info('Saving model...')
            #     hx.save_model()

        # time.sleep(0.04)

    for hx in hx_controllers:
        t = Thread(target=run_hx, args=(hx, ))
        t.start()

    try:
        while True:
            time.sleep(60)
    except (KeyboardInterrupt, SystemExit) as e:
        print('Exiting... un momento solo, faccio seriliazzazione')
        qlearning.serialize()
        qlearning.exp_replay.serialize()
        print('Ciao!')
    # tab.close()
