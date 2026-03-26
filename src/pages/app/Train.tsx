import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Play, Pause, SkipForward, Check, ChevronRight, Lightbulb, ArrowLeft, Video, Zap, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { getPlan, getStats, saveStats, saveSession, updateStreak, addXp, updateSkillRating, addAchievement, completeDrillAction } from "@/lib/storage";
import { getTodaysPlan } from "@/lib/plan-generator";
import { getDrillById } from "@/lib/drills";
import { calculateWorkoutXp, calculateDrillXp } from "@/lib/xp";
import { Drill, DrillSession, WorkoutSession } from "@/types/app";

type TrainState = 'overview' | 'countdown' | 'active' | 'rate' | 'summary';

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:v=|\/)([\w-]{11})/);
  return match ? match[1] : null;
}

const Train = () => {
  const navigate = useNavigate();
  const plan = getPlan();
  const todayPlan = plan ? getTodaysPlan(plan) : null;
  const drills = todayPlan?.drills.map(id => getDrillById(id)).filter(Boolean) as Drill[] || [];

  const [state, setState] = useState<TrainState>('overview');
  const [currentDrillIndex, setCurrentDrillIndex] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [elapsed, setElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [completedDrills, setCompletedDrills] = useState<DrillSession[]>([]);
  const [showTip, setShowTip] = useState(false);
  const [videoDrill, setVideoDrill] = useState<Drill | null>(null);
  const [sessionXp, setSessionXp] = useState(0);

  const currentDrill = drills[currentDrillIndex];
  const drillProgress = currentDrill ? Math.min((elapsed / currentDrill.duration) * 100, 100) : 0;

  // Countdown timer
  useEffect(() => {
    if (state !== 'countdown') return;
    if (countdown <= 0) {
      setState('active');
      setElapsed(0);
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [state, countdown]);

  // Active timer
  useEffect(() => {
    if (state !== 'active' || isPaused) return;
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, [state, isPaused]);

  const startDrill = () => {
    setCountdown(3);
    setElapsed(0);
    setIsPaused(false);
    setShowTip(false);
    setState('countdown');
  };

  const completeDrill = () => setState('rate');

  const goBack = () => {
    if (state === 'rate') {
      setState('active');
      return;
    }
    if (currentDrillIndex > 0) {
      setCurrentDrillIndex(i => i - 1);
      setState('overview');
    }
  };

  const rateDrill = (rating: 'easy' | 'good' | 'hard') => {
    if (!currentDrill) return;

    // Use unified completion
    const { xpEarned } = completeDrillAction(currentDrill.id, elapsed, currentDrill.category, rating);
    setSessionXp(prev => prev + xpEarned);

    toast(`+${xpEarned} XP ⚡`, { description: currentDrill.name });

    const session: DrillSession = {
      drillId: currentDrill.id,
      completedAt: new Date().toISOString(),
      rating,
      duration: elapsed,
    };
    setCompletedDrills(prev => [...prev, session]);

    if (currentDrillIndex < drills.length - 1) {
      setCurrentDrillIndex(i => i + 1);
      startDrill();
    } else {
      setState('summary');
    }
  };

  const skipDrill = () => {
    if (currentDrillIndex < drills.length - 1) {
      setCurrentDrillIndex(i => i + 1);
      startDrill();
    } else {
      setState('summary');
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const getYouTubeEmbedUrl = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  if (todayPlan?.isRestDay) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center py-20">
        <p className="text-6xl mb-4">😴</p>
        <h1 className="font-display font-extrabold text-3xl text-foreground mb-2">Rest Day</h1>
        <p className="text-muted-foreground font-body mb-8">Your body needs recovery. Come back tomorrow ready to dominate.</p>
        <Button variant="outline" onClick={() => navigate("/app/dashboard")}>Back to Dashboard</Button>
      </div>
    );
  }

  if (drills.length === 0) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center py-20">
        <p className="text-muted-foreground font-body">No drills for today. Check your weekly plan.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/app/plan")}>View Plan</Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Video Demo Dialog */}
      <Dialog open={!!videoDrill} onOpenChange={() => setVideoDrill(null)}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="font-display font-bold">{videoDrill?.name} — Demo</DialogTitle>
          </DialogHeader>
          {videoDrill?.videoUrl && (
            <div className="aspect-video w-full">
              <iframe
                src={getYouTubeEmbedUrl(videoDrill.videoUrl) || ''}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={`${videoDrill.name} demo video`}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Running XP Counter */}
      {(state === 'active' || state === 'rate' || state === 'countdown') && sessionXp > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-2 right-4 z-40 bg-primary/90 text-primary-foreground px-3 py-1 rounded-full flex items-center gap-1 text-sm font-display font-bold shadow-lg"
        >
          <Zap size={14} /> {sessionXp} XP
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {/* OVERVIEW */}
        {state === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex items-center gap-3 mb-6">
              <Button variant="ghost" size="icon" onClick={() => navigate("/app/dashboard")}>
                <ArrowLeft size={18} />
              </Button>
              <h1 className="font-display font-extrabold text-2xl text-foreground">Today's Drills</h1>
              {sessionXp > 0 && (
                <Badge className="ml-auto bg-primary/20 text-primary font-display gap-1">
                  <Zap size={12} /> {sessionXp} XP
                </Badge>
              )}
            </div>
            <div className="space-y-3">
              {drills.map((drill, i) => {
                const videoId = drill.videoUrl ? getYouTubeId(drill.videoUrl) : null;
                const isDone = completedDrills.some(d => d.drillId === drill.id);
                return (
                  <div key={drill.id} className={`flex items-center gap-3 p-4 rounded-lg border bg-card ${isDone ? 'border-accent/40 bg-accent/5' : 'border-border'}`}>
                    {videoId ? (
                      <button onClick={() => setVideoDrill(drill)} className="relative w-16 h-12 rounded overflow-hidden shrink-0 group">
                        <img src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <Play size={12} className="text-white" />
                        </div>
                      </button>
                    ) : (
                      <span className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-display font-bold text-sm text-primary shrink-0">
                        {i + 1}
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-body font-medium text-foreground">{drill.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="secondary" className="text-[10px] uppercase font-display">{drill.category}</Badge>
                        <span className="text-xs text-muted-foreground font-body">{Math.round(drill.duration / 60)} min</span>
                      </div>
                    </div>
                    {isDone && <Check size={16} className="text-accent shrink-0" />}
                  </div>
                );
              })}
            </div>
            <Button variant="hero" className="w-full mt-6" onClick={startDrill}>
              {completedDrills.length > 0 ? 'Continue Workout' : 'Start Workout'} <ChevronRight size={16} />
            </Button>
          </motion.div>
        )}

        {/* COUNTDOWN */}
        {state === 'countdown' && (
          <motion.div key="countdown" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center py-20">
            <p className="text-muted-foreground font-body mb-2">Get Ready</p>
            <p className="font-display font-extrabold text-8xl text-primary">{countdown}</p>
            <p className="font-display font-bold text-xl text-foreground mt-4">{currentDrill?.name}</p>
          </motion.div>
        )}

        {/* ACTIVE DRILL */}
        {state === 'active' && currentDrill && (
          <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="text-center mb-6">
              <p className="text-xs text-muted-foreground font-body uppercase tracking-wider">
                Drill {currentDrillIndex + 1} of {drills.length}
              </p>
              <h2 className="font-display font-extrabold text-2xl text-foreground mt-1">{currentDrill.name}</h2>
              <Badge variant="secondary" className="mt-2 text-xs uppercase font-display">{currentDrill.category}</Badge>
            </div>

            {/* Timer */}
            <div className="relative w-48 h-48 mx-auto mb-8">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
                <circle
                  cx="50" cy="50" r="45" fill="none"
                  stroke="hsl(var(--primary))" strokeWidth="4"
                  strokeDasharray={`${drillProgress * 2.83} 283`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="font-display font-extrabold text-4xl text-foreground">{formatTime(elapsed)}</p>
                <p className="text-xs text-muted-foreground font-body">/ {formatTime(currentDrill.duration)}</p>
              </div>
            </div>

            {currentDrill.reps && (
              <p className="text-center text-muted-foreground font-body mb-6">Target: {currentDrill.reps} reps</p>
            )}

            {/* Tip */}
            <AnimatePresence>
              {showTip && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 p-4 rounded-lg border border-primary/20 bg-primary/5"
                >
                  <div className="flex items-start gap-2">
                    <Lightbulb size={16} className="text-primary mt-0.5 shrink-0" />
                    <p className="text-sm text-foreground font-body">{currentDrill.tip}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Controls */}
            <div className="flex justify-center gap-3 flex-wrap">
              {currentDrillIndex > 0 && (
                <Button variant="outline" size="icon" onClick={goBack} title="Previous drill">
                  <ChevronLeft size={18} />
                </Button>
              )}
              {currentDrill.videoUrl && (
                <Button variant="outline" size="icon" onClick={() => { setIsPaused(true); setVideoDrill(currentDrill); }}>
                  <Video size={18} />
                </Button>
              )}
              <Button variant="outline" size="icon" onClick={() => setShowTip(t => !t)}>
                <Lightbulb size={18} />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setIsPaused(p => !p)}>
                {isPaused ? <Play size={18} /> : <Pause size={18} />}
              </Button>
              <Button variant="outline" size="icon" onClick={skipDrill}>
                <SkipForward size={18} />
              </Button>
              <Button variant="hero" onClick={completeDrill}>
                <Check size={16} /> Done
              </Button>
            </div>
          </motion.div>
        )}

        {/* RATE */}
        {state === 'rate' && currentDrill && (
          <motion.div key="rate" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center py-12">
            <h2 className="font-display font-bold text-xl text-foreground mb-2">How was that?</h2>
            <p className="text-muted-foreground font-body mb-8">{currentDrill.name} — {formatTime(elapsed)}</p>
            <div className="flex justify-center gap-4 mb-6">
              {[
                { value: 'easy' as const, label: 'Too Easy', emoji: '😎' },
                { value: 'good' as const, label: 'Just Right', emoji: '💪' },
                { value: 'hard' as const, label: 'Tough', emoji: '🥵' },
              ].map(r => (
                <button
                  key={r.value}
                  onClick={() => rateDrill(r.value)}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border bg-card hover:border-primary/30 hover:bg-primary/5 transition-all w-28"
                >
                  <span className="text-3xl">{r.emoji}</span>
                  <span className="text-sm font-body text-foreground">{r.label}</span>
                </button>
              ))}
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1" onClick={goBack}>
              <ChevronLeft size={12} /> Go Back
            </Button>
          </motion.div>
        )}

        {/* SUMMARY */}
        {state === 'summary' && (
          <motion.div key="summary" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
            <p className="text-6xl mb-4">🎉</p>
            <h2 className="font-display font-extrabold text-3xl text-foreground mb-2">Workout Complete!</h2>
            <div className="flex justify-center gap-6 mt-6 mb-6">
              <div>
                <p className="font-display font-extrabold text-2xl text-primary">{completedDrills.length}</p>
                <p className="text-xs text-muted-foreground font-body">Drills</p>
              </div>
              <div>
                <p className="font-display font-extrabold text-2xl text-primary">
                  {formatTime(completedDrills.reduce((s, d) => s + d.duration, 0))}
                </p>
                <p className="text-xs text-muted-foreground font-body">Time</p>
              </div>
              <div>
                <motion.p
                  className="font-display font-extrabold text-2xl text-primary"
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 10 }}
                >
                  +{sessionXp}
                </motion.p>
                <p className="text-xs text-muted-foreground font-body">XP Earned</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground font-body italic mb-6">
              🎯 Pros practice form shooting every day. Keep it up!
            </p>

            <div className="space-y-2">
              <Button variant="hero" className="w-full" onClick={() => navigate("/app/dashboard")}>
                Back to Dashboard
              </Button>
              <Button variant="outline" className="w-full gap-1" onClick={() => navigate("/app/analyze")}>
                <Video size={14} /> Analyze Your Form
              </Button>
              <Button
                variant="ghost"
                className="w-full text-xs text-muted-foreground"
                onClick={() => {
                  toast("Coming soon! 🏀", { description: "Share your progress with friends." });
                }}
              >
                Share Your Progress 📤
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Train;
