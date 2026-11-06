/**
 * GEOMETOR • phyllotaxis — 2D Apical Meristem, Closest Nodes, Parastichy & Zoetrope Studio
 */
(function (window, document) {
  'use strict';

  const RANK_STROKES = [
    'rgba(212, 175, 55, 0.85)', // 1st closest: Gold
    'rgba(0, 210, 220, 0.78)',  // 2nd closest: Cyan
    'rgba(224, 102, 255, 0.66)', // 3rd closest: Magenta
    'rgba(82, 214, 129, 0.58)',  // 4th closest: Emerald
  ];

  const RANK_LABELS = ['1st (Gold)', '2nd (Cyan)', '3rd (Mag.)', '4th (Grn.)'];
  const RANK_HEX = ['#f5d061', '#38e1eb', '#e066ff', '#52d681'];

  const FIB_INDEX = {
    1: 2,
    2: 3,
    3: 4,
    5: 5,
    8: 6,
    13: 7,
    21: 8,
    34: 9,
    55: 10,
    89: 11,
    144: 12,
    233: 13,
    377: 14,
    610: 15,
    987: 16,
    1597: 17,
    2584: 18,
    4181: 19,
    6765: 20,
  };

  const FIB_FAMILY_COLORS = {
    3: 'rgba(255, 138, 101, 0.82)',
    5: 'rgba(255, 107, 107, 0.82)',
    8: 'rgba(82, 214, 129, 0.82)',
    13: 'rgba(255, 167, 38, 0.84)',
    21: 'rgba(212, 175, 55, 0.86)',
    34: 'rgba(0, 210, 220, 0.84)',
    55: 'rgba(224, 102, 255, 0.78)',
    89: 'rgba(124, 77, 255, 0.76)',
    144: 'rgba(174, 234, 0, 0.76)',
    233: 'rgba(255, 64, 129, 0.76)',
    377: 'rgba(0, 229, 255, 0.76)',
    610: 'rgba(255, 215, 64, 0.76)',
  };

  function init2DStudio() {
    const stageWrapper = document.getElementById('phyllotaxisStage2D');
    const canvas = document.getElementById('phyllotaxisCanvas2D');
    if (!stageWrapper || !canvas) return;

    const ctx = canvas.getContext('2d');
    const Palettes = window.GeometorPalettes;

    // Controls
    const controlsPanel = document.getElementById('controlsPanel2D');
    const controlsToggle = document.getElementById('controlsToggle2D');
    const startButton = document.getElementById('startButton2D');
    const stepButton = document.getElementById('stepButton2D');
    const resetButton = document.getElementById('resetButton2D');
    const soundButton = document.getElementById('soundButton2D');
    const resetViewButton = document.getElementById('resetViewButton2D');
    const theaterButton = document.getElementById('theaterButton2D');
    const examplesSelect = document.getElementById('examplesSelect2D');

    const anglePresetSelect = document.getElementById('anglePresetSelect2D');
    const angleSlider = document.getElementById('angleSlider2D');
    const angleValBadge = document.getElementById('angleValBadge2D');

    const morphologySelect = document.getElementById('morphologySelect2D');
    const lifecycleSpanSlider = document.getElementById('lifecycleSpanSlider2D');
    const lifecycleSpanValBadge = document.getElementById('lifecycleSpanValBadge2D');
    const speedSlider = document.getElementById('speedSlider2D');
    const speedValBadge = document.getElementById('speedValBadge2D');
    const scaleSlider = document.getElementById('scaleSlider2D');
    const scaleValBadge = document.getElementById('scaleValBadge2D');
    const accelSlider = document.getElementById('accelSlider2D');
    const accelValBadge = document.getElementById('accelValBadge2D');
    const sizeSlider = document.getElementById('sizeSlider2D');
    const sizeValBadge = document.getElementById('sizeValBadge2D');
    const growthSlider = document.getElementById('growthSlider2D');
    const growthValBadge = document.getElementById('growthValBadge2D');
    const maxNodesInput = document.getElementById('maxNodesInput2D');

    const paletteSizeInput = document.getElementById('paletteSizeInput2D');
    const colorThemeSelect = document.getElementById('colorThemeSelect2D');
    const cycleColorsCheckbox = document.getElementById('cycleColorsCheckbox2D');
    const reverseCycleCheckbox = document.getElementById('reverseCycleCheckbox2D');

    const nearestCountSelect = document.getElementById('nearestCountSelect2D');
    const nearestColorModeSelect = document.getElementById('nearestColorModeSelect2D');
    const showCurveCountsCheckbox = document.getElementById('showCurveCountsCheckbox2D');
    const showIntersectionsCheckbox = document.getElementById('showIntersectionsCheckbox2D');
    const showPathsCheckbox = document.getElementById('showPathsCheckbox2D');
    const parastichy8Checkbox = document.getElementById('parastichy8Checkbox2D');
    const parastichy13Checkbox = document.getElementById('parastichy13Checkbox2D');
    const zoetropeCheckbox = document.getElementById('zoetropeCheckbox2D');

    // HUD
    const hudPrimordia = document.getElementById('hudPrimordia2D');
    const hudPhases = document.getElementById('hudPhases2D');
    const hudAngle = document.getElementById('hudAngle2D');
    const hudGrowth = document.getElementById('hudGrowth2D');
    const hudNearest = document.getElementById('hudNearest2D');
    const hudFibCurves = document.getElementById('hudFibCurves2D');
    const hudZoom = document.getElementById('hudZoom2D');
    const hudCycle = document.getElementById('hudCycle2D');
    const hudMode = document.getElementById('hudMode2D');

    // Simulation state
    let divergenceDeg = parseFloat(angleSlider.value) || 137.507764;
    let lifecycleSpan = lifecycleSpanSlider ? parseInt(lifecycleSpanSlider.value, 10) || 34 : 34;
    let scaleConstant = parseFloat(scaleSlider.value) || 5.5;
    let radialAcceleration = accelSlider ? parseFloat(accelSlider.value) || 0.0 : 0.0;
    let primordiumBaseSize = parseFloat(sizeSlider.value) || 1.8;
    let nodeGrowthFactor = growthSlider ? parseFloat(growthSlider.value) || 0.25 : 0.25;
    let maxNodes = parseInt(maxNodesInput.value, 10) || 610;

    let numberOfPaletteColors = parseInt(paletteSizeInput.value, 10) || 21;
    let selectedColorTheme = colorThemeSelect.value || 'galactic_v4';
    let colorPalette = Palettes.generatePalette(selectedColorTheme, numberOfPaletteColors);
    let isColorCycling = cycleColorsCheckbox.checked;
    let isCycleReversed = reverseCycleCheckbox.checked;
    let paletteCycleOffset = 0;

    let isAnimating = false;
    let isSoundEnabled = false;
    let audioCtx = null;
    let masterGain = null;
    let timeoutId = null;
    let primordia = [];
    let nextPrimordiumId = 0;
    let zoetropeAngleRad = 0;
    let phaseCounts = { leaf: 0, petal: 0, floret: 0, bud: 0 };

    // Closest-node segments, curve intersections & Fibonacci curve/bend analysis cache
    let nearestSegments = [];
    let curveIntersections = [];
    let curveAnalysis = {
      outerRanks: [],
      zones: [],
      bendRadii: [],
      bendVertices: [],
      outerTips0: [],
      outerTips1: [],
      maxRimRadius: 0,
    };

    // Pan & Zoom viewport state
    let zoom = 1.0;
    let panX = 0;
    let panY = 0;
    let isPanning = false;
    let panStartX = 0;
    let panStartY = 0;
    let panOriginX = 0;
    let panOriginY = 0;
    let lastTouchDist = 0;
    let lastTouchMidX = 0;
    let lastTouchMidY = 0;

    function getNearestCount() {
      return nearestCountSelect ? parseInt(nearestCountSelect.value, 10) || 0 : 0;
    }

    function classifyMeristemPhase(nodeId, totalNodes, span) {
      const phi = 1.618033988749895;
      const leafCount = Math.max(1, Math.round(span));
      const petalCount = Math.max(1, Math.round(leafCount * phi));
      const budCount = Math.max(1, Math.round(leafCount / phi));
      const age = totalNodes - 1 - nodeId;

      if (nodeId < leafCount) return 'leaf';
      if (nodeId < leafCount + petalCount) return 'petal';
      if (age < budCount) return 'bud';
      return 'floret';
    }

    function resolveNodeColor(nodeId, phase) {
      if (selectedColorTheme === 'sunflower' && Palettes.colorForLifeCyclePhase) {
        return Palettes.colorForLifeCyclePhase(nodeId, phase, paletteCycleOffset);
      }
      return Palettes.colorForNode(
        nodeId,
        selectedColorTheme,
        numberOfPaletteColors,
        colorPalette,
        paletteCycleOffset,
        0
      );
    }

    function dirArrow(dir) {
      return dir === 'CCW' ? '↺' : '↻';
    }

    function updateBadges() {
      if (angleValBadge) angleValBadge.textContent = `${divergenceDeg.toFixed(4)}°`;
      if (lifecycleSpanValBadge) lifecycleSpanValBadge.textContent = String(lifecycleSpan);
      if (speedValBadge) speedValBadge.textContent = speedSlider.value;
      if (scaleValBadge) scaleValBadge.textContent = scaleConstant.toFixed(1);
      if (accelValBadge) accelValBadge.textContent = radialAcceleration.toFixed(2);
      if (sizeValBadge) sizeValBadge.textContent = primordiumBaseSize.toFixed(1);
      if (growthValBadge) growthValBadge.textContent = nodeGrowthFactor.toFixed(2);
      if (hudPrimordia) hudPrimordia.textContent = `${primordia.length} / ${maxNodes}`;
      if (hudPhases) {
        hudPhases.textContent = `${phaseCounts.leaf}L · ${phaseCounts.petal}P · ${phaseCounts.floret}F · ${phaseCounts.bud}B`;
      }
      if (hudAngle) hudAngle.textContent = `${divergenceDeg.toFixed(4)}°`;
      if (hudGrowth) {
        hudGrowth.textContent = `a=${radialAcceleration.toFixed(2)} / g=${nodeGrowthFactor.toFixed(2)}`;
      }
      if (hudNearest) {
        const k = getNearestCount();
        if (k > 0) {
          hudNearest.textContent = `k=${k} (${nearestSegments.length} seg / ${curveIntersections.length} x)`;
        } else if (showIntersectionsCheckbox && showIntersectionsCheckbox.checked) {
          hudNearest.textContent = `Parastichy (${curveIntersections.length} x)`;
        } else {
          hudNearest.textContent = 'Off';
        }
      }
      if (hudFibCurves) {
        if (curveAnalysis.outerRanks.length > 0) {
          hudFibCurves.textContent = curveAnalysis.outerRanks
            .slice(0, 3)
            .map((r) => `${r.count}${dirArrow(r.dir)}`)
            .join(' · ');
        } else {
          hudFibCurves.textContent = '—';
        }
      }
      if (hudZoom) {
        const panMoved = Math.abs(panX) > 0.5 || Math.abs(panY) > 0.5;
        hudZoom.textContent = panMoved
          ? `${zoom.toFixed(2)}× (${Math.round(panX)}, ${Math.round(panY)})`
          : `${zoom.toFixed(2)}×`;
      }
      if (hudCycle) {
        hudCycle.textContent =
          numberOfPaletteColors > 0 ? `${numberOfPaletteColors} (${paletteCycleOffset})` : 'Cont.';
      }
      if (hudMode) {
        hudMode.textContent = zoetropeCheckbox.checked
          ? `Zoetrope + ${morphologySelect.value}`
          : morphologySelect.value;
      }
    }

    /**
     * Compute closest inner neighbors for each node (matching PlanarMixin.find_nearest_points),
     * analyze parastichy curve counts & radial bend zones, and find proper interior intersections.
     */
    function computeNearestAndIntersections() {
      nearestSegments = [];
      curveIntersections = [];
      curveAnalysis = {
        outerRanks: [],
        zones: [],
        bendRadii: [],
        bendVertices: [],
        outerTips0: [],
        outerTips1: [],
        maxRimRadius: primordia.length > 0 ? primordia[0].radius : 0,
      };

      const n = primordia.length;
      const k = getNearestCount();

      if (k > 0 && n > 1) {
        const bestDist = new Float64Array(k);
        const bestIdx = new Int32Array(k);
        const nodeRanks = new Array(n);

        for (let i = 0; i < n - 1; i++) {
          const p1 = primordia[i];
          for (let r = 0; r < k; r++) {
            bestDist[r] = Infinity;
            bestIdx[r] = -1;
          }

          for (let j = i + 1; j < n; j++) {
            const p2 = primordia[j];
            const dr = p1.radius - p2.radius;
            if (dr * dr >= bestDist[k - 1]) {
              break;
            }
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const d2 = dx * dx + dy * dy;

            if (d2 < bestDist[k - 1]) {
              let insertPos = k - 1;
              while (insertPos > 0 && d2 < bestDist[insertPos - 1]) {
                bestDist[insertPos] = bestDist[insertPos - 1];
                bestIdx[insertPos] = bestIdx[insertPos - 1];
                insertPos--;
              }
              bestDist[insertPos] = d2;
              bestIdx[insertPos] = j;
            }
          }

          const ranksForNode = [];
          for (let r = 0; r < k; r++) {
            const j = bestIdx[r];
            if (j !== -1) {
              const p2 = primordia[j];
              const delta = j - i;
              // 2D cross product from inner node p2 outward to outer node p1
              const cross = p2.x * p1.y - p2.y * p1.x;
              const dir = cross >= 0 ? 'CCW' : 'CW';
              const seg = {
                i: i,
                j: j,
                delta: delta,
                dir: dir,
                p1: p1,
                p2: p2,
                rank: r,
                minX: Math.min(p1.x, p2.x),
                maxX: Math.max(p1.x, p2.x),
                minY: Math.min(p1.y, p2.y),
                maxY: Math.max(p1.y, p2.y),
              };
              nearestSegments.push(seg);
              ranksForNode[r] = seg;
            }
          }
          nodeRanks[i] = ranksForNode;
        }

        // Detect bend vertices where a curve of rank r changes its step Δ
        const validLimit = Math.max(1, n - 8);
        for (let s = 0; s < nearestSegments.length; s++) {
          const seg = nearestSegments[s];
          if (seg.rank > 1 || seg.j >= validLimit) continue;
          const nextSeg = nodeRanks[seg.j] && nodeRanks[seg.j][seg.rank];
          if (nextSeg && nextSeg.delta !== seg.delta) {
            curveAnalysis.bendVertices.push({
              x: seg.p2.x,
              y: seg.p2.y,
              r: seg.p2.radius,
              rank: seg.rank,
              fromDelta: seg.delta,
              toDelta: nextSeg.delta,
            });
          }
        }

        // Group nodes from inner to outer into radial zones where (Δ₀, Δ₁) is constant
        const rawZones = [];
        for (let i = validLimit - 1; i >= 0; i--) {
          const rf = nodeRanks[i];
          if (!rf || !rf[0]) continue;
          const d0 = rf[0].delta;
          const dir0 = rf[0].dir;
          const d1 = rf[1] ? rf[1].delta : 0;
          const dir1 = rf[1] ? rf[1].dir : 'CW';
          const d2 = rf[2] ? rf[2].delta : 0;
          const dir2 = rf[2] ? rf[2].dir : 'CW';
          const d3 = rf[3] ? rf[3].delta : 0;
          const dir3 = rf[3] ? rf[3].dir : 'CW';
          const key = `${d0}:${d1}`;
          const rad = primordia[i].radius;

          if (rawZones.length === 0 || rawZones[rawZones.length - 1].key !== key) {
            const ranks = [{ rank: 0, count: d0, dir: dir0, fibIdx: FIB_INDEX[d0] || null }];
            if (d1 > 0) ranks.push({ rank: 1, count: d1, dir: dir1, fibIdx: FIB_INDEX[d1] || null });
            if (d2 > 0) ranks.push({ rank: 2, count: d2, dir: dir2, fibIdx: FIB_INDEX[d2] || null });
            if (d3 > 0) ranks.push({ rank: 3, count: d3, dir: dir3, fibIdx: FIB_INDEX[d3] || null });
            rawZones.push({
              key: key,
              rMin: rad,
              rMax: rad,
              nodeCount: 1,
              ranks: ranks,
            });
          } else {
            const last = rawZones[rawZones.length - 1];
            last.rMax = Math.max(last.rMax, rad);
            last.nodeCount++;
          }
        }

        const cleanZones = rawZones.filter((z) => z.nodeCount >= 4);
        curveAnalysis.zones = cleanZones.length > 0 ? cleanZones : rawZones;
        for (let z = 0; z < curveAnalysis.zones.length; z++) {
          const zn = curveAnalysis.zones[z];
          zn.rMid = 0.5 * (zn.rMin + zn.rMax);
          if (z < curveAnalysis.zones.length - 1) {
            const nextZn = curveAnalysis.zones[z + 1];
            curveAnalysis.bendRadii.push(0.5 * (zn.rMax + nextZn.rMin));
          }
        }

        if (curveAnalysis.zones.length > 0) {
          const outerZone = curveAnalysis.zones[curveAnalysis.zones.length - 1];
          curveAnalysis.outerRanks = outerZone.ranks;

          // Collect outer curve starting tips for Rank 0 (Gold) and Rank 1 (Cyan)
          if (outerZone.ranks[0]) {
            const c0 = Math.min(outerZone.ranks[0].count, n);
            const dir0 = outerZone.ranks[0].dir;
            const tips0 = [];
            for (let m = 0; m < c0; m++) {
              const pt = primordia[m];
              let ang = Math.atan2(pt.y, pt.x);
              if (ang < 0) ang += 2 * Math.PI;
              tips0.push({ x: pt.x, y: pt.y, r: pt.radius, ang: ang });
            }
            tips0.sort((a, b) => (dir0 === 'CCW' ? a.ang - b.ang : b.ang - a.ang));
            curveAnalysis.outerTips0 = tips0;
          }

          if (outerZone.ranks[1]) {
            const c1 = Math.min(outerZone.ranks[1].count, n);
            const dir1 = outerZone.ranks[1].dir;
            const tips1 = [];
            for (let m = 0; m < c1; m++) {
              const pt = primordia[m];
              let ang = Math.atan2(pt.y, pt.x);
              if (ang < 0) ang += 2 * Math.PI;
              tips1.push({ x: pt.x, y: pt.y, r: pt.radius, ang: ang });
            }
            tips1.sort((a, b) => (dir1 === 'CCW' ? a.ang - b.ang : b.ang - a.ang));
            curveAnalysis.outerTips1 = tips1;
          }
        }
      }

      // Compute curve intersections if enabled
      if (showIntersectionsCheckbox && showIntersectionsCheckbox.checked) {
        let candidateSegments = nearestSegments;

        // If closest-nodes is Off but parastichy overlays are On, intersect parastichy segments
        if (candidateSegments.length === 0 && n > 13) {
          candidateSegments = [];
          const families = [];
          if (parastichy8Checkbox.checked) families.push({ step: 8, rank: 1 });
          if (parastichy13Checkbox.checked) families.push({ step: 13, rank: 0 });
          for (let f = 0; f < families.length; f++) {
            const step = families[f].step;
            const rank = families[f].rank;
            for (let rem = 0; rem < step; rem++) {
              for (let idx = rem; idx + step < n; idx += step) {
                const p1 = primordia[idx];
                const p2 = primordia[idx + step];
                candidateSegments.push({
                  i: idx,
                  j: idx + step,
                  p1: p1,
                  p2: p2,
                  rank: rank,
                  minX: Math.min(p1.x, p2.x),
                  maxX: Math.max(p1.x, p2.x),
                  minY: Math.min(p1.y, p2.y),
                  maxY: Math.max(p1.y, p2.y),
                });
              }
            }
          }
        }

        const sortedSegs = candidateSegments.slice().sort((a, b) => a.minX - b.minX);
        const segCount = sortedSegs.length;
        for (let a = 0; a < segCount; a++) {
          const s1 = sortedSegs[a];
          for (let b = a + 1; b < segCount; b++) {
            const s2 = sortedSegs[b];
            if (s2.minX > s1.maxX) {
              break;
            }
            // Skip segments that share a node endpoint
            if (s1.i === s2.i || s1.i === s2.j || s1.j === s2.i || s1.j === s2.j) {
              continue;
            }
            // Fast Y bounding-box rejection
            if (s1.maxY < s2.minY || s2.maxY < s1.minY) {
              continue;
            }

            const ax = s1.p1.x;
            const ay = s1.p1.y;
            const d1x = s1.p2.x - ax;
            const d1y = s1.p2.y - ay;
            const cx = s2.p1.x;
            const cy = s2.p1.y;
            const d2x = s2.p2.x - cx;
            const d2y = s2.p2.y - cy;

            const denom = d1x * d2y - d1y * d2x;
            if (Math.abs(denom) < 1e-9) continue;

            const acx = cx - ax;
            const acy = cy - ay;
            const t = (acx * d2y - acy * d2x) / denom;
            if (t <= 0.002 || t >= 0.998) continue;

            const u = (acx * d1y - acy * d1x) / denom;
            if (u <= 0.002 || u >= 0.998) continue;

            curveIntersections.push({
              x: ax + t * d1x,
              y: ay + t * d1y,
              rank1: s1.rank,
              rank2: s2.rank,
            });
          }
        }
      }
    }

    function recalculatePositions() {
      const n = primordia.length;
      phaseCounts = { leaf: 0, petal: 0, floret: 0, bud: 0 };
      if (n === 0) {
        nearestSegments = [];
        curveIntersections = [];
        curveAnalysis = {
          outerRanks: [],
          zones: [],
          bendRadii: [],
          bendVertices: [],
          outerTips0: [],
          outerTips1: [],
          maxRimRadius: 0,
        };
        return;
      }
      const divRad = (divergenceDeg * Math.PI) / 180;
      const kRef = 28.0;
      for (let i = 0; i < n; i++) {
        const p = primordia[i];
        const kEff = n - 1 - p.id;
        const sqrtK = Math.sqrt(kEff);
        const accelFactor =
          radialAcceleration !== 0 && kEff > 0
            ? Math.pow((kEff + 1) / kRef, radialAcceleration)
            : 1.0;
        const sizeAccel =
          radialAcceleration !== 0 && kEff > 0
            ? Math.pow((kEff + 1) / kRef, radialAcceleration * 1.15)
            : 1.0;
        const angle = p.id * divRad + zoetropeAngleRad;
        const radius = scaleConstant * sqrtK * accelFactor;
        const phase = classifyMeristemPhase(p.id, n, lifecycleSpan);
        phaseCounts[phase] = (phaseCounts[phase] || 0) + 1;

        p.kEff = kEff;
        p.phase = phase;
        p.angle = angle;
        p.radius = radius;
        p.x = radius * Math.cos(angle);
        p.y = radius * Math.sin(angle);
        p.size = Math.max(0.4, primordiumBaseSize + nodeGrowthFactor * sqrtK * sizeAccel);
        p.color = resolveNodeColor(p.id, phase);
      }
      computeNearestAndIntersections();
    }

    function updateColors() {
      const n = primordia.length;
      for (let i = 0; i < n; i++) {
        const p = primordia[i];
        const phase = p.phase || classifyMeristemPhase(p.id, n, lifecycleSpan);
        p.color = resolveNodeColor(p.id, phase);
      }
    }

    function drawParastichyFamily(step, strokeColor, lineWidth) {
      const n = primordia.length;
      if (n <= step) return;
      ctx.save();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineWidth;

      for (let rem = 0; rem < step; rem++) {
        ctx.beginPath();
        let started = false;
        for (let idx = rem; idx < n; idx += step) {
          const p = primordia[idx];
          if (!started) {
            ctx.moveTo(p.x, p.y);
            started = true;
          } else {
            ctx.lineTo(p.x, p.y);
          }
        }
        ctx.stroke();
      }
      ctx.restore();
    }

    function drawNearestSegments(screenUnit) {
      if (nearestSegments.length === 0) return;
      const colorMode = nearestColorModeSelect ? nearestColorModeSelect.value : 'rank';

      ctx.save();
      ctx.lineCap = 'round';

      if (colorMode === 'rank') {
        // Batch by rank for fast canvas rendering (non-scaling ~1px lines)
        const maxRank = getNearestCount();
        for (let r = maxRank - 1; r >= 0; r--) {
          ctx.beginPath();
          ctx.strokeStyle = RANK_STROKES[r] || RANK_STROKES[0];
          ctx.lineWidth = Math.max(0.65, 1.05 - r * 0.12) * screenUnit;
          for (let s = 0; s < nearestSegments.length; s++) {
            const seg = nearestSegments[s];
            if (seg.rank !== r) continue;
            ctx.moveTo(seg.p1.x, seg.p1.y);
            ctx.lineTo(seg.p2.x, seg.p2.y);
          }
          ctx.stroke();
        }
      } else if (colorMode === 'winding') {
        // Color primary spirals by winding chirality (CW Gold ↻ vs CCW Cyan ↺) so curves don't swap color at bends
        for (let s = 0; s < nearestSegments.length; s++) {
          const seg = nearestSegments[s];
          ctx.beginPath();
          if (seg.rank >= 2) {
            ctx.strokeStyle = RANK_STROKES[seg.rank] || RANK_STROKES[2];
          } else {
            ctx.strokeStyle = seg.dir === 'CW' ? RANK_STROKES[0] : RANK_STROKES[1];
          }
          ctx.lineWidth = Math.max(0.65, 1.05 - seg.rank * 0.12) * screenUnit;
          ctx.moveTo(seg.p1.x, seg.p1.y);
          ctx.lineTo(seg.p2.x, seg.p2.y);
          ctx.stroke();
        }
      } else if (colorMode === 'fibonacci') {
        // Color each segment by its Fibonacci family Δ = j - i
        for (let s = 0; s < nearestSegments.length; s++) {
          const seg = nearestSegments[s];
          ctx.beginPath();
          ctx.strokeStyle =
            FIB_FAMILY_COLORS[seg.delta] || RANK_STROKES[seg.rank] || RANK_STROKES[0];
          ctx.lineWidth = Math.max(0.65, 1.05 - seg.rank * 0.12) * screenUnit;
          ctx.moveTo(seg.p1.x, seg.p1.y);
          ctx.lineTo(seg.p2.x, seg.p2.y);
          ctx.stroke();
        }
      } else {
        for (let s = 0; s < nearestSegments.length; s++) {
          const seg = nearestSegments[s];
          ctx.beginPath();
          ctx.strokeStyle = seg.p1.color;
          ctx.globalAlpha = Math.max(0.28, 0.82 - seg.rank * 0.16);
          ctx.lineWidth = Math.max(0.65, 1.05 - seg.rank * 0.12) * screenUnit;
          ctx.moveTo(seg.p1.x, seg.p1.y);
          ctx.lineTo(seg.p2.x, seg.p2.y);
          ctx.stroke();
        }
      }

      ctx.restore();
    }

    function drawCurveCountsAndBends(screenUnit) {
      if (!showCurveCountsCheckbox || !showCurveCountsCheckbox.checked) return;
      if (nearestSegments.length === 0 || curveAnalysis.outerRanks.length === 0) return;

      ctx.save();

      // 1. Dashed transition circles where curves bend from one Fibonacci pair to the next
      if (curveAnalysis.bendRadii.length > 0) {
        ctx.save();
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.42)';
        ctx.lineWidth = 0.85 * screenUnit;
        ctx.setLineDash([4 * screenUnit, 4 * screenUnit]);
        for (let b = 0; b < curveAnalysis.bendRadii.length; b++) {
          const br = curveAnalysis.bendRadii[b];
          ctx.beginPath();
          ctx.arc(0, 0, br, 0, 2 * Math.PI);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 2. Subtle hollow rings on bend vertices where Rank 0 (Gold) or Rank 1 (Cyan) curves bend
      if (curveAnalysis.bendVertices.length > 0) {
        const bvRadius = 2.0 * screenUnit;
        ctx.lineWidth = 0.8 * screenUnit;
        for (let v = 0; v < curveAnalysis.bendVertices.length; v++) {
          const bv = curveAnalysis.bendVertices[v];
          ctx.strokeStyle = bv.rank === 0 ? 'rgba(245, 208, 97, 0.65)' : 'rgba(56, 225, 235, 0.65)';
          ctx.beginPath();
          ctx.arc(bv.x, bv.y, bvRadius, 0, 2 * Math.PI);
          ctx.stroke();
        }
      }

      // 3. Radial zone badges along the -55° spoke showing Fibonacci pair in each annulus before the bend
      const spokeAngle = (-55 * Math.PI) / 180;
      const cosSpoke = Math.cos(spokeAngle);
      const sinSpoke = Math.sin(spokeAngle);
      for (let z = 0; z < curveAnalysis.zones.length; z++) {
        const zn = curveAnalysis.zones[z];
        if (zn.rMax - zn.rMin < 16) continue;
        const zx = zn.rMid * cosSpoke;
        const zy = zn.rMid * sinSpoke;
        const label = zn.ranks
          .slice(0, 2)
          .map((rk) => `${rk.count}${dirArrow(rk.dir)}`)
          .join(' : ');

        ctx.save();
        ctx.translate(zx, zy);
        ctx.scale(screenUnit, screenUnit);
        ctx.font = '600 9.5px "Fira Code", monospace';
        const tw = ctx.measureText(label).width;
        const padX = 5;
        const boxW = tw + padX * 2;
        const boxH = 15;
        ctx.fillStyle = 'rgba(10, 14, 22, 0.85)';
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(-boxW / 2, -boxH / 2, boxW, boxH, 3);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#f8fafc';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, 0, 0.5);
        ctx.restore();
      }

      // 4. Perimeter curve numbers (1 .. F_m in Gold and 1 .. F_{m+1} in Cyan)
      const maxR = curveAnalysis.maxRimRadius;
      const tips0 = curveAnalysis.outerTips0;
      for (let idx = 0; idx < tips0.length; idx++) {
        const tip = tips0[idx];
        const labelR = Math.max(tip.r + 9 * screenUnit, maxR + 11 * screenUnit);
        const lx = labelR * Math.cos(tip.ang);
        const ly = labelR * Math.sin(tip.ang);

        ctx.strokeStyle = 'rgba(245, 208, 97, 0.35)';
        ctx.lineWidth = 0.65 * screenUnit;
        ctx.beginPath();
        ctx.moveTo(tip.x, tip.y);
        ctx.lineTo(lx, ly);
        ctx.stroke();

        ctx.save();
        ctx.translate(lx, ly);
        ctx.scale(screenUnit, screenUnit);
        ctx.font = '600 9px "Fira Code", monospace';
        ctx.fillStyle = '#f5d061';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const numStr =
          idx === 0
            ? `1${dirArrow(curveAnalysis.outerRanks[0].dir)}`
            : String(idx + 1);
        ctx.fillText(numStr, 0, 0);
        ctx.restore();
      }

      const tips1 = curveAnalysis.outerTips1;
      for (let idx = 0; idx < tips1.length; idx++) {
        const tip = tips1[idx];
        const labelR = maxR + 25 * screenUnit;
        const lx = labelR * Math.cos(tip.ang);
        const ly = labelR * Math.sin(tip.ang);

        ctx.strokeStyle = 'rgba(56, 225, 235, 0.28)';
        ctx.lineWidth = 0.55 * screenUnit;
        ctx.beginPath();
        ctx.moveTo(tip.x, tip.y);
        ctx.lineTo(lx, ly);
        ctx.stroke();

        ctx.save();
        ctx.translate(lx, ly);
        ctx.scale(screenUnit, screenUnit);
        ctx.font = '600 8.5px "Fira Code", monospace';
        ctx.fillStyle = '#38e1eb';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const numStr =
          idx === 0
            ? `1${dirArrow(curveAnalysis.outerRanks[1].dir)}`
            : String(idx + 1);
        ctx.fillText(numStr, 0, 0);
        ctx.restore();
      }

      ctx.restore();
    }

    function drawCurveCountLegend() {
      if (!showCurveCountsCheckbox || !showCurveCountsCheckbox.checked) return;
      if (nearestSegments.length === 0 || curveAnalysis.outerRanks.length === 0) return;

      const ranks = curveAnalysis.outerRanks;
      const zones = curveAnalysis.zones;
      const rowH = 17;
      const padX = 12;

      ctx.save();

      const headerTitle = 'FIBONACCI CURVE COUNTS (UNBENT BY COLOR)';
      ctx.font = '700 10px "Fira Sans Condensed", sans-serif';
      let maxContentW = ctx.measureText(headerTitle).width;

      const rankLines = [];
      ctx.font = '500 11px "Fira Code", monospace';
      for (let r = 0; r < ranks.length; r++) {
        const info = ranks[r];
        const fibTag = info.fibIdx ? `F_${info.fibIdx}` : 'non-Fib';
        const dirStr = info.dir === 'CCW' ? '↺ CCW' : '↻ CW ';
        const text = `${RANK_LABELS[r]}: ${String(info.count).padStart(2, ' ')} curves ${dirStr} (${fibTag})`;
        rankLines.push({ color: RANK_HEX[r] || '#e2e8f0', text });
        maxContentW = Math.max(maxContentW, 14 + ctx.measureText(text).width);
      }

      let opposingLine = null;
      let opposingColor = '#cbd5e1';
      if (ranks.length >= 2) {
        const r0 = ranks[0];
        const r1 = ranks[1];
        const isOpposite = r0.dir !== r1.dir;
        const isBothFib = Boolean(r0.fibIdx && r1.fibIdx);
        opposingColor = isOpposite && isBothFib ? '#52d681' : '#cbd5e1';
        let sumHint = '';
        if (ranks.length >= 3) {
          const tri = [r0.count, r1.count, ranks[2].count].sort((a, b) => a - b);
          if (tri[0] + tri[1] === tri[2]) {
            sumHint = `  [${tri[0]}+${tri[1]}=${tri[2]}]`;
          }
        }
        opposingLine = `Opposing Pair: ${r0.count}${dirArrow(r0.dir)} vs ${r1.count}${dirArrow(r1.dir)}${sumHint}`;
        ctx.font = '600 10.5px "Fira Code", monospace';
        maxContentW = Math.max(maxContentW, ctx.measureText(opposingLine).width);
      }

      const bendLines = [];
      if (zones.length > 1) {
        ctx.font = '500 10px "Fira Code", monospace';
        const maxBendLineW = Math.max(maxContentW, Math.min(440, canvas.width - 48));
        const tokens = zones.map((zn) => zn.ranks.slice(0, 2).map((rk) => rk.count).join(':'));
        let currentLine = `Bends (In→Out): ${tokens[0]}`;
        for (let idx = 1; idx < tokens.length; idx++) {
          const candidate = `${currentLine} → ${tokens[idx]}`;
          if (ctx.measureText(candidate).width <= maxBendLineW) {
            currentLine = candidate;
          } else {
            bendLines.push(currentLine);
            maxContentW = Math.max(maxContentW, ctx.measureText(currentLine).width);
            currentLine = `  → ${tokens[idx]}`;
          }
        }
        bendLines.push(currentLine);
        maxContentW = Math.max(maxContentW, ctx.measureText(currentLine).width);
      }

      const totalRows = rankLines.length + (opposingLine ? 1 : 0) + bendLines.length;
      const boxW = Math.min(canvas.width - 20, Math.max(284, Math.ceil(maxContentW + padX * 2)));
      const boxH = 34 + totalRows * rowH;
      const x0 = Math.max(10, canvas.width - boxW - 12);
      const y0 = Math.max(10, canvas.height - boxH - 12);

      ctx.fillStyle = 'rgba(12, 16, 24, 0.88)';
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.36)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(x0, y0, boxW, boxH, 6);
      ctx.fill();
      ctx.stroke();

      ctx.font = '700 10px "Fira Sans Condensed", sans-serif';
      ctx.fillStyle = '#d4af37';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(headerTitle, x0 + padX, y0 + 8);

      let curY = y0 + 26;
      ctx.font = '500 11px "Fira Code", monospace';
      for (let r = 0; r < rankLines.length; r++) {
        const row = rankLines[r];
        ctx.fillStyle = row.color;
        ctx.fillRect(x0 + padX, curY + 3, 8, 8);
        ctx.fillText(row.text, x0 + padX + 14, curY);
        curY += rowH;
      }

      if (opposingLine) {
        ctx.fillStyle = opposingColor;
        ctx.font = '600 10.5px "Fira Code", monospace';
        ctx.fillText(opposingLine, x0 + padX, curY + 1);
        curY += rowH;
      }

      if (bendLines.length > 0) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '500 10px "Fira Code", monospace';
        for (let b = 0; b < bendLines.length; b++) {
          ctx.fillText(bendLines[b], x0 + padX, curY + 2);
          curY += rowH;
        }
      }

      ctx.restore();
    }

    function drawCurveIntersections(screenUnit) {
      if (curveIntersections.length === 0) return;
      ctx.save();
      const haloRadius = 2.2 * screenUnit;
      const coreRadius = 1.15 * screenUnit;

      // Subtle glowing halo around each curve crossing
      ctx.fillStyle = 'rgba(255, 95, 109, 0.32)';
      ctx.beginPath();
      for (let i = 0; i < curveIntersections.length; i++) {
        const pt = curveIntersections[i];
        ctx.moveTo(pt.x + haloRadius, pt.y);
        ctx.arc(pt.x, pt.y, haloRadius, 0, 2 * Math.PI);
      }
      ctx.fill();

      // Tiny luminous intersection core
      ctx.fillStyle = '#fff6d6';
      ctx.strokeStyle = '#ff4d6d';
      ctx.lineWidth = 0.7 * screenUnit;
      ctx.beginPath();
      for (let i = 0; i < curveIntersections.length; i++) {
        const pt = curveIntersections[i];
        ctx.moveTo(pt.x + coreRadius, pt.y);
        ctx.arc(pt.x, pt.y, coreRadius, 0, 2 * Math.PI);
      }
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    function drawLeafOrgan(p, invZoomScale) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      const L = p.size * 3.1;
      const W = p.size * 1.22;

      // Petiole stalk
      ctx.beginPath();
      ctx.moveTo(-L * 0.22, 0);
      ctx.lineTo(0, 0);
      ctx.strokeStyle = p.color;
      ctx.lineWidth = Math.max(0.9 * invZoomScale, p.size * 0.28);
      ctx.stroke();

      // Full acuminate leaf blade
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(L * 0.22, -W * 1.08, L * 0.68, -W * 0.72, L, 0);
      ctx.bezierCurveTo(L * 0.68, W * 0.72, L * 0.22, W * 1.08, 0, 0);
      ctx.closePath();
      ctx.fillStyle = p.color;
      ctx.globalAlpha = 0.88;
      ctx.fill();
      ctx.strokeStyle = '#070a0f';
      ctx.lineWidth = Math.max(0.85 * invZoomScale, p.size * 0.14);
      ctx.stroke();

      // Central midrib & pinnate lateral venation
      ctx.beginPath();
      ctx.moveTo(-L * 0.05, 0);
      ctx.lineTo(L * 0.88, 0);
      if (p.size > 1.8) {
        const veinPos = [0.22, 0.45, 0.66];
        for (let v = 0; v < veinPos.length; v++) {
          const vx = L * veinPos[v];
          const vw = W * (0.64 - v * 0.15);
          ctx.moveTo(vx, 0);
          ctx.quadraticCurveTo(vx + L * 0.08, -vw * 0.52, vx + L * 0.18, -vw);
          ctx.moveTo(vx, 0);
          ctx.quadraticCurveTo(vx + L * 0.08, vw * 0.52, vx + L * 0.18, vw);
        }
      }
      ctx.strokeStyle = 'rgba(7, 10, 15, 0.52)';
      ctx.lineWidth = Math.max(0.65 * invZoomScale, p.size * 0.1);
      ctx.stroke();
      ctx.restore();
    }

    function drawPetalOrgan(p, invZoomScale, isRayCorona) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      const L = p.size * (isRayCorona ? 3.85 : 2.95);
      const W = p.size * (isRayCorona ? 0.96 : 0.92);

      // Ligulate flower petal blade
      ctx.beginPath();
      ctx.moveTo(-L * 0.08, 0);
      ctx.bezierCurveTo(L * 0.18, -W * 0.96, L * 0.76, -W * 1.05, L, 0);
      ctx.bezierCurveTo(L * 0.76, W * 1.05, L * 0.18, W * 0.96, -L * 0.08, 0);
      ctx.closePath();
      ctx.fillStyle = p.color;
      ctx.globalAlpha = 0.91;
      ctx.fill();
      ctx.strokeStyle = '#070a0f';
      ctx.lineWidth = Math.max(0.8 * invZoomScale, p.size * 0.13);
      ctx.stroke();

      // Inner luminous petal sheen
      ctx.beginPath();
      ctx.moveTo(L * 0.06, 0);
      ctx.bezierCurveTo(L * 0.25, -W * 0.44, L * 0.68, -W * 0.44, L * 0.88, 0);
      ctx.bezierCurveTo(L * 0.68, W * 0.44, L * 0.25, W * 0.44, L * 0.06, 0);
      ctx.fillStyle = 'rgba(255, 250, 215, 0.18)';
      ctx.fill();

      // Delicate longitudinal petal striations
      if (p.size > 1.5) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(L * 0.85, 0);
        ctx.moveTo(L * 0.08, 0);
        ctx.quadraticCurveTo(L * 0.45, -W * 0.42, L * 0.78, -W * 0.22);
        ctx.moveTo(L * 0.08, 0);
        ctx.quadraticCurveTo(L * 0.45, W * 0.42, L * 0.78, W * 0.22);
        ctx.strokeStyle = 'rgba(7, 10, 15, 0.32)';
        ctx.lineWidth = Math.max(0.55 * invZoomScale, p.size * 0.08);
        ctx.stroke();
      }
      ctx.restore();
    }

    function drawWedgeOrgan(p, invZoomScale) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      const r = p.size * 1.95;
      ctx.beginPath();
      ctx.moveTo(-r * 0.42, 0);
      ctx.quadraticCurveTo(0, -r * 0.78, r * 1.18, 0);
      ctx.quadraticCurveTo(0, r * 0.78, -r * 0.42, 0);
      ctx.closePath();
      ctx.fillStyle = p.color;
      ctx.globalAlpha = 0.85;
      ctx.fill();
      ctx.strokeStyle = '#070a0f';
      ctx.lineWidth = Math.max(0.85 * invZoomScale, r * 0.06);
      ctx.stroke();

      if (p.size > 3.2) {
        ctx.beginPath();
        ctx.moveTo(-r * 0.25, 0);
        ctx.lineTo(r * 0.92, 0);
        if (p.size > 5.5) {
          ctx.moveTo(r * 0.15, -r * 0.34);
          ctx.lineTo(r * 0.72, 0);
          ctx.lineTo(r * 0.15, r * 0.34);
        }
        ctx.strokeStyle = 'rgba(7, 10, 15, 0.55)';
        ctx.lineWidth = Math.max(0.65 * invZoomScale, r * 0.04);
        ctx.stroke();
      }
      ctx.restore();
    }

    function drawFloretOrgan(p, invZoomScale) {
      const px = p.x;
      const py = p.y;
      // Outer achene / tubular bract rim
      ctx.beginPath();
      ctx.arc(px, py, p.size * 1.08, 0, 2 * Math.PI);
      ctx.fillStyle = '#1b1109';
      ctx.fill();
      ctx.strokeStyle = '#070a0f';
      ctx.lineWidth = Math.max(0.75 * invZoomScale, p.size * 0.16);
      ctx.stroke();

      // Corolla ring
      ctx.beginPath();
      ctx.arc(px, py, p.size * 0.82, 0, 2 * Math.PI);
      ctx.fillStyle = p.color;
      ctx.fill();

      // Anther / stigma pollen nucleus
      ctx.beginPath();
      ctx.arc(px, py, p.size * 0.36, 0, 2 * Math.PI);
      ctx.fillStyle = '#26170a';
      ctx.fill();
    }

    function drawBudOrgan(p, invZoomScale) {
      const px = p.x;
      const py = p.y;
      ctx.beginPath();
      ctx.arc(px, py, p.size * 0.88, 0, 2 * Math.PI);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.strokeStyle = '#070a0f';
      ctx.lineWidth = Math.max(0.8 * invZoomScale, p.size * 0.22);
      ctx.stroke();
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const morph = morphologySelect.value;
      const screenUnit = 1 / zoom;
      const invZoomScale = 1 / Math.pow(zoom, 0.45);

      ctx.save();
      ctx.translate(centerX + panX, centerY + panY);
      ctx.scale(zoom, zoom);

      // Subtle golden crosshairs at apical meristem center
      ctx.save();
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.22)';
      ctx.lineWidth = screenUnit;
      ctx.beginPath();
      ctx.arc(0, 0, 4 * screenUnit, 0, 2 * Math.PI);
      ctx.moveTo(-8 * screenUnit, 0);
      ctx.lineTo(8 * screenUnit, 0);
      ctx.moveTo(0, -8 * screenUnit);
      ctx.lineTo(0, 8 * screenUnit);
      ctx.stroke();
      ctx.restore();

      // Optional radial growth paths from meristem origin
      if (showPathsCheckbox.checked) {
        ctx.save();
        ctx.lineWidth = 0.8 * screenUnit;
        for (let i = 0; i < primordia.length; i++) {
          const p = primordia[i];
          ctx.strokeStyle = p.color;
          ctx.globalAlpha = 0.28;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Optional Fibonacci parastichy overlays
      if (parastichy8Checkbox.checked) {
        drawParastichyFamily(8, 'rgba(0, 210, 220, 0.42)', 1.0 * screenUnit);
      }
      if (parastichy13Checkbox.checked) {
        drawParastichyFamily(13, 'rgba(212, 175, 55, 0.48)', 1.0 * screenUnit);
      }

      // Closest-node segments (natural parastichy curves & transitions)
      drawNearestSegments(screenUnit);

      // Tiny constant screen-space radius (~1.35px, just slightly larger than the ~1px line connectors)
      const explorerPointRadius = 1.35 * screenUnit;
      const explorerPointStroke = 1.15 * screenUnit;

      // Render primordia according to selected morphology
      for (let i = 0; i < primordia.length; i++) {
        const p = primordia[i];
        const px = p.x;
        const py = p.y;

        if (morph === 'lifecycle') {
          if (p.phase === 'leaf') {
            drawLeafOrgan(p, invZoomScale);
          } else if (p.phase === 'petal') {
            drawPetalOrgan(p, invZoomScale, true);
          } else if (p.phase === 'bud') {
            drawBudOrgan(p, invZoomScale);
          } else {
            drawFloretOrgan(p, invZoomScale);
          }
        } else if (morph === 'leaves') {
          drawLeafOrgan(p, invZoomScale);
        } else if (morph === 'petals') {
          drawPetalOrgan(p, invZoomScale, false);
        } else if (morph === 'wedges') {
          drawWedgeOrgan(p, invZoomScale);
        } else if (morph === 'points') {
          // GEOMETOR Explorer style: non-scaling white dot with dark background-matching halo stroke
          ctx.beginPath();
          ctx.arc(px, py, explorerPointRadius, 0, 2 * Math.PI);
          ctx.strokeStyle = '#070a0f';
          ctx.lineWidth = explorerPointStroke;
          ctx.stroke();
          ctx.fillStyle = '#f8fafc';
          ctx.fill();
        } else if (morph === 'rings') {
          ctx.beginPath();
          ctx.arc(px, py, p.size * 1.35, 0, 2 * Math.PI);
          ctx.strokeStyle = p.color;
          ctx.lineWidth = Math.max(0.8 * invZoomScale, p.size * 0.32);
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(px, py, p.size * 0.42, 0, 2 * Math.PI);
          ctx.fillStyle = p.color;
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(px, py, p.size, 0, 2 * Math.PI);
          ctx.fillStyle = p.color;
          ctx.fill();
        }
      }

      // Curve intersections rendered on top so crossings are clearly legible
      drawCurveIntersections(screenUnit);

      // Fibonacci curve counts, outer rim numbering & bend rings
      drawCurveCountsAndBends(screenUnit);

      ctx.restore();

      // Screen-space Fibonacci curve count & bend summary card
      drawCurveCountLegend();
      updateBadges();
    }

    function resetView() {
      zoom = 1.0;
      panX = 0;
      panY = 0;
      draw();
    }

    function zoomAroundCanvasPoint(canvasX, canvasY, factor) {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const worldX = (canvasX - centerX - panX) / zoom;
      const worldY = (canvasY - centerY - panY) / zoom;
      const nextZoom = Math.max(0.15, Math.min(25.0, zoom * factor));
      panX = canvasX - centerX - worldX * nextZoom;
      panY = canvasY - centerY - worldY * nextZoom;
      zoom = nextZoom;
      draw();
    }

    function resizeCanvas() {
      const rect = stageWrapper.getBoundingClientRect();
      canvas.width = Math.max(320, Math.floor(rect.width));
      canvas.height = Math.max(320, Math.floor(rect.height));
      recalculatePositions();
      draw();
    }

    // Golden Just-Intonation / Fibonacci Harmonic Ratios across 3 octaves
    const GOLDEN_HARMONIC_RATIOS = [
      1.0, 9 / 8, 5 / 4, 4 / 3, 3 / 2, 8 / 5, 13 / 8,
      2.0, 9 / 4, 5 / 2, 8 / 3, 3.0, 16 / 5, 13 / 4,
      4.0, 9 / 2, 5.0, 16 / 3, 6.0, 32 / 5, 13 / 2,
    ];

    function ensureAudioContext() {
      if (!audioCtx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return null;
        audioCtx = new AudioCtx();
        const comp = audioCtx.createDynamicsCompressor();
        comp.threshold.setValueAtTime(-16, audioCtx.currentTime);
        comp.knee.setValueAtTime(18, audioCtx.currentTime);
        comp.ratio.setValueAtTime(6, audioCtx.currentTime);
        comp.attack.setValueAtTime(0.005, audioCtx.currentTime);
        comp.release.setValueAtTime(0.18, audioCtx.currentTime);
        masterGain = audioCtx.createGain();
        masterGain.gain.setValueAtTime(0.32, audioCtx.currentTime);
        masterGain.connect(comp);
        comp.connect(audioCtx.destination);
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      return audioCtx;
    }

    function toggleSound() {
      isSoundEnabled = !isSoundEnabled;
      if (isSoundEnabled) {
        ensureAudioContext();
      }
      if (soundButton) {
        soundButton.textContent = isSoundEnabled ? 'Sound: On (M)' : 'Sound: Off (M)';
        soundButton.classList.toggle('phyl-btn-primary', isSoundEnabled);
        soundButton.classList.toggle('phyl-btn-secondary', !isSoundEnabled);
      }
    }

    let lastSoundTime = 0;

    function playPrimordiumSound(nodeId, phase) {
      if (!isSoundEnabled) return;
      const ac = ensureAudioContext();
      if (!ac || !masterGain) return;

      const now = ac.currentTime;
      // Keep the pulse spacious and unhurried (~3.5 notes/sec max)
      if (now - lastSoundTime < 0.26) return;
      lastSoundTime = now;

      const divRad = (divergenceDeg * Math.PI) / 180;
      const theta = nodeId * divRad + zoetropeAngleRad;

      // 1. Direction -> Gentle Stereo Pan (cos θ) & Compass Elevation Brightness (sin θ)
      const panVal = Math.max(-0.78, Math.min(0.78, 0.78 * Math.cos(theta)));
      const elev = 0.5 + 0.5 * Math.sin(theta);

      // 2. Color / Palette Index -> Harmonic Scale Degree
      const palSize = Math.max(1, numberOfPaletteColors || 21);
      const palIdx = ((nodeId + paletteCycleOffset) % palSize + palSize) % palSize;
      const scaleIdx = palIdx % GOLDEN_HARMONIC_RATIOS.length;
      const morph = morphologySelect ? morphologySelect.value : 'dots';
      const activeOrgan = morph === 'lifecycle' ? (phase || 'floret') : morph;

      // Warm lower-register fundamental anchored at G2 (98.0 Hz)
      let baseFreq = 98.0 * GOLDEN_HARMONIC_RATIOS[scaleIdx];
      let osc1Type = 'sine';
      let osc2Type = 'triangle';
      let overtoneRatio = 1.5;
      let attack = 0.035;
      let decay = 1.15;

      if (activeOrgan === 'points' || activeOrgan === 'bud') {
        baseFreq *= 1.25;
        osc1Type = 'sine';
        osc2Type = 'sine';
        overtoneRatio = 2.0;
        attack = 0.025;
        decay = 0.95;
      } else if (activeOrgan === 'rings' || activeOrgan === 'wedges') {
        osc1Type = 'triangle';
        osc2Type = 'sine';
        overtoneRatio = 1.5;
        attack = 0.055;
        decay = 1.45;
      } else if (activeOrgan === 'petals' || activeOrgan === 'petal') {
        osc1Type = 'triangle';
        osc2Type = 'sine';
        overtoneRatio = 2.0;
        attack = 0.030;
        decay = 1.20;
      } else if (activeOrgan === 'leaves' || activeOrgan === 'leaf') {
        baseFreq *= 0.5;
        osc1Type = 'triangle';
        osc2Type = 'sine';
        overtoneRatio = 1.5;
        attack = 0.065;
        decay = 1.65;
      } else {
        osc1Type = 'sine';
        osc2Type = 'triangle';
        overtoneRatio = 2.0;
        attack = 0.032;
        decay = 1.10;
      }

      const dur = decay;
      const peakGain = 0.12;

      const osc1 = ac.createOscillator();
      const osc2 = ac.createOscillator();
      osc1.type = osc1Type;
      osc2.type = osc2Type;
      osc1.frequency.setValueAtTime(baseFreq, now);
      osc2.frequency.setValueAtTime(baseFreq * overtoneRatio, now);

      const filter = ac.createBiquadFilter();
      filter.type = 'lowpass';
      const cutoff = Math.min(3600, baseFreq * (1.8 + 2.4 * elev));
      filter.frequency.setValueAtTime(cutoff, now);
      filter.frequency.exponentialRampToValueAtTime(Math.max(140, baseFreq * 1.05), now + dur);

      const env = ac.createGain();
      env.gain.setValueAtTime(0.0001, now);
      env.gain.linearRampToValueAtTime(peakGain, now + attack);
      env.gain.exponentialRampToValueAtTime(0.0001, now + attack + dur);

      const overtoneGain = ac.createGain();
      overtoneGain.gain.setValueAtTime(0.22 * (0.4 + 0.6 * elev), now);

      osc1.connect(filter);
      osc2.connect(overtoneGain);
      overtoneGain.connect(filter);

      if (ac.createStereoPanner) {
        const panner = ac.createStereoPanner();
        panner.pan.setValueAtTime(panVal, now);
        filter.connect(env);
        env.connect(panner);
        panner.connect(masterGain);
      } else {
        filter.connect(env);
        env.connect(masterGain);
      }

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + attack + dur + 0.04);
      osc2.stop(now + attack + dur + 0.04);
    }

    function spawnOneStep() {
      if (isColorCycling && numberOfPaletteColors > 0 && colorPalette.length > 0) {
        paletteCycleOffset += isCycleReversed ? -1 : 1;
        updateColors();
      }
      if (zoetropeCheckbox.checked) {
        zoetropeAngleRad += (divergenceDeg * Math.PI) / 180;
      }

      if (primordia.length < maxNodes) {
        const currentId = nextPrimordiumId;
        const phase = classifyMeristemPhase(currentId, primordia.length + 1, lifecycleSpan);
        const color = resolveNodeColor(currentId, phase, 0);
        primordia.push({
          id: currentId,
          phase: phase,
          color: color,
          x: 0,
          y: 0,
          size: primordiumBaseSize,
        });
        nextPrimordiumId++;
        playPrimordiumSound(currentId, phase);
      } else if (isColorCycling || zoetropeCheckbox.checked) {
        playPrimordiumSound(Math.abs(paletteCycleOffset), 'floret');
      }

      recalculatePositions();
      draw();
    }

    function populateInstant(targetCount) {
      primordia = [];
      nextPrimordiumId = 0;
      for (let i = 0; i < targetCount; i++) {
        const phase = classifyMeristemPhase(i, targetCount, lifecycleSpan);
        const color = resolveNodeColor(i, phase, 0);
        primordia.push({
          id: i,
          phase: phase,
          color: color,
          x: 0,
          y: 0,
          size: primordiumBaseSize,
        });
        nextPrimordiumId++;
      }
      recalculatePositions();
      draw();
    }

    function loop() {
      if (!isAnimating) return;
      spawnOneStep();
      const speed = parseInt(speedSlider.value, 10) || 4;
      timeoutId = window.setTimeout(() => {
        window.requestAnimationFrame(loop);
      }, 1000 / (speed * 1.4));
    }

    function togglePlay() {
      if (!isAnimating) {
        isAnimating = true;
        startButton.textContent = 'Pause';
        startButton.classList.replace('phyl-btn-primary', 'phyl-btn-secondary');
        loop();
      } else {
        isAnimating = false;
        if (timeoutId) window.clearTimeout(timeoutId);
        startButton.textContent = 'Resume';
        startButton.classList.replace('phyl-btn-secondary', 'phyl-btn-primary');
      }
    }

    function resetSimulation() {
      isAnimating = false;
      if (timeoutId) window.clearTimeout(timeoutId);
      primordia = [];
      nextPrimordiumId = 0;
      paletteCycleOffset = 0;
      zoetropeAngleRad = 0;
      nearestSegments = [];
      curveIntersections = [];
      startButton.textContent = 'Start';
      startButton.classList.replace('phyl-btn-secondary', 'phyl-btn-primary');
      draw();
    }

    function handleColorChange() {
      numberOfPaletteColors = Math.max(0, Math.min(64, parseInt(paletteSizeInput.value, 10) || 0));
      paletteSizeInput.value = numberOfPaletteColors;
      selectedColorTheme = colorThemeSelect.value;
      isColorCycling = cycleColorsCheckbox.checked;
      isCycleReversed = reverseCycleCheckbox.checked;
      colorPalette = Palettes.generatePalette(selectedColorTheme, numberOfPaletteColors);
      updateColors();
      draw();
    }

    function handleNearestChange() {
      computeNearestAndIntersections();
      draw();
    }

    // Pan & Zoom event listeners on canvas
    canvas.addEventListener(
      'wheel',
      (event) => {
        event.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const mouseX = (event.clientX - rect.left) * (canvas.width / rect.width);
        const mouseY = (event.clientY - rect.top) * (canvas.height / rect.height);
        const factor = event.deltaY < 0 ? 1.14 : 1 / 1.14;
        zoomAroundCanvasPoint(mouseX, mouseY, factor);
      },
      { passive: false }
    );

    canvas.addEventListener('mousedown', (event) => {
      if (event.button !== 0) return;
      isPanning = true;
      canvas.classList.add('is-panning');
      panStartX = event.clientX;
      panStartY = event.clientY;
      panOriginX = panX;
      panOriginY = panY;
    });

    window.addEventListener('mousemove', (event) => {
      if (!isPanning) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / Math.max(1, rect.width);
      const scaleY = canvas.height / Math.max(1, rect.height);
      panX = panOriginX + (event.clientX - panStartX) * scaleX;
      panY = panOriginY + (event.clientY - panStartY) * scaleY;
      draw();
    });

    window.addEventListener('mouseup', () => {
      if (isPanning) {
        isPanning = false;
        canvas.classList.remove('is-panning');
      }
    });

    canvas.addEventListener('dblclick', () => {
      resetView();
    });

    // Touch pan & two-finger pinch zoom
    canvas.addEventListener(
      'touchstart',
      (event) => {
        if (event.touches.length === 1) {
          isPanning = true;
          panStartX = event.touches[0].clientX;
          panStartY = event.touches[0].clientY;
          panOriginX = panX;
          panOriginY = panY;
        } else if (event.touches.length === 2) {
          isPanning = false;
          const dx = event.touches[0].clientX - event.touches[1].clientX;
          const dy = event.touches[0].clientY - event.touches[1].clientY;
          lastTouchDist = Math.hypot(dx, dy);
          lastTouchMidX = (event.touches[0].clientX + event.touches[1].clientX) / 2;
          lastTouchMidY = (event.touches[0].clientY + event.touches[1].clientY) / 2;
        }
      },
      { passive: true }
    );

    canvas.addEventListener(
      'touchmove',
      (event) => {
        event.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / Math.max(1, rect.width);
        const scaleY = canvas.height / Math.max(1, rect.height);
        if (event.touches.length === 1 && isPanning) {
          panX = panOriginX + (event.touches[0].clientX - panStartX) * scaleX;
          panY = panOriginY + (event.touches[0].clientY - panStartY) * scaleY;
          draw();
        } else if (event.touches.length === 2) {
          const dx = event.touches[0].clientX - event.touches[1].clientX;
          const dy = event.touches[0].clientY - event.touches[1].clientY;
          const dist = Math.hypot(dx, dy);
          if (lastTouchDist > 0 && dist > 0) {
            const canvasMidX = (lastTouchMidX - rect.left) * scaleX;
            const canvasMidY = (lastTouchMidY - rect.top) * scaleY;
            zoomAroundCanvasPoint(canvasMidX, canvasMidY, dist / lastTouchDist);
          }
          lastTouchDist = dist;
        }
      },
      { passive: false }
    );

    canvas.addEventListener('touchend', () => {
      isPanning = false;
      lastTouchDist = 0;
    });

    // Control event bindings
    startButton.addEventListener('click', togglePlay);
    stepButton.addEventListener('click', () => {
      if (isAnimating) togglePlay();
      spawnOneStep();
    });
    resetButton.addEventListener('click', resetSimulation);
    if (resetViewButton) {
      resetViewButton.addEventListener('click', resetView);
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
      resizeCanvas();
    });

    anglePresetSelect.addEventListener('change', () => {
      const val = parseFloat(anglePresetSelect.value);
      if (!isNaN(val)) {
        divergenceDeg = val;
        angleSlider.value = val;
        recalculatePositions();
        draw();
      }
    });

    angleSlider.addEventListener('input', () => {
      divergenceDeg = parseFloat(angleSlider.value);
      anglePresetSelect.value = 'custom';
      recalculatePositions();
      draw();
    });

    morphologySelect.addEventListener('change', () => {
      if (morphologySelect.value === 'lifecycle' && selectedColorTheme === 'galactic_v4') {
        selectedColorTheme = 'sunflower';
        colorThemeSelect.value = 'sunflower';
      }
      recalculatePositions();
      draw();
    });
    if (lifecycleSpanSlider) {
      lifecycleSpanSlider.addEventListener('input', () => {
        lifecycleSpan = parseInt(lifecycleSpanSlider.value, 10) || 34;
        recalculatePositions();
        draw();
      });
    }
    speedSlider.addEventListener('input', updateBadges);
    scaleSlider.addEventListener('input', () => {
      scaleConstant = parseFloat(scaleSlider.value);
      recalculatePositions();
      draw();
    });
    if (accelSlider) {
      accelSlider.addEventListener('input', () => {
        radialAcceleration = parseFloat(accelSlider.value);
        recalculatePositions();
        draw();
      });
    }
    sizeSlider.addEventListener('input', () => {
      primordiumBaseSize = parseFloat(sizeSlider.value);
      recalculatePositions();
      draw();
    });
    if (growthSlider) {
      growthSlider.addEventListener('input', () => {
        nodeGrowthFactor = parseFloat(growthSlider.value);
        recalculatePositions();
        draw();
      });
    }
    maxNodesInput.addEventListener('change', () => {
      maxNodes = Math.max(10, Math.min(6765, parseInt(maxNodesInput.value, 10) || 610));
      maxNodesInput.value = maxNodes;
      updateBadges();
    });

    paletteSizeInput.addEventListener('input', handleColorChange);
    colorThemeSelect.addEventListener('change', handleColorChange);
    cycleColorsCheckbox.addEventListener('change', handleColorChange);
    reverseCycleCheckbox.addEventListener('change', handleColorChange);
    if (nearestCountSelect) {
      nearestCountSelect.addEventListener('change', handleNearestChange);
    }
    if (nearestColorModeSelect) {
      nearestColorModeSelect.addEventListener('change', draw);
    }
    if (showCurveCountsCheckbox) {
      showCurveCountsCheckbox.addEventListener('change', draw);
    }
    if (showIntersectionsCheckbox) {
      showIntersectionsCheckbox.addEventListener('change', handleNearestChange);
    }
    showPathsCheckbox.addEventListener('change', draw);
    parastichy8Checkbox.addEventListener('change', handleNearestChange);
    parastichy13Checkbox.addEventListener('change', handleNearestChange);
    zoetropeCheckbox.addEventListener('change', updateBadges);

    if (soundButton) {
      soundButton.addEventListener('click', toggleSound);
    }

    // Curated Preset Buttons & Examples Gallery
    const presetButtons = document.querySelectorAll('[data-preset-2d]');
    const PRESETS_2D = {
      golden_capitulum: {
        seed: 13,
        nodes: 987,
        angle: 137.507764,
        morph: 'dots',
        span: 34,
        scale: 5.5,
        accel: 0.0,
        size: 1.8,
        growth: 0.22,
        palette: 21,
        theme: 'galactic_v4',
        cycle: true,
        nearest: 0,
        nearestColor: 'rank',
        intersections: false,
        p8: false,
        p13: false,
        paths: false,
        zoetrope: false,
      },
      sunflower_lifecycle: {
        seed: 21,
        nodes: 987,
        angle: 137.507764,
        morph: 'lifecycle',
        span: 55,
        scale: 5.0,
        accel: 0.28,
        size: 1.4,
        growth: 0.26,
        palette: 13,
        theme: 'sunflower',
        cycle: false,
        nearest: 0,
        nearestColor: 'rank',
        intersections: false,
        p8: false,
        p13: false,
        paths: false,
        zoetrope: false,
      },
      closest_nodes: {
        seed: 34,
        nodes: 610,
        angle: 137.507764,
        morph: 'points',
        span: 34,
        scale: 7.4,
        accel: 0.0,
        size: 2.2,
        growth: 0.04,
        palette: 21,
        theme: 'golden_amber',
        cycle: false,
        nearest: 3,
        nearestColor: 'rank',
        intersections: true,
        p8: false,
        p13: false,
        paths: false,
        zoetrope: false,
      },
      deep_lattice_k4: {
        seed: 2584,
        nodes: 2584,
        angle: 137.507764,
        morph: 'points',
        span: 89,
        scale: 9.8,
        accel: 0.08,
        size: 1.5,
        growth: 0.015,
        palette: 21,
        theme: 'galactic_v4',
        cycle: true,
        nearest: 4,
        nearestColor: 'fibonacci',
        intersections: true,
        p8: false,
        p13: false,
        paths: false,
        zoetrope: false,
      },
      winding_chirality: {
        seed: 55,
        nodes: 1597,
        angle: 137.507764,
        morph: 'points',
        span: 55,
        scale: 8.5,
        accel: 0.16,
        size: 1.8,
        growth: 0.03,
        palette: 21,
        theme: 'golden_amber',
        cycle: false,
        nearest: 2,
        nearestColor: 'winding',
        intersections: true,
        p8: false,
        p13: false,
        paths: false,
        zoetrope: false,
      },
      pinecone_flare: {
        seed: 13,
        nodes: 377,
        angle: 137.507764,
        morph: 'wedges',
        span: 21,
        scale: 5.2,
        accel: 0.65,
        size: 1.1,
        growth: 0.42,
        palette: 13,
        theme: 'forest',
        cycle: false,
        nearest: 2,
        nearestColor: 'rank',
        intersections: false,
        p8: false,
        p13: false,
        paths: false,
        zoetrope: false,
      },
      parastichy_web: {
        seed: 21,
        nodes: 610,
        angle: 137.507764,
        morph: 'rings',
        span: 34,
        scale: 7.2,
        accel: 0.0,
        size: 1.5,
        growth: 0.22,
        palette: 13,
        theme: 'golden_amber',
        cycle: true,
        nearest: 2,
        nearestColor: 'rank',
        intersections: true,
        p8: true,
        p13: true,
        paths: false,
        zoetrope: false,
      },
      golden_wedges: {
        seed: 13,
        nodes: 377,
        angle: 137.507764,
        morph: 'leaves',
        span: 34,
        scale: 6.2,
        accel: 0.42,
        size: 1.4,
        growth: 0.36,
        palette: 8,
        theme: 'greens',
        cycle: false,
        nearest: 0,
        nearestColor: 'rank',
        intersections: false,
        p8: false,
        p13: false,
        paths: true,
        zoetrope: false,
      },
      half_short_sweep: {
        seed: 21,
        nodes: 1597,
        angle: 68.753882,
        morph: 'rings',
        span: 55,
        scale: 8.2,
        accel: 0.08,
        size: 1.4,
        growth: 0.08,
        palette: 13,
        theme: 'golden_amber',
        cycle: true,
        nearest: 2,
        nearestColor: 'palette',
        intersections: true,
        p8: false,
        p13: false,
        paths: false,
        zoetrope: false,
      },
      phi_cubed_sweep: {
        seed: 21,
        nodes: 1597,
        angle: 84.984472,
        morph: 'dots',
        span: 55,
        scale: 8.4,
        accel: 0.06,
        size: 1.5,
        growth: 0.09,
        palette: 21,
        theme: 'ocean',
        cycle: true,
        nearest: 3,
        nearestColor: 'rank',
        intersections: true,
        p8: false,
        p13: false,
        paths: false,
        zoetrope: false,
      },
      half_long_sweep: {
        seed: 21,
        nodes: 987,
        angle: 111.246118,
        morph: 'petals',
        span: 34,
        scale: 7.4,
        accel: 0.12,
        size: 1.35,
        growth: 0.14,
        palette: 13,
        theme: 'sunset',
        cycle: true,
        nearest: 2,
        nearestColor: 'palette',
        intersections: false,
        p8: false,
        p13: false,
        paths: false,
        zoetrope: false,
      },
      lucas_noble_sweep: {
        seed: 34,
        nodes: 987,
        angle: 99.501553,
        morph: 'points',
        span: 34,
        scale: 7.8,
        accel: 0.0,
        size: 2.0,
        growth: 0.04,
        palette: 21,
        theme: 'galactic_v4',
        cycle: false,
        nearest: 2,
        nearestColor: 'rank',
        intersections: true,
        p8: false,
        p13: false,
        paths: false,
        zoetrope: false,
      },
      rational_8_21: {
        seed: 21,
        nodes: 610,
        angle: 137.142857,
        morph: 'points',
        span: 34,
        scale: 6.4,
        accel: 0.0,
        size: 2.0,
        growth: 0.06,
        palette: 21,
        theme: 'ocean',
        cycle: true,
        nearest: 2,
        nearestColor: 'palette',
        intersections: false,
        p8: true,
        p13: false,
        paths: true,
        zoetrope: false,
      },
      zoetrope_strobe: {
        seed: 987,
        nodes: 1597,
        angle: 137.507764,
        morph: 'dots',
        span: 55,
        scale: 7.2,
        accel: 0.06,
        size: 1.6,
        growth: 0.12,
        palette: 21,
        theme: 'galactic_v4',
        cycle: true,
        nearest: 1,
        nearestColor: 'palette',
        intersections: false,
        p8: false,
        p13: false,
        paths: false,
        zoetrope: true,
      },
    };

    function applyPreset(key) {
      const cfg = PRESETS_2D[key];
      if (!cfg) return;

      presetButtons.forEach((b) => {
        b.classList.toggle('active', b.getAttribute('data-preset-2d') === key);
      });
      if (examplesSelect && examplesSelect.value !== key) {
        examplesSelect.value = key;
      }

      divergenceDeg = cfg.angle;
      angleSlider.value = cfg.angle;
      morphologySelect.value = cfg.morph;
      lifecycleSpan = cfg.span !== undefined ? cfg.span : 34;
      if (lifecycleSpanSlider) lifecycleSpanSlider.value = lifecycleSpan;
      scaleConstant = cfg.scale;
      scaleSlider.value = cfg.scale;
      radialAcceleration = cfg.accel !== undefined ? cfg.accel : 0.0;
      if (accelSlider) accelSlider.value = radialAcceleration;
      primordiumBaseSize = cfg.size;
      sizeSlider.value = cfg.size;
      nodeGrowthFactor = cfg.growth !== undefined ? cfg.growth : 0.25;
      if (growthSlider) growthSlider.value = nodeGrowthFactor;
      maxNodes = cfg.nodes || 610;
      maxNodesInput.value = maxNodes;
      numberOfPaletteColors = cfg.palette;
      paletteSizeInput.value = cfg.palette;
      selectedColorTheme = cfg.theme;
      colorThemeSelect.value = cfg.theme;
      cycleColorsCheckbox.checked = cfg.cycle;
      isColorCycling = cfg.cycle;
      if (nearestCountSelect) nearestCountSelect.value = String(cfg.nearest || 0);
      if (nearestColorModeSelect) nearestColorModeSelect.value = cfg.nearestColor || 'rank';
      if (showIntersectionsCheckbox) showIntersectionsCheckbox.checked = Boolean(cfg.intersections);
      parastichy8Checkbox.checked = cfg.p8;
      parastichy13Checkbox.checked = cfg.p13;
      showPathsCheckbox.checked = cfg.paths;
      zoetropeCheckbox.checked = cfg.zoetrope;

      colorPalette = Palettes.generatePalette(selectedColorTheme, numberOfPaletteColors);
      populateInstant(cfg.seed !== undefined ? cfg.seed : cfg.nodes);
      if (!isAnimating) {
        togglePlay();
      }
    }

    presetButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        applyPreset(btn.getAttribute('data-preset-2d'));
      });
    });

    if (examplesSelect) {
      examplesSelect.addEventListener('change', () => {
        applyPreset(examplesSelect.value);
      });
    }

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
        case 'm':
        case 'M':
          toggleSound();
          break;
        case 'r':
        case 'R':
          resetSimulation();
          break;
        case '0':
          resetView();
          break;
        case '+':
        case '=':
          zoomAroundCanvasPoint(canvas.width / 2, canvas.height / 2, 1.2);
          break;
        case '-':
        case '_':
          zoomAroundCanvasPoint(canvas.width / 2, canvas.height / 2, 1 / 1.2);
          break;
        case 'n':
        case 'N':
          if (nearestCountSelect) {
            const nextIdx = (nearestCountSelect.selectedIndex + 1) % nearestCountSelect.options.length;
            nearestCountSelect.selectedIndex = nextIdx;
            handleNearestChange();
          }
          break;
        case 'k':
        case 'K':
          if (showCurveCountsCheckbox) {
            showCurveCountsCheckbox.checked = !showCurveCountsCheckbox.checked;
            draw();
          }
          break;
        case 'i':
        case 'I':
          if (showIntersectionsCheckbox) {
            showIntersectionsCheckbox.checked = !showIntersectionsCheckbox.checked;
            handleNearestChange();
          }
          break;
        case 't':
        case 'T':
          controlsToggle.click();
          break;
        case 'f':
        case 'F':
          theaterButton.click();
          break;
        case 'z':
        case 'Z':
          zoetropeCheckbox.checked = !zoetropeCheckbox.checked;
          updateBadges();
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

    window.GeometorPhyllotaxis2D = {
      canvas,
      ctx,
      pause: () => {
        if (isAnimating) togglePlay();
      },
      setState: (opts = {}) => {
        if (opts.angle !== undefined) {
          divergenceDeg = opts.angle;
          angleSlider.value = opts.angle;
        }
        if (opts.morph !== undefined) morphologySelect.value = opts.morph;
        if (opts.span !== undefined) {
          lifecycleSpan = opts.span;
          if (lifecycleSpanSlider) lifecycleSpanSlider.value = opts.span;
        }
        if (opts.scale !== undefined) {
          scaleConstant = opts.scale;
          scaleSlider.value = opts.scale;
        }
        if (opts.accel !== undefined) {
          radialAcceleration = opts.accel;
          if (accelSlider) accelSlider.value = opts.accel;
        }
        if (opts.size !== undefined) {
          primordiumBaseSize = opts.size;
          sizeSlider.value = opts.size;
        }
        if (opts.growth !== undefined) {
          nodeGrowthFactor = opts.growth;
          if (growthSlider) growthSlider.value = opts.growth;
        }
        if (opts.theme !== undefined || opts.palette !== undefined) {
          if (opts.theme !== undefined) {
            selectedColorTheme = opts.theme;
            colorThemeSelect.value = opts.theme;
          }
          if (opts.palette !== undefined) {
            numberOfPaletteColors = opts.palette;
            paletteSizeInput.value = opts.palette;
          }
          colorPalette = Palettes.generatePalette(selectedColorTheme, numberOfPaletteColors);
        }
        if (opts.paletteOffset !== undefined) {
          paletteCycleOffset = opts.paletteOffset;
        }
        if (opts.zoetropeRad !== undefined) {
          zoetropeAngleRad = opts.zoetropeRad;
        }
        if (opts.nearest !== undefined && nearestCountSelect) {
          nearestCountSelect.value = String(opts.nearest);
        }
        if (opts.nearestColor !== undefined && nearestColorModeSelect) {
          nearestColorModeSelect.value = opts.nearestColor;
        }
        if (opts.curveCounts !== undefined && showCurveCountsCheckbox) {
          showCurveCountsCheckbox.checked = Boolean(opts.curveCounts);
        }
        if (opts.intersections !== undefined && showIntersectionsCheckbox) {
          showIntersectionsCheckbox.checked = Boolean(opts.intersections);
        }
        if (opts.paths !== undefined) showPathsCheckbox.checked = Boolean(opts.paths);
        if (opts.p8 !== undefined) parastichy8Checkbox.checked = Boolean(opts.p8);
        if (opts.p13 !== undefined) parastichy13Checkbox.checked = Boolean(opts.p13);
        if (opts.zoom !== undefined) zoom = opts.zoom;
        if (opts.panX !== undefined) panX = opts.panX;
        if (opts.panY !== undefined) panY = opts.panY;

        if (opts.nodes !== undefined && opts.nodes !== primordia.length) {
          populateInstant(opts.nodes);
        } else {
          updateColors();
          recalculatePositions();
          draw();
        }
      },
      resizeCanvas,
      draw,
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    // Seed initial Fibonacci capitulum and begin animating
    populateInstant(89);
    togglePlay();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init2DStudio);
  } else {
    init2DStudio();
  }
})(window, document);
