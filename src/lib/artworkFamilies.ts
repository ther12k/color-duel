import { Artwork, ArtworkVariant } from '../types/game';

export function artworkFamilyKey(artwork: Artwork): string {
  return artwork.id.replace(/-(easy|normal|hard|master)$/i, '').toLowerCase();
}

export interface ArtworkFamily {
  key: string;
  title: string;
  representative: Artwork;
  variants: Artwork[];
}

export function groupArtworkFamilies(artworks: Artwork[]): ArtworkFamily[] {
  const families = new Map<string, ArtworkFamily>();
  for (const artwork of artworks) {
    const key = artworkFamilyKey(artwork);
    const existing = families.get(key);
    if (!existing) {
      families.set(key, {
        key,
        title: artwork.title,
        representative: artwork,
        variants: variantsForArtwork(artwork),
      });
      continue;
    }
    existing.variants.push(...variantsForArtwork(artwork));
  }
  return [...families.values()];
}

export function variantsForArtwork(artwork: Artwork): Artwork[] {
  const variants = artwork.variants ?? [];
  if (variants.length < 2) return [artwork];
  return variants.map((variant: ArtworkVariant) => ({
    ...artwork,
    id: variant.id,
    difficulty: variant.difficulty,
    dataUrls: { manifest: variant.manifest },
    regions: [],
    palette: [],
    declaredRegionCount: variant.regionCount,
  }));
}
