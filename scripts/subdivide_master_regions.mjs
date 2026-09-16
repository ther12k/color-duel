/**
 * Subdivides oversized regions in a smooth-partition MASTER partition so the
 * hardest level has more, smaller fillable areas (a single tone area should
 * never be one giant fill). Geometry comes from the authored regions only:
 * each too-large region is recursively bisected along its bbox midpoint; the
 * new straight cut edges are recorded in `cuts` so the app can render them as
 * dotted artificial divisions, distinct from the real (solid) contours.
 *
 * Writes master/regions.json (regions + cuts) and updates master/artwork.json
 * (regionCount, rendering.boundaryStyle=solid). Run from the project root:
 *
 *   node scripts/subdivide_master_regions.mjs [theme ...]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const THEMES = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['cozy-window-cat', 'flower-bouquet', 'mountain-lake-cabin', 'seaside-lighthouse'];

/** Target max piece area, in authored units² (bigger divisor = more pieces). */
const PIECES_PER_CANVAS = 1400;
const MAX_DEPTH = 12;
const CURVE_STEPS = 10;

/* ---------- path parsing ---------- */

function parsePath(d) {
  const tokens = d.match(/[MmLlHhVvCcSsQqTtAaZz]|-?\d*\.?\d+(?:e-?\d+)?/g) ?? [];
  const rings = [];
  let cur = [];
  let x = 0, y = 0, sx = 0, sy = 0;
  let prevCtrl = null; // for S/T reflection
  let i = 0;

  const num = () => parseFloat(tokens[i++]);
  const cmd = () => tokens[i++];
  const pushPoint = (px, py) => cur.push([px, py]);
  const startRing = (px, py) => {
    if (cur.length > 1) rings.push(cur);
    cur = [[px, py]];
    x = px; y = py; sx = px; sy = py; prevCtrl = null;
  };

  while (i < tokens.length) {
    const c = cmd();
    switch (c) {
      case 'M': { startRing(num(), num()); while (isNum(tokens[i])) { const px = num(), py = num(); pushPoint(px, py); x = px; y = py; } break; }
      case 'm': { startRing(x + num(), y + num()); while (isNum(tokens[i])) { x += num(); y += num(); pushPoint(x, y); } break; }
      case 'L': while (isNum(tokens[i])) { x = num(); y = num(); pushPoint(x, y); } break;
      case 'l': while (isNum(tokens[i])) { x += num(); y += num(); pushPoint(x, y); } break;
      case 'H': while (isNum(tokens[i])) { x = num(); pushPoint(x, y); } break;
      case 'h': while (isNum(tokens[i])) { x += num(); pushPoint(x, y); } break;
      case 'V': while (isNum(tokens[i])) { y = num(); pushPoint(x, y); } break;
      case 'v': while (isNum(tokens[i])) { y += num(); pushPoint(x, y); } break;
      case 'C': {
        while (isNum(tokens[i])) {
          const x1 = num(), y1 = num(), x2 = num(), y2 = num(), px = num(), py = num();
          for (let s = 1; s <= CURVE_STEPS; s++) pushPoint(...cubic(x, y, x1, y1, x2, y2, px, py, s / CURVE_STEPS));
          x = px; y = py; prevCtrl = [x2, y2];
        }
        break;
      }
      case 'c': {
        while (isNum(tokens[i])) {
          const x1 = x + num(), y1 = y + num(), x2 = x + num(), y2 = y + num(), px = x + num(), py = y + num();
          for (let s = 1; s <= CURVE_STEPS; s++) pushPoint(...cubic(x, y, x1, y1, x2, y2, px, py, s / CURVE_STEPS));
          x = px; y = py; prevCtrl = [x2, y2];
        }
        break;
      }
      case 'S': {
        while (isNum(tokens[i])) {
          const x2 = num(), y2 = num(), px = num(), py = num();
          const x1 = prevCtrl ? 2 * x - prevCtrl[0] : x, y1 = prevCtrl ? 2 * y - prevCtrl[1] : y;
          for (let s = 1; s <= CURVE_STEPS; s++) pushPoint(...cubic(x, y, x1, y1, x2, y2, px, py, s / CURVE_STEPS));
          x = px; y = py; prevCtrl = [x2, y2];
        }
        break;
      }
      case 'Q': {
        while (isNum(tokens[i])) {
          const qx = num(), qy = num(), px = num(), py = num();
          for (let s = 1; s <= CURVE_STEPS; s++) pushPoint(...quad(x, y, qx, qy, px, py, s / CURVE_STEPS));
          x = px; y = py; prevCtrl = [qx, qy];
        }
        break;
      }
      case 'q': {
        while (isNum(tokens[i])) {
          const qx = x + num(), qy = y + num(), px = x + num(), py = y + num();
          for (let s = 1; s <= CURVE_STEPS; s++) pushPoint(...quad(x, y, qx, qy, px, py, s / CURVE_STEPS));
          x = px; y = py; prevCtrl = [qx, qy];
        }
        break;
      }
      case 'T': {
        while (isNum(tokens[i])) {
          const px = num(), py = num();
          const qx = prevCtrl ? 2 * x - prevCtrl[0] : x, qy = prevCtrl ? 2 * y - prevCtrl[1] : y;
          for (let s = 1; s <= CURVE_STEPS; s++) pushPoint(...quad(x, y, qx, qy, px, py, s / CURVE_STEPS));
          x = px; y = py; prevCtrl = [qx, qy];
        }
        break;
      }
      case 'A': case 'a': {
        // Only end-point interpolation (artwork has no arcs; safety fallback).
        num(); num(); num(); num(); num(); num();
        if (c === 'A') { x = num(); y = num(); } else { x += num(); y += num(); }
        pushPoint(x, y);
        break;
      }
      case 'Z': case 'z': { if (cur.length > 1) { cur.push([sx, sy]); rings.push(cur); cur = []; } x = sx; y = sy; break; }
      default: throw new Error(`unsupported path command ${c}`);
    }
  }
  if (cur.length > 1) rings.push(cur);
  return rings;
}

