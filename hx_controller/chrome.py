import logging
import subprocess
import time
from threading import Lock, Thread

import pychrome


class Chrome:
    def __init__(self, port=9222, headless=True):
        self.port = port
        self.headless = headless
        self._chrome_open_lock = Lock()
        self._chrome_process = None
        self._chrome_listener_thread = None
        self._pychrome_browser = None
        self._tabs = {}
        self._closed = True
        self.user_agent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0.1 Safari/605.1.15"

    def launch(self):
        if not self._closed:
            self.close()

        DEFAULT_ARGS = [
            '--disable-background-networking',
            '--disable-background-timer-throttling',
            '--disable-client-side-phishing-detection',
            '--disable-default-apps',
            '--disable-dev-shm-usage',
            '--disable-extensions',
            '--disable-hang-monitor',
            '--disable-popup-blocking',
            '--disable-prompt-on-repost',
            '--disable-sync',
            '--disable-translate',
            '--metrics-recording-only',
            '--no-first-run',
            '--safebrowsing-disable-auto-update',
            '--enable-automation',
            '--password-store=basic',
            '--use-mock-keychain',
            '--disable-breakpad',
            '--disable-pnacl-crash-throttling',
            '--remote-debugging-port=' + str(self.port),
            '--window-size=1440,900',
            '--user-agent=%s' % self.user_agent,
            '--mute-audio',
            '--disable-gpu',
            "--lang=it-IT,it,en-US,en"
        ]
        if self.headless:
            DEFAULT_ARGS += [
                '--headless',
                '--user-data-dir=/tmp/chrome' + str(int(time.time())),
            ]
        else:
            DEFAULT_ARGS += [
                '--no-sandbox',
                '--user-data-dir=/tmp/chrome'
            ]

        cmd = ['google-chrome'] + DEFAULT_ARGS

        self._chrome_listener_thread = Thread(
            target=self._chrome_listener,
            name='chrome_listener_thread',
            daemon=True,
            args=(cmd, )
        )
        self._chrome_open_lock.acquire()
        self._chrome_listener_thread.start()

        acquired = self._chrome_open_lock.acquire(timeout=30)
        self._chrome_open_lock.release()
        if not acquired:
            raise Exception('Non posso aprire Chrome dopo 30 secondi di attesa')

        time.sleep(3)

        self._pychrome_browser = pychrome.Browser(url="http://127.0.0.1:" + str(self.port))

        self._closed = False

        return self._pychrome_browser

    def _chrome_listener(self, cmd):
        logging.info('Launch di chrome with command: ' + ' '.join(cmd))
        self._chrome_process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

        t = Thread(
            target=self._chrome_stdout_listener,
            name='chrome_stdout_listener',
            daemon=True,
            args=(self._chrome_process.stdout, )
        )
        t.start()

        last_n_lines = []
        for line in self._chrome_process.stderr:
            line = line.decode('utf-8').rstrip()

            last_n_lines.append(line)
            last_n_lines = last_n_lines[-20:]

            if 'DevTools listening on' in line:
                self._chrome_open_lock.release()
            if 'CONSOLE' in line:
                logging.debug('CHROME STDERR: ' + line.rstrip())
            else:
                logging.info('CHROME STDERR: ' + line.rstrip())
            if 'crash' in line:
                logging.error('Crash di chrome? Last 20 lines:\n' + '\n'.join(last_n_lines))

        logging.debug('Chrome è stato chiuso')

    def _chrome_stdout_listener(self, stream):
        for line in stream:
            line = line.decode('utf-8').rstrip()
            logging.warning(line)

    def get_chrome_tab(self, tab_name='main_tab') -> "Tab":
            if tab_name in self._tabs and self._tabs[tab_name].status == self._tabs[tab_name].status_stopped:
                # Se il tab esiste già, ma è fermato
                del self._tabs[tab_name]

            if tab_name not in self._tabs:
                tab = self._pychrome_browser.new_tab()
                tab.start()
                self._tabs[tab_name] = tab
                logging.debug('Apro un nuovo tab: {}'.format(tab_name))

            self._pychrome_browser.activate_tab(self._tabs[tab_name].id)

            return self._tabs[tab_name]

    def close(self):
        for tab_name in list(self._tabs.keys()):
            logging.debug('Chiudo il tab "%s"' % tab_name)
            self._tabs[tab_name].close()

        if self._chrome_process is not None:
            logging.debug('Chiudo il processo del browser')
            try:
                self._chrome_process.kill()
            except Exception as e:
                logging.warning('Durante la chiusura del browser si è verificato questo errore: ' + str(e))

        self._tabs = {}
        self._closed = True

    def close_tab(self, tab_name: str):
        """
        Chiude il tab specificato con il nome

        :param tab_name: str, il nome del tab da chiudere
        :return:
        """
        tab = self._tabs[tab_name]
        del self._tabs[tab_name]
        return tab.close()

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()
