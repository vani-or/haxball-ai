import operator
import os

models_path = 'models3'

with open(models_path + '/update.txt', 'r') as fp:
    print('UPDATE: %s' % fp.read().strip())

ratings = {}
for file in os.listdir(models_path):
    if not file.endswith('.rating.txt'):
        continue
    model_name = file.replace('.rating.txt', '')
    with open(models_path + '/' + file, 'r') as fp:
        rating = float(fp.read().strip())
        ratings[model_name] = rating

sorted_x = list(reversed(sorted(ratings.items(), key=operator.itemgetter(1))))
for line in sorted_x:
    print("%s\t%s" % (line[0], round(line[1], 1)))

n = len(ratings)

print('-' * 50)
print('Fields number: %s' % (n * (n - 1), ))