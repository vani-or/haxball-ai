import joblib
from baselines.common.tf_util import get_session
import tensorflow as tf
import os
from torneo.models import PPOModel


def save_model(save_path: str, model: PPOModel):
    sess = model.sess or get_session()
    variables = tf.get_collection(tf.GraphKeys.GLOBAL_VARIABLES, scope=model.model_name)

    ps = sess.run(variables)
    save_dict = {v.name: value for v, value in zip(variables, ps)}
    dirname = os.path.dirname(save_path)
    if any(dirname):
        os.makedirs(dirname, exist_ok=True)
    joblib.dump(save_dict, save_path)


def load_model(load_path: str, model: PPOModel):
    sess = model.sess or get_session()
    variables = tf.get_collection(tf.GraphKeys.GLOBAL_VARIABLES, scope=model.model_name)

    loaded_params = joblib.load(os.path.expanduser(load_path))
    restores = []
    if isinstance(loaded_params, list):
        assert len(loaded_params) == len(variables), 'number of variables loaded mismatches len(variables)'
        for d, v in zip(loaded_params, variables):
            restores.append(v.assign(d))
    else:
        for v in variables:
            restores.append(v.assign(loaded_params[v.name]))

    sess.run(restores)


def load_variables_from_another_model(target_model, source_model):
    target_model_name = target_model.model_name
    source_model_name = source_model.model_name
    sess = target_model.sess or get_session()
    params = tf.trainable_variables(target_model_name)
    another_params = tf.trainable_variables(source_model_name)
    for pair in zip(params, another_params):
        sess.run(tf.assign(pair[0], pair[1]))


def sf01(arr):
    """
    swap and then flatten axes 0 and 1
    """
    s = arr.shape
    return arr.swapaxes(0, 1).reshape(s[0] * s[1], *s[2:])


def inv_sf01(arr, dim):
    s = arr.shape
    # sf01(mb_obs).reshape((220, 12, 14)).swapaxes(0, 1)
    new_s = (-1, dim) + s[1:]
    return arr.reshape(*new_s).swapaxes(0, 1)