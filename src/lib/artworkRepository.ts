import { Artwork, ArtworkVariant, ArtworkDifficulty } from '../types/game';
import { parseArtworkManifest, ArtworkManifest } from './artworkManifest';
import {
  parseVectorPackage,
  VectorArtworkManifest,
  VectorPaletteItem,
  VectorRegionsFile,
  VectorPaintFile,
} from './vectorArtwork';

/**
 * Artwork repository: the single place the app loads puzzles from.
 *
 * The catalog (public/artworks/catalog.json) lists every package. Two vector
 * package kinds are supported:
 *
 *  1. `color-duel-vector-1` — small; regions.json + palette.json load with
 *     the catalog so galleries can render authentic lineart thumbnails.
 *  2. `color-duel-detailed-vector-1` and `color-duel-clean-vector-1` —
 *     hundreds of regions plus a paint.json underpainting. These load as
 *     stubs (manifest + palette only, numbered preview thumbnail) and the
 *     full painting data is fetched when a match starts via
 *     loadArtworkPlayData. Clean-vector packages ship four difficulty
 *     variants per theme under artworks/<theme>/<level>/, sharing the
 *     theme-level paint.json and colored.png via "../" asset paths.
 *
 * Image-reference packages (artwork_manifest.json + PNG previews) are no
 * longer listed in the catalog; the parser below remains for catalogs that
 * still include them.
 *
 * Player progress is never stored in the package; it lives in
 * src/lib/progressStore.ts as artworkId + completedRegionIds metadata.
 */

export interface ArtworkCatalogEntry {
  id: string;
  title: string;
  /** Image-package style: folder containing artwork_manifest.json. */
  folder?: string;
  /** Vector-package style: path to artwork.json. */
  manifest?: string;
  /** Card image (line-art only; finished art stays reveal-only). */
  thumbnail?: string;
  regionCount?: number;
  category?: string;
  /** Fixed challenge level chosen for this artwork design. */
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  /** Optional source variant used when a design has authored density variants. */
  sourceVariant?: string;
  levels?: Array<{
    id: string;
    regionCount?: number;
    paletteCount?: number;
    manifest: string;
  }>;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} not found (${res.status})`);
  return res.json() as Promise<T>;
}

async function loadImagePackage(entry: ArtworkCatalogEntry): Promise<Artwork> {
  const folder = entry.folder!.replace(/^\//, '');
  const manifest = await fetchJson<ArtworkManifest>(`/${folder}/artwork_manifest.json`);

  // Optional region data — when a package ships regions.json it becomes
  // fully playable with no other code changes.
  let regionsJson: { regions?: ArtworkManifest['regions'] } | null = null;
  if (manifest.assets.regions) {
    const rRes = await fetch(`/${folder}/${manifest.assets.regions}`);
    if (rRes.ok) regionsJson = await rRes.json();
  }
  const withRegions = regionsJson?.regions ? { ...manifest, regions: regionsJson.regions } : manifest;

  const artwork = parseArtworkManifest(withRegions, `/${folder}`);
  return entry.difficulty ? { ...artwork, difficulty: entry.difficulty } : artwork;
}

const toDifficulty = (id: string): ArtworkDifficulty => {
  if (id === 'easy') return 'Easy';
  if (id === 'hard' || id === 'master') return 'Hard';
  return 'Medium';
};

async function loadVectorStub(entry: ArtworkCatalogEntry): Promise<Artwork> {
  const manifestPath = entry.manifest!.replace(/^\//, '');
  const folder = manifestPath.replace(/\/artwork\.json$/, '');
  const manifest = await fetchJson<VectorArtworkManifest>(`/${manifestPath}`);
  const palette = await fetchJson<VectorPaletteItem[]>(
    `/${folder}/${manifest.assets.palette ?? 'palette.json'}`
  );
  const variants: ArtworkVariant[] | undefined = entry.levels?.map((level) => ({
    id: level.id,
    difficulty: toDifficulty(level.id),
    manifest: `/${level.manifest}`,
    regionCount: level.regionCount,
    paletteCount: level.paletteCount,
  }));

  const isUnderlay =
    manifest.format === 'color-duel-detailed-vector-1' ||
    manifest.format === 'color-duel-clean-vector-1' ||
    manifest.format === 'color-duel-smooth-partition-1';
  if (!isUnderlay) {
    // Small package: load everything up front so galleries can render
    // region-based lineart thumbnails.
    const regionsFile = await fetchJson<VectorRegionsFile>(
      `/${folder}/${manifest.assets.regions ?? 'regions.json'}`
    );
    return { ...parseVectorPackage(manifest, regionsFile, palette, null, {
      loadOptions: { id: entry.id, title: entry.title, difficulty: entry.difficulty, thumbnail: entry.thumbnail },
    }), variants };
  }

  // Underlay package (detailed + clean-vector): stub now, regions + paint
  // load when a match starts. Clean packs reference ../paint.json and
  // ../colored.png in their theme folder — relative URLs resolve as-is.
  return { ...parseVectorPackage(manifest, null, palette, null, {
    baseUrl: `/${folder}`,
    manifestUrl: `/${manifestPath}`,
    loadOptions: { id: entry.id, title: entry.title, difficulty: entry.difficulty, thumbnail: entry.thumbnail },
  }), variants };
}

/**
 * Fetch a stub artwork's full painting data (regions.json + paint.json).
 * Returns the same artwork instance if nothing needs loading.
 */
export async function loadArtworkPlayData(artwork: Artwork): Promise<Artwork> {
  const urls = artwork.dataUrls;
  if (!urls || !urls.manifest) return artwork;

  const folder = urls.manifest.replace(/\/artwork\.json$/, "").replace(/^\//, "");
  const manifest = await fetchJson<VectorArtworkManifest>(urls.manifest);
  const palette = await fetchJson<VectorPaletteItem[]>(`/${folder}/${manifest.assets.palette ?? "palette.json"}`);

  const [regionsFile, paintFile] = await Promise.all([
    urls.regions ? fetchJson<VectorRegionsFile>(urls.regions) : Promise.resolve(null),
    urls.paint ? fetchJson<VectorPaintFile>(urls.paint) : Promise.resolve(null),
  ]);

  const hydrated = parseVectorPackage(manifest, regionsFile, palette, paintFile, {
    baseUrl: `/${folder}`,
    loadOptions: { id: artwork.id, title: artwork.title, difficulty: artwork.difficulty },
  });
  return hydrated;
}

export async function loadArtworkPack(): Promise<Artwork[]> {
  const catalog = await fetchJson<{ artworks: ArtworkCatalogEntry[] }>('/artworks/catalog.json');

  // Entries load independently: one broken row (a catalog entry whose package
  // files are absent — per-artwork content is a local concern, see
  // .gitignore) is skipped with a warning instead of rejecting the whole
  // gallery, so a catalog + golden-pack clone still plays everything present.
  const settled = await Promise.allSettled(
    catalog.artworks.map(async (entry) => {
      if (entry.manifest) return loadVectorStub(entry);
      return loadImagePackage(entry);
    })
  );
  const parsed: Artwork[] = [];
  settled.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      parsed.push(result.value);
    } else {
      console.warn(
        `[artworks] skipping catalog entry "${catalog.artworks[i]?.id ?? i}":`,
        result.reason instanceof Error ? result.reason.message : result.reason
      );
    }
  });
  return parsed;
}
