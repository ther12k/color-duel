/**
 * End-to-end pipeline check: catalog -> stub -> loadArtworkPlayData ->
 * render ColoringCanvas to static markup. Verifies the exact code path the
 * app runs when a detailed package is opened, without a browser.
 * Usage: bunx tsx scripts/check_play_pipeline.ts [artworkId]
 */
import { loadArtworkPack, loadArtworkPlayData } from '../src/lib/artworkRepository';
import { ColoringCanvas } from '../src/components/duel/ColoringCanvas';
import { renderToStaticMarkup } from 'react-dom/server';
import { GameMode } from '../src/types/game';

// jsdom-free render: ColoringCanvas reads containerRef.current?.clientWidth
// (null in Node -> falls back to 440) and only uses DOM via React elements.
globalThis.window = globalThis.window ?? ({} as unknown as Window & typeof globalThis);

// Node fetch has no base URL — resolve against the dev server like the browser does.
const BASE = process.argv[3] ?? 'http://localhost:3000';
const realFetch = globalThis.fetch;
globalThis.fetch = ((input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) =>
  realFetch(typeof input === 'string' && input.startsWith('/') ? BASE + input : input, init)) as typeof fetch;

const target = process.argv[2] ?? 'sunset-conservatory';
const pack = await loadArtworkPack();
const stub = pack.find((a) => a.id === target);
if (!stub) throw new Error(`stub '${target}' not in catalog`);

console.log(`stub: regions=${stub.regions.length} declared=${stub.declaredRegionCount} dataUrls=${Boolean(stub.dataUrls)} thumbnail=${stub.thumbnail}`);

const full = await loadArtworkPlayData(stub);
console.log(`hydrated: regions=${full.regions.length} underpainting=${full.underpainting?.paths.length} ink=${full.underpainting?.inkPaths.length} palette=${full.palette.length}`);

if (full.regions.length === 0) throw new Error('hydration produced no regions');
if (!full.underpainting || full.underpainting.paths.length === 0) throw new Error('no underpainting');

const sample = full.regions[0];
const html = renderToStaticMarkup(
  // @ts-expect-error - DOM event handlers are fine in static render
  <ColoringCanvas
    artwork={full}
    filledRegionIds={[sample.id]}
    selectedColorIndex={sample.colorIndex}
    mode={'solo' as GameMode}
    isPeeking={false}
    hintActiveForColor={null}
    wrongClickPos={null}
    correctClickPos={null}
    zoomLevel={4}
  />
);

const expectedPaths =
  full.underpainting!.paths.length +
  full.underpainting!.inkPaths.length +
  full.regions.length +
  (full.decorations?.length ?? 0);
const actualPaths = html.split('<path').length - 1;

const checks = {
  pathCountMatchesSource: actualPaths >= expectedPaths,
  masks: html.includes(`region-${sample.id}`),
  completedRegionTransparent: new RegExp(`fill="transparent"[^>]*`).test(html),
  labelsPresent: html.includes(`>${sample.colorIndex}</text>`) || html.includes(`fill="#0F172A"`),
  fitTransformApplied: (html.match('transform="translate') ?? []).length > 0,
};
console.log('render checks:', { ...checks, actualPaths, expectedPaths });
console.log('svg size:', (html.length / 1024).toFixed(0) + 'KB markup');

const failed = Object.entries(checks).filter(([, ok]) => !ok);
if (failed.length) {
  console.error('FAILED:', failed.map(([n]) => n).join(', '));
  process.exit(1);
}
console.log(`\nOK: '${target}' renders ${full.regions.length} masks over ${full.underpainting!.paths.length} paint paths.`);
