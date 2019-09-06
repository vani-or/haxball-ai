import os
import time
from queue import Queue
from baselines.common.policies import build_policy
from baselines.ppo2.ppo2 import constfn

from hx_controller.browser_environment import BrowserEnvironment
from hx_controller.haxball_vecenv import HaxballSubProcVecEnv, HaxballProcPoolVecEnv
from hx_controller.openai_model_torneo import A2CModel
from baselines.ppo2.model import Model as PPOModel
from launcher import run_host, run_agent
import numpy as np
from torneo.utils import sf01
from simulator.simulator.cenv import Vector as CVector, create_start_conditions as Ccreate_start_conditions


# load_path = 'models11/ppo_model_4.h5'
load_path = 'ppo2_lstm.h5'
# load_path = 'ppo2_base_delayed.h5'
# load_path = 'ppo2.h5'
# load_path = 'models10/ppo_model_1.h5'
nsteps = 30
max_ticks = int(60*3*(1/0.016))
nenvs = 2
nminibatches = 1
total_timesteps = int(15e7)

# env = HaxballSubProcVecEnv(num_fields=nenvs, max_ticks=max_ticks)
env = HaxballProcPoolVecEnv(num_fields=nenvs, max_ticks=max_ticks)
# policy = build_policy(env=env, policy_network='mlp', num_layers=4, num_hidden=256)
policy = build_policy(env=env, policy_network='lstm', nlstm=512)  # num_layers=4, num_hidden=256)

# model = A2CModel(policy, model_name='ppo_model_4', env=env, nsteps=nsteps, ent_coef=0.05, total_timesteps=total_timesteps, lr=7e-4)  # 0.005) #, vf_coef=0.0)
nbatch = nenvs * nsteps
nbatch_train = nbatch // nminibatches

model = PPOModel(policy=policy, ob_space=env.observation_space, ac_space=env.action_space, nbatch_act=2, nbatch_train=256, nsteps=1, ent_coef=0.05, vf_coef=0.5, max_grad_norm=0.5)  # 0.005) #, vf_coef=0.0)
if load_path is not None and os.path.exists(load_path):
    model.load(load_path)

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
run_agent(room_link, players_queue)

player1 = players_queue.get()  # type: BrowserEnvironment
player2 = players_queue.get()  # type: BrowserEnvironment
print('Got all players!')


