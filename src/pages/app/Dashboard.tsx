import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Flame, Dumbbell, Clock, Trophy, ChevronRight, ChevronDown, ChevronUp, MessageSquare, BookOpen, MessageCircle, Video, Target, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { getProfile, getStats, getPlan, getSessions, getCoachStyle, hasBeenWelcomed, setWelcomed, getAnalysisHistory } from "@/lib/storage";
import { getXpProgress, getXpForCurrentLevel, XP_PER_LEVEL } from "@/lib/xp";
import { getTodaysPlan } from "@/lib/plan-generator";
import { getDrillById } from "@/lib/drills";
import { CoachStyle, DayOfWeek } from "@/types/app";

const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu',
  friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
};

const ALL_DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

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
    "Discipline beats motivation every single day. Show up.",
  ],
  lebron: [
    "Every rep counts! Even 10 minutes of form shooting today puts you ahead. 🏀",
    "Build your game systematically. What's your weakest link today?",
    "Small wins stack up. Trust the process.",
  ],
  curry: [
    "Shooting is an art — let's find your rhythm today! 🎯",
    "Remember: I started with form shots too. Keep going!",
    "Have fun out there. The best players love the work.",
  ],
  sir_charles: [
    "That jumper is turrible. Let me fix it. Get to the court!",
    "Stop making excuses. Effort matters!",
    "You know what's turrible? Not practicing. Get out there!",
  ],
  phil: [
    "Focus on your breathing before each shot. The mind leads the body.",
    "Basketball is a dance, not a fight. Find your flow today.",
    "Practice with intention. The strength of your game is built in stillness.",
  ],
};

