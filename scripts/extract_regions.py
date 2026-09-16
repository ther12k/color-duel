#!/usr/bin/env python3
"""
Extract playable region geometry from an artwork package's numbered lineart.

Input:  public/artworks/<id>/numbered_lineart.png + colored_master.png
Output: public/artworks/<id>/regions.json  (and a QA overlay in /tmp)

Pipeline (numpy/scipy + tesseract binary):
 1. Threshold the lineart: dark pixels = outlines.
 2. Flood-fill label the light cells (8-connected); cells touching the canvas
    border are background, not regions.
 3. Printed numbers are detected PER CELL as local-contrast ink: pixels that
    deviate from the cell's own fill tone (works for dark-on-light and
    light-on-dark digits alike). Glyph blobs are grouped into 1-3 digit
    numbers and OCR'd with tesseract (digits whitelist).
 4. Each cell is matched with the number printed inside it; cells without a
    readable number are dropped (their color group is unknowable).
 5. Region color = median RGB of the colored master inside the cell; palette
    color per number = median across that number's cells.
 6. Polygonize each cell (Moore boundary trace of outer contour + hole
    contours, Douglas-Peucker simplification) into a closed SVG path.

The result is written as regions.json next to the manifest; the app's
artwork repository picks it up automatically (see src/lib/artworkRepository.ts).
"""
import json
import os
import subprocess
import sys
import tempfile
from collections import defaultdict

import numpy as np
from PIL import Image
from scipy import ndimage

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DARK_THRESHOLD = 120      # grayscale below this = outline ink
MIN_CELL_AREA = 140       # smaller cells are not reliably tappable
INK_CONTRAST = 12         # per-cell deviation from fill tone that counts as digit ink
FILL_TOLERANCE = 16       # paint-bucket tone tolerance when growing a cell from its number
DIGIT_MIN_AREA = 12
DIGIT_MIN_H = 7
DIGIT_MAX_H = 30
RDP_EPSILON = 1.4         # polygon simplification tolerance (px)
ERODE_INNER = 2           # cell interior shrink to exclude boundary lines
ERODE_COLOR = 2           # shrink before sampling the master color


def trace_boundary(mask):
    """Moore-neighbor boundary trace of a boolean component -> [(x, y), ...]."""
    ys, xs = np.nonzero(mask)
    if len(xs) == 0:
        return []
    start_idx = np.lexsort((xs, ys))[0]
    sy, sx = int(ys[start_idx]), int(xs[start_idx])

    neigh = [(-1, 0), (-1, -1), (0, -1), (1, -1), (1, 0), (1, 1), (0, 1), (-1, 1)]
    contour = [(sx, sy)]
    prev_dir = 0
    cy, cx = sy, sx
    guard = 0
    while True:
        found = False
        for step in range(1, 9):
            d = (prev_dir + step) % 8
            dy, dx = neigh[d]
            ny, nx = cy + dy, cx + dx
            if 0 <= ny < mask.shape[0] and 0 <= nx < mask.shape[1] and mask[ny, nx]:
                contour.append((int(nx), int(ny)))
                prev_dir = (d + 5) % 8
                cy, cx = ny, nx
                found = True
                break
        if not found:
            break
        guard += 1
        if (cx, cy) == (sx, sy) and guard > 8:
            break
        if guard > 300000:
            break
    return contour


def rdp(points, epsilon):
    """Ramer-Douglas-Peucker simplification."""
    if len(points) < 3:
        return list(points)
    pts = np.asarray(points, dtype=float)
    start, end = pts[0], pts[-1]
    seg = end - start
    norm = np.hypot(*seg)
    if norm == 0:
        dist = np.hypot(*(pts - start).T)
    else:
        dist = np.abs(np.cross(seg, pts - start)) / norm
    i = int(np.argmax(dist))
    if dist[i] > epsilon:
        left = rdp(points[: i + 1], epsilon)
        right = rdp(points[i:], epsilon)
        return left[:-1] + right
    return [points[0], points[-1]]


