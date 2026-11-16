:site_title: Phyllotaxis

.. container:: author-overline

   semantic digital archive • interactive studio

===========
Phyllotaxis
===========

``geometor.phyllotaxis`` is the botanical morphogenesis studio of the interconnected `GEOMETOR <https://geometor.com/books/>`_ semantic digital archive. It investigates the mathematical and physical principles of plant architecture—from planar Vogel capitula to recursive 3D vascular path propagations—grounded in exact symbolic representations of the golden angle and Fibonacci rational convergents.

.. math::

   \Phi = 2\pi\left(1 - \frac{1}{\phi}\right) = \frac{2\pi}{\phi^2} \approx 137.507764^\circ

Interactive Studios
-------------------

* :doc:`demos/meristem_2d` — **2D Apical Meristem, Parastichy & Zoetrope Studio**: Live planar growth (:math:`r = c\sqrt{k}`), rational Fibonacci convergent scrubbing (:math:`F_n/F_{n+2}`), :math:`(8, 13)` parastichy spiral overlays, botanical wedges, and real-time :math:`137.5^\circ` stroboscopic zoetrope rotation.
* :doc:`demos/propagation_3d` — **3D Node-as-Path & Recursive Meristem Studio**: Every node originates on its parent meristem's axis and propagates outward along a 3D trajectory :math:`\gamma_i(\tau)`, with any node capable of maturing into a secondary or tertiary child meristem.

Apparatus & Guides
------------------

* :doc:`Mission & Core Principles <mission/index>` — Foundations of botanical geometry in the divine proportion
* :doc:`Usage & Python API <usage/index>` — Interactive controls and programmatic generation of 3D meristem trees
* :doc:`Demonstrations Portal <demos/index>` — Embedded 2D/3D laboratories

.. toctree::
   :hidden:
   :maxdepth: 2

   mission/index
   demos/index
   usage/index
   refs/index
   log/index
   modules/index
   todos/index
   changelog

----

Indices
-------

* :ref:`genindex`
* :ref:`modindex`
* :ref:`search`
