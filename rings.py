from phyllotaxis import *

BUILD = False
ANALYZE = True

RINGS = True
POLYGON = False
DOT = False
POINTS = False



def main():
    num_rings = int(input(f'\nnumber of rings: '))

    NAME = f'rings/{num_rings}'
    NAME += input(f'\nsession name: {NAME}')
    log_init(NAME)
    start_time = timer()

    print_log(f'\nMODEL: {NAME}')

    num_colors = 1
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

    frames = grow(num_rings, sweep)

        
        if RINGS:
            c = circle(A, pt, classes=['ring'])
            rings.append(c)

    if POLYGON:
        add_polygon(polygon(pts))


    # ANALYZE ***************************
    nearest_points = {}
    if ANALYZE:
        nearest_points = find_nearest_points(pts)


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

    plt.clf()
    fig, ax = ax_prep_square(bounds)
    ax.set_aspect('equal')
    plt.tight_layout()
    if DOT:
            dot_radius = sp.sqrt(rad)
            dot_rad_pt = point(pt.x + dot_radius, pt.y)
            c = circle(pt, dot_rad_pt)
            c.classes = ['dot']
            dots.append(c)

        for i, pt in enumerate(dots):
            #  plot_circle(ax, dot, edgecolor='k', facecolor='r', linestyle='-', fill=True)
            color = colors[i % num_colors]
            plot_circle(ax, dot, edgecolor='k', facecolor=color, linewidth=1, linestyle='-', fill=True)

    if POINTS:
        plot_points(ax, pts)

    #  plot_sequence(ax, history, bounds)
    snapshot(NAME, '00000.png')

    if BUILD:
        print_log('\nPlot Build')
        build_sequence(NAME, ax, ax_btm, history, bounds, margin=4)


    if ANALYZE:
        for arc in arcs:
            plot_segment2(ax, arc)
        
        #  pass
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

if __name__ == '__main__':
    main()
