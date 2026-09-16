# Color Duel

Two players. The same unfinished picture. Different decisions. Who can color smarter?

A paint-by-number duel game built with React + TypeScript + Vite + Tailwind v4.
Color regions by number, race rivals, hit objective deadlines, and keep
per-region progress that survives reloads.

## Tabs

| Tab | What it shows |
|---|---|
| **Gallery** | Every artwork — search, category filters, completion badges, per-artwork progress. |
| **Discover** | Ways to play (Smart / Speed / Memory / Solo / Studio), AI challenge creation, fresh artwork rail, ranked leaderboard. |
| **Daily** | Today's challenge hero card with countdown + streak, and a month grid that lights up on days you played. |
| **My Works** | Personal shelf: stats, in-progress artworks, completed works, not-started. |

## Artwork system

Every artwork is a **vector package** under `public/artworks/`, listed in
`catalog.json` and parsed by `src/lib/vectorArtwork.ts` +
`src/lib/artworkRepository.ts`. Each package ships **closed SVG region paths**
— every region has:

- a stable `id` (what the player taps and what progress records),
- a `paletteId` (the palette number / color *group* it requires — many regions
  share one number),
- a `label` anchor (+ optional `fontSize`) for its number badge,
- an `objectId` grouping it into objectives (simple packages),
- optional gradient `stops` on palette entries, precolored `decorations`, and
  a `detailPaths` linework layer drawn above fills.

Three package formats are supported:

### 1. `color-duel-vector-1` (small, loads with the catalog)

`artwork.json` + `regions.json` + `palette.json`. Dozens of regions, so the
gallery renders authentic region-based lineart thumbnails directly.

### 2. `color-duel-detailed-vector-1` (hundreds of regions, lazy-loaded)

Adds `paint.json`: the finished art as a fine vector painting (`paths` +
`inkPaths`). Rendering uses the **vector underpainting with region masks**
model — the painting is drawn below the playable regions, unfilled regions are
opaque white masks, and completing a region removes its mask to reveal that
part of the painting. `regions.json` + `paint.json` are several MB, so these
packages load as stubs (manifest + palette) and hydrate when a match starts.

### 3. `color-duel-clean-vector-1` (hand-authored masters, four difficulty variants)

Four difficulty folders per theme (`artworks/<theme>/{easy,normal,hard,master}/`),
each with its own `artwork.json`, `regions.json`, `palette.json`, and SVG/raster
previews. Every level keeps the same master vector and final colored result;
only `regions.json` and `numbered.svg` differ by difficulty. Shared assets may
be copied into each level folder for standalone package use. Rendering uses the
underpainting-with-masks model (lazy stub + hydrate), while gallery cards use
the colored `thumbnail.png` / `assets.galleryThumbnail` — never the numbered
grid preview. `numbered-preview.png` remains available for lineart/gameplay
surfaces.

Format-specific handling:

- regions may omit `label` where a badge cannot fit — the parser falls back
  to the shipped `bbox` center;
- top-level `minZoomLabelPx` (8–11 by difficulty) gates number labels;
- `inkPaths` in `paint.json` are large filled silhouettes, so they are merged
  into the underpainting BELOW the masks (detailed packs keep them above as
  thin linework);
- match durations by difficulty: easy 180s, normal 300s, hard 480s,
  master 600s; zoom cap 10.

Extra manifest fields:

- `assets.galleryThumbnail` — colored shared master thumbnail used by gallery
  cards and artwork browsing; same image across all difficulty levels.
- `assets.numberedPreview` — uncolored numbered lineart raster for gameplay
  fallback and explicit lineart preview surfaces.
- `assets.coloredPreview` — finished master raster, exposed as
  `finishedPreviewUrl` and rendered on results/completed surfaces.
- `rendering.maxZoom` — canvas zoom cap (detailed packs use 10);
  `rendering.labelMinScreenPx` gates number labels until they are legible.

### Adding a new artwork

1. Drop the package folder in `public/artworks/<id>/` (`artwork.json`,
   `regions.json`, `palette.json`, plus `paint.json` for underlay packs —
   detailed packages flat, clean-vector packages as `<theme>/<level>/`).
2. Keep preview rasters small (the gallery loads them eagerly); derive a
   ~360px `numbered-preview.png` from `numbered.png` and a ~540px
   `colored-preview.png` from `colored.png` rather than shipping multi-MB
   originals.
3. Add a `catalog.json` entry (`id`, `title`, `manifest`, `thumbnail`,
   `regionCount`, `category`).

Validate after adding anything:

```bash
bun run validate:artwork   # structure + parser round-trip for every package
bunx tsx scripts/check_play_pipeline.tsx <artworkId>   # hydrate + render one detailed package (dev server must be running)
```

## Player progress

Progress is **metadata, never edited images** (`src/lib/progressStore.ts`):
per artwork we persist `completedRegionIds`, `totalRegions`, `isComplete`,
`updatedAt` in localStorage; play dates feed the Daily month grid. An artwork
joins `completedArtworkIds` (My Works completed shelf) only when
`isComplete` is true — every playable region colored, across as many sessions
as it takes. A timed-out session never marks an artwork complete, and the
results screen shows the colored reveal only for completed artworks.
Resetting progress in Settings clears it.

## Development

```bash
bun install
bun run dev                # vite on :3000
bun run lint               # tsc --noEmit
bun run build              # production build
bun run validate:artwork   # artwork asset checks
```