class BrowserLearner:
    def __init__(self, lr, cliprange, nenv, noptepochs, nminibatches, gamma, lam, model, env) -> None:
        self.nenv = nenv
        self.nsteps = 1
        self.noptepochs = noptepochs
        self.nminibatches = nminibatches
        self.gamma = gamma
        self.lam = lam
        self.model = model
        self.env = env
        self.update = 0
        self.nupdates = 2000
        if isinstance(lr, float):
            self.lr = constfn(lr)
        else:
            assert callable(lr)
        if isinstance(cliprange, float):
            self.cliprange = constfn(cliprange)
        else:
            assert callable(cliprange)

        self.mb_actions = []
        self.mb_values = []
        self.mb_states = []
        self.mb_obs = []
        self.mb_rewards = []
        self.mb_masks = []
        self.mb_neglogpacs = []

    def add_to_batch(self, actions, values, states, obs, rewards, masks, neglogpacs):
        for i in range(2):
            self.mb_actions.append(actions[i])
            self.mb_values.append(values[i])
            self.mb_states.append(states[i])
            self.mb_obs.append(obs[i])
            self.mb_rewards.append(rewards[i])
            self.mb_masks.append(masks[i])
            self.mb_neglogpacs.append(neglogpacs[i])

        if len(self.mb_actions) == self.nenv:
            loss = self.train(
                np.reshape(self.mb_actions, (1, self.nenv)),
                np.reshape(self.mb_values, (1, self.nenv)),
                np.reshape(self.mb_states, (1, self.nenv, len(self.mb_states[0]))),
                np.reshape(self.mb_obs, (1, self.nenv, len(self.mb_obs[0]))),
                np.reshape(self.mb_rewards, (1, self.nenv)),
                np.reshape(self.mb_masks, (1, self.nenv)),
                np.reshape(self.mb_neglogpacs, (1, self.nenv))
            )
            print('%s\tTrain: %s' % (self.update, np.mean(loss)))
            self.mb_actions = []
            self.mb_values = []
            self.mb_states = []
            self.mb_obs = []
            self.mb_rewards = []
            self.mb_masks = []
            self.mb_neglogpacs = []
            self.update += 1
            if self.update % 100 == 0:
                print('Saving...')
                self.model.save('./model_lstm_retrained.h5')

    def train(self, actions, values, states, obs, rewards, masks, neglogpacs):
        frac = 1.0 - (self.update - 1.0) / self.nupdates
        lrnow = self.lr(frac)
        # Calculate the cliprange
        cliprangenow = self.cliprange(frac)

        # last_values = model.value(obs, S=states, M=masks)
        last_values = np.array(values)
        dones = np.array(masks)

        # discount/bootstrap off value fn
        # mb_returns = np.zeros_like(mb_rewards)
        # rewards = np.reshape(rewards, (1, rewards.shape[0]))
        # values = np.reshape(values, (1, values.shape[0]))
        mb_advs = np.zeros_like(rewards)
        lastgaelam = 0
        for t in reversed(range(self.nsteps)):
            if t == self.nsteps - 1:
                nextnonterminal = 1.0 - dones
                nextvalues = last_values
            else:
                nextnonterminal = 1.0 - masks[t+1]
                nextvalues = values[t+1]
            delta = rewards[t] + self.gamma * nextvalues * nextnonterminal - values[t]
            mb_advs[t] = lastgaelam = delta + self.gamma * self.lam * nextnonterminal * lastgaelam
        returns = mb_advs + values

        models_actions = sf01(actions)
        inv_actions = env.invert_actions(models_actions)
        models_actions = np.hstack((models_actions, inv_actions))

        models_obs = sf01(obs)
        inv_obs = env.invert_states(models_obs)
        models_obs = np.vstack((models_obs, inv_obs))

        models_returns = sf01(returns)
        models_returns = np.hstack((models_returns, models_returns))

        models_masks = sf01(masks)
        models_masks = np.hstack((models_masks, models_masks))

        models_values = sf01(values)
        models_values = np.hstack((models_values, models_values))

        models_neglogpacs = sf01(neglogpacs)
        models_neglogpacs = np.hstack((models_neglogpacs, models_neglogpacs))

        models_states = sf01(states)
        models_states = np.vstack((models_states, models_states))
        # models_states = states[sf01_indexes]
        # models_states = np.hstack((models_states, models_states))

        # assert nenv % nminibatches == 0
        envsperbatch = 2 * self.nenv // nminibatches
        envinds = np.arange(2 * self.nenv)
        flatinds = np.arange(2 * self.nenv * self.nsteps).reshape(2 * self.nenv, self.nsteps)
        mblossvals = []
        for _ in range(self.noptepochs):
            np.random.shuffle(envinds)
            for start in range(0, 2 * self.nenv, envsperbatch):
                end = start + envsperbatch
                mbenvinds = envinds[start:end]
                mbflatinds = flatinds[mbenvinds].ravel()
                slices = [arr[mbflatinds] for arr in (models_obs, models_returns, models_masks, models_actions, models_values, models_neglogpacs)]
                # slices = (arr[mbflatinds] for arr in (obs, returns, masks, actions, values, neglogpacs))
                mbstates = models_states[mbenvinds]
                res = self.model.train(lrnow, cliprangenow, *slices, mbstates)
                mblossvals.append(res)
        return mblossvals


learner = BrowserLearner(
    lr=3e-4 / 10,
    cliprange=0.2,
    nenv=128,
    noptepochs=4,
    nminibatches=1,
    gamma=0.99,
    lam=0.95,
    model=model,
    env=player1
)
S = np.zeros((2, 2*512))
obs1, obs2 = None, None
done1, done2 = False, False
values = None
try:
    pred_times = []
    count = 0
    while True:
        if obs1 is None or obs2 is None:
            actions = [0, 0]
        else:
            actions, values, states, neglogpacs = model.step(np.array([obs1, obs2]), M=[done1, done2], S=S)

        game_info = player1.get_game_info()
        gameplay = Ccreate_start_conditions(
            posizione_palla=CVector(game_info['ball']['position']['x'], game_info['ball']['position']['y']),
            velocita_palla=CVector(game_info['ball']['velocity']['x'], game_info['ball']['velocity']['y']),
            posizione_blu=CVector(game_info['player']['position']['x'], game_info['player']['position']['y']),
            velocita_blu=CVector(game_info['player']['velocity']['x'], game_info['player']['velocity']['y']),
            input_blu=game_info['player']['input'],
            posizione_rosso=CVector(game_info['opponent']['position']['x'], game_info['opponent']['position']['y']),
            velocita_rosso=CVector(game_info['opponent']['velocity']['x'], game_info['opponent']['velocity']['y']),
            input_rosso=game_info['opponent']['input'],
            tempo_iniziale=0,
            punteggio_rosso=0,
            punteggio_blu=0
        )

        res1 = player1.step(actions[0])
        res2 = player2.step(actions[1])

        if res1 is not None:
            obs1, reward1, done1 = res1
        else:
            obs1 = None

        if res2 is not None:
            obs2, reward2, done2 = res2
        else:
            obs2 = None

        if obs1 is not None and obs2 is not None:
            if player1.game_finished and not done1:
                S = np.zeros((2, 2*512))
            elif values is not None:
                learner.add_to_batch(actions, values, states, [obs1, obs2], [reward1, reward2], [done1, done2], neglogpacs)


except KeyboardInterrupt:
    print('closing browser...')
    player1.browser_tab.close()
    player2.browser_tab.close()

