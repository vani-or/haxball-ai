import os
import time
from queue import Queue
from baselines.common.policies import build_policy
from hx_controller.browser_environment import BrowserEnvironment
from hx_controller.haxball_vecenv import HaxballSubProcVecEnv, HaxballProcPoolVecEnv
from hx_controller.openai_model_torneo import A2CModel
from launcher import run_host, run_agent
import numpy as np


load_path = 'models11/ppo_model_4.h5'
# load_path = 'ppo2_base_delayed.h5'
# load_path = 'ppo2.h5'
# load_path = 'models10/ppo_model_1.h5'
nsteps = 30
max_ticks = int(60*3*(1/0.016))
nenvs = 1
total_timesteps = int(15e7)

# env = HaxballSubProcVecEnv(num_fields=nenvs, max_ticks=max_ticks)
env = HaxballProcPoolVecEnv(num_fields=nenvs, max_ticks=max_ticks)
policy = build_policy(env=env, policy_network='mlp', num_layers=4, num_hidden=256)
# policy = build_policy(env=env, policy_network='lstm', nlstm=512)  # num_layers=4, num_hidden=256)

model = A2CModel(policy, model_name='ppo_model_4', env=env, nsteps=nsteps, ent_coef=0.05, total_timesteps=total_timesteps, lr=7e-4)  # 0.005) #, vf_coef=0.0)
if load_path is not None:# and os.path.exists(load_path):
    model.load(load_path)

print('Please get a token from here https://www.haxball.com/headlesstoken')
print()
token = input('Please enter a token for a new room [empty to skip]: ').strip()

if token:
    room_queue = Queue()
    run_host(token, room_queue)

    room_link = room_queue.get()
    print('Your room link: %s' % room_link)
else:
    room_link = input('Please enter a rook link: ').strip()
    # room_link = 'https://www.haxball.com/play?c=0U3a70sDiXM&p=1'

players_queue = Queue()
run_agent(room_link, players_queue)

player = players_queue.get()  # type: BrowserEnvironment
print('Got a player!')


state = None
try:
    pred_times = []
    count = 0
    while True:
        if state is None:
            action = 0
        else:
            st = time.time()
            actions, rew, _, _ = model.step(np.array([state]), M=[False], S=None)
            pred_times.append(time.time() - st)
            count += 1
            if count % 10000 == 0:
                print('pred_times - mean', np.mean(pred_times))
                print('pred_times - std', np.std(pred_times))
                pred_times = []
            action = actions[0]

        # obs_start = time.time()
        res = player.step(action)
        # print(time.time() - obs_start)
        # time.sleep(0.0166)
        if res is not None:
            state, reward, done = res
        else:
            state = None


except KeyboardInterrupt:
    print('closing browser...')
    player.browser_tab.close()

