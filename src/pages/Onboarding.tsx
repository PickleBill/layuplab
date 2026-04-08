import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { PlayerProfile, CommitmentLevel, Goal, DayOfWeek } from "@/types/app";
import { saveProfile, saveStats, getDefaultStats, savePlan } from "@/lib/storage";
import { generateWeeklyPlan } from "@/lib/plan-generator";

const COMMITMENT_LEVELS: { value: CommitmentLevel; label: string; desc: string; emoji: string }[] = [
  { value: 'starting', emoji: '🌱', label: 'Just getting started', desc: "Learn the right way from day one" },
  { value: 'working', emoji: '💪', label: "Putting in work", desc: "Train regularly, level up" },
  { value: 'competing', emoji: '🔥', label: 'This is my life', desc: "Every edge counts" },
];

const GOALS: { value: Goal; label: string; emoji: string }[] = [
  { value: 'shooting', label: 'Shooting', emoji: '🎯' },
  { value: 'ball_handling', label: 'Ball Handling', emoji: '🏀' },
  { value: 'defense', label: 'Defense', emoji: '🛡️' },
  { value: 'speed_agility', label: 'Speed & Agility', emoji: '⚡' },
  { value: 'conditioning', label: 'Conditioning', emoji: '🫁' },
];

const DAYS: { value: DayOfWeek; label: string }[] = [
  { value: 'monday', label: 'M' },
  { value: 'tuesday', label: 'T' },
  { value: 'wednesday', label: 'W' },
  { value: 'thursday', label: 'Th' },
  { value: 'friday', label: 'F' },
  { value: 'saturday', label: 'S' },
  { value: 'sunday', label: 'Su' },
];

const SESSION_LABELS: Record<number, string> = {
  15: '⚡ Quick session',
  30: '🏃 Solid warmup',
  45: '💪 Real work',
  60: '🔥 Pro grind',
  90: '🐍 Elite hours',
  120: '🏆 Mamba hours',
  150: '👑 All day grind',
  180: '🔱 No limits',
};

const getSessionLabel = (mins: number) => {
  const keys = Object.keys(SESSION_LABELS).map(Number).sort((a, b) => a - b);
  let label = SESSION_LABELS[keys[0]];
  for (const k of keys) {
    if (mins >= k) label = SESSION_LABELS[k];
  }
  return label;
};

const commitmentToSkill = (c: CommitmentLevel) => {
  if (c === 'starting') return 'beginner' as const;
  if (c === 'working') return 'intermediate' as const;
  return 'advanced' as const;
};

const Onboarding = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [commitment, setCommitment] = useState<CommitmentLevel | null>(null);
  const [showCustomize, setShowCustomize] = useState(false);
  const [sessionLength, setSessionLength] = useState(45);
  const [selectedGoals, setSelectedGoals] = useState<Goal[]>([]);
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']);

  const canGo = username.trim().length >= 2 && commitment !== null;

  // Auto-expand customization when commitment is selected
  useEffect(() => {
    if (commitment) setShowCustomize(true);
  }, [commitment]);

  const toggleGoal = (g: Goal) => {
    setSelectedGoals(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  };

  const toggleDay = (d: DayOfWeek) => {
    setSelectedDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  };

  const handleGo = () => {
    if (!commitment) return;
    const profile: PlayerProfile = {
      username: username.trim(),
      skillLevel: commitmentToSkill(commitment),
      commitmentLevel: commitment,
      coachStyle: 'mamba',
      tier: 'prove_it',
      goals: selectedGoals.length > 0 ? selectedGoals : ['overall'],
      equipment: ['none', 'hoop'],
      daysPerWeek: selectedDays.length,
      trainingDays: selectedDays,
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
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-6">
          <h1 className="font-display font-extrabold text-3xl text-foreground mb-1">
            LAYUP<span className="text-primary">LAB</span>
          </h1>
          <p className="text-muted-foreground font-body text-sm">Let's get you on the court.</p>
        </div>

        <div className="space-y-4">
          {/* Name — compact */}
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Your name (e.g. King James)"
            className="w-full h-11 px-4 rounded-md border border-border bg-card text-foreground font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
          />

          {/* Commitment — compact */}
          <div className="space-y-1.5">
            <label className="text-xs font-body text-muted-foreground">How serious are you?</label>
            <div className="grid grid-cols-3 gap-2">
              {COMMITMENT_LEVELS.map(c => (
                <button
                  key={c.value}
                  onClick={() => setCommitment(c.value)}
                  className={`flex flex-col items-center text-center p-3 rounded-md border transition-all ${
                    commitment === c.value
                      ? 'border-primary bg-primary/10 glow-orange-border'
                      : 'border-border bg-card hover:border-muted-foreground/30'
                  }`}
                >
                  <span className="text-xl mb-1">{c.emoji}</span>
                  <p className="font-display font-bold text-xs text-foreground leading-tight">{c.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Collapsible Customization Panel */}
          <div className="rounded-md border border-border bg-card overflow-hidden">
            <button
              onClick={() => setShowCustomize(!showCustomize)}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-muted/30 transition-colors"
            >
              <div>
                <p className="font-display font-bold text-xs text-foreground">Customize your plan</p>
                <p className="text-[10px] text-muted-foreground font-body">Optional — goals, schedule & session length</p>
              </div>
              {showCustomize ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
            </button>

            {showCustomize && (
              <motion.div
                className="px-3 pb-3 space-y-4 border-t border-border pt-3"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.2 }}
              >
                {/* Session Length Slider */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-body text-muted-foreground">How long can you train?</label>
                    <span className="font-display font-extrabold text-lg text-primary">{sessionLength} min</span>
                  </div>
                  <Slider
                    value={[sessionLength]}
                    onValueChange={([v]) => setSessionLength(v)}
                    min={15}
                    max={180}
                    step={15}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground font-body">
                    <span>15 min</span>
                    <span>3 hrs</span>
                  </div>
                  <p className="text-center text-xs font-body text-primary/80">{getSessionLabel(sessionLength)}</p>
                </div>

                {/* Goals */}
                <div className="space-y-1.5">
                  <label className="text-xs font-body text-muted-foreground">What do you want to work on?</label>
                  <div className="flex flex-wrap gap-1.5">
                    {GOALS.map(g => (
                      <button
                        key={g.value}
                        onClick={() => toggleGoal(g.value)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-body transition-all ${
                          selectedGoals.includes(g.value)
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-background text-muted-foreground hover:border-muted-foreground/30'
                        }`}
                      >
                        <span>{g.emoji}</span>
                        {g.label}
                      </button>
                    ))}
                  </div>
                  {selectedGoals.length === 0 && (
                    <p className="text-[10px] text-muted-foreground font-body">None = overall training</p>
                  )}
                </div>

                {/* Training Days */}
                <div className="space-y-1.5">
                  <label className="text-xs font-body text-muted-foreground">Training days</label>
                  <div className="flex gap-1.5">
                    {DAYS.map(d => (
                      <button
                        key={d.value}
                        onClick={() => toggleDay(d.value)}
                        className={`w-9 h-9 rounded-full border text-xs font-display font-bold transition-all ${
                          selectedDays.includes(d.value)
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-background text-muted-foreground hover:border-muted-foreground/30'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <Button
            variant="hero"
            size="xl"
            className="w-full"
            disabled={!canGo}
            onClick={handleGo}
          >
            Let's Go 🚀
          </Button>

          <p className="text-center text-[10px] text-muted-foreground font-body">
            Your AI coach can fine-tune your plan anytime.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Onboarding;
