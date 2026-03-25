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

/**
 * Ensures form shooting (s1 or s2 fallback) is always the first drill.
 */
function ensureFormShootingFirst(drills: string[], availableDrills: Drill[], sessionLengthSec: number): string[] {
  const FORM_SHOOTING_ID = 's1';
  const FALLBACK_ID = 's2';

  // Check if s1 or s2 is already in the list
  const formIdx = drills.indexOf(FORM_SHOOTING_ID);
  if (formIdx === 0) return drills; // already first

  if (formIdx > 0) {
    // Move it to front
    const result = [...drills];
    result.splice(formIdx, 1);
    result.unshift(FORM_SHOOTING_ID);
    return result;
  }

  // s1 not in list — check if it's available
  const formDrill = availableDrills.find(d => d.id === FORM_SHOOTING_ID);
  const fallbackDrill = availableDrills.find(d => d.id === FALLBACK_ID);
  const drillToInsert = formDrill || fallbackDrill;

  if (!drillToInsert) return drills; // neither available

  // Check if fallback is already there
  const fallbackIdx = drills.indexOf(FALLBACK_ID);
  if (fallbackIdx === 0) return drills;
  if (fallbackIdx > 0) {
    const result = [...drills];
    result.splice(fallbackIdx, 1);
    result.unshift(FALLBACK_ID);
    return result;
  }

  // Insert and trim to fit time budget
  const result = [drillToInsert.id, ...drills];
  let totalTime = result.reduce((sum, id) => {
    const d = getDrillById(id);
    return sum + (d?.duration || 0);
  }, 0);

  while (totalTime > sessionLengthSec && result.length > 1) {
    const removed = result.pop()!;
    const removedDrill = getDrillById(removed);
    totalTime -= removedDrill?.duration || 0;
  }

  return result;
}

export function generateWeeklyPlan(profile: PlayerProfile): WeeklyPlan {
  const { skillLevel, goals, equipment, sessionLength, trainingDays } = profile;
  const sessionSec = sessionLength * 60;

  const focusCategories = [...new Set(goals.flatMap(g => GOAL_TO_CATEGORIES[g] || []))];
  if (focusCategories.length === 0) focusCategories.push('shooting', 'dribbling', 'footwork');

  const available = getFilteredDrills(skillLevel, equipment);

  const trainingDaySet = new Set<DayOfWeek>(trainingDays || []);
  const useCustomDays = trainingDays && trainingDays.length > 0;

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

    const dayIndex = trainingDayIndices.indexOf(index);
    const numFocusPerDay = Math.min(2, focusCategories.length);
    const startCatIndex = (dayIndex * numFocusPerDay) % focusCategories.length;
    const dayFocus: DrillCategory[] = [];
    for (let i = 0; i < numFocusPerDay; i++) {
      dayFocus.push(focusCategories[(startCatIndex + i) % focusCategories.length]);
    }

    let drills = pickDrillsForDay(dayFocus, available, sessionSec);
    // Force form shooting first on every training day
    drills = ensureFormShootingFirst(drills, available, sessionSec);

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
  const dayIndex = (new Date().getDay() + 6) % 7;
  return plan.days[dayIndex] || null;
}
