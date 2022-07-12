from phyllotaxis import *

BUILD = False
ANALYZE = False

RINGS = True
POLYGON = False
DOT = True
#  num_rings=144
num_rings = int(input(f'\nnumber of rings: '))

NAME = f'rings/{num_rings}'
NAME += input(f'\nsession name: {NAME}')
log_init(NAME)
start_time = timer()

print_log(f'\nMODEL: {NAME}')

num_colors = 21
cmap_name = 'YlGn'
cmap_name = 'copper'
colors = get_colors(cmap_name, num_colors)

# add starting points
A = add_point(point(0, 0))
#  sweep = sweep_phi()
sweep = sweep_rational(89, 144)
print_log('Sweep:')
print_log(f'    radians: {sweep} = {sweep.evalf()}')

theta = math.degrees(sweep)
print_log(f'    degrees: {theta}')

dots = []
rings = []


for i in range(0, num_rings):
    rad = num_rings - i
    pt = point(rad, 0)
    pt = pt.rotate(i*sweep)
    print(i)
    print(f'    x: {pt.x}')
    print(f'    y: {pt.y}')
    pt.classes = []
    pt.parents = set()
    pt.elements = set()
    #  add_point(pt)
    pts.append(pt)
    history.append(pt)
    if DOT:
        dot_radius = sp.sqrt(rad)
        dot_rad_pt = point(pt.x + dot_radius, pt.y)
        c = circle(pt, dot_rad_pt)
        c.classes = ['dot']
        dots.append(c)

    if RINGS:
        c = circle(A, pt, classes=['ring'])
        rings.append(c)

if POLYGON:
    add_polygon(polygon(pts))

model_summary(NAME, start_time)

# ANALYZE ***************************
if ANALYZE:
    print_log(f'\nANALYZE: {NAME}')
    #  goldens = analyze_golden_pts(pts)
    #  print(goldens)
    #  groups = group_sections(goldens)

    #  analyze_summary(NAME, start_time, goldens, groups)
    for i in range(1, len(pts)-2):
        pt = pts[i]
        distances = []
        for test_pt in pts[i+1:]:
            d = float(pt.distance(test_pt))
            distances.append(d)
        nearest_pt_id = distances.index(min(distances)) + i + 1
        nearest_pt = pts[nearest_pt_id]
        #  breakpoint()
        add_polygon(segment(pt, nearest_pt))

# PLOT *********************************
print_log(f'\nPLOT: {NAME}')
scale = num_rings + math.sqrt(num_rings)
#  limx, limy = get_limits_from_points(pts, margin=math.sqrt(num_rings))
#  limx, limy = adjust_lims(limx, limy)
limx = (-scale, scale)
limy = (-scale, scale)
bounds = set_bounds(limx, limy)
print_log()
print_log(f'limx: {limx}')
print_log(f'limy: {limy}')

#  fig, (ax, ax_btm) = plt.subplots(2, 1, gridspec_kw={'height_ratios': [10, 1]})
#  ax_btm.axis('off')
#  ax.axis('off')
plt.clf()
fig, ax = ax_prep_square(bounds)
ax.set_aspect('equal')
plt.tight_layout()
if DOT:
    for i, dot in enumerate(dots):
        #  plot_circle(ax, dot, edgecolor='k', facecolor='r', linestyle='-', fill=True)
        color = colors[i % num_colors]
        plot_circle(ax, dot, edgecolor='k', facecolor=color, linewidth=1, linestyle='-', fill=True)

#  title = f'G E O M E T O R'
#  fig.suptitle(title, fontdict={'color': '#960', 'size':'small'})

print_log('\nPlot Summary')
#  xlabel = f'elements: {len(elements)} | points: {len(pts)}'
#  ax_prep(ax, ax_btm, bounds, xlabel)

#  plot_sequence(ax, history, bounds)
snapshot(NAME, '00000.png')

#  leafs=3
#  for i in range(0, leafs):
    #  plot_wedge_2(ax, A, leafs-i, theta*(i), theta*(i+1), linestyle='-', ec='#000', fc='#c903', linewidth=2)

if BUILD:
    print_log('\nPlot Build')
    build_sequence(NAME, ax, ax_btm, history, bounds, margin=4)


if ANALYZE:
    pass
    #  print_log('\nPlot Goldens')

    #  bounds = get_bounds_from_sections(goldens)

    #  plot_sections(NAME, ax, ax_btm, history, goldens, bounds)

    #  print_log('\nPlot Golden Groups')
    #  plot_all_groups(NAME, ax, ax_btm, history, groups, bounds)

    #  plot_all_sections(NAME, ax, ax_btm, history, goldens, bounds)

    #  complete_summary(NAME, start_time, goldens, groups)

else:
    model_summary(NAME, start_time)



plt.show()

