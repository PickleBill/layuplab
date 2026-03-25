import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronRight, ChevronLeft, Target, Dumbbell, Zap, Heart, Star, Smile, Shield, Wrench } from "lucide-react";
import { PlayerProfile, CommitmentLevel, CoachStyle, Tier, Goal, Equipment, DayOfWeek } from "@/types/app";
import { saveProfile, saveStats, getDefaultStats, savePlan } from "@/lib/storage";
import { generateWeeklyPlan } from "@/lib/plan-generator";

const COMMITMENT_LEVELS: { value: CommitmentLevel; label: string; desc: string }[] = [
  { value: 'starting', label: 'Just getting started', desc: "I want to learn the right way from day one" },
  { value: 'working', label: "I'm putting in work", desc: "I train regularly and want to level up" },
  { value: 'competing', label: 'This is my life', desc: "I'm competing and I need every edge" },
];

const COACH_STYLES: { value: CoachStyle; label: string; desc: string; icon: typeof Smile }[] = [
  { value: 'motivator', label: 'The Motivator', desc: 'Encouraging, positive reinforcement, celebrates small wins', icon: Smile },
  { value: 'drill_sergeant', label: 'The Drill Sergeant', desc: 'Direct, no-nonsense, pushes you past comfort', icon: Shield },
  { value: 'technician', label: 'The Technician', desc: 'Methodical, detail-obsessed, breaks down every mechanic', icon: Wrench },
];

