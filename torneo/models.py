import functools
import math
import random

import tensorflow as tf
from baselines.ppo2.model import Model
from baselines.common.tf_util import get_session, save_variables, load_variables, initialize
import numpy as np

try:
    from baselines.common.mpi_adam_optimizer import MpiAdamOptimizer
    from mpi4py import MPI
    from baselines.common.mpi_util import sync_from_root
except ImportError:
    MPI = None


class PPOModel(Model):
    """
    We use this object to :
    __init__:
    - Creates the step_model
    - Creates the train_model

    train():
    - Make the training part (feedforward and retropropagation of gradients)

    save/load():
    - Save load the model
    """

    def __init__(self, *, policy, ob_space, ac_space, nbatch_act, nbatch_train, nsteps, ent_coef, vf_coef, max_grad_norm, microbatch_size=None, model_name='ppo2_model', trainable=True, use_original_batch=False):
        self.sess = sess = get_session()
        self.model_name = model_name
        self.trainable = trainable

        with tf.variable_scope(model_name, reuse=tf.AUTO_REUSE):
            # CREATE OUR TWO MODELS
            # act_model that is used for sampling
            act_model = policy(nbatch_act if use_original_batch else None, 1, sess)

            # Train model for training
            if microbatch_size is None:
                train_model = policy(nbatch_train if use_original_batch else None, nsteps, sess)
            else:
                train_model = policy(microbatch_size if use_original_batch else None, nsteps, sess)

        # CREATE THE PLACEHOLDERS
        self.A = A = train_model.pdtype.sample_placeholder([None])
        self.ADV = ADV = tf.placeholder(tf.float32, [None])
        self.R = R = tf.placeholder(tf.float32, [None])
        # Keep track of old actor
        self.OLDNEGLOGPAC = OLDNEGLOGPAC = tf.placeholder(tf.float32, [None])
        # Keep track of old critic
        self.OLDVPRED = OLDVPRED = tf.placeholder(tf.float32, [None])
        self.LR = LR = tf.placeholder(tf.float32, [])
        # Cliprange
        self.CLIPRANGE = CLIPRANGE = tf.placeholder(tf.float32, [])

        neglogpac = train_model.pd.neglogp(A)

        # Calculate the entropy
        # Entropy is used to improve exploration by limiting the premature convergence to suboptimal policy.
        entropy = tf.reduce_mean(train_model.pd.entropy())

        # CALCULATE THE LOSS
        # Total loss = Policy gradient loss - entropy * entropy coefficient + Value coefficient * value loss

        # Clip the value to reduce variability during Critic training
        # Get the predicted value
        vpred = train_model.vf
        vpredclipped = OLDVPRED + tf.clip_by_value(train_model.vf - OLDVPRED, - CLIPRANGE, CLIPRANGE)
        # Unclipped value
        vf_losses1 = tf.square(vpred - R)
        # Clipped value
        vf_losses2 = tf.square(vpredclipped - R)

        vf_loss = .5 * tf.reduce_mean(tf.maximum(vf_losses1, vf_losses2))

        # Calculate ratio (pi current policy / pi old policy)
        ratio = tf.exp(OLDNEGLOGPAC - neglogpac)

        # Defining Loss = - J is equivalent to max J
        pg_losses = -ADV * ratio

        pg_losses2 = -ADV * tf.clip_by_value(ratio, 1.0 - CLIPRANGE, 1.0 + CLIPRANGE)

        # Final PG loss
        pg_loss = tf.reduce_mean(tf.maximum(pg_losses, pg_losses2))
        approxkl = .5 * tf.reduce_mean(tf.square(neglogpac - OLDNEGLOGPAC))
        clipfrac = tf.reduce_mean(tf.to_float(tf.greater(tf.abs(ratio - 1.0), CLIPRANGE)))

        # Total loss
        loss = pg_loss - entropy * ent_coef + vf_loss * vf_coef

        # UPDATE THE PARAMETERS USING LOSS
        # 1. Get the model parameters
        params = tf.trainable_variables(model_name)
        # 2. Build our trainer
        if MPI is not None:
            self.trainer = MpiAdamOptimizer(MPI.COMM_WORLD, learning_rate=LR, epsilon=1e-5)
        else:
            self.trainer = tf.train.AdamOptimizer(learning_rate=LR, epsilon=1e-5)
        # 3. Calculate the gradients
        grads_and_var = self.trainer.compute_gradients(loss, params)
        grads, var = zip(*grads_and_var)

        if max_grad_norm is not None:
            # Clip the gradients (normalize)
            grads, _grad_norm = tf.clip_by_global_norm(grads, max_grad_norm)
        grads_and_var = list(zip(grads, var))
        # zip aggregate each gradient with parameters associated
        # For instance zip(ABCD, xyza) => Ax, By, Cz, Da

        self.grads = grads
        self.var = var
        self._train_op = self.trainer.apply_gradients(grads_and_var)
        self.loss_names = ['policy_loss', 'value_loss', 'policy_entropy', 'approxkl', 'clipfrac']
        self.stats_list = [pg_loss, vf_loss, entropy, approxkl, clipfrac]


        self.train_model = train_model
        self.act_model = act_model
        self.step = act_model.step
        self.value = act_model.value
        self.initial_state = act_model.initial_state

        self.save = functools.partial(save_variables, sess=sess)
        self.load = functools.partial(load_variables, sess=sess)

        initialize()
        global_variables = tf.get_collection(tf.GraphKeys.GLOBAL_VARIABLES, scope="")
        if MPI is not None:
            sync_from_root(sess, global_variables) #pylint: disable=E1101


