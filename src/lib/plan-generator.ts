import { PlayerProfile, WeeklyPlan, DayPlan, DayOfWeek, DrillCategory, Drill } from '@/types/app';
import { getFilteredDrills, getDrillById } from './drills';

const ALL_DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const GOAL_TO_CATEGORIES: Record<string, DrillCategory[]> = {
  shooting: ['shooting'],
  ball_handling: ['dribbling'],
  speed_agility: ['agility', 'footwork'],
  conditioning: ['conditioning'],
  overall: ['shooting', 'dribbling', 'footwork', 'conditioning', 'agility'],
};

// Priority order for sorting drills within a day: shooting first, then footwork, dribbling, agility, conditioning
const CATEGORY_PRIORITY: Record<DrillCategory, number> = {
  shooting: 0,
  footwork: 1,
  dribbling: 2,
  agility: 3,
  conditioning: 4,
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickDrillsForDay(
  categories: DrillCategory[],
  availableDrills: Drill[],
  sessionLengthSec: number
): string[] {
  const picked: string[] = [];
  let remainingTime = sessionLengthSec;
  const shuffled = shuffle(availableDrills.filter(d => categories.includes(d.category)));

  for (const drill of shuffled) {
    if (remainingTime <= 0) break;
    if (drill.duration <= remainingTime) {
      picked.push(drill.id);
      remainingTime -= drill.duration;
    }
  }

  // Sort picked drills: shooting first (lowest difficulty first within shooting), then by category priority
  picked.sort((a, b) => {
    const drillA = getDrillById(a);
    const drillB = getDrillById(b);
    if (!drillA || !drillB) return 0;
    const catPriorityA = CATEGORY_PRIORITY[drillA.category];
    const catPriorityB = CATEGORY_PRIORITY[drillB.category];
    if (catPriorityA !== catPriorityB) return catPriorityA - catPriorityB;
    return drillA.difficulty - drillB.difficulty;
  });

  return picked;
}

export function generateWeeklyPlan(profile: PlayerProfile): WeeklyPlan {
  const { skillLevel, goals, equipment, sessionLength, trainingDays } = profile;
  const sessionSec = sessionLength * 60;

  // Get all categories the player cares about
  const focusCategories = [...new Set(goals.flatMap(g => GOAL_TO_CATEGORIES[g] || []))];
  if (focusCategories.length === 0) focusCategories.push('shooting', 'dribbling', 'footwork');

  // Get available drills
  const available = getFilteredDrills(skillLevel, equipment);

  // Determine which days are training days
  const trainingDaySet = new Set<DayOfWeek>(trainingDays || []);
  const useCustomDays = trainingDays && trainingDays.length > 0;

  // Fallback: auto-distribute if no custom days
  let trainingDayIndices: number[] = [];
  if (useCustomDays) {
    trainingDayIndices = ALL_DAYS
      .map((day, idx) => trainingDaySet.has(day) ? idx : -1)
      .filter(i => i >= 0);
  } else {
    const daysPerWeek = profile.daysPerWeek || 4;
    const gap = Math.floor(7 / daysPerWeek);
    for (let i = 0; i < daysPerWeek; i++) {
      trainingDayIndices.push(Math.min((i * gap) + (i > 0 ? 1 : 0), 6));
    }
  }

  const days: DayPlan[] = ALL_DAYS.map((day, index) => {
    const isTrainingDay = trainingDayIndices.includes(index);
    if (!isTrainingDay) {
      return { day, focus: [], drills: [], isRestDay: true };
    }

    // Rotate focus categories across training days
    const dayIndex = trainingDayIndices.indexOf(index);
    const numFocusPerDay = Math.min(2, focusCategories.length);
    const startCatIndex = (dayIndex * numFocusPerDay) % focusCategories.length;
    const dayFocus: DrillCategory[] = [];
    for (let i = 0; i < numFocusPerDay; i++) {
      dayFocus.push(focusCategories[(startCatIndex + i) % focusCategories.length]);
    }

    const drills = pickDrillsForDay(dayFocus, available, sessionSec);

    return { day, focus: dayFocus, drills, isRestDay: false };
  });

  const monday = new Date();
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));

  return {
    id: crypto.randomUUID(),
    weekOf: monday.toISOString().split('T')[0],
    days,
    generatedAt: new Date().toISOString(),
  };
}

export function getTodaysPlan(plan: WeeklyPlan): DayPlan | null {
  const dayIndex = (new Date().getDay() + 6) % 7; // 0=Mon
  return plan.days[dayIndex] || null;
}
