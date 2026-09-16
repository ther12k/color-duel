/**
 * Generates gallery card line-art (card-lineart.svg) for catalog packages.
 * Cards must read as a clear picture at ~250px, so each file is built from the
 * COARSEST authored partition (easy/regions.json when the package ships
 * density variants, otherwise its own regions.json) with bold uniform strokes
 * and no number labels — matching the reference app's card style. Playable
 * partitions are untouched.
 *
 * The five detailed-vector packs (600+ regions, single dense partition) are
 * skipped: they keep their numbered line-art raster previews.
 *
 * Usage: node scripts/generate_card_lineart.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';

const catalog = JSON.parse(readFileSync('public/artworks/catalog.json', 'utf8'));
const SKIP_FORMATS = new Set(['color-duel-detailed-vector-1']);

// Reference cards read ~1px strokes at card size; scale per viewBox so every
// theme gets the same visual weight (368-wide smooth art used 1.5 units).
const strokeFor = (vb) => (1.5 * Math.max(vb[2], vb[3])) / 368;
const STROKE = '#475569'; // slate-600

for (const entry of catalog.artworks) {
  if (!entry.manifest) continue;
  const manifestPath = join('public', entry.manifest);
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  if (SKIP_FORMATS.has(manifest.format)) {
    console.log(`${entry.id}: skipped (${manifest.format} keeps its numbered preview)`);
    continue;
  }

  // Coarsest partition: smooth masters divide one painting into density
  // variants — prefer the easy folder's regions for the card picture.
  const themeRoot = entry.manifest.split('/').slice(0, 2).join('/'); // artworks/<theme>
  const easyRegions = join('public', themeRoot, 'easy/regions.json');
  const ownRegions = join('public', dirname(entry.manifest), manifest.assets.regions ?? 'regions.json');
  const regionsPath = manifest.format === 'color-duel-smooth-partition-1' && existsSync(easyRegions)
    ? easyRegions
    : ownRegions;

  const regions = JSON.parse(readFileSync(regionsPath, 'utf8'));
  const list = regions.regions;
  const vb = regions.viewBox;
  if (!Array.isArray(list) || list.length === 0 || !vb) {
    console.log(`${entry.id}: no usable regions in ${regionsPath}`);
    continue;
  }

  const strokeW = strokeFor(vb).toFixed(2);
  const paths = list
    .map((r) => `<path d="${r.d}" fill="#FFFFFF" fill-rule="${r.fillRule ?? regions.fillRule ?? 'evenodd'}" stroke="${STROKE}" stroke-width="${strokeW}" stroke-linejoin="round" stroke-linecap="round"/>`)
    .join('\n  ');

  const outRel = join(themeRoot, 'card-lineart.svg');
  const outPath = join('public', outRel);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.join(' ')}">
<title>${entry.title} — gallery card lineart</title>
<rect x="${vb[0]}" y="${vb[1]}" width="${vb[2]}" height="${vb[3]}" fill="#FFFFFF"/>
${paths}
</svg>
`;
  writeFileSync(resolve(outPath), svg);
  console.log(`${entry.id}: ${list.length} regions, stroke ${strokeW} -> ${outPath}`);
}
