import logging
import time
import os

from config.config import settings
from hx_controller.chrome import Chrome


if __name__ == '__main__':
    logging.basicConfig(level=logging.WARNING, format='%(levelname)s\t%(asctime)s (%(threadName)-9s) %(message)s')

    url = 'https://html5.haxball.com/headless'
    print('please get a token from https://www.haxball.com/headlesstoken')
    token = input('Please enter then token: ')  # https://www.haxball.com/headlesstoken

    print('Ok, waiting for chrome...')
    br = Chrome(headless=True)
    br.launch()
    tab = br.get_chrome_tab()
    tab.Page.navigate(url=url)
    time.sleep(5)

    cur_path = os.path.dirname(os.path.realpath(__file__))
    with open(cur_path + '/init.js', 'r') as fp:
        js = fp.read().replace('__TOKEN__', token).replace('__PASSWORD__', settings['ROOM_PASSWORD'])
        tab.Runtime.evaluate(expression=js)

    while True:
        res = tab.Runtime.evaluate(expression='window.url')
        if 'result' in res and 'value' in res['result']:
            print('OK! Your room link is: %s' % res['result']['value'])
            break
        time.sleep(0.25)

    while True:
        time.sleep(120)