const Dashboard = () => {
  const navigate = useNavigate();
  const profile = getProfile();
  const stats = getStats();
  const plan = getPlan();
  const todayPlan = plan ? getTodaysPlan(plan) : null;
  const [showWelcome, setShowWelcome] = useState(!hasBeenWelcomed());
  const todayDayIndex = (new Date().getDay() + 6) % 7;
  const [expandedDay, setExpandedDay] = useState<number>(todayDayIndex);
  const [weekPlanOpen, setWeekPlanOpen] = useState(true);

  if (!profile) {
    navigate("/onboarding");
    return null;
  }

  const dismissWelcome = () => { setWelcomed(); setShowWelcome(false); };

  const xpProgress = getXpProgress(stats.xp) * 100;
  const xpCurrent = getXpForCurrentLevel(stats.xp);
  const todayDrills = todayPlan?.drills.map(id => getDrillById(id)).filter(Boolean) || [];
  const totalTodayMin = Math.round(todayDrills.reduce((sum, d) => sum + (d?.duration || 0), 0) / 60);

  const sessions = getSessions();
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const todayStr = new Date().toISOString().split('T')[0];
  const completedToday = sessions.some(s => s.date.startsWith(todayStr));
  const trainingDays = plan?.days.filter(d => !d.isRestDay).length || 0;
  const completedDays = sessions.filter(s => new Date(s.date) >= weekStart).length;

  const coachStyle = getCoachStyle();
  const tips = COACH_TIPS[coachStyle] || COACH_TIPS['kobe'];
  const tipIndex = Math.floor(Date.now() / 86400000) % tips.length;

  const analysisCount = getAnalysisHistory().length;

  // What's Next suggestions
  const suggestions: { emoji: string; text: string; action: () => void }[] = [];
  if (!completedToday && !todayPlan?.isRestDay) {
    suggestions.push({ emoji: '🏀', text: "Start today's workout", action: () => navigate("/app/train") });
  }
  if (analysisCount === 0) {
    suggestions.push({ emoji: '📹', text: "Try AI form analysis — film yourself shooting", action: () => navigate("/app/analyze") });
  }
  if (stats.totalDrillsCompleted < 5) {
    suggestions.push({ emoji: '📚', text: "Explore the drill library", action: () => navigate("/app/drills") });
  }
  suggestions.push({ emoji: '🎯', text: "Practice form shooting → all pros do it daily", action: () => navigate("/app/train") });

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-4">
      {/* Player Card — compact */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="relative rounded-lg border border-border bg-card p-4 glow-orange-border overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center shrink-0">
              <span className="font-display font-extrabold text-base text-primary">
                {profile.username.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-display font-extrabold text-lg text-foreground truncate">{profile.username}</h1>
                <Badge variant="outline" className="border-primary/30 text-primary font-display text-[10px] shrink-0">
                  {stats.levelTitle}
                </Badge>
                {stats.currentStreak > 0 && (
                  <span className="flex items-center gap-0.5 text-xs shrink-0">
                    <Flame size={12} className="text-primary" />
                    <span className="text-primary font-bold font-display">{stats.currentStreak}</span>
                  </span>
                )}
              </div>
              <div className="mt-1.5">
                <div className="flex justify-between text-[10px] text-muted-foreground font-body">
                  <span>{xpCurrent} / {XP_PER_LEVEL} XP</span>
                  <span>Lvl {stats.level + 1}</span>
                </div>
                <Progress value={xpProgress} className="h-1.5 mt-0.5" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* First-Time Welcome Guide */}
      {showWelcome && (
        <motion.div className="rounded-lg border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-display font-bold text-sm text-foreground">Welcome, {profile.username}! 🏀</h2>
            <button onClick={dismissWelcome} className="text-muted-foreground hover:text-foreground"><X size={14} /></button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { emoji: '🏀', label: 'Start Workout', action: () => { dismissWelcome(); navigate("/app/train"); } },
              { icon: BookOpen, label: 'Drill Library', action: () => { dismissWelcome(); navigate("/app/drills"); } },
              { icon: MessageCircle, label: 'Ask Coach', action: () => { dismissWelcome(); document.querySelector<HTMLButtonElement>('[data-coach-btn]')?.click(); } },
            ].map((item, i) => (
              <button key={i} onClick={item.action} className="flex flex-col items-center gap-1.5 p-3 rounded-md border border-border bg-card hover:border-primary/30 transition-all text-center">
                {'emoji' in item ? <span className="text-lg">{item.emoji}</span> : <item.icon size={18} className="text-primary" />}
                <span className="font-display font-bold text-[10px] text-foreground">{item.label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Weekly Plan — Inline Collapsible */}
      {plan && (
        <motion.div className="rounded-lg border border-border bg-card overflow-hidden" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.08 }}>
          <button onClick={() => setWeekPlanOpen(!weekPlanOpen)} className="w-full flex items-center justify-between p-3 hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-2">
              <p className="font-display font-bold text-sm text-foreground">This Week</p>
              <Badge variant="outline" className="text-[10px] font-body">{completedDays}/{trainingDays} days</Badge>
            </div>
            {weekPlanOpen ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
          </button>

          {weekPlanOpen && (
            <div className="px-3 pb-3 space-y-2">
              {/* Day row */}
              <div className="flex gap-1">
                {ALL_DAYS.map((day, i) => {
                  const dayPlan = plan.days[i];
                  const isToday = i === todayDayIndex;
                  const isRest = dayPlan?.isRestDay;
                  const isExpanded = expandedDay === i;
                  return (
                    <button
                      key={day}
                      onClick={() => setExpandedDay(isExpanded ? -1 : i)}
                      className={`flex-1 py-1.5 rounded text-[10px] font-display font-bold transition-all ${
                        isToday
                          ? 'bg-primary text-primary-foreground ring-2 ring-primary/30'
                          : isRest
                            ? 'bg-muted/30 text-muted-foreground'
                            : isExpanded
                              ? 'bg-primary/10 text-primary border border-primary/20'
                              : 'bg-muted/50 text-foreground hover:bg-muted'
                      }`}
                    >
                      {DAY_LABELS[day]}
                    </button>
                  );
                })}
              </div>

              {/* Expanded day drills */}
              {expandedDay >= 0 && expandedDay < 7 && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-1">
                  {plan.days[expandedDay]?.isRestDay ? (
                    <div className="text-center py-3">
                      <p className="text-xs text-muted-foreground font-body">😴 Rest day — but pros still do form shooting</p>
                      <Button variant="ghost" size="sm" className="text-xs text-primary mt-1" onClick={() => navigate("/app/train")}>
                        Quick Form Shooting →
                      </Button>
                    </div>
                  ) : (
                    <>
                      {plan.days[expandedDay]?.drills.slice(0, 5).map(id => {
                        const drill = getDrillById(id);
                        if (!drill) return null;
                        return (
                          <div key={id} className="flex items-center gap-2 px-2 py-1.5 rounded bg-muted/20 text-xs">
                            <Badge variant="secondary" className="text-[8px] uppercase font-display shrink-0">{drill.category}</Badge>
                            <span className="font-body text-foreground flex-1 truncate">{drill.name}</span>
                            <span className="text-muted-foreground font-body shrink-0">{Math.round(drill.duration / 60)}m</span>
                          </div>
                        );
                      })}
                      {(plan.days[expandedDay]?.drills.length || 0) > 5 && (
                        <p className="text-[10px] text-muted-foreground text-center">+{(plan.days[expandedDay]?.drills.length || 0) - 5} more</p>
                      )}
                    </>
                  )}
                </motion.div>
              )}

              <Button variant="ghost" size="sm" className="w-full text-xs text-primary" onClick={() => navigate("/app/plan")}>
                View Full Plan →
              </Button>
            </div>
          )}
        </motion.div>
      )}

      {/* Stats Row */}
      <motion.div className="grid grid-cols-4 gap-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
        {[
          { icon: Dumbbell, label: 'Drills', value: stats.totalDrillsCompleted },
          { icon: Clock, label: 'Minutes', value: stats.totalTrainingMinutes },
          { icon: Flame, label: 'Streak', value: stats.longestStreak },
          { icon: Trophy, label: 'Badges', value: stats.achievements.length },
        ].map(stat => (
          <div key={stat.label} className="rounded-lg border border-border bg-card p-3 text-center">
            <stat.icon size={16} className="mx-auto text-primary mb-1" />
            <p className="font-display font-extrabold text-xl text-foreground">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground font-body">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Context-Aware Primary CTA */}
      <motion.div className="rounded-lg border border-border bg-card p-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}>
        {completedToday ? (
          <div className="text-center space-y-3">
            <p className="text-3xl">🎉</p>
            <p className="font-display font-bold text-foreground">Great work today!</p>
            <p className="text-xs text-muted-foreground font-body">Keep the momentum going:</p>
            <div className="flex gap-2 justify-center flex-wrap">
              <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => navigate("/app/analyze")}>
                <Video size={14} /> Analyze Form
              </Button>
              <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => navigate("/app/drills")}>
                <BookOpen size={14} /> Browse Drills
              </Button>
              <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => document.querySelector<HTMLButtonElement>('[data-coach-btn]')?.click()}>
                <MessageCircle size={14} /> Chat Coach
              </Button>
            </div>
          </div>
        ) : todayPlan?.isRestDay ? (
          <div className="text-center space-y-2">
            <p className="text-3xl">😴</p>
            <p className="font-display font-bold text-foreground">Rest Day</p>
            <p className="text-xs text-muted-foreground font-body">Recovery is part of the game — but pros still do form shooting.</p>
            <Button variant="hero" size="sm" className="mt-2" onClick={() => navigate("/app/train")}>
              Quick Form Shooting Session 🎯
            </Button>
          </div>
        ) : todayDrills.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-bold text-sm text-foreground">Today's Workout</h2>
              <Badge variant="outline" className="text-[10px] font-body">{totalTodayMin} min • {todayDrills.length} drills</Badge>
            </div>
            <div className="space-y-1.5">
              {todayDrills.slice(0, 3).map(drill => drill && (
                <div key={drill.id} className="flex items-center gap-2 p-2 rounded bg-muted/30 border border-border/50">
                  <Badge variant="secondary" className="text-[8px] uppercase font-display">{drill.category}</Badge>
                  <span className="font-body text-xs text-foreground flex-1 truncate">{drill.name}</span>
                  <span className="text-[10px] text-muted-foreground font-body">{Math.round(drill.duration / 60)}m</span>
                </div>
              ))}
              {todayDrills.length > 3 && (
                <p className="text-[10px] text-muted-foreground font-body text-center">+{todayDrills.length - 3} more drills</p>
              )}
            </div>
            <Button variant="hero" className="w-full mt-3" onClick={() => navigate("/app/train")}>
              Start Workout <ChevronRight size={16} />
            </Button>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground font-body text-sm">No drills planned today.</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => navigate("/app/plan")}>Check Plan</Button>
          </div>
        )}
      </motion.div>

      {/* Coach's Tip with form shooting CTA */}
      <motion.div className="rounded-lg border border-primary/20 bg-primary/5 p-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
        <div className="flex items-start gap-2">
          <MessageSquare size={16} className="text-primary mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-display font-bold text-xs text-foreground mb-0.5">
              Coach's Tip
              <span className="text-[10px] text-muted-foreground font-body ml-1.5">
                ({coachStyle === 'kobe' ? 'Kobe' : coachStyle === 'lebron' ? 'LeBron' : coachStyle === 'curry' ? 'Curry' : coachStyle === 'sir_charles' ? 'Barkley' : 'Phil'})
              </span>
            </p>
            <p className="text-xs text-muted-foreground font-body">{tips[tipIndex]}</p>
            <button onClick={() => navigate("/app/train")} className="text-[10px] text-primary font-body mt-1 hover:underline">
              Practice form shooting →
            </button>
          </div>
        </div>
      </motion.div>

      {/* What's Next */}
      {!showWelcome && suggestions.length > 0 && (
        <motion.div className="rounded-lg border border-border bg-card p-3 space-y-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.25 }}>
          <p className="font-display font-bold text-xs text-foreground">What's Next</p>
          {suggestions.slice(0, 3).map((s, i) => (
            <button key={i} onClick={s.action} className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-muted/30 transition-colors text-left">
              <span className="text-sm">{s.emoji}</span>
              <span className="text-xs font-body text-foreground">{s.text}</span>
              <ChevronRight size={12} className="text-muted-foreground ml-auto" />
            </button>
          ))}
        </motion.div>
      )}

      {/* Recent Achievements */}
      {stats.achievements.length > 0 && (
        <motion.div className="rounded-lg border border-border bg-card p-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.3 }}>
          <h2 className="font-display font-bold text-sm text-foreground mb-3">Achievements</h2>
          <div className="flex gap-3 flex-wrap">
            {stats.achievements.slice(-4).map(id => {
              const ach = ACHIEVEMENTS_MAP[id];
              return ach ? (
                <div key={id} className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-muted/30 border border-border/50">
                  <span className="text-base">{ach.icon}</span>
                  <span className="text-xs font-body text-foreground">{ach.title}</span>
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