const isNum = (t) => t !== undefined && /-?\d/.test(t);
const cubic = (x0, y0, x1, y1, x2, y2, x3, y3, t) => {
  const u = 1 - t;
  return [
    u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3,
    u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3,
  ];
};
const quad = (x0, y0, x1, y1, x2, y2, t) => {
  const u = 1 - t;
  return [u * u * x0 + 2 * u * t * x1 + t * t * x2, u * u * y0 + 2 * u * t * y1 + t * t * y2];
};

/* ---------- geometry helpers ---------- */

const ringArea = (ring) => {
  let a = 0;
  for (let i = 0; i < ring.length - 1; i++) a += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  return Math.abs(a / 2);
};
const centroid = (ring) => {
  let a = 0, cx = 0, cy = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const [x0, y0] = ring[i], [x1, y1] = ring[i + 1];
    const f = x0 * y1 - x1 * y0;
    a += f; cx += (x0 + x1) * f; cy += (y0 + y1) * f;
  }
  if (Math.abs(a) < 1e-9) { const n = ring.length - 1; return ring.reduce((s, p) => [s[0] + p[0], s[1] + p[1]], [0, 0]).map((v) => v / n); }
  return [cx / (3 * a), cy / (3 * a)];
};
const pointInRing = ([px, py], ring) => {
  let inside = false;
  for (let i = 0, j = ring.length - 2; i < ring.length - 1; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};
const bboxOf = (rings) => {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const ring of rings) for (const [px, py] of ring) {
    if (px < minX) minX = px; if (px > maxX) maxX = px;
    if (py < minY) minY = py; if (py > maxY) maxY = py;
  }
  return { minX, minY, maxX, maxY };
};

/** Sutherland–Hodgman clip of one ring against x<=v or y<=v (axis 'x'|'y'). */
function clipRing(ring, axis, v, keepLess) {
  const val = (p) => (axis === 'x' ? p[0] : p[1]);
  const out = [];
  for (let i = 0; i < ring.length - 1; i++) {
    const p = ring[i], q = ring[i + 1];
    const pv = val(p), qv = val(q);
    const pIn = keepLess ? pv <= v : pv >= v;
    const qIn = keepLess ? qv <= v : qv >= v;
    if (pIn) out.push(p);
    if (pIn !== qIn) {
      const t = (v - pv) / (qv - pv);
      out.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]);
    }
  }
  if (out.length > 1) {
    const first = out[0], last = out[out.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) out.push([...first]);
  }
  return out.length >= 4 ? out : null; // a valid closed ring needs >=3 distinct points + close
}

/** Straight segments of the cut line that fall inside this piece (even-odd). */
function lineInsideRing(ring, axis, v, yMin, yMax) {
  const a1 = axis === 'x' ? [v, yMin] : [yMin, v];
  const a2 = axis === 'x' ? [v, yMax] : [yMax, v];
  const ts = [];
  for (let i = 0; i < ring.length - 1; i++) {
    const [x0, y0] = ring[i], [x1, y1] = ring[i + 1];
    if (axis === 'x') {
      if ((x0 <= v && x1 > v) || (x1 <= v && x0 > v)) ts.push(y0 + ((v - x0) / (x1 - x0)) * (y1 - y0));
    } else {
      if ((y0 <= v && y1 > v) || (y1 <= v && y0 > v)) ts.push(x0 + ((v - y0) / (y1 - y0)) * (x1 - x0));
    }
  }
  ts.sort((m, n) => m - n);
  const segs = [];
  for (let k = 0; k + 1 < ts.length; k += 2) {
    const [u0, u1] = [ts[k], ts[k + 1]];
    if (u1 - u0 < 0.5) continue;
    const p0 = axis === 'x' ? [v, u0] : [u0, v];
    const p1 = axis === 'x' ? [v, u1] : [u1, v];
    segs.push([a1[0] === a2[0] ? p0 : p0, p1]);
    segs[segs.length - 1] = axis === 'x' ? [[v, u0], [v, u1]] : [[u0, v], [u1, v]];
  }
  return segs;
}

