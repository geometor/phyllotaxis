:template: demo_3d.html

3D Node-as-Path & Recursive Meristems
=====================================

In 3D phyllotaxic propagation, **every node is a growing trajectory from its origin on the parent stem—and may itself act as a child meristem**:

.. math::

   \gamma_i(s) = \mathbf{O}_i + \bigl(c\,\lambda^{g-1} s^\rho \sin\beta\bigr)\,\hat{\mathbf{u}}_i(\theta_i) + \bigl(c\,\lambda^{g-1} s^\rho \cos\beta + \kappa\,\lambda^{g-1} s^{1.15}\bigr)\,\hat{\mathbf{T}}_{\text{parent}}, \qquad s \in [0, \tau_i]

* **Origin ($\mathbf{O}_i$)**: Each node is anchored at the exact coordinates on its parent meristem where it was initiated at plastochron $t_i$.
* **Path ($\gamma_i(s)$)**: As age $\tau_i = t - t_i$ advances, the node grows outward along a 3D curve controlled by **Radial Reach ($c$)**, **Branch Pitch ($\beta$)**, and **Gravitropic Curvature ($\kappa$)**.
* **Recursive Meristem ($D \ge 2$)**: Once a node reaches **Maturation Age**, its advancing tip frame $(\hat{\mathbf{T}}_i, \hat{\mathbf{N}}_i, \hat{\mathbf{B}}_i)$ spawns child node paths at the golden angle $\Phi \approx 137.5078^\circ$ scaled by $\lambda \approx 1/\phi$.
