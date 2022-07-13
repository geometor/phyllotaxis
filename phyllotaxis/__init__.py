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
    '''use algebraic phi value for fraction of circle'''
    return 2 * sp.pi - (2 * sp.pi / phi)

def sweep_rational(n, m):
    '''use two fibonacci numbers for fraction of circle'''
    return 2 * sp.pi - (2 * sp.pi * sp.Rational(n, m))


def find_point_distances(pt, other_pts):
    distances = {}
    for test_pt in other_pts[i+1:]:
        d = float(pt.distance(test_pt))
        distances[d] = test_pt
    #  nearest_pt_id = distances.index(min(distances)) + i + 1
    #  nearest_pt = pts[nearest_pt_id]
    return distances


def grow(steps, sweep):
    '''grow each step to num_rings'''
    result = []
    for n in range(steps):
        result.append(get_node_points(n, sweep))
    return result


def get_node_points(num_nodes, sweep):
    '''frame with n nodes'''
    result = []
    for i in range(0, num_nodes):
        rad = num_nodes - i
        pt = point(rad, 0)
        pt = pt.rotate(i*sweep)
        result.append(pt)
    return result
    

def find_nearest_points(test_points, num_nearest=3)):
    '''for each point in list, find nearest points from remainder of list'''
    result = {}
    for i, pt in enumerate(test_points):
        distances = find_point_distances(pt, test_points[i+1:])
        keys = sorted(distances.keys())
        nearest_points = []
        for j, key in enumerate(keys[0:num_nearest]):
            nearest_points.append(distances[key])
        result[pt] = nearest_points
    return result

