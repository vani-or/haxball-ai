from distutils.core import setup
from Cython.Build import cythonize


setup(
    # name='HaxballEnv',
    ext_modules=cythonize("cenv.pyx")
)
