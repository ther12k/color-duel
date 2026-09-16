/**
 * Artwork asset validator — checks every artwork the app ships:
 *   1. Vector packages under public/artworks/ (artwork.json + regions.json +
 *      palette.json), including a round trip through the app's parser and
 *      structural checks (closed paths, palette refs, labels, objectives).
 *   2. Image-reference packages (artwork_manifest.json) — file references and
 *      manifest metadata.
 *
 * Structural checks only: it does not do point-in-path label-fit or overlap
 * topology. Usage: bunx tsx scripts/validate_artworks.ts
 */
import { parseVectorPackage } from '../src/lib/vectorArtwork';
import { parseViewBox } from '../src/lib/paints';
import { Artwork } from '../src/types/game';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let failures = 0;
let checks = 0;

function check(artworkId: string, name: string, ok: boolean, detail?: string) {
  checks++;
  if (!ok) {
    failures++;
    console.error(`  FAIL [${artworkId}] ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

const HEX_RE = /^#[0-9a-fA-F]{3,8}$/;

/** Formats that render via a paint.json underpainting (lazy stub + hydrate). */
const isUnderlayFormat = (f: unknown) =>
  f === 'color-duel-detailed-vector-1' || f === 'color-duel-clean-vector-1' || f === 'color-duel-smooth-partition-1';

/** Structural checks shared by every playable artwork, however it was loaded. */
function checkPlayableArtwork(artwork: Artwork) {
  const id = artwork.id;
  const regionIds = artwork.regions.map((r) => r.id);
  const paletteNumbers = new Set(artwork.palette.map((p) => p.number));

  check(id, 'unique region IDs', new Set(regionIds).size === regionIds.length);
  check(id, 'unique palette numbers', paletteNumbers.size === artwork.palette.length);

  for (const p of artwork.palette) {
    check(id, `palette ${p.number}: hex color`, HEX_RE.test(p.hex), p.hex);
    if (p.stops) {
      check(id, `palette ${p.number}: >=2 gradient stops`, p.stops.length >= 2);
      const offsets = p.stops.map(([o]) => o);
      check(
        id,
        `palette ${p.number}: stops ordered in [0,1]`,
        offsets.every((o) => o >= 0 && o <= 1) && offsets.every((o, i) => i === 0 || o >= offsets[i - 1]),
        offsets.join(',')
      );
      check(id, `palette ${p.number}: stop colors are hex`, p.stops.every(([, c]) => HEX_RE.test(c)));
    }
  }

  for (const r of artwork.regions) {
    check(id, `region ${r.id}: path closed (ends with Z)`, /z\s*$/i.test(r.path.trim()));
    check(id, `region ${r.id}: path non-empty`, r.path.trim().length > 4);
    check(id, `region ${r.id}: colorIndex in palette`, paletteNumbers.has(r.colorIndex), String(r.colorIndex));
    check(id, `region ${r.id}: finite label anchor`, Number.isFinite(r.labelPos.x) && Number.isFinite(r.labelPos.y));
    check(
      id,
      `region ${r.id}: fillRule valid`,
      r.fillRule === undefined || r.fillRule === 'nonzero' || r.fillRule === 'evenodd'
    );
    check(
      id,
      `region ${r.id}: labelFontSize positive`,
      r.labelFontSize === undefined || (r.labelFontSize > 0 && Number.isFinite(r.labelFontSize))
    );
  }

  for (const dec of artwork.decorations ?? []) {
    check(id, `decoration ${dec.id}: colorIndex in palette`, paletteNumbers.has(dec.colorIndex), String(dec.colorIndex));
    check(id, `decoration ${dec.id}: path closed`, /z\s*$/i.test(dec.path.trim()));
  }

  for (const d of artwork.details ?? []) {
    check(id, 'detail path non-empty', d.path.trim().length > 0);
    check(
      id,
      'detail strokeWidth positive',
      d.strokeWidth === undefined || (d.strokeWidth > 0 && Number.isFinite(d.strokeWidth))
    );
  }

  const vb = parseViewBox(artwork.viewBox);
  check(id, 'viewBox parses with positive extent', vb.w > 0 && vb.h > 0, artwork.viewBox);

  // Objectives must be attainable from the regions actually assigned to their
  // objectId — otherwise the +30 bonus can never trigger.
  const objectIdCounts = new Map<string, number>();
  for (const r of artwork.regions) {
    objectIdCounts.set(r.objectId, (objectIdCounts.get(r.objectId) ?? 0) + 1);
  }
  for (const obj of artwork.objectives) {
    const available = objectIdCounts.get(obj.objectId) ?? 0;
    check(id, `objective ${obj.id}: objectId has regions`, available > 0, `objectId '${obj.objectId}'`);
    check(
      id,
      `objective ${obj.id}: totalRegions attainable`,
      obj.totalRegions <= available,
      `wants ${obj.totalRegions}, only ${available} region(s) with objectId '${obj.objectId}'`
    );
    for (const rid of obj.regionIds ?? []) {
      check(id, `objective ${obj.id}: regionId exists`, regionIds.includes(rid), rid);
    }
  }
}

// ---- public/artworks packages ----
const packRoot = path.resolve(__dirname, '../public/artworks');
check('artwork-pack', 'catalog.json exists', fs.existsSync(path.join(packRoot, 'catalog.json')));
const catalogPath = path.join(packRoot, 'catalog.json');
if (!fs.existsSync(catalogPath)) {
  console.error(`${failures} check(s) FAILED.`);
  process.exit(1);
}

const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8')) as {
  artworks?: Array<{ id: string; title: string; folder?: string; manifest?: string; thumbnail?: string }>;
};
const seenFolders = new Set<string>();
let playableCount = 0;

for (const entry of catalog.artworks ?? []) {
  if (entry.manifest) {
    // ---- Vector package (color-duel-vector-1) ----
    // Catalog manifest paths are relative to public/ (e.g. artworks/<id>/artwork.json).
    const manifestPath = path.resolve(packRoot, '..', entry.manifest);
    const dir = path.dirname(manifestPath);
    // Nested packs (clean-vector difficulty variants) share a theme folder;
    // catalogue by the top folder segment so it counts as seen below.
    seenFolders.add(path.relative(packRoot, dir).split(path.sep)[0]);
    check(entry.id, 'vector manifest exists', fs.existsSync(manifestPath), entry.manifest);
    if (!fs.existsSync(manifestPath)) continue;
    try {
      const m = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      const r = JSON.parse(fs.readFileSync(path.join(dir, m.assets?.regions ?? 'regions.json'), 'utf-8'));
      const p = JSON.parse(
        fs.readFileSync(path.join(dir, m.assets?.palette ?? 'palette.json'), 'utf-8')
      ) as Array<{ id: number; hex: string; name?: string; paint?: { type?: string; stops?: Array<{ offset: number; color: string }> } }>;

      check(entry.id, 'vector manifest id matches catalog', m.id === entry.id, `${m.id} vs ${entry.id}`);
      check(
        entry.id,
        'vector viewBox valid',
        Array.isArray(m.viewBox) && m.viewBox.length === 4 && m.viewBox.every((n: number) => Number.isFinite(n) && n >= 0)
      );
      check(entry.id, 'vector regionCount matches', !m.regionCount || m.regionCount === r.regions.length, `${m.regionCount} vs ${r.regions.length}`);
      check(entry.id, 'catalog thumbnail exists', typeof entry.thumbnail === 'string' && fs.existsSync(path.resolve(packRoot, '..', entry.thumbnail)), entry.thumbnail);
      if (m.format === 'color-duel-clean-vector-1') {
        check(entry.id, 'fixed galleryThumbnail declared', typeof m.assets?.galleryThumbnail === 'string');
        check(entry.id, 'fixed colored thumbnail exists', typeof m.assets?.galleryThumbnail === 'string' && fs.existsSync(path.join(dir, m.assets.galleryThumbnail)));
        check(entry.id, 'fixed colored preview exists', typeof m.assets?.coloredPreview === 'string' && fs.existsSync(path.join(dir, m.assets.coloredPreview)));
        check(entry.id, 'fixed numbered SVG exists', typeof m.assets?.numberedSvg === 'string' && fs.existsSync(path.join(dir, m.assets.numberedSvg)));
      }
      // palette.json is the runtime source of truth; manifest drift is a warning.
      if (m.paletteCount && m.paletteCount !== p.length) {
        console.log(`  warn ${entry.id}: manifest paletteCount ${m.paletteCount} != palette.json ${p.length} (using palette.json)`);
      }

      // Underlay formats: paint.json must exist and be well-formed.
      let paint = null as null | { paths?: Array<{ fill?: string; d?: string }>; inkPaths?: Array<{ fill?: string; d?: string }> };
      if (isUnderlayFormat(m.format)) {
        const paintPath = path.join(dir, m.assets?.paint ?? 'paint.json');
        check(entry.id, 'underlay paint.json exists', fs.existsSync(paintPath), m.assets?.paint);
        if (fs.existsSync(paintPath)) {
          paint = JSON.parse(fs.readFileSync(paintPath, 'utf-8'));
          check(entry.id, 'paint paths non-empty', (paint.paths?.length ?? 0) > 0);
          const bad = (paint.paths ?? []).filter((pp) => !pp.fill || !pp.d || !/z\s*$/i.test(pp.d.trim()));
          check(entry.id, 'paint paths closed with fills', bad.length === 0, `${bad.length} bad`);
          for (const ip of paint.inkPaths ?? []) {
            check(entry.id, 'ink path closed', !!ip.d && /z\s*$/i.test(ip.d.trim()));
          }
        }
      }

      const paletteIds = new Set(p.map((x) => x.id));
      for (const item of p) {
        check(entry.id, `palette ${item.id}: hex color`, HEX_RE.test(item.hex ?? ''), item.hex);
        if (item.paint?.stops) {
          check(entry.id, `palette ${item.id}: >=2 gradient stops`, item.paint.stops.length >= 2);
          check(
            entry.id,
            `palette ${item.id}: stop colors are hex`,
            item.paint.stops.every((s) => HEX_RE.test(s.color ?? ''))
          );
        }
      }

      const regionIds = new Set(r.regions.map((x: { id: string }) => x.id));
      check(entry.id, 'vector unique region ids', regionIds.size === r.regions.length);
      for (const reg of r.regions) {
        check(entry.id, `region ${reg.id}: path closed`, /z\s*$/i.test((reg.d ?? '').trim()));
        check(entry.id, `region ${reg.id}: paletteId in palette`, paletteIds.has(reg.paletteId), String(reg.paletteId));
        // Label is optional — clean-vector packs omit it where a badge cannot
        // fit — but an unlabeled region must then ship a usable bbox.
        if (reg.label) {
          check(
            entry.id,
            `region ${reg.id}: finite label anchor`,
            Number.isFinite(reg.label.x) && Number.isFinite(reg.label.y)
          );
        } else {
          check(
            entry.id,
            `region ${reg.id}: bbox for unlabeled region`,
            Array.isArray(reg.bbox) && reg.bbox.length === 4 && reg.bbox.every((n: number) => Number.isFinite(n))
          );
        }
      }
      for (const dec of r.decorations ?? []) {
        check(entry.id, `decoration ${dec.id}: paletteId in palette`, paletteIds.has(dec.paletteId), String(dec.paletteId));
      }
      for (const g of m.objectGroups ?? []) {
        for (const rid of g.regionIds ?? []) {
          check(entry.id, `objectGroup ${g.id}: regionId exists`, regionIds.has(rid), rid);
        }
      }

      // Round trip through the app parser + full structural checks
      const loaded = parseVectorPackage(m, r, p, paint as Parameters<typeof parseVectorPackage>[3]);
      check(entry.id, 'vector package loads via parser', loaded.regions.length === r.regions.length);
      checkPlayableArtwork(loaded);
      if (isUnderlayFormat(m.format)) {
        // Clean-vector packs fold inkPaths into the underpainting layer.
        const expectedPaths =
          (paint?.paths?.length ?? 0) + (m.format === 'color-duel-clean-vector-1' ? paint?.inkPaths?.length ?? 0 : 0);
        check(entry.id, 'underlay underpainting parsed', (loaded.underpainting?.paths.length ?? 0) === expectedPaths);
        if (m.format !== 'color-duel-clean-vector-1') {
          check(entry.id, 'underlay ink parsed', (loaded.underpainting?.inkPaths.length ?? 0) === (paint?.inkPaths?.length ?? 0));
        }
        // Stub form (what the catalog actually loads) must declare its count.
        const stub = parseVectorPackage(m, null, p, null, {
          baseUrl: `/${(entry.manifest ?? '').replace(/\/artwork\.json$/, '')}`,
          manifestUrl: `/${entry.manifest ?? ''}`,
        });
        check(entry.id, 'underlay stub declares region count', stub.declaredRegionCount === r.regions.length);
        check(entry.id, 'underlay stub carries data urls', !!stub.dataUrls?.regions && !!stub.dataUrls?.paint);
      }
      playableCount++;
      console.log(`  ok vector package ${entry.id} (${loaded.regions.length} regions, ${p.length} colors, ${loaded.objectives.length} objectives${loaded.underpainting ? `, ${loaded.underpainting.paths.length} paint paths` : ''})`);
    } catch (e) {
      check(entry.id, 'vector package parses', false, String(e));
    }
    continue;
  }

  // ---- Image-reference package ----
  const dir = path.join(packRoot, (entry.folder ?? '').replace(/^artworks\//, '').replace(/^\//, ''));
  seenFolders.add(entry.id);
  check(entry.id, 'package folder exists', fs.existsSync(dir), entry.folder ?? '');
  const manifestPath = path.join(dir, 'artwork_manifest.json');
  check(entry.id, 'manifest exists', fs.existsSync(manifestPath));
  if (fs.existsSync(manifestPath)) {
    try {
      const m = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      check(entry.id, 'manifest id matches catalog', m.id === entry.id, `${m.id} vs ${entry.id}`);
      check(entry.id, 'manifest has canvas', Number(m.canvas?.width) > 0 && Number(m.canvas?.height) > 0);
      check(entry.id, 'manifest has non-empty palette', Array.isArray(m.palette) && m.palette.length > 0);
      for (const p of m.palette ?? []) {
        check(entry.id, `palette ${p.id}: hex color`, HEX_RE.test(p.hex ?? ''), p.hex);
        check(entry.id, `palette ${p.id}: has name`, typeof p.name === 'string' && p.name.length > 0);
      }
      for (const key of ['preview_colored', 'preview_numbered'] as const) {
        const rel = m.assets?.[key];
        check(entry.id, `assets.${key} exists on disk`, typeof rel === 'string' && fs.existsSync(path.join(dir, rel)), rel);
      }
      if (m.assets?.thumbnail) {
        check(entry.id, 'assets.thumbnail exists on disk', fs.existsSync(path.join(dir, m.assets.thumbnail)), m.assets.thumbnail);
      }
      console.log(`  ok image package ${entry.id} (${m.palette?.length ?? 0} palette colors) — hidden until regions are authored`);
    } catch (e) {
      check(entry.id, 'manifest parses', false, String(e));
    }
  }
}

// Folders on disk without a catalog entry
for (const dir of fs.readdirSync(packRoot, { withFileTypes: true })) {
  if (dir.isDirectory() && !seenFolders.has(dir.name)) {
    check('artwork-pack', 'every package folder is catalogued', false, dir.name);
  }
}

console.log(`\n${checks - failures}/${checks} artwork checks passed (${playableCount} playable vector packages).`);
if (failures > 0) {
  console.error(`${failures} check(s) FAILED.`);
  process.exit(1);
}
