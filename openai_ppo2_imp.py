from baselines.common.policies import build_policy
from baselines.ppo2.runner import Runner
from baselines.ppo2.model import Model
from hx_controller.haxball_vecenv import HaxballSubProcVecEnv, HaxballProcPoolVecEnv
import numpy as np
from baselines import logger
from baselines.common import set_global_seeds, explained_variance


nenvs = 100
nsteps = 30
gamma = 0.99
# load_path = 'ciao.h5'
save_interval = 100
load_path = None
# load_path = 'ppo2.h5'
log_interval = 100
total_timesteps = int(10e7)
max_ticks = int(60*2*(1/0.0166))
# env = HaxballSubProcVecEnv(num_fields=nenvs, max_ticks=max_ticks)
env = HaxballProcPoolVecEnv(num_fields=nenvs, max_ticks=max_ticks)
# policy = build_policy(env=env, policy_network='mlp', num_layers=4, num_hidden=256)
#
# model = Model(
#     policy=policy,
#     ob_space=env.observation_space,
#     ac_space=env.action_space,
#     nbatch_act=None,
#     nbatch_train=None,
#     nsteps=nsteps,
#     ent_coef=0.05,
#     vf_coef=0.5,
#     max_grad_norm=0.5,
#     microbatch_size=None
# )
# runner = Runner(
#     env=env,
#     model=model,
#     nsteps=nsteps,
#     gamma=gamma,
#     lam=0.99
# )

from baselines.ppo2.ppo2 import learn


model = learn(
    network='mlp',
    env=env,
    total_timesteps=total_timesteps,
    eval_env=None,
    seed=None,
    nsteps=nsteps,
    ent_coef=0.0,
    lr=3e-4,
    vf_coef=0.5,
    max_grad_norm=0.5,
    gamma=gamma,
    lam=0.95,
    log_interval=log_interval,
    nminibatches=4,
    noptepochs=4,
    cliprange=0.2,
    save_interval=save_interval,
    load_path=load_path,
    model_fn=None,
    num_layers=4,
    num_hidden=256
)
