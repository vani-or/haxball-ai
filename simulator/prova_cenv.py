from simulator.simulator.cenv import Vector as CVector, Object, create_start_conditions as Ccreate_start_conditions
from simulator import Vector, create_start_conditions
import time

# N = 1000000
# start = time.time()
# v = CVector(1, 3)
# for i in range(N):
#     v == v
# print(time.time() - start)
#
# start = time.time()
# v = Vector(1, 3)
# for i in range(N):
#     v == v
# print(time.time() - start)
# a = Object()
# o = Object()

gameplay = Ccreate_start_conditions()

N = 10000
start = time.time()
for i in range(N):
    gameplay.step(1)

print(time.time() - start)

