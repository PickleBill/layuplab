import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Flame, Check } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getChallenges, saveChallenges, getStats, addXp } from "@/lib/storage";
import { DailyChallenge, DrillCategory } from "@/types/app";
import { XP_PER_CHALLENGE } from "@/lib/xp";

const CHALLENGE_TEMPLATES = [
  { title: 'Form Shooting Focus', description: 'Complete 10 minutes of form shooting', category: 'shooting' as DrillCategory, target: 10, isDaily: true },
  { title: 'Sharp Shooter', description: 'Complete 50 form shots', category: 'shooting' as DrillCategory, target: 50 },
  { title: 'Handle Master', description: 'Do 5 minutes of stationary dribbling', category: 'dribbling' as DrillCategory, target: 300 },
  { title: 'Quick Feet', description: 'Complete 100 defensive slides', category: 'footwork' as DrillCategory, target: 100 },
  { title: 'Iron Lungs', description: 'Run 3 sets of suicides', category: 'conditioning' as DrillCategory, target: 3 },
  { title: 'Cone Killer', description: 'Complete 5 T-Drill rounds', category: 'agility' as DrillCategory, target: 5 },
  { title: 'Free Throw Machine', description: 'Hit 20 free throws in a row', category: 'shooting' as DrillCategory, target: 20 },
  { title: 'Ball on a String', description: 'Do 3 minutes of figure-8 dribbles', category: 'dribbling' as DrillCategory, target: 180 },
  { title: 'Wall Warrior', description: 'Hold wall sits for 3 minutes total', category: 'conditioning' as DrillCategory, target: 180 },
  { title: 'Sprint Demon', description: 'Complete 10 full-court sprints', category: 'agility' as DrillCategory, target: 10 },
  { title: 'Triple Threat', description: 'Do 50 jab step series', category: 'footwork' as DrillCategory, target: 50 },
];

function generateDailyChallenges(): DailyChallenge[] {
  const today = new Date().toISOString().split('T')[0];
  const shuffled = [...CHALLENGE_TEMPLATES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3).map((t, i) => ({
    id: `${today}-${i}`,
    title: t.title,
    description: t.description,
    category: t.category,
    target: t.target,
    xpReward: XP_PER_CHALLENGE,
    date: today,
    completed: false,
  }));
}

const Challenges = () => {
  const [challenges, setChallenges] = useState<DailyChallenge[]>([]);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const stats = getStats();

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    let saved = getChallenges();
    if (saved.length === 0 || saved[0].date !== today) {
      saved = generateDailyChallenges();
      saveChallenges(saved);
    }
    setChallenges(saved);
  }, []);

  const confirmingChallenge = challenges.find(c => c.id === confirmingId);

  const completeChallenge = (id: string) => {
    const updated = challenges.map(c =>
      c.id === id ? { ...c, completed: true } : c
    );
    setChallenges(updated);
    saveChallenges(updated);
    addXp(XP_PER_CHALLENGE);
    setConfirmingId(null);
  };

  const completedCount = challenges.filter(c => c.completed).length;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display font-extrabold text-2xl text-foreground">Daily Challenges</h1>
        <p className="text-sm text-muted-foreground font-body mt-1">
          Complete challenges to earn bonus XP. New challenges every day.
        </p>
      </div>

      {stats.currentStreak > 0 && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 flex items-center gap-3">
          <Flame className="text-primary" size={24} />
          <div>
            <p className="font-display font-bold text-foreground">{stats.currentStreak}-Day Streak!</p>
            <p className="text-xs text-muted-foreground font-body">Keep it going for bonus XP multipliers.</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Trophy size={16} className="text-primary" />
        <span className="text-sm font-body text-muted-foreground">{completedCount}/{challenges.length} completed today</span>
      </div>

      <div className="space-y-3">
        {challenges.map((challenge, i) => (
          <motion.div
            key={challenge.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`rounded-lg border p-4 transition-all ${
              challenge.completed
                ? 'border-accent/30 bg-accent/5'
                : 'border-border bg-card'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-display font-bold text-foreground">{challenge.title}</h3>
                  <Badge variant="outline" className="text-[10px] uppercase font-display border-primary/20 text-primary">
                    {challenge.category}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground font-body">{challenge.description}</p>
                <p className="text-xs text-primary font-display font-bold mt-2">+{challenge.xpReward} XP</p>
              </div>
              {challenge.completed ? (
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <Check size={18} className="text-accent" />
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setConfirmingId(challenge.id)}>
                  Done
                </Button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground font-body text-center italic">
        Be honest — your progress depends on it. Real verification coming soon.
      </p>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmingId} onOpenChange={(open) => !open && setConfirmingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Did you actually complete it?</AlertDialogTitle>
            <AlertDialogDescription className="font-body">
              {confirmingChallenge ? `"${confirmingChallenge.title}" — ${confirmingChallenge.description}` : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-body">Not yet</AlertDialogCancel>
            <AlertDialogAction
              className="font-display"
              onClick={() => confirmingId && completeChallenge(confirmingId)}
            >
              Yes, I did it 💪
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Challenges;
