import { Artwork, ArtworkDecoration, ArtworkDetailPath, ArtworkRegion, BonusObjective, ColorPaletteItem, Underpainting } from '../types/game';
import { computeCanvasFit } from './artworkAsset';

/**
 * Parser for packaged vector artworks served from public/artworks/:
 *
 *  - `color-duel-vector-1` (artwork.json + regions.json + palette.json):
 *    gradient paints per palette group, decorations, detail linework.
 *    Regions ship small enough to load with the catalog.
 *
 *  - `color-duel-detailed-vector-1` (adds paint.json, hundreds of regions):
 *    "vector underpainting with region masks" — the finished art is a fine
 *    vector painting drawn BELOW the playable regions; unfilled regions are
 *    opaque masks and completing one reveals that part of the underpainting.
 *    regions.json + paint.json are several MB, so these load lazily when a
 *    match starts (see loadArtworkPlayData in artworkRepository.ts); until
 *    then the package appears as a stub with its numbered.svg thumbnail.
 *
 *  - `color-duel-clean-vector-1` — hand-authored vector masters shipped as
 *    four difficulty variants (easy/normal/hard/master) per theme. The
 *    variant folders hold regions.json + palette.json + previews; paint.json
 *    and colored.png live one level up (assets use "../" paths). Rendering
 *    is the same underpainting-with-masks model as the detailed format, so
 *    these are lazy stubs too. minZoomLabelPx (top level) gates tiny labels.
 *
 * Both formats: every region has a stable id, a paletteId (color group), a
 * label anchor and even-odd filling. Progress is region-ID metadata only.
 */

export interface VectorArtworkManifest {
  schemaVersion: number;
  id: string;
  version: string;
  title: string;
  description?: string;
  category?: string;
  format?: string;
  viewBox: [number, number, number, number];
  difficulty?: string;
  difficultyLabel?: string;
  regionCount?: number;
  paletteCount?: number;
  /** Clean-vector packs: hide region labels smaller than this on screen. */
  minZoomLabelPx?: number;
  assets: {
    regions?: string;
    palette?: string;
    paint?: string;
    thumbnail?: string;
    /** Colored master thumbnail used by gallery cards. */
    galleryThumbnail?: string;
    /** Uncolored numbered lineart raster — safe to show before playing. */
    numberedPreview?: string;
    /** Finished colored master raster — only shown once a match is won. */
    coloredPreview?: string;
    numberedSvg?: string;
    coloredSvg?: string;
    lineworkSvg?: string;
    inkSvg?: string;
  };
  objectGroups?: Array<{ id: string; label: string; regionIds: string[] }>;
  rendering?: {
    model?: string;
    fillRule?: 'nonzero' | 'evenodd';
    labelMinScreenPx?: number;
    zoomRecommended?: number;
    maxZoom?: number;
    boundaryStyle?: 'solid' | 'dotted';
    boundaryStrokeWidth?: number;
    boundaryStroke?: string;
    boundaryDasharray?: string;
    labelStrokeWidth?: number;
    labelFontWeight?: number;
  };
}

export interface VectorRegion {
  id: string;
  paletteId: number;
  objectId?: string;
  d: string;
  fillRule?: 'nonzero' | 'evenodd';
  label?: { x: number; y: number; fontSize?: number; minScreenPx?: number };
  /** Clean-vector packs ship bbox for every region; label may be omitted. */
  bbox?: [number, number, number, number];
}

export interface VectorRegionsFile {
  schemaVersion?: number;
  artworkId?: string;
  viewBox?: [number, number, number, number];
  fillRule?: 'nonzero' | 'evenodd';
  regions: VectorRegion[];
  /** Artificial bisector edges from subdivide_master_regions.mjs. */
  cuts?: string[];
  decorations?: Array<{ id: string; paletteId: number; d: string; fillRule?: 'nonzero' | 'evenodd' }>;
  detailPaths?: Array<{ id?: string; d: string; stroke?: string; strokeWidth?: number; opacity?: number }>;
}

