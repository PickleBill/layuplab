import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Flame, Dumbbell, Clock, Trophy, ChevronRight, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { getProfile, getStats, getPlan, getSessions, getCoachStyle } from "@/lib/storage";
import { getXpProgress, getXpForCurrentLevel, XP_PER_LEVEL } from "@/lib/xp";
import { getTodaysPlan } from "@/lib/plan-generator";
import { getDrillById } from "@/lib/drills";
import { CoachStyle } from "@/types/app";

const ACHIEVEMENTS_MAP: Record<string, { title: string; icon: string }> = {
  first_workout: { title: 'First Workout', icon: '🏀' },
  streak_7: { title: '7-Day Streak', icon: '🔥' },
  drills_100: { title: '100 Drills', icon: '💯' },
  level_5: { title: 'Level 5', icon: '⭐' },
};

const COACH_TIPS: Record<CoachStyle, string[]> = {
  kobe: [
    "No excuses today. Get to the court and put in the work. Form shooting first — always.",
    "You think one workout is enough? Do it again. Mamba Mentality.",
    "I used to start at 4am. What time are you starting?",
    "Discipline beats motivation every single day. Show up.",
  ],
  lebron: [
    "Every rep counts! Even 10 minutes of form shooting today puts you ahead of yesterday. 🏀",
    "Build your game systematically. What's your weakest link today?",
    "Small wins stack up. Trust the process and watch yourself level up.",
    "Recovery is just as important as the grind. Take care of your body.",
  ],
  curry: [
    "Shooting is an art — let's find your rhythm today! 🎯",
    "Remember: I started with form shots too. Keep going!",
    "Have fun out there. The best players love the work.",
    "One more rep. One more shot. That's how you change the game.",
  ],
  sir_charles: [
    "That jumper is turrible. Let me fix it. Get to the court!",
    "I was the Round Mound of Rebound and I still outworked everyone. Your turn.",
    "Stop making excuses. Even I made the Hall of Fame without a ring. Effort matters!",
    "You know what's turrible? Not practicing. Get out there!",
  ],
  phil: [
    "Focus on your breathing before each shot. The mind leads the body.",
    "Basketball is a dance, not a fight. Find your flow today.",
    "The strength of your game is built in moments of stillness. Practice with intention.",
    "Footwork tip: Your pivot foot placement determines your entire shot mechanics. Start there.",
  ],
};

