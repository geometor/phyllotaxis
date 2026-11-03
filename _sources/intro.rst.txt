**Symbolic modeling, interactive 2D/3D web visualizations, and recursive meristem path propagations of botanical geometry.**

``geometor.phyllotaxis`` investigates the mathematical laws governing botanical form—where primordia emerge from an apical meristem at the Golden Angle:

.. math::

   \Phi = 2\pi\left(1 - \frac{1}{\phi}\right) = \frac{2\pi}{\phi^2} \approx 137.507764^\circ

Rather than rendering thousands of static PNG files, ``geometor.phyllotaxis`` embeds live 2D HTML5 Canvas and 3D Three.js WebGL laboratories directly inside this documentation:

* :doc:`demos/meristem_2d` — **2D Apical Meristem, Parastichy & Zoetrope Studio**: Live planar growth ($r = c\sqrt{k}$), rational Fibonacci convergent scrubbing ($F_n/F_{n+2}$), $(8, 13)$ parastichy spiral overlays, botanical wedges, and real-time $137.5^\circ$ stroboscopic zoetrope rotation.
* :doc:`demos/propagation_3d` — **3D Node-as-Path & Recursive Meristem Studio**: Every node originates on its parent meristem's axis and propagates outward along a 3D trajectory $\gamma_i(\tau)$, with any node capable of maturing into a secondary or tertiary child meristem.
