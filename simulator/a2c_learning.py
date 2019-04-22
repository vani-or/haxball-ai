import logging
import traceback
from config.config import settings
from hx_controller.qlearning import QLearning
from hx_controller.virtual_environment import VirtualEnvironment
from simulator import create_start_conditions, Vector
from simulator.visualizer import draw_frame


logging.basicConfig(level=logging.DEBUG, format='%(levelname)s\t%(asctime)s (%(threadName)-9s) %(message)s')

qlearning = QLearning(buffer_size=settings['EXP_REPLAY_BUFFER_SIZE'])

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
    punteggio_blu=0,
    commincia_rosso=True
)
