/**
 * Player progress store. Progress is metadata only — never edited images:
 *   { artworkId -> completedRegionIds, updatedAt, ... }
 * plus a lightweight play log (artworkId -> last played date) that powers the
 * Daily tab's month calendar. Persisted to localStorage; failures (private
 * browsing, quota) degrade silently to in-memory state.
 *
 * Progress identity is (artworkId, contentVersion): a record applies ONLY to
 * the pack version it was played on. When a package ships a new version, its
 * old completion never silently carries over — regions may have been cut,
 * merged or renumbered, so a stale "complete" would be a lie. Reading with a
 * different version yields nothing; writing to a different version starts a
 * fresh record (and replaces the old one — versions move forward).
 */

export interface ArtworkProgress {
  artworkId: string;
  completedRegionIds: string[];
  totalRegions: number;
  /** True once every playable region is completed. */
  isComplete: boolean;
  updatedAt: string;
  /** Pack version this progress was recorded against (undefined = legacy
   *  record from before versioning; it only ever matches unversioned
   *  content). */
  contentVersion?: string;
}

interface ProgressData {
  version: 1;
  artworks: Record<string, ArtworkProgress>;
  /** ISO date (YYYY-MM-DD) of the last session per artwork, for calendars. */
  playDates: Record<string, string>;
}

const STORAGE_KEY = 'color-duel:progress:v1';

function emptyData(): ProgressData {
  return { version: 1, artworks: {}, playDates: {} };
}

function load(): ProgressData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyData();
    const data = JSON.parse(raw) as ProgressData;
    if (data?.version !== 1 || typeof data.artworks !== 'object') return emptyData();
    return data;
  } catch {
    return emptyData();
  }
}

function save(data: ProgressData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* Storage is optional. */
  }
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/** True when `record` belongs to content with the given version. */
function sameVersion(record: ArtworkProgress, contentVersion?: string): boolean {
  return record.contentVersion === (contentVersion ?? undefined);
}

/** Identity-checked read: the record for `artworkId`, but only if it was
 *  recorded against `contentVersion`. A record from any other version (or a
 *  legacy record asked about versioned content) reads as no progress. */
export function getProgress(artworkId: string, contentVersion?: string): ArtworkProgress | undefined {
  const record = load().artworks[artworkId];
  return record && sameVersion(record, contentVersion) ? record : undefined;
}

/** Identity-checked map for catalog consumers: only records matching each
 *  artwork's own content version are returned. */
export function progressMapFor(
  artworks: ReadonlyArray<{ id: string; contentVersion?: string }>
): Record<string, ArtworkProgress> {
  const all = load().artworks;
  const out: Record<string, ArtworkProgress> = {};
  for (const art of artworks) {
    const record = all[art.id];
    if (record && sameVersion(record, art.contentVersion)) out[art.id] = record;
  }
  return out;
}

/** RAW records by artworkId, regardless of content version. Only for
 *  storage-level views (debug/export); gameplay reads must go through
 *  getProgress / progressMapFor so versions cannot be mixed. */
export function getAllProgress(): Record<string, ArtworkProgress> {
  return load().artworks;
}

export function recordRegionCompleted(
  artworkId: string,
  regionId: string,
  totalRegions: number,
  contentVersion?: string
): ArtworkProgress {
  const data = load();
  const existing = data.artworks[artworkId];
  // Progress never crosses content versions: a record from another version
  // does not seed the new content's completion — the new version starts
  // fresh and replaces the old record.
  const carried = existing && sameVersion(existing, contentVersion) ? existing : undefined;
  const completedRegionIds = carried
    ? carried.completedRegionIds.includes(regionId)
      ? carried.completedRegionIds
      : [...carried.completedRegionIds, regionId]
    : [regionId];
  const progress: ArtworkProgress = {
    artworkId,
    completedRegionIds,
    totalRegions,
    isComplete: completedRegionIds.length >= totalRegions,
    updatedAt: new Date().toISOString(),
    ...(contentVersion !== undefined ? { contentVersion } : {}),
  };
  data.artworks[artworkId] = progress;
  data.playDates[artworkId] = todayIso();
  save(data);
  return progress;
}

export function recordSession(artworkId: string): void {
  const data = load();
  data.playDates[artworkId] = todayIso();
  save(data);
}

/** Dates (YYYY-MM-DD) on which any artwork was played, within recent history. */
export function getPlayedDates(): Set<string> {
  return new Set(Object.values(load().playDates));
}

export function clearAllProgress(): void {
  save(emptyData());
}
