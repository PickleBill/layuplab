import { PlayerProfile, WeeklyPlan, DayPlan, DayOfWeek, DrillCategory, Drill } from '@/types/app';
import { getFilteredDrills } from './drills';

const ALL_DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const GOAL_TO_CATEGORIES: Record<string, DrillCategory[]> = {
  shooting: ['shooting'],
  ball_handling: ['dribbling'],
  speed_agility: ['agility', 'footwork'],
  conditioning: ['conditioning'],
  overall: ['shooting', 'dribbling', 'footwork', 'conditioning', 'agility'],
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
  return picked;
}

export function generateWeeklyPlan(profile: PlayerProfile): WeeklyPlan {
  const { skillLevel, goals, equipment, daysPerWeek, sessionLength } = profile;
  const sessionSec = sessionLength * 60;

  // Get all categories the player cares about
  const focusCategories = [...new Set(goals.flatMap(g => GOAL_TO_CATEGORIES[g] || []))];
  if (focusCategories.length === 0) focusCategories.push('shooting', 'dribbling', 'footwork');

  // Get available drills
  const available = getFilteredDrills(skillLevel, equipment);

  // Spread training days evenly
  const trainingDayIndices: number[] = [];
  const gap = Math.floor(7 / daysPerWeek);
  for (let i = 0; i < daysPerWeek; i++) {
    trainingDayIndices.push(Math.min((i * gap) + (i > 0 ? 1 : 0), 6));
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
