import { GameMode } from '../types/game';

export interface DuelInvite { id: string; artworkId: string; mode: GameMode; difficulty: string; }

export function encodeDuelInvite(invite: DuelInvite): string {
  return btoa(JSON.stringify(invite)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeDuelInvite(value: string): DuelInvite | null {
  try {
    const json = atob(value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4));
    const parsed = JSON.parse(json) as DuelInvite;
    if (!parsed.id || !parsed.artworkId || !parsed.mode || !parsed.difficulty) return null;
    return parsed;
  } catch { return null; }
}

export function inviteUrl(invite: DuelInvite): string {
  const url = new URL(window.location.href);
  url.searchParams.set('duel', encodeDuelInvite(invite));
  return url.toString();
}
