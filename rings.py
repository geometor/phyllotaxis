from phyllotaxis import *

BUILD = False
ANALYZE = True

RINGS = True
POLYGON = False
DOT = True
POINTS = False

def plot_dots(ax, dot_pts, colors):
    for i, pt in enumerate(dot_pts):
        dot_radius = sp.sqrt(len(dot_pts) - i)
        dot_rad_pt = point(pt.x + dot_radius, pt.y)
        dot = circle(pt, dot_rad_pt)
        dot.classes = ['dot']

        color = colors[i % len(colors)]
        plot_circle(ax, dot, edgecolor=color, facecolor=color, linewidth=0, linestyle='-', fill=True)


def main():
    num_rings = int(input(f'\nnumber of rings: '))

    cmap_name = 'twilight'
    print(f'color map: {cmap_name}')
    num_colors  = int(input(f'\nnumber of colors: '))
    colors = get_colors(cmap_name, num_colors)

    session_folder = f'pyllotaxis/{cmap_name}/{num_colors:0>3}'
    session_folder += input(f'\nsession name: {session_folder}')
    log_init(session_folder)
    start_time = timer()

    print_log(f'\nMODEL: {session_folder}')


    # add center points
    C = add_point(point(0, 0))

    #  sweep = sweep_phi()
    sweep = sweep_rational(89, 144)
    print_log('Sweep:')
    print_log(f'    radians: {sweep} = {sweep.evalf()}')
    theta = math.degrees(sweep)
    print_log(f'    degrees: {theta}')

    frames = grow(num_rings, sweep)



    # ANALYZE ***************************
    nearest_points = {}
    if ANALYZE:
        # nearest points for each point
        nearest_points = find_nearest_points(pts)


    # PLOT *********************************
    print_log(f'\nPLOT: {session_folder}')

    max_scale = num_rings + math.sqrt(num_rings)
    max_limx = (-max_scale, max_scale)
    max_limy = (-max_scale, max_scale)

    for i, frame_pts in enumerate(frames):
        scale = i + math.sqrt(i)
        limx = (-scale, scale)
        limy = (-scale, scale)
        bounds = set_bounds(limx, limy)

        plt.close()
        fig, ax = ax_prep_square()
        ax.set_aspect('equal')
        plt.tight_layout()

        if DOT:
            plot_dots(ax, frame_pts, colors)
            dot_folder = f'{session_folder}/{i:0>5}'
            ax.set_xlim(limx[0], limx[1])
            #  ax.set_ylim(limy[0], limy[1])
            ax.set_ylim(*limy)
            snapshot(dot_folder, 'dots-zoom.png')
            snapshot(dot_folder, 'dots-zoom.svg')
            #  ax_set_bounds(ax, bounds)
            ax.set_xlim(*max_limx)
            ax.set_ylim(*max_limy)
            snapshot(dot_folder, 'dots.png')
            snapshot(dot_folder, 'dots.svg')

        if RINGS:
            pass

        if POINTS:
            plot_points(ax, pts)

        if POLYGON:
            pass

    if ANALYZE:
        # plot_nearest()
        pass
        #  for arc in arcs:
            #  plot_segment2(ax, arc)
    else:
        model_summary(NAME, start_time)

    #  plt.show()

if __name__ == '__main__':
    main()
