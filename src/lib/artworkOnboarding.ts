const KEY = 'color-duel:onboarding:v1';

export function hasSeenArtworkExplanation(): boolean {
  try { return localStorage.getItem(KEY) === 'seen'; } catch { return false; }
}

export function markArtworkExplanationSeen(): void {
  try { localStorage.setItem(KEY, 'seen'); } catch { /* optional storage */ }
}