const TIER_OPTIONS: { value: Tier; name: string; price: string; period: string; desc: string; features: string[] }[] = [
  { value: 'prove_it', name: 'Prove It', price: '$25', period: '/mo', desc: "You're here to get better. Start with the fundamentals.", features: ['Daily form shooting drills', 'Progress tracking & streaks', 'Community challenges', 'Coach personality selection'] },
  { value: 'lock_in', name: 'Lock In', price: '$50', period: '/mo', desc: "You're serious. Get AI in your corner.", features: ['Everything in Prove It', 'Full AI VisionForm analysis', 'Personalized adaptive workouts', 'Advanced footwork & handle metrics'] },
  { value: 'no_limits', name: 'No Limits', price: '$100', period: '/mo', desc: 'The complete training ecosystem. Earn your way here.', features: ['Everything in Lock In', 'Wearable syncing', "Coach's Corner reports", 'Scouting profile visibility'] },
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

const ALL_DAYS: { value: DayOfWeek; label: string; short: string }[] = [
  { value: 'monday', label: 'Monday', short: 'Mon' },
  { value: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { value: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { value: 'thursday', label: 'Thursday', short: 'Thu' },
  { value: 'friday', label: 'Friday', short: 'Fri' },
  { value: 'saturday', label: 'Saturday', short: 'Sat' },
  { value: 'sunday', label: 'Sunday', short: 'Sun' },
];

const TOTAL_STEPS = 6;

const commitmentToSkill = (c: CommitmentLevel) => {
  if (c === 'starting') return 'beginner' as const;
  if (c === 'working') return 'intermediate' as const;
  return 'advanced' as const;
};

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState("");
  const [commitment, setCommitment] = useState<CommitmentLevel | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [coachStyle, setCoachStyle] = useState<CoachStyle | null>(null);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [trainingDays, setTrainingDays] = useState<DayOfWeek[]>([]);
  const [sessionLength, setSessionLength] = useState<30 | 45 | 60>(45);
  const [tier, setTier] = useState<Tier | null>(null);

  const toggleGoal = (g: Goal) => setGoals(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  const toggleEquip = (e: Equipment) => setEquipment(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e]);
  const toggleDay = (d: DayOfWeek) => setTrainingDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);

  const canProceed = () => {
    switch (step) {
      case 0: return username.trim().length >= 2 && commitment !== null;
      case 1: return goals.length > 0;
      case 2: return coachStyle !== null;
      case 3: return equipment.length > 0;
      case 4: return trainingDays.length > 0;
      case 5: return tier !== null;
      default: return false;
    }
  };

  const handleComplete = () => {
    if (!commitment || !coachStyle || !tier) return;
    const profile: PlayerProfile = {
      username: username.trim(),
      skillLevel: commitmentToSkill(commitment),
      commitmentLevel: commitment,
      coachStyle,
      tier,
      goals,
      equipment,
      daysPerWeek: trainingDays.length,
      trainingDays,
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
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
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
            {/* Step 0: Profile + Commitment */}
            {step === 0 && (
              <div className="space-y-8">
                <div>
                  <h1 className="font-display font-extrabold text-3xl text-foreground mb-2">Let's see what you're about.</h1>
                  <p className="text-muted-foreground font-body">Tell us who you are and how serious you're taking this.</p>
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
                  <label className="text-sm font-body text-muted-foreground">How serious are you?</label>
                  <div className="space-y-3">
                    {COMMITMENT_LEVELS.map(s => (
                      <button
                        key={s.value}
                        onClick={() => setCommitment(s.value)}
                        className={`w-full text-left p-4 rounded-md border transition-all ${
                          commitment === s.value
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

            {/* Step 1: Goals */}
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

            {/* Step 2: Coach Style */}
            {step === 2 && (
              <div className="space-y-8">
                <div>
                  <h1 className="font-display font-extrabold text-3xl text-foreground mb-2">What kind of coach do you want?</h1>
                  <p className="text-muted-foreground font-body">This shapes how your AI coach talks to you.</p>
                </div>
                <div className="space-y-3">
                  {COACH_STYLES.map(c => (
                    <button
                      key={c.value}
                      onClick={() => setCoachStyle(c.value)}
                      className={`w-full flex items-center gap-4 p-4 rounded-md border transition-all ${
                        coachStyle === c.value
                          ? 'border-primary bg-primary/10 glow-orange-border'
                          : 'border-border bg-card hover:border-muted-foreground/30'
                      }`}
                    >
                      <c.icon size={22} className={coachStyle === c.value ? 'text-primary' : 'text-muted-foreground'} />
                      <div className="text-left">
                        <p className="font-display font-bold text-foreground">{c.label}</p>
                        <p className="text-sm text-muted-foreground font-body">{c.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Equipment */}
            {step === 3 && (
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

            {/* Step 4: Training Schedule */}
            {step === 4 && (
              <div className="space-y-8">
                <div>
                  <h1 className="font-display font-extrabold text-3xl text-foreground mb-2">Pick your training days</h1>
                  <p className="text-muted-foreground font-body">Choose which days you want to train. We'll build your plan around your schedule.</p>
                </div>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-sm font-body text-muted-foreground">Training days</label>
                    <div className="grid grid-cols-4 gap-2">
                      {ALL_DAYS.map(d => (
                        <button
                          key={d.value}
                          onClick={() => toggleDay(d.value)}
                          className={`h-14 rounded-md border font-display font-bold text-sm transition-all ${
                            trainingDays.includes(d.value)
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border bg-card text-foreground hover:border-muted-foreground/30'
                          }`}
                        >
                          {d.short}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground font-body">
                      {trainingDays.length} day{trainingDays.length !== 1 ? 's' : ''} selected
                    </p>
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

            {/* Step 5: Tier Selection */}
            {step === 5 && (
              <div className="space-y-8">
                <div>
                  <h1 className="font-display font-extrabold text-3xl text-foreground mb-2">Pick your level of access</h1>
                  <p className="text-muted-foreground font-body">Not about skill — it's about commitment.</p>
                </div>
                <div className="space-y-3">
                  {TIER_OPTIONS.map(t => (
                    <button
                      key={t.value}
                      onClick={() => setTier(t.value)}
                      className={`w-full text-left p-5 rounded-lg border transition-all ${
                        tier === t.value
                          ? 'border-primary bg-primary/10 glow-orange-border'
                          : 'border-border bg-card hover:border-muted-foreground/30'
                      }`}
                    >
                      <div className="flex items-baseline justify-between mb-1">
                        <p className="font-display font-bold text-lg text-foreground">{t.name}</p>
                        <p className="font-display font-extrabold text-xl text-primary">{t.price}<span className="text-sm text-muted-foreground font-body">{t.period}</span></p>
                      </div>
                      <p className="text-sm text-muted-foreground font-body mb-3">{t.desc}</p>
                      <ul className="space-y-1">
                        {t.features.map(f => (
                          <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground font-body">
                            <Check size={12} className="text-accent shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </button>
                  ))}
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
          {step < TOTAL_STEPS - 1 ? (
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
