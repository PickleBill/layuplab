import { LevelTitle } from '@/types/app';

export const XP_PER_DRILL = 10;
export const XP_PER_WORKOUT = 50;
export const XP_PER_CHALLENGE = 100;
export const XP_PER_LEVEL = 500;
export const STREAK_MULTIPLIER = 0.1; // 10% bonus per streak day, capped at 50%

export const LEVEL_TITLES: LevelTitle[] = ['Rookie', 'Starter', 'Varsity', 'All-Star', 'MVP', 'Elite'];

export function getLevelFromXp(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

export function getLevelTitle(level: number): LevelTitle {
  const index = Math.min(Math.floor((level - 1) / 2), LEVEL_TITLES.length - 1);
  return LEVEL_TITLES[index];
}

export function getXpForCurrentLevel(xp: number): number {
  return xp % XP_PER_LEVEL;
}

export function getXpProgress(xp: number): number {
  return (xp % XP_PER_LEVEL) / XP_PER_LEVEL;
}

export function calculateStreakBonus(streak: number): number {
  return Math.min(streak * STREAK_MULTIPLIER, 0.5);
}

export function calculateDrillXp(streak: number): number {
  const bonus = calculateStreakBonus(streak);
  return Math.round(XP_PER_DRILL * (1 + bonus));
}

export function calculateWorkoutXp(drillCount: number, streak: number): number {
  const bonus = calculateStreakBonus(streak);
  const drillXp = drillCount * XP_PER_DRILL;
  return Math.round((drillXp + XP_PER_WORKOUT) * (1 + bonus));
}
