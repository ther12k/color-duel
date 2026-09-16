import { Artwork, ArtworkDetailPath, ArtworkRegion, ColorPaletteItem } from '../types/game';

/**
 * Loader for exported artwork asset packs (artwork.json — see the
 * color_duel_vector_region_pack proof for the source schema and contract).
 *
 * The pack schema maps ~1:1 onto the game types:
 *   colorGroupId -> colorIndex   (the displayed number; shared by many regions)
 *   label        -> labelPos + labelFontSize
 *   objectId     -> objectId     (semantic grouping, unrelated to palette)
 *   palette.stops-> palette.stops (gradient paint per group)
 *
 * `paintId`/`zIndex` are accepted but not carried over: the renderer derives
 * paint from palette stops, and draw order is the regions array order (sorted
 * by zIndex here to honor the pack's declared order).
 */

export interface ArtworkAssetLabel {
  x: number;
  y: number;
  fontSize?: number;
}

export interface ArtworkAssetRegion {
  id: string;
  path: string;
  fillRule?: 'nonzero' | 'evenodd';
  colorGroupId: number;
  label: ArtworkAssetLabel;
  objectId: string;
  paintId?: string;
  zIndex?: number;
}

export interface ArtworkAssetPaletteItem {
  id: number;
  name: string;
  swatch: string;
  stops?: Array<[number, string]>;
}

export interface ArtworkAssetDetail {
  regionId?: string;
  path: string;
  strokeWidth?: number;
}

export interface ArtworkAssetJson {
  schemaVersion: string;
  artworkId: string;
  assetVersion?: number;
  title: string;
  purpose?: string;
  coordinateSystem: { viewBox: [number, number, number, number]; origin?: string };
  palette: ArtworkAssetPaletteItem[];
  regions: ArtworkAssetRegion[];
  details?: ArtworkAssetDetail[];
  nonPlayableBackground?: string;
  completionMetric?: string;
  notes?: string[];
}

export interface LoadArtworkOptions {
  category?: Artwork['category'];
  difficulty?: Artwork['difficulty'];
  defaultDurationSeconds?: number;
  likes?: string;
  subtitle?: string;
  isDaily?: boolean;
}

const CANVAS_SIZE = 500;

/**
 * Letterbox fit of an arbitrary viewBox onto the fixed 500x500 duel canvas:
 * one transform applied around all geometry, coordinates untouched. Returns
 * undefined for native 500x500 assets. Shared by every package parser.
 */
export function computeCanvasFit(viewBox: readonly number[]): {
  fitTransform?: string;
  fitParams?: { scale: number; tx: number; ty: number };
} {
  const [vx, vy, vw, vh] = viewBox;
  const scale = CANVAS_SIZE / Math.max(vw, vh);
  const isNativeCanvas = vx === 0 && vy === 0 && vw === CANVAS_SIZE && vh === CANVAS_SIZE;
  if (isNativeCanvas) return {};
  const tx = (CANVAS_SIZE - vw * scale) / 2 - vx * scale;
  const ty = (CANVAS_SIZE - vh * scale) / 2 - vy * scale;
  return {
    fitTransform: `translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${scale.toFixed(4)})`,
    fitParams: { scale, tx, ty },
  };
}

export function loadArtworkAsset(asset: ArtworkAssetJson, opts: LoadArtworkOptions = {}): Artwork {
  const [vx, vy, vw, vh] = asset.coordinateSystem.viewBox;
  const { fitTransform, fitParams } = computeCanvasFit(asset.coordinateSystem.viewBox);

  const palette: ColorPaletteItem[] = asset.palette.map((p) => ({
    number: p.id,
    hex: p.swatch,
    name: p.name,
    stops: p.stops?.map(([offset, color]) => [offset, color] as [number, string]),
  }));

  const regions: ArtworkRegion[] = [...asset.regions]
    .sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0))
    .map((r) => ({
      id: r.id,
      objectId: r.objectId,
      path: r.path,
      colorIndex: r.colorGroupId,
      labelPos: { x: r.label.x, y: r.label.y },
      labelFontSize: r.label.fontSize,
      fillRule: r.fillRule,
    }));

  const details: ArtworkDetailPath[] | undefined = asset.details?.map((d) => ({
    regionId: d.regionId,
    path: d.path,
    strokeWidth: d.strokeWidth,
  }));

  return {
    id: asset.artworkId,
    title: asset.title,
    subtitle: opts.subtitle ?? asset.purpose,
    category: opts.category ?? 'Nature',
    likes: opts.likes ?? '0',
    thumbnail: '', // Vector thumbnails render from regions
    palette,
    regions,
    details,
    objectives: [],
    difficulty: opts.difficulty ?? 'Medium',
    backgroundColor: asset.nonPlayableBackground,
    viewBox: `${vx} ${vy} ${vw} ${vh}`,
    fitTransform,
    fitParams,
    defaultDurationSeconds: opts.defaultDurationSeconds ?? 120,
    isDaily: opts.isDaily,
  };
}
