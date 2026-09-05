export type GameMode =
  | 'smart-duel'
  | 'speed-duel'
  | 'memory-duel'
  | 'palette-puzzle'
  | 'studio';

export interface ColorPaletteItem {
  number: number;
  hex: string;
  name: string;
}

export interface ArtworkRegion {
  id: string;
  objectId: string; // Grouping into meaningful objects (e.g. 'lanterns', 'bowls', 'awning')
  path: string; // SVG path data
  colorIndex: number; // 1-based index matching ColorPaletteItem.number
  labelPos: { x: number; y: number };
  name?: string;
}

export interface BonusObjective {
  id: string;
  title: string;
  objectId: string;
  regionIds?: string[];
  deadlineSeconds: number;
  bonusPoints: number;
  iconType: 'lantern' | 'bowl' | 'awning' | 'dragon' | 'flower' | 'window' | 'star' | 'cup' | 'gem';
  totalRegions: number;
  isCompletedByRival?: boolean;
}

export interface Artwork {
  id: string;
  title: string;
  subtitle?: string;
  category: 'Cozy' | 'Fantasy' | 'Nature' | 'Characters';
  likes: string;
  thumbnail: string;
  palette: ColorPaletteItem[];
  regions: ArtworkRegion[];
  objectives: BonusObjective[];
  difficulty: 'Fewer Details' | 'Medium Details' | 'Larger Regions';
  viewBox: string;
  defaultDurationSeconds: number;
  isDaily?: boolean;
}

export interface DuelOpponent {
  id: string;
  name: string;
  avatar: string;
  level: number;
  isBot: boolean;
  score: number;
  progressPercent: number;
  completedRegionIds: string[];
  completedObjectiveIds: string[];
  mistakes: number;
  accuracy: number;
  strategy: 'objective-focused' | 'speed-focused' | 'balanced';
  speedFactor: number;
}

export interface DuelResult {
  artwork: Artwork;
  mode: GameMode;
  playerScore: number;
  rivalScore: number;
  playerCorrect: number;
  rivalCorrect: number;
  playerBonuses: number;
  rivalBonuses: number;
  playerMistakes: number;
  rivalMistakes: number;
  playerAccuracy: number;
  rivalAccuracy: number;
  playerTimeSeconds: number;
  rivalTimeSeconds: number;
  whyExplanation: string;
  coinsEarned: number;
  arenaPointsEarned: number;
  xpEarned: number;
  isWin: boolean;
  isDraw: boolean;
  rivalName: string;
  rivalAvatar: string;
}

export interface UserProfile {
  name: string;
  avatar: string;
  level: number;
  xp: number;
  xpForNextLevel: number;
  coins: number;
  gems: number;
  arenaPoints: number;
  streakDays: number;
  weeklyGoalCompleted: number;
  weeklyGoalTotal: number;
  matchesPlayed: number;
  matchesWon: number;
  completedArtworkIds: string[];
  unreadNotifications: number;
}

export interface LiveDuelToast {
  id: string;
  message: string;
  avatar: string;
  type: 'rival-objective' | 'rival-fast' | 'rival-close' | 'system';
}
