import { supabase } from "@/integrations/supabase/client";
import { PlayerProfile, PlayerStats, WorkoutSession, WeeklyPlan } from "@/types/app";
import { getDefaultStats } from "./storage";

// Check if user is authenticated
export async function getAuthUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// ===== PLAYER PROFILE =====

export async function syncProfileToCloud(profile: PlayerProfile) {
  const user = await getAuthUser();
  if (!user) return;

  await supabase.from("player_profiles").upsert({
    user_id: user.id,
    username: profile.username,
    skill_level: profile.skillLevel,
    commitment_level: profile.commitmentLevel,
    coach_style: profile.coachStyle,
    tier: profile.tier,
    goals: profile.goals,
    equipment: profile.equipment,
    days_per_week: profile.daysPerWeek,
    training_days: profile.trainingDays || null,
    session_length: profile.sessionLength,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id" });
}

export async function loadProfileFromCloud(): Promise<PlayerProfile | null> {
  const user = await getAuthUser();
  if (!user) return null;

  const { data } = await supabase.from("player_profiles").select("*").eq("user_id", user.id).maybeSingle();
  if (!data) return null;

  return {
    username: data.username,
    skillLevel: data.skill_level as any,
    commitmentLevel: data.commitment_level as any,
    coachStyle: data.coach_style as any,
    tier: data.tier as any,
    goals: data.goals as any[],
    equipment: data.equipment as any[],
    daysPerWeek: data.days_per_week,
    trainingDays: data.training_days as any[] || undefined,
    sessionLength: data.session_length,
    createdAt: data.created_at,
  };
}

// ===== PLAYER STATS =====

export async function syncStatsToCloud(stats: PlayerStats) {
  const user = await getAuthUser();
  if (!user) return;

  await supabase.from("player_stats").upsert({
    user_id: user.id,
    xp: stats.xp,
    level: stats.level,
    level_title: stats.levelTitle,
    current_streak: stats.currentStreak,
    longest_streak: stats.longestStreak,
    total_drills_completed: stats.totalDrillsCompleted,
    total_training_minutes: stats.totalTrainingMinutes,
    last_workout_date: stats.lastWorkoutDate,
    skill_ratings: stats.skillRatings,
    achievements: stats.achievements,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id" });
}

export async function loadStatsFromCloud(): Promise<PlayerStats | null> {
  const user = await getAuthUser();
  if (!user) return null;

  const { data } = await supabase.from("player_stats").select("*").eq("user_id", user.id).maybeSingle();
  if (!data) return null;

  return {
    xp: data.xp,
    level: data.level,
    levelTitle: data.level_title as any,
    currentStreak: data.current_streak,
    longestStreak: data.longest_streak,
    totalDrillsCompleted: data.total_drills_completed,
    totalTrainingMinutes: data.total_training_minutes,
    lastWorkoutDate: data.last_workout_date,
    skillRatings: data.skill_ratings as any,
    achievements: data.achievements,
  };
}

// ===== FAVORITES =====

export async function syncFavoritesToCloud(favorites: string[]) {
  const user = await getAuthUser();
  if (!user) return;

  // Delete existing and re-insert
  await supabase.from("favorites").delete().eq("user_id", user.id);
  if (favorites.length > 0) {
    await supabase.from("favorites").insert(
      favorites.map(drillId => ({ user_id: user.id, drill_id: drillId }))
    );
  }
}

export async function loadFavoritesFromCloud(): Promise<string[]> {
  const user = await getAuthUser();
  if (!user) return [];

  const { data } = await supabase.from("favorites").select("drill_id").eq("user_id", user.id);
  return data?.map(r => r.drill_id) || [];
}

// ===== SESSIONS =====

export async function syncSessionToCloud(session: WorkoutSession) {
  const user = await getAuthUser();
  if (!user) return;

  await supabase.from("workout_sessions").insert({
    user_id: user.id,
    date: session.date,
    drills: session.drills as any,
    total_xp_earned: session.totalXpEarned,
    completed: session.completed,
  });
}

export async function loadSessionsFromCloud(): Promise<WorkoutSession[]> {
  const user = await getAuthUser();
  if (!user) return [];

  const { data } = await supabase.from("workout_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  return (data || []).map(s => ({
    id: s.id,
    date: s.date,
    drills: s.drills as any[],
    totalXpEarned: s.total_xp_earned,
    completed: s.completed,
  }));
}

// ===== WEEKLY PLAN =====

export async function syncPlanToCloud(plan: WeeklyPlan) {
  const user = await getAuthUser();
  if (!user) return;

  // Upsert latest plan
  await supabase.from("weekly_plans").upsert({
    user_id: user.id,
    week_of: plan.weekOf,
    days: plan.days as any,
    generated_at: plan.generatedAt,
  }, { onConflict: "user_id" });
}

export async function loadPlanFromCloud(): Promise<WeeklyPlan | null> {
  const user = await getAuthUser();
  if (!user) return null;

  const { data } = await supabase.from("weekly_plans")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;

  return {
    id: data.id,
    weekOf: data.week_of,
    days: data.days as any[],
    generatedAt: data.generated_at,
  };
}

// ===== DRILL RECOMMENDATIONS =====

export async function loadRecommendationsFromCloud() {
  const user = await getAuthUser();
  if (!user) return null;

  const { data } = await supabase.from("drill_recommendations")
    .select("*")
    .eq("user_id", user.id)
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;

  return {
    recommendations: data.recommendations as any[],
    reasoning: data.reasoning,
    generatedAt: data.generated_at,
    expiresAt: data.expires_at,
  };
}

export async function requestDrillRecommendations() {
  const { data, error } = await supabase.functions.invoke("drill-recommender");
  if (error) throw error;
  return data;
}

// ===== FULL SYNC: localStorage → Cloud =====

export async function pushLocalDataToCloud() {
  const user = await getAuthUser();
  if (!user) return;

  // Import storage functions dynamically to avoid circular deps
  const { getProfile, getStats, getSessions, getFavorites, getPlan } = await import("./storage");

  const profile = getProfile();
  const stats = getStats();
  const sessions = getSessions();
  const favorites = getFavorites();
  const plan = getPlan();

  if (profile) await syncProfileToCloud(profile);
  if (stats.xp > 0) await syncStatsToCloud(stats);
  if (favorites.length > 0) await syncFavoritesToCloud(favorites);
  if (plan) await syncPlanToCloud(plan);

  // Sync sessions (only recent ones)
  for (const session of sessions.slice(0, 20)) {
    await syncSessionToCloud(session);
  }
}

// ===== FULL SYNC: Cloud → localStorage =====

export async function pullCloudDataToLocal() {
  const { saveProfile, saveStats, savePlan } = await import("./storage");

  const [profile, stats, plan] = await Promise.all([
    loadProfileFromCloud(),
    loadStatsFromCloud(),
    loadPlanFromCloud(),
  ]);

  if (profile) saveProfile(profile);
  if (stats) saveStats(stats);
  if (plan) savePlan(plan);

  return { profile, stats, plan };
}
