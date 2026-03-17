import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { getStats, getProfile } from "@/lib/storage";
import { ALL_ACHIEVEMENTS, getUnlockedAchievements, getLockedAchievements } from "@/lib/achievements";
import { Trophy, Crown, Users } from "lucide-react";

const Leaderboard = () => {
  const stats = getStats();
  const profile = getProfile();
  const unlockedAchievements = getUnlockedAchievements(stats.achievements);
  const lockedAchievements = getLockedAchievements(stats.achievements);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Your Rank */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Users size={22} className="text-primary" />
          <h1 className="font-display font-extrabold text-2xl text-foreground">Leaderboard</h1>
        </div>

        {/* Current User Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-primary/30 bg-primary/5 p-6"
          style={{ boxShadow: '0 0 20px hsla(var(--primary) / 0.1)' }}
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center shrink-0">
              <Crown size={24} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-extrabold text-xl text-foreground truncate">
                {profile?.username || 'Player'}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="border-primary/20 text-primary font-display">
                  {stats.levelTitle}
                </Badge>
                <span className="text-sm text-muted-foreground font-body">Level {stats.level}</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="font-display font-extrabold text-2xl text-primary">{stats.xp.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground font-body">Total XP</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-primary/10">
            <div className="text-center">
              <p className="font-display font-extrabold text-lg text-foreground">🔥 {stats.currentStreak}</p>
              <p className="text-xs text-muted-foreground font-body">Streak</p>
            </div>
            <div className="text-center">
              <p className="font-display font-extrabold text-lg text-foreground">{stats.totalDrillsCompleted}</p>
              <p className="text-xs text-muted-foreground font-body">Drills Done</p>
            </div>
            <div className="text-center">
              <p className="font-display font-extrabold text-lg text-foreground">{stats.totalTrainingMinutes}</p>
              <p className="text-xs text-muted-foreground font-body">Minutes</p>
            </div>
          </div>
        </motion.div>

        {/* Coming Soon */}
        <div className="mt-6 rounded-lg border border-border bg-card/50 p-8 text-center">
          <Users size={32} className="mx-auto text-muted-foreground mb-3" />
          <p className="font-display font-bold text-foreground mb-1">Community Leaderboard Coming Soon</p>
          <p className="text-sm text-muted-foreground font-body max-w-md mx-auto">
            As more players join Layup Lab, you'll be able to compete and compare your progress with others. Keep training to secure your spot at the top!
          </p>
        </div>
      </div>

      {/* Achievement Badges */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Trophy size={22} className="text-primary" />
          <h2 className="font-display font-extrabold text-2xl text-foreground">Achievement Badges</h2>
        </div>

        {/* Unlocked */}
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

        {/* Locked */}
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