/* ---------- subdivision ---------- */

function pieceArea(rings) {
  // evenodd: outer ring(s) minus holes — approximate as alternating by |area| order.
  const sorted = rings.map(ringArea).sort((a, b) => b - a);
  return sorted[0] - sorted.slice(1).reduce((s, a) => s + a, 0);
}

function subdivide(rings, cap, depth, cuts, key) {
  const area = pieceArea(rings);
  if (area <= cap || depth >= MAX_DEPTH) return [rings];

  const bb = bboxOf(rings);
  const axis = bb.maxX - bb.minX >= bb.maxY - bb.minY ? 'x' : 'y';
  const mid = (axis === 'x' ? bb.minX + bb.maxX : bb.minY + bb.maxY) / 2;

  const leftRings = rings.map((r) => clipRing(r, axis, mid, true)).filter(Boolean);
  const rightRings = rings.map((r) => clipRing(r, axis, mid, false)).filter(Boolean);
  if (leftRings.length === 0 || rightRings.length === 0) return [rings];

  // Record the cut segment(s) that actually pass through material: intersect
  // the split line with the outer ring and keep inside spans.
  const outer = rings.reduce((a, b) => (ringArea(a) >= ringArea(b) ? a : b));
  const spanMin = axis === 'x' ? bb.minY : bb.minX;
  const spanMax = axis === 'x' ? bb.maxY : bb.maxX;
  for (const [p0, p1] of lineInsideRing(outer, axis, mid, spanMin, spanMax)) {
    cuts.add(`${key}|${axis}|${p0.map((n) => n.toFixed(1)).join(',')}|${p1.map((n) => n.toFixed(1)).join(',')}`);
  }

  return [
    ...subdivide(leftRings, cap, depth + 1, cuts, key),
    ...subdivide(rightRings, cap, depth + 1, cuts, key),
  ];
}

const fmt = (n) => Number(n.toFixed(2));
const ringToPath = (ring) =>
  `M${fmt(ring[0][0])},${fmt(ring[0][1])}L${ring.slice(1).map(([px, py]) => `${fmt(px)},${fmt(py)}`).join('L')}Z`;

/* ---------- main ---------- */

for (const theme of THEMES) {
  const dir = resolve(`public/artworks/${theme}/master`);
  const data = JSON.parse(readFileSync(`${dir}/regions.json`, 'utf8'));
  const manifest = JSON.parse(readFileSync(`${dir}/artwork.json`, 'utf8'));
  const vb = data.viewBox;
  const canvasArea = vb[2] * vb[3];
  const cap = canvasArea / PIECES_PER_CANVAS;

  const newRegions = [];
  const cutKeys = new Set();

  for (const region of data.regions) {
    const rings = parsePath(region.d);
    const pieces = subdivide(rings, cap, 0, cutKeys, region.id);
    const outer = rings.reduce((a, b) => (ringArea(a) >= ringArea(b) ? a : b));
    const font = region.label?.fontSize;
    for (const pieceRings of pieces) {
      const main = pieceRings.reduce((a, b) => (ringArea(a) >= ringArea(b) ? a : b));
      const labelFrom = pointInRing(centroid(main), main) ? centroid(main) : bboxOf(pieceRings);
      const c = centroid(main);
      newRegions.push({
        id: pieces.length === 1 ? region.id : `${region.id}-s${newRegions.length}`,
        paletteId: region.paletteId,
        objectId: region.objectId,
        d: pieceRings.map(ringToPath).join(''),
        fillRule: region.fillRule ?? data.fillRule ?? 'evenodd',
        label: { x: fmt(c[0]), y: fmt(c[1]), fontSize: font ? Math.min(font, 7.5) : undefined },
        bbox: Object.values(bboxOf(pieceRings)).map(fmt),
      });
      void labelFrom;
    }
  }

  const cuts = [...cutKeys].map((k) => {
    const [, axis, a, b] = k.split('|');
    const [p0, p1] = [a.split(',').map(Number), b.split(',').map(Number)];
    return `M${fmt(p0[0])},${fmt(p0[1])}L${fmt(p1[0])},${fmt(p1[1])}`;
  });

  writeFileSync(`${dir}/regions.json`, JSON.stringify({ ...data, regions: newRegions, cuts }));
  manifest.regionCount = newRegions.length;
  manifest.rendering = {
    ...manifest.rendering,
    boundaryStyle: 'solid',
    boundaryStrokeWidth: 1.1,
  };
  writeFileSync(`${dir}/artwork.json`, JSON.stringify(manifest));

  console.log(`${theme}: ${data.regions.length} -> ${newRegions.length} regions (cap ${cap.toFixed(0)}u²), ${cuts.length} cut segments`);
}
