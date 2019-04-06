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

players = [
    VirtualEnvironment(gameplay, squadra_rossa=True),
    VirtualEnvironment(gameplay, squadra_rossa=False)
]

if settings['VISUALIZE']:
    import pygame
    pygame.init()
    size = width, height = 1024, 768
    center = (width // 2, height // 2)
    black = 105, 150, 90
    clock = pygame.time.Clock()
    font = pygame.font.SysFont("monospace", 44)
    screen = pygame.display.set_mode(size)
    display = True

prev_states = None
i = 0
try:
    while True:
        i += 1
        # info = hx.get_game_info()
        if prev_states is None:
            prev_states = [hx.get_step_results()[0] for hx in players]

        if prev_states is not None:
            try:
                next_states, rs, dones = zip(*qlearning.one_step(prev_states, players))
                prev_states = next_states
            except KeyboardInterrupt as e:
                raise e
            except Exception:
                prev_states = None

            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    raise KeyboardInterrupt
                elif event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_v:
                        display = not display

            if display:
                draw_frame(screen, gameplay)

                # screen.blit(ball, ballrect)
                pygame.display.flip()
                clock.tick(20)
                for event in pygame.event.get():
                    if event.type == pygame.QUIT:
                        break

            if i % 20 == 0:
                logging.debug("%s\t, %s-%s" % (round(gameplay.Ac, 1), gameplay.Kb, gameplay.Cb))

            if any(dones):
                gameplay = create_start_conditions(
                    posizione_palla=Vector(0, 0),
                    velocita_palla=Vector(0, 0),
                    posizione_blu=Vector(277.5, 0),
                    velocita_blu=Vector(0, 0),
                    input_blu=0,
                    posizione_rosso=Vector(-277.5, 0),
                    velocita_rosso=Vector(0, 0),
                    input_rosso=0,
                    tempo_iniziale=gameplay.Ac,
                    punteggio_rosso=gameplay.Kb,
                    punteggio_blu=gameplay.Cb,
                    commincia_rosso=gameplay.blue_scored
                )
                for pl in players:
                    pl.gameplay = gameplay
                prev_states = None

except BaseException as e:
    logging.error(e)
    logging.error(traceback.format_exc())
    logging.info('Exiting... un momento solo, faccio seriliazzazione')
    qlearning.serialize()
    qlearning.exp_replay.serialize()
    logging.info('Ciao!')
    print('Ciao!')
