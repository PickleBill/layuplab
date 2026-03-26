import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlayerProfile, CommitmentLevel, Goal, DayOfWeek } from "@/types/app";
import { saveProfile, saveStats, getDefaultStats, savePlan } from "@/lib/storage";
import { generateWeeklyPlan } from "@/lib/plan-generator";

const COMMITMENT_LEVELS: { value: CommitmentLevel; label: string; desc: string; emoji: string }[] = [
  { value: 'starting', emoji: '🌱', label: 'Just getting started', desc: "I want to learn the right way from day one" },
  { value: 'working', emoji: '💪', label: "I'm putting in work", desc: "I train regularly and want to level up" },
  { value: 'competing', emoji: '🔥', label: 'This is my life', desc: "I'm competing and I need every edge" },
];

const GOALS: { value: Goal; label: string; emoji: string }[] = [
  { value: 'shooting', label: 'Shooting', emoji: '🎯' },
  { value: 'ball_handling', label: 'Ball Handling', emoji: '🏀' },
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

const SESSION_LENGTHS = [30, 45, 60] as const;

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
  const [sessionLength, setSessionLength] = useState<30 | 45 | 60>(45);
  const [selectedGoals, setSelectedGoals] = useState<Goal[]>([]);
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']);

  const canGo = username.trim().length >= 2 && commitment !== null;

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
      coachStyle: 'kobe',
      tier: 'prove_it',
      goals: selectedGoals.length > 0 ? selectedGoals : ['overall'],
      equipment: ['none'],
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
        <div className="text-center mb-8">
          <h1 className="font-display font-extrabold text-4xl text-foreground mb-2">
            LAYUP<span className="text-primary">LAB</span>
          </h1>
          <p className="text-muted-foreground font-body">Let's get you on the court.</p>
        </div>

        <div className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-body text-muted-foreground">What should we call you?</label>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="e.g. King James"
              className="w-full h-12 px-4 rounded-md border border-border bg-card text-foreground font-body placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
          </div>

          {/* Commitment */}
          <div className="space-y-2">
            <label className="text-sm font-body text-muted-foreground">How serious are you?</label>
            <div className="space-y-2">
              {COMMITMENT_LEVELS.map(c => (
                <button
                  key={c.value}
                  onClick={() => setCommitment(c.value)}
                  className={`w-full flex items-center gap-3 text-left p-4 rounded-md border transition-all ${
                    commitment === c.value
                      ? 'border-primary bg-primary/10 glow-orange-border'
                      : 'border-border bg-card hover:border-muted-foreground/30'
                  }`}
                >
                  <span className="text-2xl">{c.emoji}</span>
                  <div>
                    <p className="font-display font-bold text-foreground">{c.label}</p>
                    <p className="text-xs text-muted-foreground font-body">{c.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Collapsible Customization Panel */}
          <div className="rounded-md border border-border bg-card overflow-hidden">
            <button
              onClick={() => setShowCustomize(!showCustomize)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
            >
              <div>
                <p className="font-display font-bold text-sm text-foreground">Customize your plan</p>
                <p className="text-xs text-muted-foreground font-body">Optional — set goals, schedule & session length</p>
              </div>
              {showCustomize ? <ChevronUp size={18} className="text-muted-foreground" /> : <ChevronDown size={18} className="text-muted-foreground" />}
            </button>

            {showCustomize && (
              <motion.div
                className="px-4 pb-4 space-y-5 border-t border-border pt-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.2 }}
              >
                {/* Session Length */}
                <div className="space-y-2">
                  <label className="text-xs font-body text-muted-foreground">Session length</label>
                  <div className="flex gap-2">
                    {SESSION_LENGTHS.map(len => (
                      <button
                        key={len}
                        onClick={() => setSessionLength(len)}
                        className={`flex-1 py-2 rounded-md border text-sm font-display font-bold transition-all ${
                          sessionLength === len
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-background text-muted-foreground hover:border-muted-foreground/30'
                        }`}
                      >
                        {len} min
                      </button>
                    ))}
                  </div>
                </div>

                {/* Goals */}
                <div className="space-y-2">
                  <label className="text-xs font-body text-muted-foreground">What do you want to work on?</label>
                  <div className="flex flex-wrap gap-2">
                    {GOALS.map(g => (
                      <button
                        key={g.value}
                        onClick={() => toggleGoal(g.value)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-body transition-all ${
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
                    <p className="text-[10px] text-muted-foreground font-body">None selected = overall training</p>
                  )}
                </div>

                {/* Training Days */}
                <div className="space-y-2">
                  <label className="text-xs font-body text-muted-foreground">Training days</label>
                  <div className="flex gap-1.5">
                    {DAYS.map(d => (
                      <button
                        key={d.value}
                        onClick={() => toggleDay(d.value)}
                        className={`w-10 h-10 rounded-full border text-xs font-display font-bold transition-all ${
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

          <p className="text-center text-xs text-muted-foreground font-body">
            Your AI coach can fine-tune your plan anytime inside the app.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Onboarding;