class StaticModel:
    def __init__(self, default_action=0, model_name=None, action_space=None) -> None:
        self.default_action = default_action
        self.initial_state = None
        self.action_space = action_space
        if model_name is None:
            model_name = str(self.__class__)
        self.model_name = model_name
        self.trainable = False

    def step(self, obs, **kwargs):
        num = obs.shape[0]
        actions = np.zeros(shape=(num, )) + self.default_action
        tmp_values = np.ones(shape=(num, ))
        tmp_states = None
        tmp_neglogpacs = np.ones(shape=(num, ))
        return actions, tmp_values, tmp_states, tmp_neglogpacs

    def value(self, obs, **kwargs):
        num = obs.shape[0]
        return np.ones(shape=(num, ))

    def train(self, lrnow, cliprangenow, obs, returns, masks, actions, values, neglogpacs):
        num = obs.shape[0]
        return np.zeros(shape=(num, ))


class RandomModel(StaticModel):
    def step(self, obs, **kwargs):
        num = obs.shape[0]
        actions = [self.action_space.sample() for i in range(num)]
        tmp_values = np.ones(shape=(num, ))
        tmp_states = None
        tmp_neglogpacs = np.ones(shape=(num, ))
        return actions, tmp_values, tmp_states, tmp_neglogpacs


class PazzoModel(StaticModel):
    def __init__(self, change_period=150, model_name=None, action_space=None) -> None:
        super().__init__(default_action=0, model_name=model_name, action_space=action_space)
        self.random_points = []
        self.step_nums = []
        self.change_period = change_period  # 10 secondi virtuali

    def choose_random_point(self):
        return (
            random.randint(-405, 405),
            random.randint(-185, 185),
        )
        # print(self.random_point)

    def step(self, obs, **kwargs):
        if obs.shape[0] != len(self.random_points):
            self.random_points = [self.choose_random_point() for _ in range(obs.shape[0])]
            self.step_nums = [0 for _ in range(obs.shape[0])]

        actions = []
        for i, ob in enumerate(obs):
            self.step_nums[i] += 1

            if self.step_nums[i] > self.change_period or \
                    ('M' in kwargs and kwargs['M'][i]):  # M - dones
                self.random_points[i] = self.choose_random_point()
                self.step_nums[i] = 0

            hor = 0
            ver = 0
            action = 0

            if ob[8] == 0 and ob[9] == 0 and ob[13] == 0:
                point = (random.randint(-150, 150), random.randint(-150, 150))
            else:
                point = self.random_points[i]

            comp_x = point[0] - ob[0]
            comp_y = point[1] - ob[1]
            vers_denom = math.sqrt(comp_x ** 2 + comp_y ** 2)

            if vers_denom > 40:
                prob_x = abs(comp_x) / vers_denom
                prob_y = abs(comp_y) / vers_denom
                if prob_x > prob_y:
                    prob_x = 1
                elif prob_y > prob_x:
                    prob_y = 1

                if random.random() < prob_x:
                    hor = abs(comp_x) / comp_x
                if random.random() < prob_y:
                    ver = abs(comp_y) / comp_y

            if hor > 0 and ver > 0:
                action = 4
            elif hor > 0 and ver < 0:
                action = 2
            elif hor < 0 and ver > 0:
                action = 6
            elif hor < 0 and ver < 0:
                action = 8
            elif hor > 0 and ver == 0:
                action = 3
            elif hor < 0 and ver == 0:
                action = 7
            elif hor == 0 and ver > 0:
                action = 5
            elif hor == 0 and ver < 0:
                action = 1

            actions.append(action)

        num = obs.shape[0]
        tmp_values = np.ones(shape=(num,))
        tmp_states = None
        tmp_neglogpacs = np.ones(shape=(num,))
        return np.array(actions), tmp_values, tmp_states, tmp_neglogpacs

class MoreRealisticModel(StaticModel):
    def step(self, obs, **kwargs):
        actions = []
        for i, ob in enumerate(obs):
            hor = 0
            ver = 0
            action = 0

            point = [ob[8], ob[9]]
            if ob[0] < ob[8]:
                point[0] = ob[8] + 15

            comp_x = point[0] - ob[0]
            comp_y = point[1] - ob[1]
            vers_denom = math.sqrt(comp_x ** 2 + comp_y ** 2)

            if vers_denom > 0:
                prob_x = abs(comp_x) / vers_denom
                prob_y = abs(comp_y) / vers_denom
                if prob_x > prob_y:
                    prob_x = 1
                elif prob_y > prob_x:
                    prob_y = 1

                if random.random() < prob_x:
                    hor = abs(comp_x) / comp_x
                if random.random() < prob_y:
                    ver = abs(comp_y) / comp_y

            if hor > 0 and ver > 0:
                action = 4
            elif hor > 0 and ver < 0:
                action = 2
            elif hor < 0 and ver > 0:
                action = 6
            elif hor < 0 and ver < 0:
                action = 8
            elif hor > 0 and ver == 0:
                action = 3
            elif hor < 0 and ver == 0:
                action = 7
            elif hor == 0 and ver > 0:
                action = 5
            elif hor == 0 and ver < 0:
                action = 1

            if ob[0] > ob[8] and ob[12] < 30:
                k = (ob[1] - ob[9]) / (ob[0] - ob[8])
                b = ob[1] - k * ob[0]
                y_cross = -370 * k + b
                if -64 < y_cross < 64:
                    action = 9

            actions.append(action)

        num = obs.shape[0]
        tmp_values = np.ones(shape=(num,))
        tmp_states = None
        tmp_neglogpacs = np.ones(shape=(num,))
        return np.array(actions), tmp_values, tmp_states, tmp_neglogpacs