export interface VectorPaletteItem {
  id: number;
  number?: number;
  name?: string;
  hex: string;
  paint?: {
    type?: string;
    stops?: Array<{ offset: number; color: string }>;
  };
}

export interface VectorPaintFile {
  paths?: Array<{ fill: string; d: string; fillRule?: 'nonzero' | 'evenodd' }>;
  inkPaths?: Array<{ fill: string; d: string; fillRule?: 'nonzero' | 'evenodd' }>;
}

export interface LoadVectorPackageOptions {
  id?: string;
  title?: string;
  category?: Artwork['category'];
  difficulty?: Artwork['difficulty'];
  defaultDurationSeconds?: number;
  likes?: string;
  /** Catalog-provided card image; overrides manifest-derived thumbnails. */
  thumbnail?: string;
}

/** Map free-form package categories onto the app's category union. */
function mapCategory(raw: string | undefined): Artwork['category'] {
  const c = (raw || '').toLowerCase();
  if (c === 'cozy') return 'Cozy';
  if (c === 'mandala') return 'Mandala';
  if (c === 'masterpiece' || c === 'decorative') return 'Masterpiece';
  if (c === 'fantasy') return 'Fantasy';
  if (c === 'characters') return 'Characters';
  if (c === 'travel') return 'Travel';
  if (c === 'interior') return 'Interior';
  if (c === 'sci-fi' || c === 'sci fi') return 'Sci-Fi';
  if (c === 'coastal' || c === 'coast') return 'Coastal';
  if (c === 'wildlife') return 'Wildlife';
  if (c === 'animals') return 'Animals';
  if (c === 'ocean') return 'Ocean';
  return 'Nature'; // nature, scenery, and unknown categories
}

/** Package difficulties (easy/medium/hard/master/…) onto the app union. */
function mapDifficulty(raw: string | undefined): Artwork['difficulty'] {
  const d = (raw || '').toLowerCase();
  if (d === 'easy') return 'Easy';
  if (d === 'hard' || d === 'detailed' || d === 'expert' || d === 'master') return 'Hard';
  return 'Medium';
}

function paletteFrom(paletteFile: VectorPaletteItem[]): ColorPaletteItem[] {
  return paletteFile.map((p) => ({
    number: p.number ?? p.id,
    hex: p.hex,
    name: p.name ?? `Color ${p.id}`,
    stops:
      p.paint?.type === 'linearGradient' && p.paint.stops && p.paint.stops.length >= 2
        ? p.paint.stops.map((s) => [s.offset, s.color] as [number, string])
        : undefined,
  }));
}

function underpaintingFrom(paintFile: VectorPaintFile | null | undefined): Underpainting | undefined {
  if (!paintFile?.paths?.length) return undefined;
  return {
    paths: paintFile.paths.map((p) => ({ fill: p.fill, d: p.d, fillRule: p.fillRule ?? 'evenodd' })),
    inkPaths: (paintFile.inkPaths ?? []).map((p) => ({
      fill: p.fill,
      d: p.d,
      fillRule: p.fillRule ?? 'evenodd',
    })),
  };
}

/**
 * Build the full playable Artwork. `regionsFile` may be null for detailed
 * packages whose region/paint data loads lazily — the result is a stub that
 * renders from its numbered.svg thumbnail until hydrated.
 */
