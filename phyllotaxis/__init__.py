'''
phyllotaxis module for the GEOMETOR project
'''

from geometor.utils import *
from geometor.model import *
from geometor.render import *
from geometor.pappus import *
from itertools import permutations

sp.init_printing()

def get_colors(cmap_name, steps):
    cmap = mp.cm.get_cmap(cmap_name)
    colors = []
    offset = 1 / (2 * steps)
    for step in range(steps):
        color_scale = (((step + offset) % steps) / steps)
        #  color_scale = color_scale + (1 / (color_cycle * 2))
        #  if rev:
            #  color_scale = 1 - color_scale
        colors.append(cmap(color_scale))
    return colors

def sweep_phi():
    return 2 * sp.pi - (2 * sp.pi / phi)

def sweep_rational(n, m):
    return 2 * sp.pi - (2 * sp.pi * sp.Rational(n, m))
