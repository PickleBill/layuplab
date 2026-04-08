import { PlayerProfile, PlayerStats, WeeklyPlan, WorkoutSession, DailyChallenge, DrillCategory, LevelTitle, AnalysisRecord, CoachStyle, DrillSession } from '@/types/app';
import { getLevelFromXp, getLevelTitle, calculateDrillXp } from './xp';
import { syncProfileToCloud, syncStatsToCloud, syncFavoritesToCloud, syncSessionToCloud, syncPlanToCloud } from './cloud-sync';

const KEYS = {
  profile: 'layuplab_profile',
  stats: 'layuplab_stats',
  plan: 'layuplab_plan',
  sessions: 'layuplab_sessions',
  challenges: 'layuplab_challenges',
  analysisHistory: 'layuplab_analysis_history',
  favorites: 'layuplab_favorites',
  completedToday: 'layuplab_completed_today',
} as const;

function get<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function set<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// Profile
export function getProfile(): PlayerProfile | null {
  return get<PlayerProfile>(KEYS.profile);
}

export function saveProfile(profile: PlayerProfile): void {
  set(KEYS.profile, profile);
  syncProfileToCloud(profile).catch(() => {});
}

export function getCoachStyle(): CoachStyle {
  return getProfile()?.coachStyle || 'kobe';
}

// Stats
export function getDefaultStats(): PlayerStats {
  return {
    xp: 0, level: 1, levelTitle: 'Rookie' as LevelTitle,
    currentStreak: 0, longestStreak: 0,
    totalDrillsCompleted: 0, totalTrainingMinutes: 0,
    lastWorkoutDate: null,
    skillRatings: { shooting: 10, dribbling: 10, footwork: 10, conditioning: 10, agility: 10, defense: 10, warm_up: 10 },
    achievements: [],
  };
}

export function getStats(): PlayerStats {
  return get<PlayerStats>(KEYS.stats) || getDefaultStats();
}

export function saveStats(stats: PlayerStats): void {
  set(KEYS.stats, stats);
  syncStatsToCloud(stats).catch(() => {});
}

export function addXp(amount: number): PlayerStats {
  const stats = getStats();
  stats.xp += amount;
  stats.level = getLevelFromXp(stats.xp);
  stats.levelTitle = getLevelTitle(stats.level);
  saveStats(stats);
  return stats;
}

export function updateStreak(): PlayerStats {
  const stats = getStats();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (stats.lastWorkoutDate === today) return stats;

  if (stats.lastWorkoutDate === yesterday) {
    stats.currentStreak += 1;
  } else {
    stats.currentStreak = 1;
  }
  stats.longestStreak = Math.max(stats.longestStreak, stats.currentStreak);
  stats.lastWorkoutDate = today;
  saveStats(stats);
  return stats;
}

export function updateSkillRating(category: DrillCategory, delta: number): void {
  const stats = getStats();
  stats.skillRatings[category] = Math.min(100, Math.max(0, stats.skillRatings[category] + delta));
  saveStats(stats);
}

export function addAchievement(id: string): PlayerStats {
  const stats = getStats();
  if (!stats.achievements.includes(id)) {
    stats.achievements.push(id);
    saveStats(stats);
  }
  return stats;
}

