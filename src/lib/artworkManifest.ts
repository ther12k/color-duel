import { Artwork, ColorPaletteItem } from '../types/game';

/**
 * Parser for the `artwork_manifest.json` format used by image-based artwork
 * packages under `public/artworks/<artwork-id>/` (see docs/artwork_schema.json
 * in the sample pack and README.md for the full contract).
 *
 * A package may ship with or without tappable region data:
 *  - With `regions` (regions.svg / regions.json): parsed regions are attached
 *    and the artwork is fully playable (tap-to-fill).
 *  - Without regions (the current sample pack): the artwork renders as an
 *    image-reference preview — numbered lineart + finished master — and the
 *    UI presents it as "preview only" until region paths are authored.
 *
 * Player progress is never stored in the package; it lives in
 * `src/lib/progressStore.ts` as artworkId + completedRegionIds metadata.
 */

export interface ArtworkManifestPaletteItem {
  id: number;
  hex: string;
  name: string;
}

export interface ArtworkManifestRegion {
  id: string;
  /** Closed SVG path data in the manifest's canvas coordinate space. */
  path: string;
  colorGroupId: number;
  label?: { x: number; y: number; fontSize?: number };
  objectId?: string;
}

export interface ArtworkManifest {
  version?: number;
  id: string;
  title: string;
  theme?: string;
  subtitle?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  canvas: { width: number; height: number };
  assets: {
    preview_colored: string;
    preview_numbered: string;
    thumbnail?: string;
    regions?: string;
    linework?: string;
  };
  palette: ArtworkManifestPaletteItem[];
  regions?: ArtworkManifestRegion[];
  regionStorage?: {
    type?: string;
    notes?: string;
    showLabelsUntilFilled?: boolean;
  };
  rendering?: Record<string, unknown>;
}

/** Map free-form manifest themes onto the app's category union. */
function themeToCategory(theme: string | undefined): Artwork['category'] {
  const t = (theme || '').toLowerCase();
  if (t.includes('fantasy') || t.includes('dragon') || t.includes('magic')) return 'Fantasy';
  if (t.includes('cozy')) return 'Cozy';
  if (t.includes('mandala') || t.includes('decorative') || t.includes('masterpiece')) return 'Masterpiece';
  if (t.includes('character') || t.includes('person')) return 'Characters';
  return 'Nature';
}

function hexToName(p: ArtworkManifestPaletteItem): ColorPaletteItem {
  return { number: p.id, hex: p.hex, name: p.name };
}

export function parseArtworkManifest(
  manifest: ArtworkManifest,
  /** Base URL the manifest's relative asset paths resolve against. */
  baseUrl: string
): Artwork {
  if (!manifest?.id || !manifest?.title || !manifest?.canvas || !manifest?.palette) {
    throw new Error('Invalid artwork manifest: missing required id/title/canvas/palette');
  }
  const asset = (p: string) => `${baseUrl.replace(/\/$/, '')}/${p.replace(/^\//, '')}`;

  const regions = (manifest.regions ?? []).map((r) => ({
    id: r.id,
    objectId: r.objectId ?? 'general',
    path: r.path,
    colorIndex: r.colorGroupId,
    labelPos: r.label ? { x: r.label.x, y: r.label.y } : { x: 0, y: 0 },
    labelFontSize: r.label?.fontSize,
  }));

  const artwork: Artwork = {
    id: manifest.id,
    title: manifest.title,
    subtitle: manifest.subtitle ?? manifest.theme,
    category: themeToCategory(manifest.theme),
    likes: '0',
    thumbnail: manifest.assets.thumbnail ? asset(manifest.assets.thumbnail) : '',
    palette: manifest.palette.map(hexToName),
    regions,
    objectives: [],
    difficulty: manifest.difficulty ?? 'Medium',
    viewBox: `0 0 ${manifest.canvas.width} ${manifest.canvas.height}`,
    defaultDurationSeconds: 120,
    imageReference: {
      previewColored: asset(manifest.assets.preview_colored),
      previewNumbered: asset(manifest.assets.preview_numbered),
    },
  };
  return artwork;
}
