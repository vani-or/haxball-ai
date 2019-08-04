import os
import sys
import time
from argparse import Namespace

import gym
import pygame
from baselines.a2c.runner import Runner
from baselines.common import set_global_seeds
from baselines.common.cmd_util import make_env, make_vec_env
from baselines.common.policies import build_policy
from baselines.a2c.a2c import Model
from baselines.common import set_global_seeds, explained_variance
from baselines.ppo2.ppo2 import safemean
from baselines.ppo2.model import Model as PPOModel
# sys.path.append('./baselines')
from baselines.common.vec_env import DummyVecEnv, VecEnv
from baselines.common.vec_env.test_vec_env import SimpleEnv
from baselines.run import build_env

from hx_controller.haxball_gym import Haxball
from hx_controller.haxball_vecenv import HaxballVecEnv, HaxballSubProcVecEnv, HaxballProcPoolVecEnv
from hx_controller.openai_model_torneo import A2CModel
from simulator import create_start_conditions, Vector
import numpy as np
from collections import deque

from simulator.visualizer import draw_frame

if __name__ == '__main__':
    args_namespace = Namespace(
        alg='a2c',
        env='haxball-v0',
        num_env=None,
        # env='PongNoFrameskip-v4',
        env_type=None, gamestate=None, network=None, num_timesteps=1000000.0, play=False,
        reward_scale=1.0, save_path=None, save_video_interval=0, save_video_length=200, seed=None)
    # env2 = build_env(args_namespace)

    try:
        from mpi4py import MPI
    except ImportError:
        MPI = None
    from baselines import logger

    nsteps = 3
    gamma = 0.99
    nenvs = 2
    total_timesteps = int(15e7)
    log_interval = 100
    load_path = None
    load_path = 'ppo2.h5'
    # load_path = 'models8/ppo_model_1.h5'
    # model_i = 3
    model_i = ''
    # load_path = 'models/%s.h5' % model_i

    max_ticks = int(60*2*(1/0.016))
    env = HaxballProcPoolVecEnv(num_fields=nenvs, max_ticks=max_ticks)
    # env = HaxballSubProcVecEnv(num_fields=nenvs, max_ticks=max_ticks)
    policy = build_policy(env=env, policy_network='mlp', num_layers=4, num_hidden=256)
    # policy = build_policy(env=env, policy_network='lstm')

    model = A2CModel(policy, model_name='ppo2_model', env=env, nsteps=nsteps, ent_coef=0.05, total_timesteps=total_timesteps, lr=7e-4)# 0.005) #, vf_coef=0.0)

    play = True
    if load_path is not None and os.path.exists(load_path):
        model.load(load_path)

    if play:
        logger.log("Running trained model")
        obs = env.reset()

        state = model.initial_state if hasattr(model, 'initial_state') else None
        dones = np.zeros((1,))

        episode_rew = 0
        episode_rew2 = 0
        while True:
            if state is not None:
                actions, _, state, _ = model.step(obs, S=state, M=dones)
            else:
                actions, rew, _, _ = model.step(obs)

            obs, rew, done, _ = env.step(actions)
            episode_rew += rew[0] if isinstance(env, VecEnv) else rew
            episode_rew2 += rew[1] if isinstance(env, VecEnv) else rew
            env.render()
            done = done.any() if isinstance(done, np.ndarray) else done
            if done:
                print('episode_rew={}, \t{}'.format(episode_rew, episode_rew2))
                episode_rew = 0
                episode_rew2 = 0
                obs = env.reset()

    # nsteps = 30
    # model = PPOModel(
    #     policy=policy,
    #     ob_space=env.observation_space,
    #     ac_space=env.action_space,
    #     nbatch_act=env.num_envs,
    #     nbatch_train=env.num_envs,
    #     nsteps=nsteps,
    #     ent_coef=0.05,
    #     vf_coef=0.5,
    #     max_grad_norm=0.5
    # )# 0.005) #, vf_coef=0.0)
    if load_path is not None and os.path.exists(load_path):
        model.load(load_path)

    size = width, height = 900, 520
    center = (width // 2, height // 2 + 30)
    black = 105, 150, 90

    pygame.init()
    clock = pygame.time.Clock()
    screen = pygame.display.set_mode(size)

    gameplay = create_start_conditions(
        posizione_palla=Vector(0, 0),
        velocita_palla=Vector(0, 0),
        posizione_blu=Vector(277.5, 0),
        velocita_blu=Vector(0, 0),
        input_blu=0,
        posizione_rosso=Vector(-277.5, 0),
        velocita_rosso=Vector(0, 0),
        input_rosso=0,
        tempo_iniziale=0,
        punteggio_rosso=0,
        punteggio_blu=0
    )

    env = Haxball(gameplay=gameplay, max_ticks=max_ticks)
    obs = env.reset()
    action = 0

    blue_unpressed = True
    red_unpressed = True

    play_red = 0

    D_i = 1 if play_red else 2
    i = 0
    while True:
        i += 1
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                sys.exit()

        gameplay.Pa.D[D_i].mb = 0
        keys = pygame.key.get_pressed()
        if keys[pygame.K_UP]:
            gameplay.Pa.D[D_i].mb |= 1
        if keys[pygame.K_DOWN]:
            gameplay.Pa.D[D_i].mb |= 2
        if keys[pygame.K_RIGHT]:
            gameplay.Pa.D[D_i].mb |= 8
        if keys[pygame.K_LEFT]:
            gameplay.Pa.D[D_i].mb |= 4
        if keys[pygame.K_SPACE]:
            if blue_unpressed:
                gameplay.Pa.D[D_i].mb |= 16
                gameplay.Pa.D[D_i].bc = 1
            blue_unpressed = False
        else:
            gameplay.Pa.D[D_i].bc = 0
            blue_unpressed = True

        # a1, a2 = data
        # env.step_async(a1, red_team=True)
        if i % 6 == 0:

            #
            # env.step_physics()
            #
            obs, rew, done, info = env.step_wait(red_team=not play_red)
            if done:
                env.reset()
            actions, rew, _, _ = model.step(obs)
            action = actions[0]
            env.step_async(action, red_team=not play_red)

        # obs = env.get_observation(action)
        # actions = model.step(obs)

        # gameplay.Pa.D[1].mb = 0
        # gameplay.Pa.D[1].bc = 0
        # keys = pygame.key.get_pressed()
        # if keys[pygame.K_w]:
        #     gameplay.Pa.D[1].mb |= 1
        # if keys[pygame.K_s]:
        #     gameplay.Pa.D[1].mb |= 2
        # if keys[pygame.K_d]:
        #     gameplay.Pa.D[1].mb |= 8
        # if keys[pygame.K_a]:
        #     gameplay.Pa.D[1].mb |= 4
        # if keys[pygame.K_LCTRL]:
        #     if red_unpressed:
        #         gameplay.Pa.D[1].mb |= 16
        #         gameplay.Pa.D[1].bc = 1
        #     red_unpressed = False
        # else:
        #     red_unpressed = True

        draw_frame(screen, gameplay)

        # screen.blit(ball, ballrect)
        pygame.display.flip()
        clock.tick(60)
        gameplay.step(1)

        # if gameplay.zb == 2:
        #     gameplay = create_start_conditions(
        #         posizione_palla=Vector(0, 0),
        #         velocita_palla=Vector(0, 0),
        #         posizione_blu=Vector(277.5, 0),
        #         velocita_blu=Vector(0, 0),
        #         input_blu=0,
        #         posizione_rosso=Vector(-277.5, 0),
        #         velocita_rosso=Vector(0, 0),
        #         input_rosso=0,
        #         tempo_iniziale=gameplay.Ac,
        #         punteggio_rosso=gameplay.Kb,
        #         punteggio_blu=gameplay.Cb,
        #         commincia_rosso=gameplay.Jd.sn == 't-red'
        #     )