// Unified Drill Completion — used by Train, DrillLibrary, Challenges
export function completeDrillAction(drillId: string, durationSeconds: number, category: DrillCategory, rating?: 'easy' | 'good' | 'hard'): { xpEarned: number; stats: PlayerStats } {
  const stats = getStats();
  const xpEarned = calculateDrillXp(stats.currentStreak);

  // Add XP
  stats.xp += xpEarned;
  stats.level = getLevelFromXp(stats.xp);
  stats.levelTitle = getLevelTitle(stats.level);

  // Update stats
  stats.totalDrillsCompleted += 1;
  stats.totalTrainingMinutes += Math.max(1, Math.round(durationSeconds / 60));

  // Skill rating adjustment
  if (rating) {
    const delta = rating === 'easy' ? 3 : rating === 'good' ? 1 : -1;
    stats.skillRatings[category] = Math.min(100, Math.max(0, stats.skillRatings[category] + delta));
  }

  // Update streak
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (stats.lastWorkoutDate !== today) {
    if (stats.lastWorkoutDate === yesterday) {
      stats.currentStreak += 1;
    } else {
      stats.currentStreak = 1;
    }
    stats.longestStreak = Math.max(stats.longestStreak, stats.currentStreak);
    stats.lastWorkoutDate = today;
  }

  saveStats(stats);

  // Save drill session
  const session: DrillSession = {
    drillId,
    completedAt: new Date().toISOString(),
    rating: rating || 'good',
    duration: durationSeconds,
  };
  const sessions = getSessions();
  // Find or create today's workout session
  const todaySession = sessions.find(s => s.date.startsWith(today));
  if (todaySession) {
    todaySession.drills.push(session);
    todaySession.totalXpEarned += xpEarned;
    set(KEYS.sessions, sessions);
  } else {
    const workout: WorkoutSession = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      drills: [session],
      totalXpEarned: xpEarned,
      completed: false,
    };
    sessions.push(workout);
    set(KEYS.sessions, sessions);
  }

  // Check achievements
  if (stats.totalDrillsCompleted >= 1 && !stats.achievements.includes('first_workout')) {
    addAchievement('first_workout');
  }
  if (stats.totalDrillsCompleted >= 10 && !stats.achievements.includes('drills_10')) {
    addAchievement('drills_10');
  }
  if (stats.totalDrillsCompleted >= 50 && !stats.achievements.includes('drills_50')) {
    addAchievement('drills_50');
  }
  if (stats.totalDrillsCompleted >= 100 && !stats.achievements.includes('drills_100')) {
    addAchievement('drills_100');
  }
  if (stats.currentStreak >= 7 && !stats.achievements.includes('streak_7')) {
    addAchievement('streak_7');
  }
  if (stats.totalTrainingMinutes >= 60 && !stats.achievements.includes('minutes_60')) {
    addAchievement('minutes_60');
  }
  if (stats.totalTrainingMinutes >= 300 && !stats.achievements.includes('minutes_300')) {
    addAchievement('minutes_300');
  }

  // Track completed today
  markCompletedToday(drillId);

  return { xpEarned, stats: getStats() };
}

// Favorites
export function getFavorites(): string[] {
  return get<string[]>(KEYS.favorites) || [];
}

export function toggleFavorite(drillId: string): string[] {
  const favs = getFavorites();
  const idx = favs.indexOf(drillId);
  if (idx >= 0) {
    favs.splice(idx, 1);
  } else {
    favs.push(drillId);
  }
  set(KEYS.favorites, favs);
  syncFavoritesToCloud(favs).catch(() => {});
  return favs;
}

// Completed Today
export function getCompletedToday(): string[] {
  const data = get<{ date: string; ids: string[] }>(KEYS.completedToday);
  const today = new Date().toISOString().split('T')[0];
  if (data?.date === today) return data.ids;
  return [];
}

function markCompletedToday(drillId: string): void {
  const today = new Date().toISOString().split('T')[0];
  const ids = getCompletedToday();
  if (!ids.includes(drillId)) {
    ids.push(drillId);
  }
  set(KEYS.completedToday, { date: today, ids });
}

// Plan
export function getPlan(): WeeklyPlan | null {
  return get<WeeklyPlan>(KEYS.plan);
}

export function savePlan(plan: WeeklyPlan): void {
  set(KEYS.plan, plan);
  syncPlanToCloud(plan).catch(() => {});
}

// Sessions
export function getSessions(): WorkoutSession[] {
  return get<WorkoutSession[]>(KEYS.sessions) || [];
}

export function saveSession(session: WorkoutSession): void {
  const sessions = getSessions();
  sessions.push(session);
  set(KEYS.sessions, sessions);
}

// Challenges
export function getChallenges(): DailyChallenge[] {
  return get<DailyChallenge[]>(KEYS.challenges) || [];
}

export function saveChallenges(challenges: DailyChallenge[]): void {
  set(KEYS.challenges, challenges);
}

// Analysis History
export function getAnalysisHistory(): AnalysisRecord[] {
  return get<AnalysisRecord[]>(KEYS.analysisHistory) || [];
}

export function saveAnalysisRecord(record: AnalysisRecord): void {
  const history = getAnalysisHistory();
  history.unshift(record);
  if (history.length > 20) history.length = 20;
  set(KEYS.analysisHistory, history);
}

export function hasCompletedOnboarding(): boolean {
  return getProfile() !== null;
}

export function hasDetailedProfile(): boolean {
  const p = getProfile();
  if (!p) return false;
  return !(p.goals.length === 1 && p.goals[0] === 'overall' && p.equipment.length === 1 && p.equipment[0] === 'none');
}

export function hasBeenWelcomed(): boolean {
  return localStorage.getItem('layuplab_welcomed') === 'true';
}

export function setWelcomed(): void {
  localStorage.setItem('layuplab_welcomed', 'true');
}

export function resetAllData(): void {
  Object.values(KEYS).forEach(k => localStorage.removeItem(k));
  localStorage.removeItem('layuplab_welcomed');
}
