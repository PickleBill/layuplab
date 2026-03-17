export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export type Goal = 'shooting' | 'ball_handling' | 'speed_agility' | 'conditioning' | 'overall';

export type Equipment = 'hoop' | 'cones' | 'resistance_band' | 'jump_rope' | 'none';

export type DrillCategory = 'shooting' | 'dribbling' | 'footwork' | 'conditioning' | 'agility';

export type Difficulty = 1 | 2 | 3; // 1=easy, 2=medium, 3=hard

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export type LevelTitle = 'Rookie' | 'Starter' | 'Varsity' | 'All-Star' | 'MVP' | 'Elite';

export interface Drill {
  id: string;
  name: string;
  category: DrillCategory;
  difficulty: Difficulty;
  duration: number; // seconds
  reps?: number;
  equipment: Equipment[];
  description: string;
  tip: string;
  skillLevel: SkillLevel[];
  videoUrl?: string;
}

export interface PlayerProfile {
  username: string;
  skillLevel: SkillLevel;
  goals: Goal[];
  equipment: Equipment[];
  daysPerWeek: number;
  trainingDays?: DayOfWeek[];
  sessionLength: 30 | 45 | 60;
  createdAt: string;
}

export interface PlayerStats {
  xp: number;
  level: number;
  levelTitle: LevelTitle;
  currentStreak: number;
  longestStreak: number;
  totalDrillsCompleted: number;
  totalTrainingMinutes: number;
  lastWorkoutDate: string | null;
  skillRatings: Record<DrillCategory, number>; // 0-100
  achievements: string[];
}

export interface DrillSession {
  drillId: string;
  completedAt: string;
  rating: 'easy' | 'good' | 'hard';
  duration: number; // actual seconds spent
}

export interface DayPlan {
  day: DayOfWeek;
  focus: DrillCategory[];
  drills: string[]; // drill IDs
  isRestDay: boolean;
}

export interface WeeklyPlan {
  id: string;
  weekOf: string; // ISO date of Monday
  days: DayPlan[];
  generatedAt: string;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  category: DrillCategory;
  target: number; // reps or seconds
  xpReward: number;
  date: string;
  completed: boolean;
}

export interface WorkoutSession {
  id: string;
  date: string;
  drills: DrillSession[];
  totalXpEarned: number;
  completed: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface AnalysisRecord {
  id: string;
  date: string;
  analysisType: 'shooting' | 'dribbling' | 'footwork';
  thumbnailDataUrl: string;
  overallScore: number;
  summary: string;
  strengths: string[];
  corrections: { area: string; issue: string; fix: string; priority: 'high' | 'medium' | 'low' }[];
  drillRecommendations: string[];
  detailedNotes: string;
}
