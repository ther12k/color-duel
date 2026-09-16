export type GameMode =
  | 'smart-duel'
  | 'speed-duel'
  | 'memory-duel'
  | 'palette-puzzle'
  | 'studio'
  | 'solo';

export type ArtworkDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface ColorPaletteItem {
  number: number;
  hex: string; // Flat fallback color; also the palette swatch color
  name: string;
  // Optional gradient stops [offset 0..1, hex]. When present, filled regions of
  // this group render `url(#paint-<artworkId>-<number>)` instead of flat hex.
  stops?: Array<[number, string]>;
}

export interface ArtworkRegion {
  id: string;
  objectId: string; // Grouping into meaningful objects (e.g. 'lanterns', 'bowls', 'awning')
  path: string; // SVG path data
  colorIndex: number; // 1-based index matching ColorPaletteItem.number
  labelPos: { x: number; y: number };
  name?: string;
  fillRule?: 'nonzero' | 'evenodd'; // How holes/self-overlap in the path are interpreted
  // Artwork-space font size for the number badge. Drives badge radius/font scaling
  // for assets authored in a coordinate space other than the 500x500 canvas.
  labelFontSize?: number;
}

// Decorative linework (veins, hatching, texture strokes) drawn above all region
// fills but below number labels. Never tappable, never counted toward progress.
export interface ArtworkDetailPath {
  id?: string;
  regionId?: string; // Semantic grouping only
  path: string;
  strokeWidth?: number;
  stroke?: string;
  opacity?: number;
}

// Precolored shapes that render in their finished color in every state.
// Purely decorative — excluded from completion progress and never tappable.
export interface ArtworkDecoration {
  id: string;
  path: string;
  colorIndex: number; // Palette entry whose paint (flat or gradient) fills the shape
  fillRule?: 'nonzero' | 'evenodd';
}

// Fine vector painting layer (color-duel-detailed-vector-1). The finished art
// is drawn once below the playable regions; unfilled regions sit on top as
// opaque masks, and completing a region removes its mask — revealing exactly
// that part of the shared underpainting. Never stretched into regions.
export interface UnderpaintingPath {
  fill: string;
  d: string;
  fillRule?: 'nonzero' | 'evenodd';
}

export interface Underpainting {
  paths: UnderpaintingPath[]; // color shapes (below masks)
  inkPaths: UnderpaintingPath[]; // source linework (above masks)
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

export interface ArtworkVariant {
  id: string;
  difficulty: ArtworkDifficulty;
  manifest: string;
  regionCount?: number;
  paletteCount?: number;
}

export interface Artwork {
  id: string;
  title: string;
  subtitle?: string;
  artist?: string;
  category:
    | 'Cozy'
    | 'Fantasy'
    | 'Nature'
    | 'Characters'
    | 'Masterpiece'
    | 'Travel'
    | 'Interior'
    | 'Sci-Fi'
    | 'Mandala'
    | 'Coastal'
    | 'Wildlife'
    | 'Animals'
    | 'Ocean';
  likes: string;
  thumbnail: string;
  palette: ColorPaletteItem[];
  regions: ArtworkRegion[];
  objectives: BonusObjective[];
  difficulty: ArtworkDifficulty;
  paintingStyle?: 'vector' | 'original-painting';
  paintingBackground?: string;
  backgroundColor?: string; // Paper color behind regions (defaults per surface)
  details?: ArtworkDetailPath[];
  decorations?: ArtworkDecoration[];
  // Normalizes non-500x500 assets onto the square duel canvas: an SVG transform
  // attribute applied around all artwork geometry (letterbox fit, coordinates untouched).
  fitTransform?: string;
  // Numeric form of fitTransform (scale/tx/ty applied as x*scale+tx) for code that
  // must map artwork coordinates onto the 500x500 canvas, e.g. locate-target panning.
  fitParams?: { scale: number; tx: number; ty: number };
  // Present for image-based artwork packages without region data (see
  // src/lib/artworkManifest.ts): renders as a preview artwork until region
  // paths are authored. Region-based (playable) artworks leave it undefined.
  imageReference?: { previewColored: string; previewNumbered: string };
  // Colored gallery thumbnail. Fixed clean-vector packs use this for every
  // difficulty because all levels share one master illustration.
  galleryThumbnailUrl?: string;
  // Finished colored master raster from vector packages (assets.coloredPreview).
  // Used on results screen and completed shelf.
  finishedPreviewUrl?: string;
  // Fine vector painting + its URL when paint.json loads lazily (detailed pack).
  underpainting?: Underpainting;
  underpaintingUrl?: string;
  // Lazy play data for stub artworks (regions/paint load when a match starts).
  dataUrls?: { manifest: string; regions?: string; paint?: string };
  // Pack version this content was shipped as (artwork.json `version`). Progress
  // is recorded against it and never applied across versions — see
  // src/lib/progressStore.ts.
  contentVersion?: string;
  /** Authored difficulty variants available for this picture. */
  variants?: ArtworkVariant[];
  declaredRegionCount?: number;
  // Zoom the pack recommends for comfortable play; raises the canvas zoom cap.
  zoomRecommended?: number;
  // Hide a region's number label unless it renders at least this many CSS px.
  labelMinScreenPx?: number;
  // Rendering hints for dense imported line-art packs. These affect strokes only;
  // region geometry and hit testing remain authored by regions.json.
  boundaryStyle?: 'solid' | 'dotted';
  boundaryStrokeWidth?: number;
  boundaryStroke?: string;
  boundaryDasharray?: string;
  labelStrokeWidth?: number;
  labelFontWeight?: number;
  // Artificial subdivision edges (straight bisector cuts in subdivided master
  // partitions). Rendered as a dotted overlay so they read differently from
  // the real contours; never tappable and never part of progress.
  cutPaths?: string[];
  detailNote?: string;
  hiddenPolygonsCount?: number;
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
  starsEarned?: number;
  coloringOrder?: string[];
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
