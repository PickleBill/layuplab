import { PlayerProfile, WeeklyPlan, DayPlan, DayOfWeek, DrillCategory, Drill } from '@/types/app';
import { getFilteredDrills, getDrillById, getWarmUpDrills } from './drills';

const ALL_DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const GOAL_TO_CATEGORIES: Record<string, DrillCategory[]> = {
  shooting: ['shooting'],
  ball_handling: ['dribbling'],
  speed_agility: ['agility', 'footwork'],
  conditioning: ['conditioning'],
  defense: ['defense'],
  overall: ['shooting', 'dribbling', 'footwork', 'conditioning', 'agility', 'defense'],
};

const CATEGORY_PRIORITY: Record<DrillCategory, number> = {
  warm_up: 0,
  shooting: 1,
  footwork: 2,
  dribbling: 3,
  defense: 4,
  agility: 5,
  conditioning: 6,
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

  // Pick drills from ALL categories, distributing time roughly equally
  const timePerCategory = Math.floor(sessionLengthSec / categories.length);

  for (const cat of categories) {
    const catDrills = shuffle(availableDrills.filter(d => d.category === cat));
    let catTime = timePerCategory;
    for (const drill of catDrills) {
      if (catTime <= 0) break;
      if (drill.duration <= catTime && drill.duration <= remainingTime) {
        picked.push(drill.id);
        catTime -= drill.duration;
        remainingTime -= drill.duration;
      }
    }
  }

  // Fill remaining time with any category drills
  if (remainingTime > 60) {
    const remaining = shuffle(availableDrills.filter(d => categories.includes(d.category) && !picked.includes(d.id)));
    for (const drill of remaining) {
      if (remainingTime <= 0) break;
      if (drill.duration <= remainingTime) {
        picked.push(drill.id);
        remainingTime -= drill.duration;
      }
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
 * Prepends warm-up drills to the session.
 */
function addWarmUp(drills: string[], skillLevel: string, sessionLengthSec: number): string[] {
  const warmUps = getWarmUpDrills(skillLevel);
  // Use ~10% of session time for warm-up, min 3 min, max 10 min
  const warmUpBudget = Math.min(Math.max(Math.floor(sessionLengthSec * 0.1), 180), 600);
  const warmUpIds: string[] = [];
  let warmUpTime = 0;

  for (const wu of warmUps) {
    if (warmUpTime + wu.duration <= warmUpBudget) {
      warmUpIds.push(wu.id);
      warmUpTime += wu.duration;
    }
  }

  return [...warmUpIds, ...drills];
}

/**
 * Ensures form shooting (s1 or s2 fallback) is in the session (after warm-up).
 */
function ensureFormShooting(drills: string[], availableDrills: Drill[]): string[] {
  const FORM_SHOOTING_ID = 's1';
  const FALLBACK_ID = 's2';

  if (drills.includes(FORM_SHOOTING_ID) || drills.includes(FALLBACK_ID)) return drills;

  const formDrill = availableDrills.find(d => d.id === FORM_SHOOTING_ID);
  const fallbackDrill = availableDrills.find(d => d.id === FALLBACK_ID);
  const drillToInsert = formDrill || fallbackDrill;
  if (!drillToInsert) return drills;

  // Insert after warm-up drills
  const firstNonWarmUp = drills.findIndex(id => {
    const d = getDrillById(id);
    return d && d.category !== 'warm_up';
  });
  const insertAt = firstNonWarmUp >= 0 ? firstNonWarmUp : drills.length;
  const result = [...drills];
  result.splice(insertAt, 0, drillToInsert.id);
  return result;
}

export function generateWeeklyPlan(profile: PlayerProfile): WeeklyPlan {
  const { skillLevel, goals, equipment, sessionLength, trainingDays } = profile;
  const sessionSec = sessionLength * 60;

  // ALL selected focus categories go into EVERY training day
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

    // ALL focus categories in every session
    const dayFocus = [...focusCategories];

    let drills = pickDrillsForDay(dayFocus, available, sessionSec);
    // Add warm-up before everything
    drills = addWarmUp(drills, skillLevel, sessionSec);
    // Ensure form shooting after warm-up
    drills = ensureFormShooting(drills, available);

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
