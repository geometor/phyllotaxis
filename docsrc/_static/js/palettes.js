/**
 * GEOMETOR • phyllotaxis
 * Shared Color Palette & Theme Cycling Engine for 2D and 3D Studios
 */
(function (window) {
  'use strict';

  const CONTINUOUS_HUE_STEP = 13;
  const CONTINUOUS_SAT_BASE = 72;
  const CONTINUOUS_LGT_BASE = 58;

  const NEAR_BLACK = { h: 270, s: 15, l: 10 };
  const LIGHT_BLUE_CENTER = { h: 200, s: 80, l: 70 };
  const LIGHT_BLUE_PEAK = { h: 200, s: 85, l: 65 };
  const LIGHT_MAGENTA_PEAK = { h: 320, s: 85, l: 65 };
  const DARK_PURPLE_MID = { h: 270, s: 60, l: 30 };

  const COLOR_THEMES = {
    golden_amber: [32, 54, 75, 95, 35, 72],
    greens: [80, 140, 50, 75, 30, 70],
    autumn: [0, 50, 60, 85, 40, 65],
    forest: [25, 130, 30, 60, 25, 50],
    sunset: [300, 30, 70, 90, 45, 70],
    ocean: [180, 240, 50, 80, 30, 65],
    galactic: [230, 330, 60, 90, 35, 65],
    galactic_v2: [330, 240, 70, 90, 50, 65],
    galactic_v3: [
      LIGHT_BLUE_CENTER.h,
      LIGHT_BLUE_CENTER.h,
      LIGHT_BLUE_CENTER.s,
      LIGHT_BLUE_CENTER.s,
      LIGHT_BLUE_CENTER.l,
      LIGHT_BLUE_CENTER.l,
    ],
    galactic_v4: [],
  };

  function hslString(h, s, l) {
    const hue = ((Math.round(h) % 360) + 360) % 360;
    return `hsl(${hue}, ${Math.round(s)}%, ${Math.round(l)}%)`;
  }

  function interpolateHue(h1, h2, t) {
    const diff = h2 - h1;
    let newHue;
    if (Math.abs(diff) > 180) {
      if (diff > 0) {
        newHue = h1 + t * (diff - 360);
      } else {
        newHue = h1 + t * (diff + 360);
      }
    } else {
      newHue = h1 + t * diff;
    }
    return newHue + 360;
  }

  function interpolateColorsSegment(targetPalette, startIndex, endIndex, startHSL, endHSL) {
    const steps = endIndex - startIndex;
    if (steps <= 0) return;
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const h = interpolateHue(startHSL.h, endHSL.h, t);
      const s = startHSL.s + t * (endHSL.s - startHSL.s);
      const l = startHSL.l + t * (endHSL.l - startHSL.l);
      if (startIndex + i < targetPalette.length) {
        targetPalette[startIndex + i] = hslString(h, s, l);
      }
    }
  }

  function generatePalette(themeName, numColors) {
    if (numColors <= 0 || themeName === 'continuous_spectrum') {
      return [];
    }
    let palette = [];

    if (themeName === 'custom_palette') {
      const S = 75;
      const L = 62;
      if (numColors === 1) return [hslString(200, S, L)];
      for (let i = 0; i < numColors; i++) {
        palette.push(hslString(i * (360 / numColors), S, L));
      }
      return palette;
    }

    if (themeName === 'galactic_v3') {
      const nearBlackStr = hslString(NEAR_BLACK.h, NEAR_BLACK.s, NEAR_BLACK.l);
      const lightBlueStr = hslString(LIGHT_BLUE_CENTER.h, LIGHT_BLUE_CENTER.s, LIGHT_BLUE_CENTER.l);
      if (numColors === 1) return [lightBlueStr];
      if (numColors === 2) return [nearBlackStr, lightBlueStr];
      if (numColors === 3) return [nearBlackStr, lightBlueStr, nearBlackStr];
      const mid = Math.floor((numColors - 1) / 2);
      palette = new Array(numColors);
      palette[0] = nearBlackStr;
      palette[mid] = lightBlueStr;
      palette[numColors - 1] = nearBlackStr;
      interpolateColorsSegment(palette, 0, mid, NEAR_BLACK, LIGHT_BLUE_CENTER);
      interpolateColorsSegment(palette, mid, numColors - 1, LIGHT_BLUE_CENTER, NEAR_BLACK);
      return palette;
    }

    if (themeName === 'galactic_v4') {
      const nearBlackStr = hslString(NEAR_BLACK.h, NEAR_BLACK.s, NEAR_BLACK.l);
      const lightBlueStr = hslString(LIGHT_BLUE_PEAK.h, LIGHT_BLUE_PEAK.s, LIGHT_BLUE_PEAK.l);
      const darkPurpleStr = hslString(DARK_PURPLE_MID.h, DARK_PURPLE_MID.s, DARK_PURPLE_MID.l);
      const lightMagentaStr = hslString(LIGHT_MAGENTA_PEAK.h, LIGHT_MAGENTA_PEAK.s, LIGHT_MAGENTA_PEAK.l);
      if (numColors === 1) return [lightBlueStr];
      if (numColors === 2) return [lightBlueStr, lightMagentaStr];
      if (numColors === 3) return [nearBlackStr, lightBlueStr, nearBlackStr];
      if (numColors === 4) return [nearBlackStr, lightBlueStr, lightMagentaStr, nearBlackStr];

      palette = new Array(numColors);
      palette[0] = nearBlackStr;
      palette[numColors - 1] = nearBlackStr;
      let idxP1 = Math.max(1, Math.floor((numColors - 1) * 0.25));
      let idxMid = Math.max(idxP1 + 1, Math.floor((numColors - 1) * 0.5));
      let idxP2 = Math.max(idxMid + 1, Math.floor((numColors - 1) * 0.75));
      if (idxP2 >= numColors - 1) idxP2 = numColors - 2;
      if (idxMid >= idxP2) idxMid = Math.max(idxP1 + 1, idxP2 - 1);
      if (idxP1 >= idxMid) idxP1 = Math.max(1, idxMid - 1);
      if (numColors === 5) {
        idxP1 = 1;
        idxMid = 2;
        idxP2 = 3;
      }
      palette[idxP1] = lightBlueStr;
      palette[idxMid] = darkPurpleStr;
      palette[idxP2] = lightMagentaStr;
      interpolateColorsSegment(palette, 0, idxP1, NEAR_BLACK, LIGHT_BLUE_PEAK);
      interpolateColorsSegment(palette, idxP1, idxMid, LIGHT_BLUE_PEAK, DARK_PURPLE_MID);
      interpolateColorsSegment(palette, idxMid, idxP2, DARK_PURPLE_MID, LIGHT_MAGENTA_PEAK);
      interpolateColorsSegment(palette, idxP2, numColors - 1, LIGHT_MAGENTA_PEAK, NEAR_BLACK);
      return palette;
    }

    if (themeName === 'forest') {
      const [, , sS, sE, lS, lE] = COLOR_THEMES.forest;
      palette = new Array(numColors);
      const numBrowns = Math.ceil(numColors / 2);
      const numGreens = numColors - numBrowns;
      for (let k = 0; k < numBrowns; k++) {
        const tHue = numBrowns <= 1 ? 0.5 : k / Math.max(1, numBrowns - 1);
        const hVal = 25 + tHue * 20;
        const tSL = numColors <= 1 ? 0.5 : k / Math.max(1, numColors - 1);
        palette[k] = hslString(hVal, sS + tSL * (sE - sS), lS + tSL * (lE - lS));
      }
      for (let k = 0; k < numGreens; k++) {
        const tHue = numGreens <= 1 ? 0.5 : k / Math.max(1, numGreens - 1);
        const hVal = 90 + tHue * 40;
        const tSL = numColors <= 1 ? 0.5 : (k + numBrowns) / Math.max(1, numColors - 1);
        palette[numBrowns + k] = hslString(hVal, sS + tSL * (sE - sS), lS + tSL * (lE - lS));
      }
      return palette;
    }

    const theme = COLOR_THEMES[themeName] || COLOR_THEMES.golden_amber;
    const [hS, hE, sS, sE, lS, lE] = theme;
    if (numColors === 1) {
      let avgHue = (hS + hE) / 2;
      if (hS > hE) avgHue = ((hS + hE + 360) / 2) % 360;
      return [hslString(avgHue, (sS + sE) / 2, (lS + lE) / 2)];
    }
    for (let i = 0; i < numColors; i++) {
      const t = i / (numColors - 1);
      const hue = hS > hE ? interpolateHue(hS, hE + 360, t) : hS + t * (hE - hS);
      palette.push(hslString(hue, sS + t * (sE - sS), lS + t * (lE - lS)));
    }
    if (themeName === 'galactic_v2' && numColors >= 3) {
      const nearBlackStr = hslString(NEAR_BLACK.h, NEAR_BLACK.s, NEAR_BLACK.l);
      palette[0] = nearBlackStr;
      palette[numColors - 1] = nearBlackStr;
    }
    return palette;
  }

  function colorForNode(id, themeName, numColors, palette, cycleOffset, generation) {
    const genShift = (generation || 0) * 3;
    if (numColors <= 0 || themeName === 'continuous_spectrum' || !palette || palette.length === 0) {
      if (themeName === 'golden_amber' && numColors <= 0) {
        const h = 36 + ((id * 7 + genShift * 12) % 24);
        const s = 82 - Math.min(30, (generation || 0) * 8);
        const l = 48 + ((id * 5) % 24);
        return hslString(h, s, l);
      }
      const hue = (id + genShift) * CONTINUOUS_HUE_STEP;
      const sat = CONTINUOUS_SAT_BASE + (id % 10) * 2;
      const lgt = CONTINUOUS_LGT_BASE + (id % 10);
      return hslString(hue, sat, lgt);
    }
    let idx = id + cycleOffset + genShift;
    while (idx < 0) {
      idx += palette.length * 10000;
    }
    return palette[idx % palette.length];
  }

  function colorForLifeCyclePhase(id, phase, cycleOffset) {
    const wave = (((id * 5 + cycleOffset * 2) % 13) + 13) % 13;
    const t = wave / 12;
    if (phase === 'leaf') {
      // Involucral phyllary bracts: deep emerald to vibrant chlorophyll green
      return hslString(104 + t * 28, 56 + t * 18, 26 + t * 20);
    }
    if (phase === 'petal') {
      // Ligulate ray petals: rich saffron gold to luminous sunflower yellow
      return hslString(41 + t * 13, 92, 50 + t * 16);
    }
    if (phase === 'bud') {
      // Nascent apical meristem primordia: chartreuse olive-gold buds
      return hslString(68 + t * 24, 65, 38 + t * 18);
    }
    // Mature tubular disc florets: warm amber-russet & golden pollen
    return hslString(24 + t * 20, 78, 34 + t * 22);
  }

  window.GeometorPalettes = {
    generatePalette,
    colorForNode,
    colorForLifeCyclePhase,
    hslString,
  };
})(window);
