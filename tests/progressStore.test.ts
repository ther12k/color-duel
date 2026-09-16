/**
 * Progress identity regression (reviewer contract: "never silently reuse
 * region completion across versions"). localStorage is shimmed with a Map —
 * the store reads it lazily on every call, so installing it at module scope
 * is enough.
 */
import { beforeEach, describe, expect, test } from 'bun:test';

const backing = new Map<string, string>();
(globalThis as Record<string, unknown>).localStorage = {
  getItem: (k: string) => backing.get(k) ?? null,
  setItem: (k: string, v: string) => void backing.set(k, v),
  removeItem: (k: string) => void backing.delete(k),
  clear: () => backing.clear(),
};

import {
  clearAllProgress,
  getAllProgress,
  getProgress,
  progressMapFor,
  recordRegionCompleted,
} from '../src/lib/progressStore';

const ID = 'pack-a';

describe('progressStore version identity', () => {
  beforeEach(() => clearAllProgress());

  test('records and reads on the SAME version round-trip', () => {
    recordRegionCompleted(ID, 'r-1', 3, '1.0.0');
    recordRegionCompleted(ID, 'r-2', 3, '1.0.0');
    const p = getProgress(ID, '1.0.0');
    expect(p?.completedRegionIds).toEqual(['r-1', 'r-2']);
    expect(p?.isComplete).toBe(false);
    expect(p?.contentVersion).toBe('1.0.0');
  });

  test('reading with another version is non-destructive: the v1 record stays intact', () => {
    // Complete every region of version 1…
    recordRegionCompleted(ID, 'r-1', 2, '1.0.0');
    const done = recordRegionCompleted(ID, 'r-2', 2, '1.0.0');
    expect(done.isComplete).toBe(true);
    // …the pack re-ships as version 2: the same artworkId reads as UNTOUCHED,
    // and merely READING (no play yet) neither resurrects nor clobbers v1.
    expect(getProgress(ID, '2.0.0')).toBeUndefined();
    expect(getProgress(ID, '1.0.0')?.isComplete).toBe(true);
  });

  test('writing on the new version starts fresh (forward-only: v1 slot is replaced)', () => {
    recordRegionCompleted(ID, 'r-1', 2, '1.0.0');
    recordRegionCompleted(ID, 'r-2', 2, '1.0.0'); // v1 complete

    const v2 = recordRegionCompleted(ID, 'r-1', 2, '2.0.0');
    // v2 has ONLY its own region — the v1 completion did not leak in…
    expect(v2.completedRegionIds).toEqual(['r-1']);
    expect(v2.isComplete).toBe(false);
    // …and the storage slot now belongs to v2 (versions move forward).
    expect(getProgress(ID, '1.0.0')).toBeUndefined();
  });

  test('legacy unversioned records match only unversioned content', () => {
    recordRegionCompleted(ID, 'r-1', 2); // pre-versioning record
    expect(getProgress(ID)).toBeDefined();
    expect(getProgress(ID, '1.0.0')).toBeUndefined();
    // A versioned write replaces the legacy record; once the record is
    // versioned, an unversioned read yields nothing.
    recordRegionCompleted(ID, 'r-2', 2, '1.0.0');
    expect(getProgress(ID)).toBeUndefined();
    expect(getProgress(ID, '1.0.0')?.completedRegionIds).toEqual(['r-2']);
  });

  test('reading a versioned record without a version yields nothing', () => {
    recordRegionCompleted(ID, 'r-1', 1, '1.0.0');
    expect(getProgress(ID)).toBeUndefined();
  });

  test('progressMapFor returns only records matching each artwork version', () => {
    recordRegionCompleted('old-art', 'r-1', 1, '1.0.0');
    recordRegionCompleted('new-art', 'r-1', 1, '2.0.0');
    const map = progressMapFor([
      { id: 'old-art', contentVersion: '1.0.0' },
      { id: 'new-art', contentVersion: '2.0.0' },
    ]);
    expect(map['old-art']?.contentVersion).toBe('1.0.0');
    expect(map['new-art']?.contentVersion).toBe('2.0.0');
    // The same id asked about ANOTHER version gets no record — a re-shipped
    // pack never sees the old version's work.
    const remap = progressMapFor([{ id: 'old-art', contentVersion: '2.0.0' }]);
    expect(remap['old-art']).toBeUndefined();
  });

  test('getAllProgress stays the raw storage view (both versions visible)', () => {
    recordRegionCompleted(ID, 'r-1', 1, '1.0.0');
    recordRegionCompleted(ID, 'r-1', 1, '2.0.0');
    expect(Object.keys(getAllProgress())).toEqual([ID]);
  });

  test('free-color paint rides with its region and survives later same-version writes', () => {
    recordRegionCompleted(ID, 'r-1', 3, '1.0.0', { customColor: '#B4D4AA' });
    const p = getProgress(ID, '1.0.0');
    expect(p?.customRegionColors).toEqual({ 'r-1': '#B4D4AA' });
    // A different region completed later must not drop the earlier paint…
    recordRegionCompleted(ID, 'r-2', 3, '1.0.0');
    expect(getProgress(ID, '1.0.0')?.customRegionColors).toEqual({ 'r-1': '#B4D4AA' });
    // …and a repaint of the same region overrides it.
    recordRegionCompleted(ID, 'r-1', 3, '1.0.0', { customColor: '#FF8800' });
    expect(getProgress(ID, '1.0.0')?.customRegionColors).toEqual({ 'r-1': '#FF8800' });
  });

  test('free-color paints never cross a content version (same identity contract)', () => {
    recordRegionCompleted(ID, 'r-1', 2, '1.0.0', { customColor: '#B4D4AA' });
    // The re-shipped version starts fresh: no completion AND no paint leak.
    const v2 = recordRegionCompleted(ID, 'r-1', 2, '2.0.0');
    expect(v2.customRegionColors).toBeUndefined();
    expect(v2.completedRegionIds).toEqual(['r-1']);
  });

  test('number-mode writes add no customRegionColors key at all', () => {
    recordRegionCompleted(ID, 'r-1', 1, '1.0.0');
    expect(getProgress(ID, '1.0.0')).not.toHaveProperty('customRegionColors');
  });
});
