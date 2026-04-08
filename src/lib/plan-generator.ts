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

/**
 * Session ordering priority:
 * 1. Warm-up
 * 2. Dribbling (ball handling)
 * 3. Shooting / Defense / Footwork / Agility (main work)
 * 4. Conditioning (finisher)
 */
const SESSION_ORDER: Record<DrillCategory, number> = {
  warm_up: 0,
  dribbling: 1,
  shooting: 2,
  footwork: 3,
  defense: 4,
  agility: 5,
  conditioning: 6,
};

// Categories that are ALWAYS included if the user selected them
const ALWAYS_INCLUDE: DrillCategory[] = ['shooting', 'dribbling'];
// Conditioning always goes at the end if selected
const FINISHER: DrillCategory = 'conditioning';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * From the user's selected categories, build a daily focus that:
 * - Always includes shooting & dribbling (if user selected them)
 * - Always includes conditioning at the end (if selected)
 * - Rotates the remaining categories (defense, agility, footwork) across days
 *   so each day feels different
 */
function buildDailyFocusRotation(
  allCategories: DrillCategory[],
  numTrainingDays: number
): DrillCategory[][] {
  const alwaysOn = allCategories.filter(c => ALWAYS_INCLUDE.includes(c) || c === FINISHER);
  const rotating = allCategories.filter(c => !ALWAYS_INCLUDE.includes(c) && c !== FINISHER);

  const rotations: DrillCategory[][] = [];

  for (let dayIdx = 0; dayIdx < numTrainingDays; dayIdx++) {
    const dayFocus: DrillCategory[] = [];

    // Always-on categories first (shooting, dribbling)
    for (const c of alwaysOn) {
      if (c !== FINISHER) dayFocus.push(c);
    }

    // Pick 1-2 rotating categories, cycling through them
    if (rotating.length > 0) {
      // Each day picks a different subset
      const pick1 = rotating[dayIdx % rotating.length];
      dayFocus.push(pick1);
      // If we have enough rotating cats and enough time, add a second
      if (rotating.length > 1 && numTrainingDays <= rotating.length) {
        const pick2 = rotating[(dayIdx + 1) % rotating.length];
        if (pick2 !== pick1) dayFocus.push(pick2);
      }
    }

    // Conditioning always last
    if (allCategories.includes(FINISHER)) {
      dayFocus.push(FINISHER);
    }

    rotations.push(dayFocus);
  }

  return rotations;
}

function pickDrillsForDay(
  categories: DrillCategory[],
  availableDrills: Drill[],
  sessionLengthSec: number
): string[] {
  const picked: string[] = [];
  let remainingTime = sessionLengthSec;

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

  // Fill remaining time
  if (remainingTime > 60) {
    const remaining = shuffle(
      availableDrills.filter(d => categories.includes(d.category) && !picked.includes(d.id))
    );
    for (const drill of remaining) {
      if (remainingTime <= 0) break;
      if (drill.duration <= remainingTime) {
        picked.push(drill.id);
        remainingTime -= drill.duration;
      }
    }
  }

  // Sort by session order: warm_up → dribbling → shooting → defense → conditioning
  picked.sort((a, b) => {
    const drillA = getDrillById(a);
    const drillB = getDrillById(b);
    if (!drillA || !drillB) return 0;
    const orderA = SESSION_ORDER[drillA.category];
    const orderB = SESSION_ORDER[drillB.category];
    if (orderA !== orderB) return orderA - orderB;
    return drillA.difficulty - drillB.difficulty;
  });

  return picked;
}

function addWarmUp(drills: string[], skillLevel: string, sessionLengthSec: number): string[] {
  const warmUps = getWarmUpDrills(skillLevel);
  const warmUpBudget = Math.min(Math.max(Math.floor(sessionLengthSec * 0.1), 180), 600);
  const warmUpIds: string[] = [];
  let warmUpTime = 0;

  for (const wu of shuffle(warmUps)) {
    if (warmUpTime + wu.duration <= warmUpBudget) {
      warmUpIds.push(wu.id);
      warmUpTime += wu.duration;
    }
  }

  return [...warmUpIds, ...drills];
}

/**
 * Ensures form shooting (s1 or s2 fallback) is in the session right after warm-up.
 */
function ensureFormShooting(drills: string[], availableDrills: Drill[]): string[] {
  const FORM_SHOOTING_ID = 's1';
  const FALLBACK_ID = 's2';

  if (drills.includes(FORM_SHOOTING_ID) || drills.includes(FALLBACK_ID)) return drills;

  const drillToInsert = availableDrills.find(d => d.id === FORM_SHOOTING_ID)
    || availableDrills.find(d => d.id === FALLBACK_ID);
  if (!drillToInsert) return drills;

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

  const focusCategories = [...new Set(goals.flatMap(g => GOAL_TO_CATEGORIES[g] || []))];
  if (focusCategories.length === 0) focusCategories.push('shooting', 'dribbling');

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

  const numTrainingDays = trainingDayIndices.length;
  const dailyFocusRotations = buildDailyFocusRotation(focusCategories, numTrainingDays);

  let rotationIdx = 0;
  const days: DayPlan[] = ALL_DAYS.map((day, index) => {
    const isTrainingDay = trainingDayIndices.includes(index);
    if (!isTrainingDay) {
      return { day, focus: [], drills: [], isRestDay: true };
    }

    const dayFocus = dailyFocusRotations[rotationIdx % dailyFocusRotations.length];
    rotationIdx++;

    let drills = pickDrillsForDay(dayFocus, available, sessionSec);
    drills = addWarmUp(drills, skillLevel, sessionSec);
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
