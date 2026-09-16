/**
 * Player progress store. Progress is metadata only — never edited images:
 *   { artworkId -> completedRegionIds, updatedAt, ... }
 * plus a lightweight play log (artworkId -> last played date) that powers the
 * Daily tab's month calendar. Persisted to localStorage; failures (private
 * browsing, quota) degrade silently to in-memory state.
 */

export interface ArtworkProgress {
  artworkId: string;
  completedRegionIds: string[];
  totalRegions: number;
  /** True once every playable region is completed. */
  isComplete: boolean;
  updatedAt: string;
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

export function getProgress(artworkId: string): ArtworkProgress | undefined {
  return load().artworks[artworkId];
}

export function getAllProgress(): Record<string, ArtworkProgress> {
  return load().artworks;
}

export function recordRegionCompleted(
  artworkId: string,
  regionId: string,
  totalRegions: number
): ArtworkProgress {
  const data = load();
  const existing = data.artworks[artworkId];
  const completedRegionIds = existing
    ? existing.completedRegionIds.includes(regionId)
      ? existing.completedRegionIds
      : [...existing.completedRegionIds, regionId]
    : [regionId];
  const progress: ArtworkProgress = {
    artworkId,
    completedRegionIds,
    totalRegions,
    isComplete: completedRegionIds.length >= totalRegions,
    updatedAt: new Date().toISOString(),
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