const Dashboard = () => {
  const navigate = useNavigate();
  const profile = getProfile();
  const stats = getStats();
  const plan = getPlan();
  const todayPlan = plan ? getTodaysPlan(plan) : null;

  if (!profile) {
    navigate("/onboarding");
    return null;
  }

  const xpProgress = getXpProgress(stats.xp) * 100;
  const xpCurrent = getXpForCurrentLevel(stats.xp);
  const todayDrills = todayPlan?.drills.map(id => getDrillById(id)).filter(Boolean) || [];
  const totalTodayMin = Math.round(todayDrills.reduce((sum, d) => sum + (d?.duration || 0), 0) / 60);

  // Weekly progress — real calculation
  const trainingDays = plan?.days.filter(d => !d.isRestDay).length || 0;
  const sessions = getSessions();
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const completedDays = sessions.filter(s => new Date(s.date) >= weekStart).length;

  // Coach tip
  const coachStyle = getCoachStyle();
  const tips = COACH_TIPS[coachStyle];
  const tipIndex = Math.floor(Date.now() / 86400000) % tips.length; // rotates daily

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        {/* Player Card */}
        <div className="relative rounded-lg border border-border bg-card p-6 glow-orange-border overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
              <span className="font-display font-extrabold text-xl text-primary">
                {profile.username.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h1 className="font-display font-extrabold text-2xl text-foreground">{profile.username}</h1>
              <div className="flex items-center gap-3 mt-1">
                <Badge variant="outline" className="border-primary/30 text-primary font-display text-xs">
                  {stats.levelTitle}
                </Badge>
                <span className="text-sm text-muted-foreground font-body">Level {stats.level}</span>
                {stats.currentStreak > 0 && (
                  <span className="flex items-center gap-1 text-sm font-body">
                    <Flame size={14} className="text-primary" />
                    <span className="text-primary font-bold">{stats.currentStreak}</span>
                  </span>
                )}
              </div>
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground font-body">
                  <span>{xpCurrent} / {XP_PER_LEVEL} XP</span>
                  <span>Level {stats.level + 1}</span>
                </div>
                <Progress value={xpProgress} className="h-2" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Coach's Tip */}
      <motion.div
        className="rounded-lg border border-primary/20 bg-primary/5 p-4 flex items-start gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
      >
        <MessageSquare size={20} className="text-primary mt-0.5 shrink-0" />
        <div>
          <p className="font-display font-bold text-sm text-foreground mb-1">
            Coach's Tip
            <span className="text-xs text-muted-foreground font-body ml-2">
              ({coachStyle === 'motivator' ? 'The Motivator' : coachStyle === 'drill_sergeant' ? 'The Drill Sergeant' : 'The Technician'})
            </span>
          </p>
          <p className="text-sm text-muted-foreground font-body">{tips[tipIndex]}</p>
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {[
          { icon: Dumbbell, label: 'Drills Done', value: stats.totalDrillsCompleted },
          { icon: Clock, label: 'Minutes', value: stats.totalTrainingMinutes },
          { icon: Flame, label: 'Best Streak', value: stats.longestStreak },
          { icon: Trophy, label: 'Achievements', value: stats.achievements.length },
        ].map(stat => (
          <div key={stat.label} className="rounded-lg border border-border bg-card p-4 text-center">
            <stat.icon size={20} className="mx-auto text-primary mb-2" />
            <p className="font-display font-extrabold text-2xl text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground font-body">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Weekly Progress */}
      <motion.div
        className="rounded-lg border border-border bg-card p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        <div className="flex items-center justify-between">
          <p className="font-display font-bold text-sm text-foreground">This Week</p>
          <Badge variant="outline" className="text-xs font-body">
            {completedDays}/{trainingDays} days
          </Badge>
        </div>
        <Progress value={trainingDays > 0 ? (completedDays / trainingDays) * 100 : 0} className="h-2 mt-2" />
      </motion.div>

      {/* Today's Workout */}
      <motion.div
        className="rounded-lg border border-border bg-card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-lg text-foreground">Today's Workout</h2>
          {todayPlan && !todayPlan.isRestDay && (
            <Badge variant="outline" className="text-xs font-body">
              {totalTodayMin} min • {todayDrills.length} drills
            </Badge>
          )}
        </div>

        {todayPlan?.isRestDay ? (
          <div className="text-center py-8">
            <p className="text-4xl mb-2">😴</p>
            <p className="font-display font-bold text-foreground">Rest Day</p>
            <p className="text-sm text-muted-foreground font-body">Recovery is part of the game. Come back stronger tomorrow.</p>
          </div>
        ) : todayDrills.length > 0 ? (
          <div className="space-y-2">
            {todayDrills.slice(0, 4).map(drill => drill && (
              <div key={drill.id} className="flex items-center gap-3 p-3 rounded-md bg-muted/30 border border-border/50">
                <Badge variant="secondary" className="text-[10px] uppercase font-display">
                  {drill.category}
                </Badge>
                <span className="font-body text-sm text-foreground flex-1">{drill.name}</span>
                <span className="text-xs text-muted-foreground font-body">{Math.round(drill.duration / 60)}m</span>
              </div>
            ))}
            {todayDrills.length > 4 && (
              <p className="text-xs text-muted-foreground font-body text-center">+{todayDrills.length - 4} more drills</p>
            )}
            <Button variant="hero" className="w-full mt-4" onClick={() => navigate("/app/train")}>
              Start Workout <ChevronRight size={16} />
            </Button>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground font-body">No drills planned for today.</p>
          </div>
        )}
      </motion.div>

      {/* Recent Achievements */}
      {stats.achievements.length > 0 && (
        <motion.div
          className="rounded-lg border border-border bg-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <h2 className="font-display font-bold text-lg text-foreground mb-4">Achievements</h2>
          <div className="flex gap-4 flex-wrap">
            {stats.achievements.slice(-4).map(id => {
              const ach = ACHIEVEMENTS_MAP[id];
              return ach ? (
                <div key={id} className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/30 border border-border/50">
                  <span className="text-lg">{ach.icon}</span>
                  <span className="text-sm font-body text-foreground">{ach.title}</span>
                </div>
              ) : null;
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;
