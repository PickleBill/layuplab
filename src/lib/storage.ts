import { PlayerProfile, PlayerStats, WeeklyPlan, WorkoutSession, DailyChallenge, DrillCategory, LevelTitle, AnalysisRecord, CoachStyle } from '@/types/app';
import { getLevelFromXp, getLevelTitle } from './xp';

const KEYS = {
  profile: 'layuplab_profile',
  stats: 'layuplab_stats',
  plan: 'layuplab_plan',
  sessions: 'layuplab_sessions',
  challenges: 'layuplab_challenges',
  analysisHistory: 'layuplab_analysis_history',
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
    skillRatings: { shooting: 10, dribbling: 10, footwork: 10, conditioning: 10, agility: 10 },
    achievements: [],
  };
}

export function getStats(): PlayerStats {
  return get<PlayerStats>(KEYS.stats) || getDefaultStats();
}

export function saveStats(stats: PlayerStats): void {
  set(KEYS.stats, stats);
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

// Plan
export function getPlan(): WeeklyPlan | null {
  return get<WeeklyPlan>(KEYS.plan);
}

export function savePlan(plan: WeeklyPlan): void {
  set(KEYS.plan, plan);
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
