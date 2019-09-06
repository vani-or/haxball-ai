import pickle
import time
from typing import Optional

import numpy as np
from collections import deque

from hx_controller.haxball_gym import Haxball
from hx_controller.haxball_vecenv import HaxballProcPoolVecEnv, HaxballSubProcVecEnv
from torneo.models import PPOModel, StaticModel, RandomModel, PazzoModel
from torneo.runner import TorneoRunner
from torneo.utils import save_model, sf01, load_model, load_variables_from_another_model
from baselines import logger
from baselines.common import explained_variance, set_global_seeds
import os.path as osp
from baselines.common.policies import build_policy


if __name__ == '__main__':
    import os

    # nenvs = 3
    n_players = 1
    nenvs = 2

    nsteps = 100
    gamma = 0.99
    lam = 0.95
    nminibatches = 4  # 4
    noptepochs = 4
    ent_coef = 0.0
    lr = 3e-4 / 10
    cliprange = 0.2
    vf_coef = 0.5
    max_grad_norm = 0.5
    models_path = 'models17/'
    os.makedirs(models_path, exist_ok=True)

    # load_path = 'ciao.h5'
    save_interval = 25
    load_path = None
    log_interval = 25
    new_player_introduce_interval = 1000
    replace_worst_interval = 500
    total_timesteps = int(10e7)
    max_ticks = int(60 * 3 * (1 / 0.0166))
    env = HaxballProcPoolVecEnv(num_fields=nenvs//2, max_ticks=max_ticks)
    # env = HaxballSubProcVecEnv(num_fields=nenvs//2, max_ticks=max_ticks)

    runner = TorneoRunner(env=env, nsteps=nsteps, gamma=gamma, lam=lam, nminibatches=nminibatches)
    if os.path.exists(models_path + '/results.pkl'):
        with open(models_path + '/results.pkl', 'rb') as fp:
            runner.results = pickle.load(fp)

    n_players = 3 + 3
    # nenvs = 2 * n_players * (n_players - 1)
    nenvs = 2 * (n_players - 1)
    ob_space = env.observation_space
    ac_space = env.action_space
    nbatch = nenvs * nsteps
    nbatch_train = 2 * nbatch // nminibatches
    train_batches_num = nsteps // nminibatches

    # policy = build_policy(env, 'mlp', num_layers=4, num_hidden=256)
    policy = build_policy(env, 'lstm', nlstm=512)

    def ppo_model_creator(model_name: str, from_model: Optional[PPOModel]=None, trainable=True) -> PPOModel:
        print('Creating model %s...' % model_name)

        model = PPOModel(
            policy=policy,
            ob_space=ob_space,
            ac_space=ac_space,
            nbatch_act=nenvs,
            nbatch_train=nbatch_train,
            nsteps=nsteps,
            ent_coef=ent_coef,
            vf_coef=vf_coef,
            max_grad_norm=max_grad_norm,
            model_name=model_name,
            trainable=trainable,
            use_original_batch=True
        )

        if from_model is not None:
            load_variables_from_another_model(model, from_model)

        return model

    perfect_model = PPOModel(
            policy=policy,
            ob_space=ob_space,
            ac_space=ac_space,
            nbatch_act=nenvs,
            nbatch_train=nbatch_train,
            nsteps=nsteps,
            ent_coef=ent_coef,
            vf_coef=vf_coef,
            max_grad_norm=max_grad_norm,
            model_name='ppo2_model',
            trainable=True,
            use_original_batch=True
        )
    # perfect_model.load('ppo2_prova.h5')
    # perfect_model.load('ppo2_lstm.h5')

    # corridori_model = PPOModel(
    #     policy=policy,
    #     ob_space=ob_space,
    #     ac_space=ac_space,
    #     nbatch_act=nenvs,
    #     nbatch_train=nbatch_train,
    #     nsteps=nsteps,
    #     ent_coef=ent_coef,
    #     vf_coef=vf_coef,
    #     max_grad_norm=max_grad_norm,
    #     model_name='ppo2_model',
    #     trainable=False
    # )
    # corridori_model.load('ppo2_corridori.h5')

    min_trainable_players = 3
    min_baseline_players = 0

    for fn in os.listdir(models_path):
        if not fn.endswith('.h5'):
            continue
        model_name = fn.replace('.h5', '')
        trainable = '_epoch_' not in fn and 'baseline' not in fn
        model = ppo_model_creator(model_name, trainable=trainable)
        load_model(models_path + '/' + fn, model)

        rating_fn = models_path + model_name + '.rating.txt'
        rating = 1200
        if os.path.exists(rating_fn):
            with open(rating_fn, 'r') as fp:
                line = fp.read().strip()
                rating = float(line)

        model.reward_function = None
        rf_path = models_path + model_name + '.reward_function.pkl'
        if os.path.exists(rf_path):
            with open(rf_path, 'rb') as fp:
                model.reward_function = pickle.load(fp)

        runner.add_model(model, rating=rating)

        if trainable:
            min_trainable_players -= 1
        if 'baseline' in fn:
            min_baseline_players -= 1

    print('modelli da creare: %s' % min_trainable_players)
    for j in range(min_trainable_players):
        i = len(runner.models)

        model_name = 'ppo_model_' + str(i)
        model = ppo_model_creator(model_name)
        load_variables_from_another_model(model, perfect_model)
        fn = models_path + model_name + '.h5'
        if os.path.exists(fn):
            load_model(fn, model)
        fn = models_path + model_name + '.rating.txt'
        rating = 1200
        if os.path.exists(fn):
            with open(fn, 'r') as fp:
                line = fp.read().strip()
                rating = float(line)
        model.reward_function = None
        # model.reward_function = Haxball.create_random_reward_function()
        rf_path = models_path + model_name + '.reward_function.pkl'
        if os.path.exists(rf_path):
            with open(rf_path, 'rb') as fp:
                model.reward_function = pickle.load(fp)
        runner.add_model(model, rating=rating)

    print('baseline da creare: %s' % min_baseline_players)
    for j in range(min_baseline_players):
        i = len(runner.models)

        model_name = 'ppo_model_' + str(i) + '_baseline'
        model = ppo_model_creator(model_name, trainable=False)
        load_variables_from_another_model(model, perfect_model)
        fn = models_path + model_name + '.h5'
        if os.path.exists(fn):
            load_model(fn, model)
        fn = models_path + model_name + '.rating.txt'
        rating = 1200
        if os.path.exists(fn):
            with open(fn, 'r') as fp:
                line = fp.read().strip()
                rating = float(line)
        model.reward_function = None
        # model.reward_function = Haxball.create_random_reward_function()
        rf_path = models_path + model_name + '.reward_function.pkl'
        if os.path.exists(rf_path):
            with open(rf_path, 'rb') as fp:
                model.reward_function = pickle.load(fp)
        runner.add_model(model, rating=rating)

    # model_name = 'ppo_corridori'
    # model = ppo_model_creator(model_name)
    # load_variables_from_another_model(model, corridori_model)
    # fn = models_path + model_name + '.h5'
    # if os.path.exists(fn):
    #     # model.load(fn)
    #     load_model(fn, model)
    # fn = models_path + model_name + '.rating.txt'
    # rating = 1200
    # if os.path.exists(fn):
    #     with open(fn, 'r') as fp:
    #         line = fp.read().strip()
    #         rating = float(line)
    # runner.add_model(model, rating=rating)

    model_name = 'static'
    static_model = StaticModel(default_action=0, model_name=model_name)
    fn = models_path + model_name + '.rating.txt'
    rating = 1200
    if os.path.exists(fn):
        with open(fn, 'r') as fp:
            rating = float(fp.read())
    runner.add_model(static_model, rating=rating)

    model_name = 'always_left'
    static_model = StaticModel(default_action=7, model_name=model_name)
    fn = models_path + model_name + '.rating.txt'
    rating = 1200
    if os.path.exists(fn):
        with open(fn, 'r') as fp:
            rating = float(fp.read())
    runner.add_model(static_model, rating=rating)

    # model_name = 'random'
    # random_model = RandomModel(default_action=0, model_name=model_name, action_space=ac_space)
    # fn = models_path + model_name + '.rating.txt'
    # rating = 1200
    # if os.path.exists(fn):
    #     with open(fn, 'r') as fp:
    #         rating = float(fp.read())
    # runner.add_model(random_model, rating=rating)

    for i in range(1):
        model_name = 'pazzo_' + str(i)
        pazzo_model = PazzoModel(change_period=150 + 10*i, model_name=model_name, action_space=ac_space)
        fn = models_path + model_name + '.rating.txt'
        rating = 1200
        if os.path.exists(fn):
            with open(fn, 'r') as fp:
                rating = float(fp.read())
        runner.add_model(pazzo_model, rating=rating)

    ############### RUNNER #####################
    # Start total timer
    tfirststart = time.perf_counter()

    try:
        from mpi4py import MPI
    except ImportError:
        MPI = None

    def constfn(val):
        def f(_):
            return val
        return f

    # Avoid division error when calculate the mean (in our case if epinfo is empty returns np.nan, not return an error)
    def safemean(xs):
        return np.nan if len(xs) == 0 else np.mean(xs)
    if isinstance(lr, float):
        lr = constfn(lr)
    else:
        assert callable(lr)
    if isinstance(cliprange, float):
        cliprange = constfn(cliprange)
    else:
        assert callable(cliprange)

    eval_env = None
    epinfobuf = deque(maxlen=100)
    if eval_env is not None:
        eval_epinfobuf = deque(maxlen=100)

    nupdates = total_timesteps // nbatch // runner.m
    nupdates = 16600
    print('nupdates: %s' % nupdates)

    start_update = 1
    if os.path.exists(models_path + '/update.txt'):
        with open(models_path + '/update.txt', 'r') as fp:
            start_update = int(fp.read())
    print('start_update: %s' % start_update)

    for update in range(start_update, nupdates + 1):
        assert nbatch % nminibatches == 0
        print('yellow, update ' + str(update))
        # Start timer
        tstart = time.perf_counter()
        frac = 1.0 - (update - 1.0) / nupdates
        # Calculate the learning rate
        lrnow = lr(frac)
        # Calculate the cliprange
        cliprangenow = cliprange(frac)
        # Get minibatch
        obs, returns, masks, actions, values, neglogpacs, states, epinfos = runner.run()  # pylint: disable=E0632
        # if eval_env is not None:
        #     eval_obs, eval_returns, eval_masks, eval_actions, eval_values, eval_neglogpacs, eval_states, eval_epinfos = eval_runner.run()  # pylint: disable=E0632

        # epinfobuf.extend(epinfos)
        # if eval_env is not None:
        #     eval_epinfobuf.extend(eval_epinfos)

        mblossvals = runner.train(lrnow, cliprangenow, nminibatches, noptepochs, obs, returns, masks, actions, values, neglogpacs, states)

        # values = sf01(values)
        # returns = sf01(returns)

        # Feedforward --> get losses --> update
        lossvals = np.mean(mblossvals, axis=0)
        # End timer
        tnow = time.perf_counter()
        # Calculate the fps (frame per second)
        fps = int(nbatch / (tnow - tstart))
        if update % log_interval == 0 or update == 1:
            # Calculates if value function is a good predicator of the returns (ev > 1)
            # or if it's just worse than predicting nothing (ev =< 0)
            ev = explained_variance(values, returns)
            logger.logkv("serial_timesteps", update * nsteps)
            logger.logkv("nupdates", update)
            logger.logkv("total_timesteps", update * nbatch)
            logger.logkv("fps", fps)
            logger.logkv("explained_variance", float(ev))
            logger.logkv('eprewmean', safemean([epinfo['r'] for epinfo in epinfobuf]))
            logger.logkv('eplenmean', safemean([epinfo['l'] for epinfo in epinfobuf]))

            positions = list(map(int, reversed(np.argsort(runner.ratings))))
            logger.logkv("ELO top 1: %s" % runner.models[positions[0]].model_name, str(round(runner.ratings[positions[0]], 1)))
            logger.logkv("ELO top 2: %s" % runner.models[positions[1]].model_name, str(round(runner.ratings[positions[1]], 1)))
            logger.logkv("ELO top 3: %s" % runner.models[positions[2]].model_name, str(round(runner.ratings[positions[2]], 1)))
            logger.logkv("ELO top 4: %s" % runner.models[positions[3]].model_name, str(round(runner.ratings[positions[3]], 1)))
            logger.logkv("ELO worst: %s" % runner.models[positions[-1]].model_name, str(round(runner.ratings[positions[-1]], 1)))

            if replace_worst_interval > 0 and update % replace_worst_interval == 0 and update > 0:
                i = 0
                while i < runner.m:
                    if isinstance(runner.models[positions[i]], PPOModel) and runner.models[positions[i]].trainable:
                        break
                    i += 1
                j = runner.m - 1
                while j >= 0:
                    if isinstance(runner.models[positions[j]], PPOModel) and runner.models[positions[j]].trainable:
                        break
                    j -= 1
                best_model = runner.models[positions[i]]
                worst_model = runner.models[positions[j]]
                print('yellow: Coppio i pesi dal modello %s per il %s' % (best_model.model_name, worst_model.model_name))
                load_variables_from_another_model(worst_model, best_model)
                runner.ratings[positions[j]] = runner.ratings[positions[i]]

            if update % new_player_introduce_interval == 0 and update > 0 or update == 1:
                i = 0
                while i < runner.m:
                    best_model = runner.models[positions[i]]
                    new_model_rating = runner.ratings[positions[i]]
                    if not best_model.trainable or 'ppo2' in best_model.model_name:
                        i += 1
                        continue
                    if '_epoch_' not in best_model.model_name:
                        new_model_name = best_model.model_name + '_epoch_' + str(update)

                        # reserved name?
                        if all(x.model_name != new_model_name for x in runner.models):
                            print('New player! From %s with rating %s' % (best_model.model_name, new_model_rating))

                            new_model = ppo_model_creator(new_model_name, from_model=best_model, trainable=False)
                            runner.add_model(new_model, rating=new_model_rating)
                    break

            if eval_env is not None:
                logger.logkv('eval_eprewmean', safemean([epinfo['r'] for epinfo in eval_epinfobuf]))
                logger.logkv('eval_eplenmean', safemean([epinfo['l'] for epinfo in eval_epinfobuf]))
            logger.logkv('time_elapsed', tnow - tfirststart)
            i = 0
            while i < runner.m:
                if not isinstance(runner.models[positions[i]], PPOModel):
                    i += 1
                    continue
                model = runner.models[positions[i]]
                for (lossval, lossname) in zip(lossvals, model.loss_names):
                    logger.logkv(lossname, lossval)
                break
            if MPI is None or MPI.COMM_WORLD.Get_rank() == 0:
                logger.dumpkvs()
        if save_interval and (update % save_interval == 0) and logger.get_dir() and (
                MPI is None or MPI.COMM_WORLD.Get_rank() == 0):
            checkdir = osp.join(logger.get_dir(), 'checkpoints')
            os.makedirs(checkdir, exist_ok=True)
            # savepath = osp.join(checkdir, '%.5i' % update)
            # print('Saving to', savepath)
            print('Saving...')
            with open(models_path + '/update.txt', 'w') as fp:
                fp.write(str(update))
            with open(models_path + '/results.pkl', 'wb') as fp:
                pickle.dump(runner.results, fp)
            for i, model in enumerate(runner.models):
                if hasattr(model, 'save') and callable(model.save):
                    fn = models_path + model.model_name + '.h5'
                    # model.save(fn)
                    save_model(fn, model)
                fn = models_path + model.model_name + '.rating.txt'
                with open(fn, 'w') as fp:
                    fp.write(str(runner.ratings[i]))
                rf_path = models_path + model.model_name + '.reward_function.pkl'
                if hasattr(model, 'reward_function'):
                    with open(rf_path, 'wb') as fp:
                        pickle.dump(model.reward_function, fp)
    # return model
