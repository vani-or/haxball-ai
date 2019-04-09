import copy
import unittest
from simulator import Vector, Room, GamePlay, FieldPhysics, BasicObject, z, I, Field, User, Object, Team, zb, D
import pandas as pd


class TestSimulation(unittest.TestCase):
    def test_trajectories(self):
        df = pd.read_csv('simulations.csv', sep=';', float_precision='round_trip', dtype='float64')
        for i, row in df.iterrows():
            # print(row)
            gameplay = self.create_start_conditions(
                posizione_palla=Vector(row.palla_pos_x, row.palla_pos_y),  # this.kd
                velocita_palla=Vector(row.palla_vel_x, row.palla_vel_y),  # this.wa.K[0].M
                posizione_blu=Vector(row.blu_pos_x, row.blu_pos_y),  # this.wa.K[6].a
                velocita_blu=Vector(row.blu_vel_x, row.blu_vel_y),  # this.wa.K[6].M
                input_blu=row.blu_input,
                posizione_rosso=Vector(row.rosso_pos_x, row.rosso_pos_y),  # this.wa.K[5].a
                velocita_rosso=Vector(row.rosso_vel_x, row.rosso_vel_y),  # this.wa.K[5].M
                input_rosso=row.rosso_input,  # this.wa.K[5].M
                tempo_iniziale=row.tempo,  # this.Ac
                punteggio_rosso=row.punti_rosso,  # this.Kb
                punteggio_blu=row.punti_blu,  # this.Cb
            )
            # for i in range(10000):
            gameplay.step(1)
            self.assertEqual(row.new_tempo, gameplay.Ac, 'tempo')
            self.assertEqual(row.new_palla_pos_x, gameplay.wa.K[0].a.x, 'Posizione palla x')
            self.assertEqual(row.new_palla_pos_y, gameplay.wa.K[0].a.y, 'Posizione palla y')
            self.assertEqual(row.new_palla_vel_x, gameplay.wa.K[0].M.x, 'Velocità palla x')
            self.assertEqual(row.new_palla_vel_y, gameplay.wa.K[0].M.y, 'Velocità palla y')
            self.assertEqual(row.new_rosso_pos_x, gameplay.wa.K[5].a.x, 'Posizione rosso x')
            self.assertEqual(row.new_rosso_pos_y, gameplay.wa.K[5].a.y, 'Posizione rosso y')
            self.assertEqual(row.new_rosso_vel_x, gameplay.wa.K[5].M.x, 'Velocità rosso x')
            self.assertEqual(row.new_rosso_vel_y, gameplay.wa.K[5].M.y, 'Velocitò rosso y')
            self.assertEqual(row.new_blu_pos_x, gameplay.wa.K[6].a.x, 'Posizione blu x')
            self.assertEqual(row.new_blu_pos_y, gameplay.wa.K[6].a.y, 'Posizione blu y')
            self.assertEqual(row.new_blu_vel_x, gameplay.wa.K[6].M.x, 'Velocità blu x')
            self.assertEqual(row.new_blu_vel_y, gameplay.wa.K[6].M.y, 'Velocitò blu y')

        # start_params.concat(end_params).join(';')
        # gameplay = self.create_start_conditions(
        #     posizione_palla=Vector(115.47626014228705, 74.15597803819995),  # this.kd
        #     velocita_palla=Vector(0.20848982394149093, -1.037226803411967),  # this.wa.K[0].M
        #     posizione_blu=Vector(80.85399385623211, 3.8445393466359863),  # this.wa.K[6].a
        #     velocita_blu=Vector(-0.0014708917267419372, 0.002365030062473023),  # this.wa.K[6].M
        #     posizione_rosso=Vector(1.8229900270898083, -3.145694940949635),  # this.wa.K[5].a
        #     velocita_rosso=Vector(2.905652738753635e-17, 4.1237475847635185e-18),  # this.wa.K[5].M
        #     tempo_iniziale=15.583333333333687,  # this.Ac
        #     punteggio_rosso=0,  # this.Kb
        #     punteggio_blu=0,  # this.Cb
        # )
        # gameplay.step(1)
        # posizione_palla = gameplay.wa.K[0].a
        # self.assertEqual(Vector(115.68474996622854, 73.11875123478798), posizione_palla)
        # posizione_rosso = gameplay.wa.K[6].a
        # velocita_rosso = gameplay.wa.K[6].M
        # self.assertEqual(Vector(80.85252296450537, 3.8469043766984594), posizione_rosso)
        # self.assertEqual(Vector(-0.0014120560576722596, 0.002270428859974102), velocita_rosso)
        # self.assertEqual(15.600000000000355, gameplay.Ac)
        #
        # start_params = "87.6260859077766|15.480556044971292|0.00013493753773190557|0.00002383888420655573|277.5|0|0|0|-6.238537572306306|-16.837642119945333|2.39402499325618e-16|-1.6746783866103807e-16|14.550000000000303|0|0";
        # end_params = "87.62622084531434|15.4805798838555|0.0001335881623545865|0.00002360049536449017|277.5|0|0|0|-6.238537572306306|-16.837642119945333|2.298263993525933e-16|-1.6076912511459655e-16|14.56666666666697|0|0";
        # start_numbers = list(map(float, start_params.split('|')))
        # end_numbers = list(map(float, end_params.split('|')))
        #
        # posizione_palla = Vector(*start_numbers[0:2])
        # velocita_palla = Vector(*start_numbers[2:4])
        # posizione_blu = Vector(*start_numbers[4:6])
        # velocita_blu = Vector(*start_numbers[6:8])
        # posizione_rosso = Vector(*start_numbers[8:10])
        # velocita_rosso = Vector(*start_numbers[10:12])
        # tempo_iniziale = start_numbers[12]
        # punteggio_rosso = int(start_numbers[13])
        # punteggio_blu = int(start_numbers[14])
        # gameplay = self.create_start_conditions(
        #     posizione_palla,
        #     velocita_palla,
        #     posizione_blu,
        #     velocita_blu,
        #     posizione_rosso,
        #     velocita_rosso,
        #     tempo_iniziale,
        #     punteggio_rosso,
        #     punteggio_blu,
        # )
        # gameplay.step(1)
        # self.assertEqual(Vector(*end_numbers[0:2]), gameplay.kd)


if __name__ == '__main__':
    unittest.main()
