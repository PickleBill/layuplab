import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ChevronLeft, Target, Dumbbell, Zap, Heart, Star } from "lucide-react";
import { PlayerProfile, SkillLevel, Goal, Equipment } from "@/types/app";
import { saveProfile, saveStats, getDefaultStats, savePlan } from "@/lib/storage";
import { generateWeeklyPlan } from "@/lib/plan-generator";

const SKILL_LEVELS: { value: SkillLevel; label: string; desc: string }[] = [
  { value: 'beginner', label: 'Beginner', desc: 'New to basketball or returning after a long break' },
  { value: 'intermediate', label: 'Intermediate', desc: 'Play regularly, comfortable with fundamentals' },
  { value: 'advanced', label: 'Advanced', desc: 'Competitive player, looking to refine and dominate' },
];

const GOALS: { value: Goal; label: string; icon: typeof Target }[] = [
  { value: 'shooting', label: 'Shooting Accuracy', icon: Target },
  { value: 'ball_handling', label: 'Ball Handling', icon: Dumbbell },
  { value: 'speed_agility', label: 'Speed & Agility', icon: Zap },
  { value: 'conditioning', label: 'Conditioning', icon: Heart },
  { value: 'overall', label: 'Overall Game', icon: Star },
];

const EQUIPMENT: { value: Equipment; label: string }[] = [
  { value: 'hoop', label: '🏀 Basketball Hoop' },
  { value: 'cones', label: '🔶 Cones / Markers' },
  { value: 'resistance_band', label: '💪 Resistance Band' },
  { value: 'jump_rope', label: '🪢 Jump Rope' },
  { value: 'none', label: '✋ Nothing (bodyweight only)' },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState("");
  const [skillLevel, setSkillLevel] = useState<SkillLevel | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [sessionLength, setSessionLength] = useState<30 | 45 | 60>(45);

  const toggleGoal = (g: Goal) => setGoals(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  const toggleEquip = (e: Equipment) => setEquipment(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e]);

  const canProceed = () => {
    switch (step) {
      case 0: return username.trim().length >= 2 && skillLevel !== null;
      case 1: return goals.length > 0;
      case 2: return equipment.length > 0;
      case 3: return true;
      default: return false;
    }
  };

  const handleComplete = () => {
    if (!skillLevel) return;
    const profile: PlayerProfile = {
      username: username.trim(),
      skillLevel,
      goals,
      equipment,
      daysPerWeek,
      sessionLength,
      createdAt: new Date().toISOString(),
    };
    saveProfile(profile);
    saveStats(getDefaultStats());
    const plan = generateWeeklyPlan(profile);
    savePlan(plan);
    navigate("/app/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-primary' : 'bg-muted'}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {step === 0 && (
              <div className="space-y-8">
                <div>
                  <h1 className="font-display font-extrabold text-3xl text-foreground mb-2">Let's build your profile</h1>
                  <p className="text-muted-foreground font-body">Tell us about yourself so we can create your perfect training plan.</p>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-body text-muted-foreground">Your name or nickname</label>
                  <input
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="e.g. King James"
                    className="w-full h-12 px-4 rounded-md border border-border bg-card text-foreground font-body placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-body text-muted-foreground">Skill level</label>
                  <div className="space-y-3">
                    {SKILL_LEVELS.map(s => (
                      <button
                        key={s.value}
                        onClick={() => setSkillLevel(s.value)}
                        className={`w-full text-left p-4 rounded-md border transition-all ${
                          skillLevel === s.value
                            ? 'border-primary bg-primary/10 glow-orange-border'
                            : 'border-border bg-card hover:border-muted-foreground/30'
                        }`}
                      >
                        <p className="font-display font-bold text-foreground">{s.label}</p>
                        <p className="text-sm text-muted-foreground font-body">{s.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-8">
                <div>
                  <h1 className="font-display font-extrabold text-3xl text-foreground mb-2">What's your focus?</h1>
                  <p className="text-muted-foreground font-body">Select one or more goals. We'll weight your plan accordingly.</p>
                </div>
                <div className="space-y-3">
                  {GOALS.map(g => (
                    <button
                      key={g.value}
                      onClick={() => toggleGoal(g.value)}
                      className={`w-full flex items-center gap-4 p-4 rounded-md border transition-all ${
                        goals.includes(g.value)
                          ? 'border-primary bg-primary/10 glow-orange-border'
                          : 'border-border bg-card hover:border-muted-foreground/30'
                      }`}
                    >
                      <g.icon size={22} className={goals.includes(g.value) ? 'text-primary' : 'text-muted-foreground'} />
                      <span className="font-display font-bold text-foreground">{g.label}</span>
                      {goals.includes(g.value) && <Badge className="ml-auto">Selected</Badge>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8">
                <div>
                  <h1 className="font-display font-extrabold text-3xl text-foreground mb-2">What do you have?</h1>
                  <p className="text-muted-foreground font-body">We'll only assign drills you can actually do.</p>
                </div>
                <div className="space-y-3">
                  {EQUIPMENT.map(e => (
                    <button
                      key={e.value}
                      onClick={() => toggleEquip(e.value)}
                      className={`w-full text-left p-4 rounded-md border transition-all ${
                        equipment.includes(e.value)
                          ? 'border-primary bg-primary/10 glow-orange-border'
                          : 'border-border bg-card hover:border-muted-foreground/30'
                      }`}
                    >
                      <span className="font-display font-bold text-foreground">{e.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8">
                <div>
                  <h1 className="font-display font-extrabold text-3xl text-foreground mb-2">Set your schedule</h1>
                  <p className="text-muted-foreground font-body">How often and how long can you train?</p>
                </div>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-sm font-body text-muted-foreground">Days per week</label>
                    <div className="flex gap-2">
                      {[2, 3, 4, 5, 6].map(d => (
                        <button
                          key={d}
                          onClick={() => setDaysPerWeek(d)}
                          className={`flex-1 h-12 rounded-md border font-display font-bold transition-all ${
                            daysPerWeek === d
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border bg-card text-foreground hover:border-muted-foreground/30'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-body text-muted-foreground">Session length</label>
                    <div className="flex gap-2">
                      {([30, 45, 60] as const).map(m => (
                        <button
                          key={m}
                          onClick={() => setSessionLength(m)}
                          className={`flex-1 h-12 rounded-md border font-display font-bold transition-all ${
                            sessionLength === m
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border bg-card text-foreground hover:border-muted-foreground/30'
                          }`}
                        >
                          {m} min
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-10">
          {step > 0 ? (
            <Button variant="outline" onClick={() => setStep(s => s - 1)}>
              <ChevronLeft size={16} /> Back
            </Button>
          ) : <div />}
          {step < 3 ? (
            <Button variant="hero" onClick={() => setStep(s => s + 1)} disabled={!canProceed()}>
              Next <ChevronRight size={16} />
            </Button>
          ) : (
            <Button variant="hero" onClick={handleComplete} disabled={!canProceed()}>
              Generate My Plan 🚀
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
