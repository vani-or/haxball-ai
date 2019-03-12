import base64
import logging
import random
import time

import names

from hx_controller.chrome import Chrome


def inject(js):
    # newjs = js.replace('RTCPeerConnection', 'myRTCPeerConnection')
    # newjs = newjs.replace('Dp:function(a){switch(a.G())', 'Dp:function(a){var _ga=a.G();console.log("Dp", _ga);switch(_ga)')
    # newjs = newjs.replace('a=this.Ol(a);', 'a=this.Ol(a);console.log("Ol(a)", a);')
    # newjs = newjs.replace('this.Uh.push(', 'console.log("a,b",a,b);this.Uh.push(')
    # newjs = newjs.replace('b.hd&&(b.Gl', 'console.log("a=", a);b.hd&&(b.Gl')
    # newjs = newjs.replace('xp:function(a,b){', 'xp:function(a,b){console.log("a,b", a, b);')
    # newjs = newjs.replace('c);return c', 'c);console.log("c", c);return c')
    # newjs = newjs.replace('this.Xf.Mr(this.S)', 'this.Xf.Mr(this.S);console.log("S", this.L.H.wa.K[0].M);') # this.L.D - giocatori

    with open('../js/game.js', 'r') as fp:
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
        br = Chrome(port=9223, headless=False)
        br.launch()
        tab = br.get_chrome_tab('tab' + str(i))
        tab.Network.enable()
        tab.Network.setRequestInterception(
            patterns=[{'urlPattern': '*game*.js', 'interceptionStage': 'HeadersReceived'}])
        tab.Network.requestIntercepted = requestIntercepted(tab)
        tab.Page.navigate(url=room_url)
        tabs.append(tab)

    time.sleep(10)

    usernames = []
    for tab in tabs:
        with open('../js/injection.js', 'r') as fp:
            res = tab.Runtime.evaluate(expression=fp.read())

        username = names.get_full_name(gender=random.choice(['male', 'female']))
        usernames.append(username)
        password = 'hellokitty'

        while True:
            res = tab.Runtime.evaluate(expression="login('%s', '%s');" % (username, password))
            if 'result' in res and 'value' in res['result'] and res['result']['value']:
                break
            time.sleep(0.1)

    time.sleep(1000000)
