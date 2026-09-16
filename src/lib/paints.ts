import { Artwork } from '../types/game';

// SVG defs IDs are document-global. Every artwork that renders gradient paints
// must namespace its IDs so multiple SVGs on one page never cross-reference.
export function paintIdFor(artworkId: string, colorIndex: number): string {
  return `paint-${artworkId}-${colorIndex}`;
}

/** Fill value for a finished region: its group gradient when defined, flat hex otherwise. */
export function finishedFillFor(artwork: Artwork, colorIndex: number): string {
  const item = artwork.palette.find((p) => p.number === colorIndex);
  if (item?.stops && item.stops.length >= 2) {
    return `url(#${paintIdFor(artwork.id, colorIndex)})`;
  }
  return item?.hex || '#CBD5E1';
}

export function parseViewBox(viewBox: string | undefined): { x: number; y: number; w: number; h: number } {
  const parts = (viewBox || '0 0 500 500').split(/[\s,]+/).map(Number);
  const [x, y, w, h] = parts;
  if (parts.length !== 4 || [x, y, w, h].some((n) => !Number.isFinite(n)) || w <= 0 || h <= 0) {
    return { x: 0, y: 0, w: 500, h: 500 };
  }
  return { x, y, w, h };
}
