import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { getStats, getProfile } from "@/lib/storage";
import { ALL_ACHIEVEMENTS, getUnlockedAchievements, getLockedAchievements } from "@/lib/achievements";
import { Trophy, Crown, Zap, Target } from "lucide-react";

const BENCHMARKS = [
  { name: 'Gym Rat', xp: 10000, emoji: '🐀', title: 'Elite' },
  { name: 'All-Star Grinder', xp: 5000, emoji: '⭐', title: 'All-Star' },
  { name: 'Varsity Hustler', xp: 2500, emoji: '🏀', title: 'Varsity' },
  { name: 'Dedicated Player', xp: 1500, emoji: '💪', title: 'Starter' },
  { name: 'Average Player', xp: 500, emoji: '🎯', title: 'Rookie' },
  { name: 'Just Starting', xp: 100, emoji: '👟', title: 'Rookie' },
];

const Leaderboard = () => {
  const stats = getStats();
  const profile = getProfile();
  const unlockedAchievements = getUnlockedAchievements(stats.achievements);
  const lockedAchievements = getLockedAchievements(stats.achievements);

  // Build leaderboard: benchmarks + user, sorted by XP desc
  const userEntry = {
    name: profile?.username || 'You',
    xp: stats.xp,
    emoji: '👤',
    title: stats.levelTitle,
    isUser: true,
  };

  const entries = [
    ...BENCHMARKS.map(b => ({ ...b, isUser: false })),
    userEntry,
  ].sort((a, b) => b.xp - a.xp);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Leaderboard */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Crown size={22} className="text-primary" />
          <h1 className="font-display font-extrabold text-2xl text-foreground">Leaderboard</h1>
        </div>

        <div className="space-y-2">
          {entries.map((entry, i) => (
            <motion.div
              key={entry.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`rounded-lg border p-4 flex items-center gap-3 ${
                entry.isUser
                  ? 'border-primary/30 bg-primary/5'
                  : stats.xp >= entry.xp
                    ? 'border-accent/20 bg-accent/5'
                    : 'border-border bg-card'
              }`}
              style={entry.isUser ? { boxShadow: '0 0 20px hsla(var(--primary) / 0.1)' } : undefined}
            >
              <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-display font-bold text-sm text-muted-foreground shrink-0">
                {i + 1}
              </span>
              <span className="text-2xl shrink-0">{entry.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className={`font-display font-bold text-sm ${entry.isUser ? 'text-primary' : 'text-foreground'}`}>
                  {entry.name} {entry.isUser && '(You)'}
                </p>
                <Badge variant="outline" className="text-[10px] font-display mt-0.5">
                  {entry.title}
                </Badge>
              </div>
              <div className="text-right shrink-0">
                <p className={`font-display font-extrabold text-lg ${entry.isUser ? 'text-primary' : 'text-foreground'}`}>
                  {entry.xp.toLocaleString()}
                </p>
                <p className="text-[10px] text-muted-foreground font-body">XP</p>
              </div>
              {!entry.isUser && stats.xp >= entry.xp && (
                <Zap size={16} className="text-accent shrink-0" />
              )}
            </motion.div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground font-body text-center mt-4 italic">
          Climb the ranks by completing drills, workouts, and challenges.
        </p>
      </div>

      {/* Achievement Badges */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Trophy size={22} className="text-primary" />
          <h2 className="font-display font-extrabold text-2xl text-foreground">Achievement Badges</h2>
        </div>

        {unlockedAchievements.length > 0 && (
          <div className="mb-6">
            <p className="text-sm text-muted-foreground font-body mb-3">Unlocked ({unlockedAchievements.length}/{ALL_ACHIEVEMENTS.length})</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {unlockedAchievements.map((ach, i) => (
                <motion.div
                  key={ach.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05, type: "spring", damping: 15 }}
                  className="rounded-lg border border-accent/30 bg-accent/5 p-4 text-center"
                  style={{ boxShadow: '0 0 15px hsla(142, 71%, 45%, 0.1)' }}
                >
                  <span className="text-3xl block mb-2">{ach.icon}</span>
                  <p className="font-display font-bold text-sm text-foreground">{ach.title}</p>
                  <p className="text-xs text-muted-foreground font-body mt-1">{ach.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="text-sm text-muted-foreground font-body mb-3">Locked ({lockedAchievements.length})</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {lockedAchievements.map(ach => (
              <div
                key={ach.id}
                className="rounded-lg border border-border bg-card/50 p-4 text-center opacity-50"
              >
                <span className="text-3xl block mb-2 grayscale">🔒</span>
                <p className="font-display font-bold text-sm text-foreground">{ach.title}</p>
                <p className="text-xs text-muted-foreground font-body mt-1">{ach.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
