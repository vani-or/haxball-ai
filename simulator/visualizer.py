import sys, pygame
import time

from simulator import create_start_conditions, Vector

pygame.init()

size = width, height = 1024, 768
center = (width // 2, height // 2)

black = 105, 150, 90
clock = pygame.time.Clock()
font = pygame.font.SysFont("comicsansms", 44)

screen = pygame.display.set_mode(size)

gameplay = create_start_conditions(
    posizione_palla=Vector(0, 0),
    velocita_palla=Vector(0, 0),
    posizione_blu=Vector(200, 0),
    velocita_blu=Vector(0, 0),
    input_blu=0,
    posizione_rosso=Vector(-200, 0),
    velocita_rosso=Vector(0, 0),
    input_rosso=0,
    tempo_iniziale=0,
    punteggio_rosso=0,
    punteggio_blu=0
)

blue_unpressed = True
red_unpressed = True

while 1:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            sys.exit()

    # speed = [0, 0]
    gameplay.Pa.D[2].mb = 0
    keys = pygame.key.get_pressed()
    if keys[pygame.K_UP]:
        gameplay.Pa.D[2].mb |= 1
    if keys[pygame.K_DOWN]:
        gameplay.Pa.D[2].mb |= 2
    if keys[pygame.K_RIGHT]:
        gameplay.Pa.D[2].mb |= 8
    if keys[pygame.K_LEFT]:
        gameplay.Pa.D[2].mb |= 4
    if keys[pygame.K_SPACE]:
        if blue_unpressed:
            gameplay.Pa.D[2].mb |= 16
            gameplay.Pa.D[2].bc = 1
        blue_unpressed = False
    else:
        gameplay.Pa.D[2].bc = 0
        blue_unpressed = True

    gameplay.Pa.D[1].mb = 0
    keys = pygame.key.get_pressed()
    if keys[pygame.K_w]:
        gameplay.Pa.D[1].mb |= 1
    if keys[pygame.K_s]:
        gameplay.Pa.D[1].mb |= 2
    if keys[pygame.K_d]:
        gameplay.Pa.D[1].mb |= 8
    if keys[pygame.K_a]:
        gameplay.Pa.D[1].mb |= 4
    if keys[pygame.K_LCTRL]:
        if red_unpressed:
            gameplay.Pa.D[1].mb |= 16
            gameplay.Pa.D[1].bc = 1
        red_unpressed = False
    else:
        gameplay.Pa.D[1].bc = 0
        red_unpressed = True

    # ballrect = ballrect.move(speed)

    # if ballrect.left < 0 or ballrect.right > width:
    #     speed[0] = -speed[0]
    # if ballrect.top < 0 or ballrect.bottom > height:
    #     speed[1] = -speed[1]
    """
    Down: 2;
                                Kick: 16;
                                Left: 4;
                                Right: 8;
                                Up: 1;
                                NULL: 0
    """
    screen.fill(black)

    # Centro
    pygame.draw.circle(screen, (0, 0, 0), center, 2, 0)

    # Linee
    pygame.draw.rect(screen, (255,255,255), (center[0]-370, center[1]-170, 370*2, 170*2), 2)
    pygame.draw.circle(screen, (255, 255, 255), center, 75, 2)
    pygame.draw.line(screen, (255, 255, 255), (center[0], center[1]-170), (center[0], center[1]+170), 2)

    # Rosso
    pygame.draw.circle(screen, (225, 100, 90), (center[0]+int(gameplay.wa.K[5].a.x), center[1] + int(gameplay.wa.K[5].a.y)), gameplay.wa.K[5].la, 0)
    if gameplay.Pa.D[1].bc:
        pygame.draw.circle(screen, (255, 255, 255), (center[0] + int(gameplay.wa.K[5].a.x), center[1] + int(gameplay.wa.K[5].a.y)),gameplay.wa.K[5].la, 1)
    else:
        pygame.draw.circle(screen, (0, 0, 0), (center[0] + int(gameplay.wa.K[5].a.x), center[1] + int(gameplay.wa.K[5].a.y)), gameplay.wa.K[5].la, 1)

    # Blu
    pygame.draw.circle(screen, (100, 90, 245), (center[0]+int(gameplay.wa.K[6].a.x), center[1] + int(gameplay.wa.K[6].a.y)), gameplay.wa.K[6].la, 0)
    if gameplay.Pa.D[2].bc:
        pygame.draw.circle(screen, (255, 255, 255), (center[0] + int(gameplay.wa.K[6].a.x), center[1] + int(gameplay.wa.K[6].a.y)),gameplay.wa.K[6].la, 1)
    else:
        pygame.draw.circle(screen, (0, 0, 0), (center[0] + int(gameplay.wa.K[6].a.x), center[1] + int(gameplay.wa.K[6].a.y)), gameplay.wa.K[6].la, 1)

    # Palla
    pygame.draw.circle(screen, (220, 220, 220), (center[0] + int(gameplay.wa.K[0].a.x), center[1] + int(gameplay.wa.K[0].a.y)), gameplay.wa.K[0].la, 0)
    pygame.draw.circle(screen, (50, 50, 50), (center[0] + int(gameplay.wa.K[0].a.x), center[1] + int(gameplay.wa.K[0].a.y)), gameplay.wa.K[0].la + 1, 1)

    # Pali
    for i in range(4):
        pygame.draw.circle(screen, (50, 50, 50), (center[0] + int(gameplay.wa.K[1+i].a.x), center[1] + int(gameplay.wa.K[1+i].a.y)), gameplay.wa.K[1+i].la, 0)

    # Punteggio
    text = font.render("%s - %s" % (gameplay.Kb, gameplay.Cb), True, (0, 0, 0))
    screen.blit(text,   (center[0] - text.get_width() // 2, center[1] - 300))

    # Tempo
    text = font.render(str(round(gameplay.Ac, 1)), True, (0, 0, 0))
    screen.blit(text, (center[0] - 370, center[1] - 300))

    # screen.blit(ball, ballrect)
    pygame.display.flip()
    clock.tick(60)
    gameplay.step(1)

    if gameplay.zb == 2:
        gameplay = create_start_conditions(
            posizione_palla=Vector(0, 0),
            velocita_palla=Vector(0, 0),
            posizione_blu=Vector(200, 0),
            velocita_blu=Vector(0, 0),
            input_blu=0,
            posizione_rosso=Vector(-200, 0),
            velocita_rosso=Vector(0, 0),
            input_rosso=0,
            tempo_iniziale=0,
            punteggio_rosso=gameplay.Kb,
            punteggio_blu=gameplay.Cb
        )

