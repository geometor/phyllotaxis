:navigation: header
:order: 30

usage
=====

3D Node-as-Path & Recursive Meristem Propagation
------------------------------------------------

Use :func:`~geometor.phyllotaxis.propagate_3d` and :class:`~geometor.phyllotaxis.MeristemConfig` to generate multi-generation 3D meristem trees in Python:

.. code-block:: python

   from geometor.phyllotaxis import MeristemConfig, propagate_3d

   config = MeristemConfig(
       max_depth=2,
       maturation_age=6,
       spawn_cadence=3,
       meristem_stride=2,
       child_scale_decay=0.6180339887,
   )
   nodes = propagate_3d(steps=34, config=config)

   for node in nodes[:5]:
       print(
           f"Node {node.id} (Gen {node.generation}): "
           f"origin={node.origin} -> tip={node.tip}, "
           f"children={len(node.children)}"
       )

Symbolic & Planar Constructions
-------------------------------

Construct exact :class:`geometor.model.Model` instances or analyze 2D parastichies:

.. code-block:: python

   from geometor.phyllotaxis import (
       build_rings_model,
       find_parastichies,
       sweep_phi,
       vogel_points,
   )

   model = build_rings_model(num_rings=13, sweep=sweep_phi())
   pts_2d = vogel_points(num_nodes=89, scale=5.0)
   spirals = find_parastichies(num_nodes=89, families=(5, 8, 13, 21))
