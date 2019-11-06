import time

print()
print()
actions = {
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

start_time = None
real_start = time.time()

fn = 'logs/2019_09_12_12_04_13.txt'

with open(fn, 'r') as fp:
    for line in fp:
        ts, best_action, pred_return, neglogpac, res = line.split('\t')
        if 'null' not in res:
            state, reward, done = eval(res.replace('false', '0').replace('true', '1'))
            reward = float(reward)
        else:
            reward = 0
        ts = float(ts)
        pred_return = float(pred_return)
        best_action = int(best_action)

        if start_time is None:
            start_time = ts
            continue


        delta = ts - start_time
        pause = delta - (time.time() - real_start)
        if pause > 0:
            time.sleep(pause)
        print('\rBest action: %s\tReturn (prediction): %s\tReward: %s\tts: %s' % (actions[best_action], round(pred_return, 2), round(reward, 2), round(delta, 1)), end='')
