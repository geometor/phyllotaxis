/**
 * GEOMETOR • phyllotaxis — 3D Node-as-Path & Recursive Meristem Studio
 *
 * Key Architectural Principle:
 * Every node originates on its parent meristem's axis and propagates outward along
 * a 3D trajectory γ_i(τ) from its origin to its active tip. Any node may itself act
 * as a child meristem, spawning recursive phyllotaxic node paths along its trajectory.
 */
(function (window, document) {
  'use strict';

  function init3DStudio() {
    const stageWrapper = document.getElementById('phyllotaxisStage3D');
    const container = document.getElementById('rendererContainer3D');
    if (!stageWrapper || !container || typeof window.THREE === 'undefined') return;

    const THREE = window.THREE;
    const Palettes = window.GeometorPalettes;

    // --- Three.js Scene Setup ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05070b);

    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1500);
    camera.position.set(0, 18, 34);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x8a95a8, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xfff4d6, 1.0);
    dirLight1.position.set(18, 35, 24);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x4fc3f7, 0.45);
    dirLight2.position.set(-20, -10, -18);
    scene.add(dirLight2);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 2;
    controls.maxDistance = 400;
    controls.target.set(0, 9, 0);
    controls.update();

    // Subtle ground reference grid in XZ plane (Y is vertical shoot axis)
    const gridHelper = new THREE.GridHelper(36, 18, 0x2a3446, 0x141a24);
    scene.add(gridHelper);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Shared sphere geometries
    const tipSphereGeo = new THREE.SphereGeometry(1, 14, 10);
    const originSphereGeo = new THREE.SphereGeometry(1, 8, 6);
    const stemMat = new THREE.LineBasicMaterial({ color: 0xd4af37, linewidth: 2 });
    const originMat = new THREE.MeshBasicMaterial({ color: 0xd4af37 });

    // --- DOM Elements ---
    const controlsPanel = document.getElementById('controlsPanel3D');
    const controlsToggle = document.getElementById('controlsToggle3D');
    const startButton = document.getElementById('startButton3D');
    const stepButton = document.getElementById('stepButton3D');
    const resetButton = document.getElementById('resetButton3D');
    const resetViewButton = document.getElementById('resetViewButton3D');
    const theaterButton = document.getElementById('theaterButton3D');

    const speedSlider = document.getElementById('speedSlider3D');
    const speedValBadge = document.getElementById('speedValBadge3D');
    const angleSlider = document.getElementById('angleSlider3D');
    const angleValBadge = document.getElementById('angleValBadge3D');
    const scaleSlider = document.getElementById('scaleSlider3D');
    const scaleValBadge = document.getElementById('scaleValBadge3D');
    const accelSlider = document.getElementById('accelSlider3D');
    const accelValBadge = document.getElementById('accelValBadge3D');
    const pitchSlider = document.getElementById('pitchSlider3D');
    const pitchValBadge = document.getElementById('pitchValBadge3D');
    const archSlider = document.getElementById('archSlider3D');
    const archValBadge = document.getElementById('archValBadge3D');
    const stemStepSlider = document.getElementById('stemStepSlider3D');
    const stemStepValBadge = document.getElementById('stemStepValBadge3D');
    const sizeSlider = document.getElementById('sizeSlider3D');
    const sizeValBadge = document.getElementById('sizeValBadge3D');
    const growthSlider = document.getElementById('growthSlider3D');
    const growthValBadge = document.getElementById('growthValBadge3D');

    // Meristem recursion controls
    const maxDepthSelect = document.getElementById('maxDepthSelect3D');
    const maturationInput = document.getElementById('maturationInput3D');
    const cadenceInput = document.getElementById('cadenceInput3D');
    const strideInput = document.getElementById('strideInput3D');
    const decaySlider = document.getElementById('decaySlider3D');
    const decayValBadge = document.getElementById('decayValBadge3D');

    // Color & visibility controls
    const paletteSizeInput = document.getElementById('paletteSizeInput3D');
    const colorThemeSelect = document.getElementById('colorThemeSelect3D');
    const cycleColorsCheckbox = document.getElementById('cycleColorsCheckbox3D');
    const reverseCycleCheckbox = document.getElementById('reverseCycleCheckbox3D');

    const showPathsCheckbox = document.getElementById('showPathsCheckbox3D');
    const showTipsCheckbox = document.getElementById('showTipsCheckbox3D');
    const showOriginsCheckbox = document.getElementById('showOriginsCheckbox3D');
    const autoOrbitCheckbox = document.getElementById('autoOrbitCheckbox3D');

    // HUD
    const hudStep = document.getElementById('hudStep3D');
    const hudHeight = document.getElementById('hudHeight3D');
    const hudTotalPaths = document.getElementById('hudTotalPaths3D');
    const hudMeristems = document.getElementById('hudMeristems3D');
    const hudGenerations = document.getElementById('hudGenerations3D');

    // --- Simulation State ---
    let currentStep = 0;
    const maxPlastochrons = 360;
    let isAnimating = false;
    let logicTimeoutId = null;
    let currentShootHeight = 0;
    let lastTrackedTargetY = 9;

    let numberOfPaletteColors = parseInt(paletteSizeInput.value, 10) || 13;
    let selectedColorTheme = colorThemeSelect.value || 'galactic_v4';
    let colorPalette = Palettes.generatePalette(selectedColorTheme, numberOfPaletteColors);
    let paletteCycleOffset = 0;

    // Scene object caches
    let stemLine = null;
    let stemTipMesh = null;
    let nodeObjects = [];

    function readConfig() {
      return {
        divergenceDeg: parseFloat(angleSlider.value) || 137.507764,
        xySpreadScale: parseFloat(scaleSlider.value) || 1.65,
        pathAcceleration: accelSlider ? parseFloat(accelSlider.value) || 0.0 : 0.0,
        branchPitchDeg: parseFloat(pitchSlider.value) || 56,
        pathArch: parseFloat(archSlider.value) || 0.16,
        stemStep: parseFloat(stemStepSlider.value) || 0.34,
        baseSize: parseFloat(sizeSlider.value) || 0.22,
        sizeGrowth: growthSlider ? parseFloat(growthSlider.value) || 0.0 : 0.05,
        radialExponent: 0.54,
        pathSegments: 10,
        maxDepth: parseInt(maxDepthSelect.value, 10) || 2,
        maturationAge: Math.max(2, parseInt(maturationInput.value, 10) || 6),
        spawnCadence: Math.max(1, parseInt(cadenceInput.value, 10) || 3),
        meristemStride: Math.max(1, parseInt(strideInput.value, 10) || 2),
        childScaleDecay: parseFloat(decaySlider.value) || 0.618,
      };
    }

    function updateBadges(cfg, genCounts, meristemCount, shootHeight) {
      if (speedValBadge) speedValBadge.textContent = speedSlider.value;
      if (angleValBadge) angleValBadge.textContent = `${cfg.divergenceDeg.toFixed(2)}°`;
      if (scaleValBadge) scaleValBadge.textContent = cfg.xySpreadScale.toFixed(2);
      if (accelValBadge) accelValBadge.textContent = cfg.pathAcceleration.toFixed(2);
      if (pitchValBadge) pitchValBadge.textContent = `${cfg.branchPitchDeg.toFixed(0)}°`;
      if (archValBadge) archValBadge.textContent = cfg.pathArch.toFixed(2);
      if (stemStepValBadge) stemStepValBadge.textContent = cfg.stemStep.toFixed(2);
      if (sizeValBadge) sizeValBadge.textContent = cfg.baseSize.toFixed(2);
      if (growthValBadge) growthValBadge.textContent = cfg.sizeGrowth.toFixed(2);
      if (decayValBadge) decayValBadge.textContent = cfg.childScaleDecay.toFixed(3);

      if (hudStep) hudStep.textContent = String(currentStep);
      if (hudHeight) hudHeight.textContent = (shootHeight || 0).toFixed(1);
      if (hudTotalPaths) hudTotalPaths.textContent = String(nodeObjects.length);
      if (hudMeristems) hudMeristems.textContent = String(meristemCount);
      if (hudGenerations && genCounts) {
        hudGenerations.textContent = `${genCounts[1] || 0} / ${genCounts[2] || 0} / ${genCounts[3] || 0}`;
      }
    }

    /**
     * Evaluate a 3D path γ(s) for s ∈ [0, age] starting at `origin` in the parent's
     * orthonormal frame (parentTangent, radialDir, binormalDir).
     * Note: In Three.js, Y is vertical (+up) and XZ is the horizontal plane.
     */
    function evaluatePath3D(origin, parentTangent, radialDir, binormalDir, age, generation, cfg) {
      const decay = Math.pow(cfg.childScaleDecay, generation - 1);
      const pitchRad = (cfg.branchPitchDeg * Math.PI) / 180;
      const sinPitch = Math.sin(pitchRad);
      const cosPitch = Math.cos(pitchRad);

      if (age <= 0) {
        const t0 = parentTangent
          .clone()
          .multiplyScalar(cosPitch)
          .addScaledVector(radialDir, sinPitch)
          .normalize();
        let b0 = new THREE.Vector3().crossVectors(t0, parentTangent);
        if (b0.lengthSq() < 1e-6) b0.copy(binormalDir);
        b0.normalize();
        const n0 = new THREE.Vector3().crossVectors(b0, t0).normalize();
        return { points: [origin.clone()], tipTangent: t0, tipNormal: n0, tipBinormal: b0 };
      }

      const numSeg = Math.max(2, Math.min(cfg.pathSegments, age + 1));
      const pts = [];

      for (let k = 0; k <= numSeg; k++) {
        const u = k / numSeg;
        const s = age * u;
        const accelFactor =
          cfg.pathAcceleration !== 0 && s > 0
            ? Math.pow((s + 1) / 18.0, cfg.pathAcceleration * 0.65)
            : 1.0;
        const reach = cfg.xySpreadScale * decay * Math.pow(s, cfg.radialExponent) * accelFactor;
        const radialDisp = reach * sinPitch;
        const axialDisp = reach * cosPitch + cfg.pathArch * reach * u * u;

        const pt = origin
          .clone()
          .addScaledVector(radialDir, radialDisp)
          .addScaledVector(parentTangent, axialDisp);
        pts.push(pt);
      }

      const tipTangent = new THREE.Vector3().subVectors(pts[pts.length - 1], pts[pts.length - 2]).normalize();
      let tipBinormal = new THREE.Vector3().crossVectors(tipTangent, parentTangent);
      if (tipBinormal.lengthSq() < 1e-6) tipBinormal.copy(binormalDir);
      tipBinormal.normalize();
      const tipNormal = new THREE.Vector3().crossVectors(tipBinormal, tipTangent).normalize();

      return { points: pts, tipTangent, tipNormal, tipBinormal };
    }

    function clearSceneObjects() {
      while (rootGroup.children.length > 0) {
        const obj = rootGroup.children.pop();
        if (obj.geometry && obj.geometry !== tipSphereGeo && obj.geometry !== originSphereGeo) {
          obj.geometry.dispose();
        }
        if (obj.material && obj.material !== stemMat && obj.material !== originMat) {
          obj.material.dispose();
        }
      }
      nodeObjects = [];
      stemLine = null;
      stemTipMesh = null;
    }

    function rebuildMeristemTree(steps) {
      clearSceneObjects();
      const cfg = readConfig();
      const divRad = (cfg.divergenceDeg * Math.PI) / 180;
      const showPaths = showPathsCheckbox.checked;
      const showTips = showTipsCheckbox.checked;
      const showOrigins = showOriginsCheckbox.checked;

      // 1. Primary Apical Shoot (Generation 0 Meristem growing continuously along +Y)
      const stemPoints = [new THREE.Vector3(0, 0, 0)];
      let curY = 0;
      const totalSteps = Math.max(1, steps);
      for (let s = 1; s <= totalSteps; s++) {
        const internodeAge = Math.max(0, totalSteps - s);
        const internodeElongation =
          cfg.pathAcceleration !== 0 && internodeAge > 0
            ? 1.0 + 0.35 * cfg.pathAcceleration * Math.pow((internodeAge + 1) / 24.0, 0.45)
            : 1.0;
        const dy = cfg.stemStep * internodeElongation;
        curY += dy;
        stemPoints.push(new THREE.Vector3(0, curY, 0));
      }
      currentShootHeight = curY;

      if (showPaths) {
        const stemGeo = new THREE.BufferGeometry().setFromPoints(stemPoints);
        stemLine = new THREE.Line(stemGeo, stemMat);
        rootGroup.add(stemLine);
      }

      if (showTips) {
        const domeMat = new THREE.MeshStandardMaterial({
          color: 0xd4af37,
          emissive: 0x3a2c05,
          roughness: 0.3,
          metalness: 0.4,
        });
        stemTipMesh = new THREE.Mesh(tipSphereGeo, domeMat);
        stemTipMesh.position.copy(stemPoints[stemPoints.length - 1]);
        const domeScale = cfg.baseSize * 1.3;
        stemTipMesh.scale.set(domeScale, domeScale, domeScale);
        rootGroup.add(stemTipMesh);
      }

      const genCounts = { 1: 0, 2: 0, 3: 0 };
      let activeMeristemCount = 1; // Root shoot

      const rootMeristem = {
        id: 0,
        generation: 0,
        birthStep: 0,
        isMeristem: true,
        origin: new THREE.Vector3(0, 0, 0),
        tangent: new THREE.Vector3(0, 1, 0),
        normal: new THREE.Vector3(1, 0, 0),
        binormal: new THREE.Vector3(0, 0, 1),
      };

      const queue = [rootMeristem];
      let nextId = 1;

      while (queue.length > 0) {
        const parent = queue.shift();
        const childGen = parent.generation + 1;
        if (childGen > cfg.maxDepth) continue;

        const decay = Math.pow(cfg.childScaleDecay, childGen - 1);
        const spawnSteps = [];
        if (parent.generation === 0) {
          for (let t = 0; t < steps; t++) spawnSteps.push(t);
        } else {
          const maxLateralChildren = childGen === 2 ? 21 : 13;
          for (
            let t = parent.birthStep + cfg.maturationAge;
            t < steps && spawnSteps.length < maxLateralChildren;
            t += cfg.spawnCadence
          ) {
            spawnSteps.push(t);
          }
        }

        for (let idx = 0; idx < spawnSteps.length; idx++) {
          const birthT = spawnSteps[idx];
          const rawAge = Math.max(0, steps - 1 - birthT);
          const childAge = childGen === 1 ? rawAge : Math.min(rawAge, 42);
          const theta = idx * divRad;

          let childOrigin;
          let pTangent;
          let pNormal;
          let pBinormal;

          if (parent.generation === 0) {
            childOrigin = stemPoints[Math.min(birthT, stemPoints.length - 1)].clone();
            pTangent = new THREE.Vector3(0, 1, 0);
            pNormal = new THREE.Vector3(1, 0, 0);
            pBinormal = new THREE.Vector3(0, 0, 1);
          } else {
            const ageAtBirth = Math.max(1, birthT - parent.birthStep);
            const subEval = evaluatePath3D(
              parent.origin,
              parent.tangent,
              parent.normal,
              parent.binormal,
              ageAtBirth,
              parent.generation,
              cfg
            );
            childOrigin = subEval.points[subEval.points.length - 1].clone();
            pTangent = subEval.tipTangent;
            pNormal = subEval.tipNormal;
            pBinormal = subEval.tipBinormal;
          }

          const radialDir = pNormal
            .clone()
            .multiplyScalar(Math.cos(theta))
            .addScaledVector(pBinormal, Math.sin(theta))
            .normalize();
          const binormalDir = new THREE.Vector3().crossVectors(pTangent, radialDir).normalize();

          const pathEval = evaluatePath3D(
            childOrigin,
            pTangent,
            radialDir,
            binormalDir,
            childAge,
            childGen,
            cfg
          );

          const isChildMeristem =
            childGen < cfg.maxDepth && idx % cfg.meristemStride === 0;
          if (isChildMeristem) activeMeristemCount++;
          genCounts[childGen] = (genCounts[childGen] || 0) + 1;

          const colorStr = Palettes.colorForNode(
            idx,
            selectedColorTheme,
            numberOfPaletteColors,
            colorPalette,
            paletteCycleOffset,
            childGen - 1
          );

          // Render 3D Path Line from Origin to Tip
          if (showPaths && pathEval.points.length >= 2) {
            const pathGeo = new THREE.BufferGeometry().setFromPoints(pathEval.points);
            const pathMat = new THREE.LineBasicMaterial({
              color: colorStr,
              transparent: childGen > 1,
              opacity: childGen === 1 ? 0.92 : 0.72,
            });
            const pathLine = new THREE.Line(pathGeo, pathMat);
            rootGroup.add(pathLine);
          }

          // Render Origin Anchor on Parent Meristem
          if (showOrigins) {
            const origMesh = new THREE.Mesh(originSphereGeo, originMat);
            origMesh.position.copy(childOrigin);
            const origScale = Math.max(0.03, cfg.baseSize * 0.32 * decay);
            origMesh.scale.set(origScale, origScale, origScale);
            rootGroup.add(origMesh);
          }

          // Render Tip Bud / Meristem Sphere at Path Endpoint
          if (showTips) {
            const tipPos = pathEval.points[pathEval.points.length - 1];
            const tipMat = new THREE.MeshStandardMaterial({
              color: colorStr,
              roughness: isChildMeristem ? 0.28 : 0.5,
              metalness: isChildMeristem ? 0.25 : 0.1,
            });
            const tipMesh = new THREE.Mesh(tipSphereGeo, tipMat);
            tipMesh.position.copy(tipPos);
            const sizeAccel =
              cfg.pathAcceleration !== 0 && childAge > 0
                ? Math.pow((childAge + 1) / 18.0, cfg.pathAcceleration * 0.85)
                : 1.0;
            const tipScale = Math.max(
              0.03,
              (cfg.baseSize + cfg.sizeGrowth * Math.sqrt(childAge) * sizeAccel) * decay
            );
            tipMesh.scale.set(tipScale, tipScale, tipScale);
            rootGroup.add(tipMesh);
          }

          const nodeRecord = {
            id: nextId++,
            generation: childGen,
            birthStep: birthT,
            isMeristem: isChildMeristem,
            origin: childOrigin,
            tangent: pTangent,
            normal: radialDir,
            binormal: binormalDir,
          };
          nodeObjects.push(nodeRecord);

          if (isChildMeristem && nodeObjects.length < 4500) {
            queue.push(nodeRecord);
          }
        }
      }

      // Smoothly elevate camera orbit target and distance as the meristem climbs higher
      const desiredTargetY = Math.max(6, curY * 0.52);
      const dyTarget = desiredTargetY - lastTrackedTargetY;
      if (Math.abs(dyTarget) > 1e-4) {
        controls.target.y += dyTarget;
        camera.position.y += dyTarget;
        lastTrackedTargetY = desiredTargetY;
      }
      const offsetVec = new THREE.Vector3().subVectors(camera.position, controls.target);
      const minRequiredDist = Math.max(26, curY * 1.08);
      if (offsetVec.length() < minRequiredDist) {
        offsetVec.setLength(minRequiredDist);
        camera.position.copy(controls.target).add(offsetVec);
      }

      updateBadges(cfg, genCounts, activeMeristemCount, curY);
    }

    function recenterCameraOnMeristem() {
      const targetY = Math.max(6, currentShootHeight * 0.52);
      const dist = Math.max(32, currentShootHeight * 1.18);
      lastTrackedTargetY = targetY;
      controls.target.set(0, targetY, 0);
      camera.position.set(0, targetY + dist * 0.26, dist);
      controls.update();
    }

    function stepForward() {
      if (cycleColorsCheckbox.checked && numberOfPaletteColors > 0 && colorPalette.length > 0) {
        paletteCycleOffset += reverseCycleCheckbox.checked ? -1 : 1;
      }
      if (currentStep < maxPlastochrons) {
        currentStep++;
      } else {
        currentStep = 1;
      }
      rebuildMeristemTree(currentStep);
    }

    function logicLoop() {
      if (!isAnimating) return;
      stepForward();
      const speed = parseInt(speedSlider.value, 10) || 6;
      logicTimeoutId = window.setTimeout(logicLoop, 1000 / (speed * 2.2));
    }

    function renderLoop() {
      window.requestAnimationFrame(renderLoop);
      if (autoOrbitCheckbox && autoOrbitCheckbox.checked) {
        rootGroup.rotation.y += 0.0045;
      }
      controls.update();
      renderer.render(scene, camera);
    }

    function togglePlay() {
      if (!isAnimating) {
        isAnimating = true;
        startButton.textContent = 'Pause';
        startButton.classList.replace('phyl-btn-primary', 'phyl-btn-secondary');
        logicLoop();
      } else {
        isAnimating = false;
        if (logicTimeoutId) window.clearTimeout(logicTimeoutId);
        startButton.textContent = 'Resume';
        startButton.classList.replace('phyl-btn-secondary', 'phyl-btn-primary');
      }
    }

    function resetSimulation() {
      isAnimating = false;
      if (logicTimeoutId) window.clearTimeout(logicTimeoutId);
      currentStep = 0;
      paletteCycleOffset = 0;
      rootGroup.rotation.y = 0;
      startButton.textContent = 'Start';
      startButton.classList.replace('phyl-btn-secondary', 'phyl-btn-primary');
      rebuildMeristemTree(0);
      recenterCameraOnMeristem();
    }

    function resizeRenderer() {
      const rect = stageWrapper.getBoundingClientRect();
      const w = Math.max(320, Math.floor(rect.width));
      const h = Math.max(320, Math.floor(rect.height));
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }

    function handleColorChange() {
      numberOfPaletteColors = Math.max(0, Math.min(64, parseInt(paletteSizeInput.value, 10) || 0));
      paletteSizeInput.value = numberOfPaletteColors;
      selectedColorTheme = colorThemeSelect.value;
      colorPalette = Palettes.generatePalette(selectedColorTheme, numberOfPaletteColors);
      rebuildMeristemTree(currentStep);
    }

    // --- Event Listeners ---
    startButton.addEventListener('click', togglePlay);
    stepButton.addEventListener('click', () => {
      if (isAnimating) togglePlay();
      stepForward();
    });
    resetButton.addEventListener('click', resetSimulation);
    if (resetViewButton) {
      resetViewButton.addEventListener('click', recenterCameraOnMeristem);
    }

    const presetBar = stageWrapper.parentElement
      ? stageWrapper.parentElement.querySelector('.phyllotaxis-preset-bar')
      : null;

    controlsToggle.addEventListener('click', () => {
      controlsPanel.classList.toggle('collapsed');
      const isCollapsed = controlsPanel.classList.contains('collapsed');
      controlsToggle.textContent = isCollapsed ? '›' : '‹';
      if (presetBar) {
        presetBar.classList.toggle('controls-collapsed', isCollapsed);
      }
    });

    theaterButton.addEventListener('click', () => {
      stageWrapper.classList.toggle('theater-mode');
      const isTheater = stageWrapper.classList.contains('theater-mode');
      theaterButton.textContent = isTheater ? 'Exit Full' : 'Theater (F)';
      if (presetBar) {
        presetBar.classList.toggle('theater-mode', isTheater);
      }
      resizeRenderer();
    });

    const liveRebuildInputs = [
      angleSlider,
      scaleSlider,
      accelSlider,
      pitchSlider,
      archSlider,
      stemStepSlider,
      sizeSlider,
      growthSlider,
      maxDepthSelect,
      maturationInput,
      cadenceInput,
      strideInput,
      decaySlider,
      showPathsCheckbox,
      showTipsCheckbox,
      showOriginsCheckbox,
    ];
    liveRebuildInputs.forEach((el) => {
      if (!el) return;
      el.addEventListener('input', () => rebuildMeristemTree(currentStep));
      el.addEventListener('change', () => rebuildMeristemTree(currentStep));
    });

    speedSlider.addEventListener('input', () => {
      if (speedValBadge) speedValBadge.textContent = speedSlider.value;
    });
    paletteSizeInput.addEventListener('input', handleColorChange);
    colorThemeSelect.addEventListener('change', handleColorChange);
    cycleColorsCheckbox.addEventListener('change', handleColorChange);
    reverseCycleCheckbox.addEventListener('change', handleColorChange);

    // Curated 3D Presets
    const presetButtons = document.querySelectorAll('[data-preset-3d]');
    const PRESETS_3D = {
      recursive_tree: {
        step: 38,
        depth: 2,
        angle: 137.507764,
        scale: 1.75,
        accel: 0.0,
        pitch: 56,
        arch: 0.16,
        stemStep: 0.36,
        size: 0.22,
        growth: 0.05,
        maturation: 6,
        cadence: 3,
        stride: 2,
        decay: 0.618,
        palette: 13,
        theme: 'galactic_v4',
        paths: true,
        tips: true,
        origins: true,
      },
      pinecone_strobilus: {
        step: 64,
        depth: 2,
        angle: 137.507764,
        scale: 1.15,
        accel: 0.72,
        pitch: 76,
        arch: 0.06,
        stemStep: 0.24,
        size: 0.14,
        growth: 0.18,
        maturation: 5,
        cadence: 3,
        stride: 2,
        decay: 0.56,
        palette: 13,
        theme: 'forest',
        paths: true,
        tips: true,
        origins: true,
      },
      romanesco_depth3: {
        step: 28,
        depth: 3,
        angle: 137.507764,
        scale: 1.9,
        accel: 0.24,
        pitch: 52,
        arch: 0.12,
        stemStep: 0.42,
        size: 0.18,
        growth: 0.08,
        maturation: 5,
        cadence: 4,
        stride: 2,
        decay: 0.58,
        palette: 21,
        theme: 'greens',
        paths: true,
        tips: true,
        origins: false,
      },
      classic_meristem: {
        step: 65,
        depth: 1,
        angle: 137.507764,
        scale: 1.85,
        accel: 0.38,
        pitch: 72,
        arch: 0.04,
        stemStep: 0.26,
        size: 0.18,
        growth: 0.12,
        maturation: 6,
        cadence: 3,
        stride: 2,
        decay: 0.618,
        palette: 13,
        theme: 'golden_amber',
        paths: true,
        tips: true,
        origins: true,
      },
      candelabra_shoot: {
        step: 42,
        depth: 2,
        angle: 137.507764,
        scale: 1.45,
        accel: 0.32,
        pitch: 68,
        arch: 0.34,
        stemStep: 0.32,
        size: 0.18,
        growth: 0.09,
        maturation: 5,
        cadence: 3,
        stride: 3,
        decay: 0.618,
        palette: 8,
        theme: 'sunset',
        paths: true,
        tips: true,
        origins: true,
      },
      weeping_canopy: {
        step: 44,
        depth: 2,
        angle: 137.507764,
        scale: 1.8,
        accel: 0.45,
        pitch: 64,
        arch: -0.22,
        stemStep: 0.38,
        size: 0.16,
        growth: 0.11,
        maturation: 6,
        cadence: 3,
        stride: 2,
        decay: 0.618,
        palette: 13,
        theme: 'forest',
        paths: true,
        tips: true,
        origins: false,
      },
    };

    presetButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        presetButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const key = btn.getAttribute('data-preset-3d');
        const p = PRESETS_3D[key];
        if (!p) return;

        currentStep = p.step;
        maxDepthSelect.value = String(p.depth);
        angleSlider.value = p.angle;
        scaleSlider.value = p.scale;
        if (accelSlider) accelSlider.value = p.accel !== undefined ? p.accel : 0.0;
        pitchSlider.value = p.pitch;
        archSlider.value = p.arch;
        stemStepSlider.value = p.stemStep;
        sizeSlider.value = p.size;
        if (growthSlider) growthSlider.value = p.growth !== undefined ? p.growth : 0.05;
        maturationInput.value = p.maturation;
        cadenceInput.value = p.cadence;
        strideInput.value = p.stride;
        decaySlider.value = p.decay;
        paletteSizeInput.value = p.palette;
        numberOfPaletteColors = p.palette;
        colorThemeSelect.value = p.theme;
        selectedColorTheme = p.theme;
        showPathsCheckbox.checked = p.paths;
        showTipsCheckbox.checked = p.tips;
        showOriginsCheckbox.checked = p.origins;

        colorPalette = Palettes.generatePalette(selectedColorTheme, numberOfPaletteColors);
        rebuildMeristemTree(currentStep);
        recenterCameraOnMeristem();
      });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (event) => {
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT') {
        if (event.key.toLowerCase() !== 't') return;
      }
      switch (event.key) {
        case ' ':
          event.preventDefault();
          togglePlay();
          break;
        case 'r':
        case 'R':
          resetSimulation();
          break;
        case '0':
          recenterCameraOnMeristem();
          break;
        case 't':
        case 'T':
          controlsToggle.click();
          break;
        case 'f':
        case 'F':
          theaterButton.click();
          break;
        case 'o':
        case 'O':
          autoOrbitCheckbox.checked = !autoOrbitCheckbox.checked;
          break;
        case 'c':
        case 'C':
          cycleColorsCheckbox.checked = !cycleColorsCheckbox.checked;
          handleColorChange();
          break;
        case 'x':
        case 'X':
          reverseCycleCheckbox.checked = !reverseCycleCheckbox.checked;
          handleColorChange();
          break;
        case 'ArrowUp':
          event.preventDefault();
          paletteSizeInput.value = Math.min(64, (parseInt(paletteSizeInput.value, 10) || 0) + 1);
          handleColorChange();
          break;
        case 'ArrowDown':
          event.preventDefault();
          paletteSizeInput.value = Math.max(0, (parseInt(paletteSizeInput.value, 10) || 0) - 1);
          handleColorChange();
          break;
        case 'ArrowRight':
          event.preventDefault();
          colorThemeSelect.selectedIndex =
            (colorThemeSelect.selectedIndex + 1) % colorThemeSelect.options.length;
          handleColorChange();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          colorThemeSelect.selectedIndex =
            (colorThemeSelect.selectedIndex - 1 + colorThemeSelect.options.length) %
            colorThemeSelect.options.length;
          handleColorChange();
          break;
      }
    });

    window.addEventListener('resize', resizeRenderer);
    resizeRenderer();
    currentStep = 34;
    rebuildMeristemTree(currentStep);
    renderLoop();
    togglePlay();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init3DStudio);
  } else {
    init3DStudio();
  }
})(window, document);
