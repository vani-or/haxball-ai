from typing import List

from baselines.common.runners import AbstractEnvRunner
import numpy as np
from torneo.models import PPOModel, StaticModel
from torneo.utils import sf01


class TorneoRunner(AbstractEnvRunner):
    """
    We use this object to make a mini batch of experiences
    __init__:
    - Initialize the runner

    run():
    - Make a mini batch
    """
    def __init__(self, *, env, nsteps, gamma, lam, nminibatches=4):
        # super().__init__(env=env, model=model, nsteps=nsteps)
        self.env = env
        # self.model = model
        self.nenv = env.num_envs if hasattr(env, 'num_envs') else 1
        self.batch_ob_shape = (self.nenv * nsteps,) + env.observation_space.shape
        self.obs = np.zeros((self.nenv,) + env.observation_space.shape, dtype=env.observation_space.dtype.name)
        self.obs[:] = env.reset()
        self.nsteps = nsteps
        self.states = None
        self.dones = [False for _ in range(self.nenv)]

        self.nminibatches = nminibatches
        nbatch = self.nenv * self.nsteps
        self.nbatch_train = nbatch // self.nminibatches
        self.train_batches_num = nsteps // self.nminibatches

        # Lambda used in GAE (General Advantage Estimation)
        self.lam = lam
        # Discount rate
        self.gamma = gamma

        self.models = []  # type: List[PPOModel]
        self.m = 0
        self.ratings = []
        self.reward_functions = []
        # self.m = 1
        # self.pool = Pool(self.m)

    def add_model(self, model: PPOModel, rating=1200):
        if self.states is None:
            self.states = model.initial_state
        self.models.append(model)
        self.ratings.append(rating)

        self.m = len(self.models)

        self.env.set_num_fields(self.m * (self.m - 1))

        self.nenv = self.env.num_envs if hasattr(self.env, 'num_envs') else 1

        nbatch = self.nenv * self.nsteps
        self.nbatch_train = nbatch // self.nminibatches
        self.train_batches_num = self.nsteps // self.nminibatches

        self.batch_ob_shape = (self.nenv * self.nsteps,) + self.env.observation_space.shape
        # TODO: partite terminano, da rifare
        self.obs = np.zeros((self.nenv,) + self.env.observation_space.shape, dtype=self.env.observation_space.dtype.name)
        self.obs[:] = self.env.reset()
        self.states = None
        # TODO: anche qua
        self.dones = [False for _ in range(self.nenv)]

        self.models_indexes = [[] for _ in range(self.m)]
        self.players_indexs = {}
        l = 0
        for k in range(self.m ** 2):
            i = k // self.m
            j = k % self.m
            if i == j:
                continue
            self.players_indexs[l] = (i, j)
            el = l * 2
            self.models_indexes[i].append(el)
            self.models_indexes[j].append(el + 1)
            l += 1

        self.results = {}

        self.sf01_indexes = {}
        for i in range(self.m):
            self.sf01_indexes[i] = []
            indexes = self.models_indexes[i]
            for ind in indexes:
                start = ind * self.nsteps
                end = start + self.nsteps
                self.sf01_indexes[i] += list(range(start, end))

        # Model names
        # self.reward_functions = np.ndarray(shape=(2 * self.m * (self.m - 0),), dtype=object)
        # self.reward_functions[:] = None
        # for i in range(self.m):
        #     indexes = self.models_indexes[i]
        #     if hasattr(self.models[i], 'reward_function'):
        #         self.reward_functions[indexes] = self.models[i].reward_function
        #     else:
        #         self.reward_functions[indexes] = None

    def process_winners(self, result_scores):
        for i, score in enumerate(result_scores):
            if score is not None:
                red_model_i, blue_model_i = self.players_indexs[i]

                red_model_name = self.models[red_model_i].model_name
                blue_model_name = self.models[blue_model_i].model_name

                result_key = red_model_name + '-' + blue_model_name
                if result_key not in self.results:
                    self.results[result_key] = {'w': 0, 'l': 0, 'd': 0}
                if score == 1:
                    self.results[result_key]['w'] += 1
                elif score == 0:
                    self.results[result_key]['l'] += 1
                elif score == 0.5:
                    self.results[result_key]['d'] += 1

                if red_model_i == blue_model_i:
                    print('%s - %s \t %s \t %s' % (
                        red_model_name,
                        blue_model_name,
                        score,
                        round(self.ratings[red_model_i], 1),
                    ))
                    continue
                exp_score = self.expected_score(self.ratings[red_model_i], self.ratings[blue_model_i])
                new_rating_red = self.ratings[red_model_i] + 32 * (score - exp_score)
                new_rating_blue = self.ratings[blue_model_i] + 32 * (-score + exp_score)
                print('%s - %s \t %s \t %s => %s, %s => %s' % (
                    red_model_name,
                    blue_model_name,
                    score,
                    round(self.ratings[red_model_i], 1),
                    round(new_rating_red, 1),
                    round(self.ratings[blue_model_i], 1),
                    round(new_rating_blue, 1),
                ))
                # TODO: non è coretto, le partite sono sincrone, non devo aggiornare gli ELO sequenzialmente
                self.ratings[red_model_i] = new_rating_red
                self.ratings[blue_model_i] = new_rating_blue

    def expected_score(self, player_rating: int, opponent_rating: int) -> float:
        return 1 / (1 + 10 ** ((opponent_rating - player_rating) / 400))

    def run(self):
        # Here, we init the lists that will contain the mb of experiences
        mb_obs, mb_rewards, mb_actions, mb_values, mb_dones, mb_neglogpacs = [],[],[],[],[],[]
        mb_states = self.states
        epinfos = []
        # For n in range number of steps
        for _ in range(self.nsteps):
            # Given observations, get action value and neglopacs
            # We already have self.obs because Runner superclass run self.obs[:] = env.reset() on init
            # ORIG
            # actions, values, self.states, neglogpacs = self.model.step(self.obs, S=self.states, M=self.dones)
            # MY
            self.dones = np.array(self.dones)
            actions = np.ones(shape=(2 * self.m * (self.m - 1), )) * (-1)
            values = np.ones(shape=(2 * self.m * (self.m - 1), )) * (-1)
            neglogpacs = np.ones(shape=(2 * self.m * (self.m - 1), )) * (-1)
            for i in range(self.m):
                indexes = self.models_indexes[i]
                obs = self.obs[indexes]
                if self.states is not None:
                    states = self.states[indexes]
                else:
                    states = None
                dones = self.dones[indexes]

                tmp_actions, tmp_values, tmp_states, tmp_neglogpacs = self.models[i].step(obs, S=states, M=dones)
                actions[indexes] = tmp_actions
                values[indexes] = tmp_values
                if tmp_states is not None:
                    self.states[indexes] = tmp_states
                else:
                    self.states = None
                neglogpacs[indexes] = tmp_neglogpacs
            # results = [m.step(args[i], **kwargs[i]) for i, m in enumerate(self.models)]
            # actions, values, self.states, neglogpacs = self.model.step(self.obs, S=self.states, M=self.dones)
            ######
            mb_obs.append(self.obs.copy())
            mb_actions.append(actions.copy())
            mb_values.append(values.copy())
            mb_neglogpacs.append(neglogpacs.copy())
            mb_dones.append(self.dones.copy())

            # Take actions in env and look the results
            # Infos contains a ton of useful informations
            self.obs[:], rewards, self.dones, infos = self.env.step(actions, reward_functions=self.reward_functions)

            players_is = [info['players_i'] for info in infos]
            # assert players_is == sorted(players_is), 'Osservazioni da ENV non sono in ordine!'

            result_scores = [info['score'] for info in infos[::2]]
            self.process_winners(result_scores)

            # for info in infos:
            #     maybeepinfo = info.get('episode')
            #     if maybeepinfo:
            #         epinfos.append(maybeepinfo)
            mb_rewards.append(rewards.copy())
        #batch of steps to batch of rollouts
        mb_obs = np.asarray(mb_obs, dtype=self.obs.dtype)
        mb_rewards = np.asarray(mb_rewards, dtype=np.float32)
        mb_actions = np.asarray(mb_actions)
        mb_values = np.asarray(mb_values, dtype=np.float32)
        mb_neglogpacs = np.asarray(mb_neglogpacs, dtype=np.float32)
        mb_dones = np.asarray(mb_dones, dtype=np.bool)
        # ORIG
        # last_values = self.model.value(self.obs, S=self.states, M=self.dones)
        # MY
        last_values = np.zeros(shape=(2 * self.m * (self.m - 1), )) - 1
        mb_returns = np.zeros_like(mb_rewards)
        for i in range(self.m):
            indexes = self.models_indexes[i]
            obs = self.obs[indexes]
            if self.states is not None:
                states = self.states[indexes]
            else:
                states = None
            dones = self.dones[indexes]
            loc_last_values = self.models[i].value(obs, S=states, M=dones)
            last_values[indexes] = loc_last_values

            # discount/bootstrap off value fn
            # mb_returns = np.zeros_like(mb_rewards)
            mb_rewards_loc = mb_rewards[:, indexes]
            mb_values_loc = mb_values[:, indexes]
            mb_dones_loc = mb_dones[:, indexes]

            mb_advs = np.zeros_like(mb_rewards_loc)
            lastgaelam = 0
            for t in reversed(range(self.nsteps)):
                if t == self.nsteps - 1:
                    nextnonterminal = 1.0 - dones
                    nextvalues = loc_last_values
                else:
                    nextnonterminal = 1.0 - mb_dones_loc[t + 1]
                    nextvalues = mb_values_loc[t + 1]
                delta = mb_rewards_loc[t] + self.gamma * nextvalues * nextnonterminal - mb_values_loc[t]
                mb_advs[t] = lastgaelam = delta + self.gamma * self.lam * nextnonterminal * lastgaelam
            mb_returns_loc = mb_advs + mb_values_loc
            mb_returns[:, indexes] = mb_returns_loc
        # last_values = self.model.value(self.obs, S=self.states, M=self.dones)
        ########

        # # discount/bootstrap off value fn
        # # mb_returns = np.zeros_like(mb_rewards)
        # mb_advs = np.zeros_like(mb_rewards)
        # lastgaelam = 0
        # for t in reversed(range(self.nsteps)):
        #     if t == self.nsteps - 1:
        #         nextnonterminal = 1.0 - self.dones
        #         nextvalues = last_values
        #     else:
        #         nextnonterminal = 1.0 - mb_dones[t+1]
        #         nextvalues = mb_values[t+1]
        #     delta = mb_rewards[t] + self.gamma * nextvalues * nextnonterminal - mb_values[t]
        #     mb_advs[t] = lastgaelam = delta + self.gamma * self.lam * nextnonterminal * lastgaelam
        # mb_returns = mb_advs + mb_values
        return (*map(sf01, (mb_obs, mb_returns, mb_dones, mb_actions, mb_values, mb_neglogpacs)), mb_states, epinfos)
        # return mb_obs, mb_returns, mb_dones, mb_actions, mb_values, mb_neglogpacs, mb_states, epinfos

    def train(self, lrnow, cliprangenow, nminibatches, noptepochs, obs, returns, masks, actions, values, neglogpacs, states):
        # Here what we're going to do is for each minibatch calculate the loss and append it.
        # N = 2 * self.m * (self.m - 1)
        mblossvals = []

        nbatch = self.nenv * self.nsteps // self.m
        nbatch_train = nbatch // nminibatches
        # train_batches_num = nsteps // nminibatches

        for i in range(self.m):
            # if self.models[i].model_name == 'static':
            #     indexes = self.models_indexes[i]
            #     models_obs = sf01(obs[:, indexes])
            #     print(models_obs)

            if not self.models[i].trainable and not isinstance(self.models[i], StaticModel):
                continue

            sf01_indexes = self.sf01_indexes[i]
            # indexes = self.models_indexes[i]

            # models_actions = sf01(inv_sf01(actions, self.nsteps)[:, indexes])
            # actions_loc = sf01(actions[:, indexes])
            # inv_actions = self.env.invert_actions(actions_loc)
            # models_actions = np.hstack((actions_loc, inv_actions))
            models_actions = actions[sf01_indexes]
            inv_actions = self.env.invert_actions(models_actions)
            models_actions = np.hstack((models_actions, inv_actions))

            # models_obs = sf01(inv_sf01(obs, self.nsteps)[:, indexes])
            # obs_loc = sf01(obs[:, indexes])
            # inv_obs = self.env.invert_states(obs_loc)
            # models_obs = np.vstack((obs_loc, inv_obs))
            models_obs = obs[sf01_indexes]
            inv_obs = self.env.invert_states(models_obs)
            models_obs = np.vstack((models_obs, inv_obs))

            # models_returns = sf01(inv_sf01(returns, self.nsteps)[:, indexes])
            # returns_loc = sf01(returns[:, indexes])
            # models_returns = np.hstack((returns_loc, returns_loc))
            models_returns = returns[sf01_indexes]
            models_returns = np.hstack((models_returns, models_returns))

            # models_masks = sf01(inv_sf01(masks, self.nsteps)[:, indexes])
            # masks_loc = sf01(masks[:, indexes])
            # models_masks = np.hstack((masks_loc, masks_loc))
            models_masks = masks[sf01_indexes]
            models_masks = np.hstack((models_masks, models_masks))

            # models_values = sf01(inv_sf01(values, self.nsteps)[:, indexes])
            # values_loc = sf01(values[:, indexes])
            # models_values = np.hstack((values_loc, values_loc))
            models_values = values[sf01_indexes]
            models_values = np.hstack((models_values, models_values))

            # models_neglogpacs = sf01(inv_sf01(neglogpacs, self.nsteps)[:, indexes])
            # neglogpacs_loc = sf01(neglogpacs[:, indexes])
            # models_neglogpacs = np.hstack((neglogpacs_loc, neglogpacs_loc))
            models_neglogpacs = neglogpacs[sf01_indexes]
            models_neglogpacs = np.hstack((models_neglogpacs, models_neglogpacs))
            # TODO: redefine states per LSTM

            nbatch = models_actions.shape[0]
            nbatch_train = nbatch // nminibatches
            if states is None:  # nonrecurrent version
                # Index of each element of batch_size
                # Create the indices array
                inds = np.arange(nbatch)  # *2 perchè INV
                for _ in range(noptepochs):
                    # Randomize the indexes
                    # TODO: uncomment
                    np.random.shuffle(inds)
                    # 0 to batch_size with batch_train_size step
                    for start in range(0, nbatch, nbatch_train):
                        end = start + nbatch_train
                        mbinds = inds[start:end]
                        slices = [arr[mbinds] for arr in (models_obs, models_returns, models_masks, models_actions, models_values, models_neglogpacs)]
                        # ORIG
                        # mblossvals.append(model.train(lrnow, cliprangenow, *slices))
                        # MY
                        if not isinstance(self.models[i], StaticModel):
                            res = self.models[i].train(lrnow, cliprangenow, *slices)
                            if isinstance(self.models[i], PPOModel):
                                mblossvals.append(res)
                        ####
            else:  # recurrent version
                assert self.nenv % nminibatches == 0
                envsperbatch = self.nenv // nminibatches
                envinds = np.arange(self.nenv)
                flatinds = np.arange(self.nenv * self.nsteps).reshape(self.nenv, self.nsteps)
                for _ in range(noptepochs):
                    np.random.shuffle(envinds)
                    for start in range(0, self.nenv, envsperbatch):
                        end = start + envsperbatch
                        mbenvinds = envinds[start:end]
                        mbflatinds = flatinds[mbenvinds].ravel()
                        slices = (arr[mbflatinds] for arr in (obs, returns, masks, actions, values, neglogpacs))
                        mbstates = states[mbenvinds]
                        # TODO: redefine
                        mblossvals.append(model.train(lrnow, cliprangenow, *slices, mbstates))

        ###########
        return mblossvals