def path_from_contours(outer, holes):
    parts = []
    for contour in [outer] + holes:
        simplified = rdp(contour, RDP_EPSILON)
        if len(simplified) < 3:
            return None
        cmds = [f"M {simplified[0][0]:g} {simplified[0][1]:g}"]
        for x, y in simplified[1:]:
            cmds.append(f"L {x:g} {y:g}")
        cmds.append("Z")
        parts.append(" ".join(cmds))
    return " ".join(parts) if parts else None


def ocr_number(img):
    """OCR digits from a black-ink/white-paper PIL image via tesseract."""
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as f:
        path = f.name
    try:
        img.resize((img.width * 4, img.height * 4), Image.LANCZOS).save(path)
        out = subprocess.run(
            ["tesseract", path, "stdout", "--psm", "8", "--oem", "3",
             "-c", "tessedit_char_whitelist=0123456789"],
            capture_output=True, text=True,
        )
        digits = "".join(ch for ch in out.stdout if ch.isdigit())
        return int(digits) if digits else None
    finally:
        os.unlink(path)


def find_numbers(gray, tone):
    """Detect and OCR every printed number in the lineart, globally.

    `tone` is a median-filtered copy of the grayscale image in which thin
    outlines and digits have vanished, leaving each pixel's local fill tone.
    Digits (and lines/texture) are pixels deviating from that tone; compact
    glyph-sized blobs are grouped into numbers and OCR'd.

    Returns a list of (number, cx, cy, digit_height).
    """
    ink = np.abs(gray.astype(float) - tone) >= INK_CONTRAST
    lab, n = ndimage.label(ink, structure=np.ones((3, 3)))
    glyphs = []
    objs = ndimage.find_objects(lab)
    for i, sl in enumerate(objs):
        if sl is None:
            continue
        m = lab[sl] == i + 1
        area = int(m.sum())
        bh = sl[0].stop - sl[0].start
        bw = sl[1].stop - sl[1].start
        if area < DIGIT_MIN_AREA or not (DIGIT_MIN_H <= bh <= DIGIT_MAX_H):
            continue
        if bw > bh * 1.7:  # wide blobs are texture strokes, not digits
            continue
        glyphs.append((sl[1].start, sl[0].start, sl[1].stop - 1, sl[0].stop - 1))

    if not glyphs:
        return []

    # Group glyphs on the same row into numbers.
    glyphs.sort(key=lambda g: (g[1] // 4, g[0]))
    clusters = [[glyphs[0]]]
    for g in glyphs[1:]:
        placed = False
        for cl in clusters:
            last = cl[-1]
            h_gap = g[0] - last[2]
            v_gap = max(g[1], last[1]) - min(g[3], last[3])
            if 0 <= h_gap <= 7 and v_gap <= 2:
                cl.append(g)
                placed = True
                break
        if not placed:
            clusters.append([g])

    found = []
    for cluster in clusters:
        if len(cluster) > 3 or len(cluster) == 0:
            continue
        x0 = min(g[0] for g in cluster); x1 = max(g[2] for g in cluster)
        y0 = min(g[1] for g in cluster); y1 = max(g[3] for g in cluster)
        cx, cy = (x0 + x1) // 2, (y0 + y1) // 2

        # Re-render the crop as pure black ink on white for OCR.
        pad = 3
        crop = gray[max(0, y0 - pad):y1 + pad + 1, max(0, x0 - pad):x1 + pad + 1].astype(float)
        tone_crop = tone[max(0, y0 - pad):y1 + pad + 1, max(0, x0 - pad):x1 + pad + 1]
        binz = np.full(crop.shape, 255, dtype=np.uint8)
        binz[np.abs(crop - tone_crop) >= INK_CONTRAST] = 0
        num = ocr_number(Image.fromarray(binz))
        if num is not None and 1 <= num <= 150:
            found.append((num, cx, cy, y1 - y0 + 1))
    return found


def flood_cells_from_seeds(gray, tone, seeds):
    """Multi-source simultaneous flood of the tone mask.

    Every number seed floods in parallel; neighbouring cells split exactly at
    their middle, so no seed can leak across a weak divider into another cell.
    Returns an int array where value k+1 marks the cell of seeds[k], 0 is
    unclaimed (ink, lines, or areas with no number).
    """
    tone_mask = np.abs(gray.astype(float) - tone) <= FILL_TOLERANCE
    lab = np.zeros(gray.shape, dtype=np.int32)
    for k, (_, cx, cy, _) in enumerate(seeds):
        lab[cy, cx] = k + 1
        tone_mask[cy, cx] = True  # seed sits on digit ink; let it flood

    while True:
        grown = ndimage.grey_dilation(lab, footprint=np.ones((3, 3), dtype=bool))
        claim = (lab == 0) & (grown > 0) & tone_mask
        if not claim.any():
            break
        lab[claim] = grown[claim]
    return lab


def extract(artwork_id):
    folder = os.path.join(REPO, "public", "artworks", artwork_id)
    lineart = Image.open(os.path.join(folder, "numbered_lineart.png")).convert("L")
    master = Image.open(os.path.join(folder, "colored_master.png")).convert("RGB")
    gray = np.array(lineart)
    master_rgb = np.array(master)
    h, w = gray.shape

    tone = ndimage.median_filter(gray, size=17)

    seeds = find_numbers(gray, tone)
    numbers_found = len(seeds)
    cell_lab = flood_cells_from_seeds(gray, tone, seeds)

    regions = []
    number_colors = defaultdict(list)
    playable_mask = np.zeros((h, w), dtype=bool)
    for k, (num, cx, cy, dh) in enumerate(seeds):
        mask = cell_lab == k + 1
        if int(mask.sum()) < MIN_CELL_AREA:
            continue

        outer = trace_boundary(mask)
        filled = ndimage.binary_fill_holes(mask)
        hole_mask = filled & ~mask
        hlab, n_holes = ndimage.label(hole_mask)
        holes = []
        for hl in range(1, n_holes + 1):
            hm = hlab == hl
            if hm.sum() < 40:
                continue
            hc = trace_boundary(hm)
            if len(hc) >= 3:
                holes.append(hc)
        d = path_from_contours(outer, holes)
        if d is None:
            continue

        sample_mask = ndimage.binary_erosion(mask, iterations=ERODE_COLOR)
        if not sample_mask.any():
            sample_mask = mask
        med = np.median(master_rgb[sample_mask], axis=0).astype(int)
        number_colors[num].append(tuple(med))
        playable_mask |= mask

        regions.append({
            "id": "",
            "path": d,
            "fillRule": "evenodd",
            "colorGroupId": num,
            "label": {"x": int(cx), "y": int(cy), "fontSize": max(9, int(dh * 1.15))},
            "objectId": "auto",
        })

    regions.sort(key=lambda r: (r["colorGroupId"], r["label"]["y"], r["label"]["x"]))
    for i, r in enumerate(regions):
        r["id"] = f"{artwork_id}_{i + 1:04d}"

    palette = []
    for num in sorted(number_colors):
        med = np.median(np.array(number_colors[num]), axis=0).astype(int)
        palette.append({"id": num, "hex": "#{:02X}{:02X}{:02X}".format(*med),
                        "name": f"Color {num}"})

    out = {
        "source": "auto-extracted from numbered_lineart.png (scripts/extract_regions.py)",
        "palette": palette,
        "regions": regions,
        "stats": {
            "numbersDetected": numbers_found,
            "regionsPlayable": len(regions),
            "paletteColors": len(palette),
        },
    }
    with open(os.path.join(folder, "regions.json"), "w") as f:
        json.dump(out, f, separators=(",", ":"))

    # QA overlay: playable cells tinted green, everything else tinted blue.
    qa = np.array(lineart.convert("RGB"))
    qa[~playable_mask] = (qa[~playable_mask] * 0.6 + np.array((40, 60, 255)) * 0.4).astype(np.uint8)
    qa[playable_mask] = (qa[playable_mask] * 0.6 + np.array((40, 255, 80)) * 0.4).astype(np.uint8)
    Image.fromarray(qa).save(f"/tmp/qa_{artwork_id}.png")

    print(f"{artwork_id}: numbers={numbers_found} "
          f"playable={len(regions)} palette={len(palette)} "
          f"numberRange={sorted(number_colors)}")
    return out


if __name__ == "__main__":
    for aid in sys.argv[1:] or ["zen_garden"]:
        extract(aid)
