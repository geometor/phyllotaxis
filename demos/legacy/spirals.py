from geometor.utils import *
from geometor.model import *
from geometor.render import *

sp.init_printing()

print(f'num_workers: {num_workers}')

nodes = 1086
cycles = 13

plt_init_polar()
fig, ax = plt.subplots(subplot_kw={'projection': 'polar'})

ax.set_title('G E O M E T O R', fontdict={'color': '#960', 'size':'small'})
ax.set_axis_off()

phi = (1 + math.sqrt(5)) / 2
sweep = (2 * math.pi) - ((2 * math.pi) / phi)

def spiral(n=144, cmap=mp.cm.YlGn, color_cycle=21, rev=False, offset=0):
    for i in range(n):
        # radius = i * phi
        radius = n - i 
        #  theta = 2 * np.pi * i * phi
        angle = i * sweep
        color_scale = (((i + offset) % color_cycle) / color_cycle)
        color_scale = color_scale + (1 / (color_cycle * 2))
        if rev:
            color_scale = 1 - color_scale
        color = cmap(color_scale)
        markersize = math.sqrt(radius) + 8
        ax.plot(angle, radius, marker='.', markersize=markersize, color=color)

#  spiral(n=21, cmap=mp.cm.hot, color_cycle=5)
#  fig.show()

# grow to n points for each color cycle up to n
# - with Pool

def spiral_params(params):
    '''take params in single dict for multiprocessing'''
    n = params['n']
    n_pad = str(n).zfill(4)
    color_cycle = params['color_cycle']
    cycle_pad = str(color_cycle).zfill(4)
    cmap = params['cmap']
    
    plt.cla()
    plt_init_polar()
    
    title = f'G E O M E T O R • {cmap.name} • cycle: {cycle_pad} • n: {n_pad}'
    ax.set_title(title, fontdict={'color': '#960', 'size':'small'})
    ax.set_axis_off()
    
    spiral(n=n, cmap=cmap, color_cycle=color_cycle)
    
    out = f'spirals/{cmap_name}/{cycle_pad}'
    filename = snapshot(out, f'{n_pad}.png')
    return filename

cmap_name = 'copper'
cmap = mp.cm.get_cmap(cmap_name)

generations = []

for cycle in range(1, cycles + 1):
    for i in range(1, nodes):
        gen = {'n': i, 'cmap': cmap, 'color_cycle': cycle} 
        generations.append(gen)
        
print(f'count: {len(generations)}')
        
with Pool(num_workers) as pool:
    results = pool.map(spiral_params, generations)
print("generation complete", len(results))

