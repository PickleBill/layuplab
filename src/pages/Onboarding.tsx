import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PlayerProfile, CommitmentLevel } from "@/types/app";
import { saveProfile, saveStats, getDefaultStats, savePlan } from "@/lib/storage";
import { generateWeeklyPlan } from "@/lib/plan-generator";

const COMMITMENT_LEVELS: { value: CommitmentLevel; label: string; desc: string; emoji: string }[] = [
  { value: 'starting', emoji: '🌱', label: 'Just getting started', desc: "I want to learn the right way from day one" },
  { value: 'working', emoji: '💪', label: "I'm putting in work", desc: "I train regularly and want to level up" },
  { value: 'competing', emoji: '🔥', label: 'This is my life', desc: "I'm competing and I need every edge" },
];

const commitmentToSkill = (c: CommitmentLevel) => {
  if (c === 'starting') return 'beginner' as const;
  if (c === 'working') return 'intermediate' as const;
  return 'advanced' as const;
};

const Onboarding = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [commitment, setCommitment] = useState<CommitmentLevel | null>(null);

  const canGo = username.trim().length >= 2 && commitment !== null;

  const handleGo = () => {
    if (!commitment) return;
    const profile: PlayerProfile = {
      username: username.trim(),
      skillLevel: commitmentToSkill(commitment),
      commitmentLevel: commitment,
      coachStyle: 'kobe',
      tier: 'prove_it',
      goals: ['overall'],
      equipment: ['none'],
      daysPerWeek: 7,
      trainingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      sessionLength: 45,
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
            Your AI coach will fine-tune your plan once you're inside.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Onboarding;
