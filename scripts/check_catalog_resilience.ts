/**
 * Catalog resilience check: a catalog entry whose package files are absent
 * (local-only content in a fresh clone, a truncated export, a typo) must be
 * SKIPPED by loadArtworkPack, never reject the whole gallery — the game and
 * the golden-pack test harness both depend on every other entry still
 * loading. No server and no files: fetch is redirected to an in-memory
 * catalog with one good vector package and one 404 package.
 * Usage: bunx tsx scripts/check_catalog_resilience.ts
 */
import { loadArtworkPack } from '../src/lib/artworkRepository';

const GOOD_ID = 'resilient-good-pack';
const BROKEN_ID = 'resilient-missing-pack';

const CATALOG = {
  artworks: [
    { id: BROKEN_ID, title: 'Broken (files absent)', manifest: `artworks/${BROKEN_ID}/artwork.json` },
    {
      id: GOOD_ID,
      title: 'Good vector package',
      manifest: `artworks/${GOOD_ID}/artwork.json`,
      difficulty: 'Easy' as const,
    },
  ],
};

const GOOD_MANIFEST = {
  schemaVersion: 1,
  id: GOOD_ID,
  version: '1.0.0',
  title: 'Good vector package',
  viewBox: [0, 0, 500, 500],
  format: 'color-duel-vector-1',
  assets: {},
};

const GOOD_PALETTE = [
  { id: 1, hex: '#3366CC', name: 'Blue' },
  { id: 2, hex: '#F2A03D', name: 'Amber' },
];

const GOOD_REGIONS = {
  regions: [
    { id: 'r-1', paletteId: 1, d: 'M 10,10 L 90,10 L 90,90 L 10,90 Z', label: { x: 50, y: 50 } },
    { id: 'r-2', paletteId: 2, d: 'M 110,10 L 190,10 L 190,90 L 110,90 Z', label: { x: 150, y: 50 } },
  ],
};

globalThis.fetch = (async (input: Parameters<typeof fetch>[0]): Promise<Response> => {
  const path = String(input).replace(/^https?:\/\/[^/]+/, '');
  const body = (() => {
    if (path === '/artworks/catalog.json') return CATALOG;
    if (path === `/artworks/${GOOD_ID}/artwork.json`) return GOOD_MANIFEST;
    if (path === `/artworks/${GOOD_ID}/palette.json`) return GOOD_PALETTE;
    if (path === `/artworks/${GOOD_ID}/regions.json`) return GOOD_REGIONS;
    return undefined;
  })();
  if (body === undefined) {
    return new Response('not found', { status: 404 });
  }
  return new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } });
}) as typeof fetch;

const pack = await loadArtworkPack();
const ids = pack.map((a) => a.id).sort();
if (ids.length !== 1 || ids[0] !== GOOD_ID) {
  throw new Error(`expected exactly [${GOOD_ID}] from a catalog with one broken entry, got ${JSON.stringify(ids)}`);
}
const good = pack[0];
if (good.regions.length !== 2 || good.palette.length !== 2) {
  throw new Error(`good package parsed wrong: regions=${good.regions.length} palette=${good.palette.length}`);
}
console.log(`ok: catalog with 1 broken + 1 good entry loaded exactly the good package (${good.regions.length} regions)`);
