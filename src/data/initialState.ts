import { DuelOpponent, UserProfile } from '../types/game';

export const INITIAL_USER_PROFILE: UserProfile = {
  name: 'Elena',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
  level: 12,
  xp: 320,
  xpForNextLevel: 500,
  coins: 2540,
  gems: 120,
  arenaPoints: 415,
  streakDays: 7,
  weeklyGoalCompleted: 3,
  weeklyGoalTotal: 5,
  matchesPlayed: 24,
  matchesWon: 18,
  completedArtworkIds: ['best-friends', 'moonlit-castle'],
  unreadNotifications: 3,
};

export const RIVAL_PROFILES: DuelOpponent[] = [
  {
    id: 'rival-alex',
    name: 'Alex',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=160&auto=format&fit=crop&q=80',
    level: 12,
    isBot: true,
    score: 0,
    progressPercent: 0,
    completedRegionIds: [],
    completedObjectiveIds: [],
    mistakes: 1,
    accuracy: 97,
    strategy: 'speed-focused', // Alex colors regions quickly one-by-one, might miss early bonus deadlines!
    speedFactor: 1.15,
  },
  {
    id: 'rival-maya',
    name: 'Maya',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=160&auto=format&fit=crop&q=80',
    level: 11,
    isBot: true,
    score: 0,
    progressPercent: 0,
    completedRegionIds: [],
    completedObjectiveIds: [],
    mistakes: 2,
    accuracy: 96,
    strategy: 'objective-focused',
    speedFactor: 0.95,
  },
  {
    id: 'rival-leo',
    name: 'Leo',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
    level: 13,
    isBot: true,
    score: 0,
    progressPercent: 0,
    completedRegionIds: [],
    completedObjectiveIds: [],
    mistakes: 0,
    accuracy: 99,
    strategy: 'balanced',
    speedFactor: 1.05,
  },
];

export const INITIAL_RIVALS = RIVAL_PROFILES;