export function parseVectorPackage(
  manifest: VectorArtworkManifest,
  regionsFile: VectorRegionsFile | null,
  paletteFile: VectorPaletteItem[],
  paintFile?: VectorPaintFile | null,
  opts: { baseUrl?: string; loadOptions?: LoadVectorPackageOptions; manifestUrl?: string } = {}
): Artwork {
  if (!manifest?.id || !manifest?.title || !manifest?.viewBox) {
    throw new Error('Invalid vector artwork package: missing id/title/viewBox');
  }
  const { baseUrl = '', loadOptions = {}, manifestUrl } = opts;
  const assetUrl = (p?: string) => (p ? `${baseUrl.replace(/\/$/, '')}/${p}` : undefined);

  const { fitTransform, fitParams } = computeCanvasFit(manifest.viewBox);
  const isDetailed = manifest.format === 'color-duel-detailed-vector-1';
  const isSmooth = manifest.format === 'color-duel-smooth-partition-1';
  // Clean-vector packs scale their label floor (8–11px) and region density by
  // difficulty; give harder variants longer sessions and deeper zoom.
  const isClean = manifest.format === 'color-duel-clean-vector-1';
  const cleanDurations: Record<string, number> = { easy: 180, normal: 300, hard: 480, master: 600 };
  const lazy = regionsFile === null;
  const defaultFillRule = regionsFile?.fillRule ?? 'evenodd';

  const regions: ArtworkRegion[] = (regionsFile?.regions ?? []).map((r) => ({
    id: r.id,
    objectId: r.objectId ?? 'general',
    path: r.d,
    colorIndex: r.paletteId,
    // Clean-vector packs omit labels on regions too small to hold a badge;
    // fall back to the bbox center so badges and Locate stay inside them.
    labelPos: r.label
      ? { x: r.label.x, y: r.label.y }
      : r.bbox
        ? { x: (r.bbox[0] + r.bbox[2]) / 2, y: (r.bbox[1] + r.bbox[3]) / 2 }
        : { x: 0, y: 0 },
    labelFontSize: r.label?.fontSize,
    fillRule: r.fillRule ?? defaultFillRule,
  }));

  const decorations: ArtworkDecoration[] | undefined = regionsFile?.decorations?.length
    ? regionsFile.decorations.map((dec) => ({
        id: dec.id,
        path: dec.d,
        colorIndex: dec.paletteId,
        fillRule: dec.fillRule ?? defaultFillRule,
      }))
    : undefined;

  const details: ArtworkDetailPath[] | undefined = regionsFile?.detailPaths?.length
    ? regionsFile.detailPaths.map((d, i) => ({
        id: d.id ?? `detail-${i}`,
        path: d.d,
        strokeWidth: d.strokeWidth,
        stroke: d.stroke,
        opacity: d.opacity,
      }))
    : undefined;

  const objectives = regionsFile ? buildObjectives(manifest, regionsFile) : [];
  // Smooth conversion bundles use the same underpainting-and-mask model as the detailed packs.

  const underpainting = underpaintingFrom(paintFile);
  // Clean-vector packs use inkPaths for large filled silhouette shapes that
  // belong to the finished painting (e.g. Turtle's deep-water band), not for
  // thin linework. Render them inside the underpainting BELOW the region
  // masks — above-mask ink would blanket the unfilled white canvas.
  if (isClean && underpainting && paintFile?.inkPaths?.length) {
    underpainting.paths.push(
      ...paintFile.inkPaths.map((p) => ({
        fill: p.fill,
        d: p.d,
        fillRule: p.fillRule ?? 'evenodd' as const,
      }))
    );
    underpainting.inkPaths = [];
  }

  return {
    id: loadOptions.id ?? manifest.id,
    title: loadOptions.title ?? manifest.title,
    // Progress identity: completions are recorded against this pack version
    // and never applied across versions (progressStore contract).
    contentVersion: manifest.version,
    subtitle: manifest.description,
    category: loadOptions.category ?? mapCategory(manifest.category),
    likes: loadOptions.likes ?? '0',
    // Thumbnail: the pack's numbered lineart raster (numberedPreview, or the
    // older thumbnail field when it already pointed at a numbered preview) —
    // reveals no palette colors before the artwork is played. Falls back to
    // the numbered SVG when no preview raster ships. The colored master
    // (coloredPreview) is exposed separately as finishedPreviewUrl and only
    // ever rendered once a match is won.
    // Gallery uses the finished shared thumbnail for fixed clean-vector packs.
    // Gameplay never reads this field; canvas still hydrates regions + paint.
    galleryThumbnailUrl:
      assetUrl(manifest.assets.galleryThumbnail) ??
      (isClean ? assetUrl(manifest.assets.thumbnail ?? 'thumbnail.png') : undefined),
    thumbnail:
      loadOptions.thumbnail ??
      assetUrl(manifest.assets.numberedPreview) ??
      assetUrl(manifest.assets.numberedSvg) ??
      assetUrl(manifest.assets.thumbnail) ??
      '',
    finishedPreviewUrl: assetUrl(manifest.assets.coloredPreview),
    palette: paletteFrom(paletteFile),
    regions,
    decorations,
    details,
    underpainting,
    objectives,
    difficulty: loadOptions.difficulty ?? mapDifficulty(manifest.difficulty ?? (manifest as VectorArtworkManifest & { difficultyLabel?: string }).difficultyLabel),
    backgroundColor: '#FFFFFF',
    viewBox: `${manifest.viewBox.join(' ')}`,
    fitTransform,
    fitParams,
    defaultDurationSeconds:
      loadOptions.defaultDurationSeconds ??
      (isDetailed ? 300 : isClean ? cleanDurations[manifest.difficulty ?? ''] ?? 240
        : isSmooth && (manifest.regionCount ?? 0) > 1000 ? 480 : 180),
    zoomRecommended:
      manifest.rendering?.maxZoom ??
      manifest.rendering?.zoomRecommended ??
      (isClean ? 10 : undefined),
    labelMinScreenPx: manifest.rendering?.labelMinScreenPx ?? manifest.minZoomLabelPx,
    boundaryStyle:
      manifest.rendering?.boundaryStyle ?? (isSmooth ? 'solid' : 'solid'),
    boundaryStrokeWidth:
      manifest.rendering?.boundaryStrokeWidth ?? (isSmooth ? 1.1 : undefined),
    boundaryStroke: manifest.rendering?.boundaryStroke,
    cutPaths: regionsFile?.cuts?.length ? regionsFile.cuts : undefined,
    labelStrokeWidth: manifest.rendering?.labelStrokeWidth,
    labelFontWeight: manifest.rendering?.labelFontWeight,
    declaredRegionCount: lazy ? manifest.regionCount : undefined,
    dataUrls: lazy
      ? {
          manifest: manifestUrl ?? '',
          regions: assetUrl(manifest.assets.regions ?? 'regions.json'),
          paint: assetUrl(manifest.assets.paint ?? 'paint.json'),
        }
      : undefined,
  } as Artwork;
}

/**
 * Bonus objectives from the manifest's objectGroups: the three largest
 * thematic groups (excluding pure backgrounds) with at least 2 regions.
 * Detailed packages ship empty objectGroups (segmentation cannot prove
 * semantic membership) and therefore get none.
 */
function buildObjectives(manifest: VectorArtworkManifest, regionsFile: VectorRegionsFile): BonusObjective[] {
  const groups = (manifest.objectGroups ?? [])
    .filter((g) => g.id !== 'background' && g.regionIds.length >= 2)
    .sort((a, b) => b.regionIds.length - a.regionIds.length)
    .slice(0, 3);
  if (groups.length === 0) return [];

  const ICONS: BonusObjective['iconType'][] = ['star', 'gem', 'flower', 'lantern', 'window', 'cup'];
  return groups.map((g, i) => ({
    id: `obj-${manifest.id}-${g.id}`,
    title: `Color the ${g.label}`,
    objectId: g.id,
    deadlineSeconds: Math.min(150, 45 + g.regionIds.length * 12),
    bonusPoints: 30,
    iconType: ICONS[i % ICONS.length],
    totalRegions: g.regionIds.filter((rid) => regionsFile.regions.some((r) => r.id === rid)).length,
  }));
}
