import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { getStats } from "@/lib/storage";
import { ALL_ACHIEVEMENTS, getUnlockedAchievements, getLockedAchievements } from "@/lib/achievements";
import { Trophy, Crown, Medal, Star, Users } from "lucide-react";

const MOCK_LEADERBOARD = [
  { rank: 1, name: 'DeShawn Carter', level: 24, title: 'Elite', xp: 12400, streak: 45, avatar: 'DC' },
  { rank: 2, name: 'Maria Santos', level: 21, title: 'All-Star', xp: 10800, streak: 32, avatar: 'MS' },
  { rank: 3, name: 'Tyler Vance', level: 19, title: 'All-Star', xp: 9650, streak: 28, avatar: 'TV' },
  { rank: 4, name: 'Aisha Johnson', level: 17, title: 'Varsity', xp: 8500, streak: 21, avatar: 'AJ' },
  { rank: 5, name: 'Coach Davis', level: 15, title: 'Varsity', xp: 7800, streak: 18, avatar: 'CD' },
  { rank: 6, name: 'Jake Kim', level: 14, title: 'Varsity', xp: 7200, streak: 15, avatar: 'JK' },
  { rank: 7, name: 'Priya Patel', level: 12, title: 'Starter', xp: 6100, streak: 12, avatar: 'PP' },
  { rank: 8, name: 'Marcus Wright', level: 11, title: 'Starter', xp: 5600, streak: 10, avatar: 'MW' },
  { rank: 9, name: 'Sofia Lopez', level: 9, title: 'Starter', xp: 4800, streak: 8, avatar: 'SL' },
  { rank: 10, name: 'Ben Okafor', level: 7, title: 'Rookie', xp: 3500, streak: 5, avatar: 'BO' },
];

const RANK_ICONS = [Crown, Medal, Star];
const RANK_COLORS = ['text-yellow-400', 'text-gray-400', 'text-amber-600'];

const Leaderboard = () => {
  const stats = getStats();
  const unlockedAchievements = getUnlockedAchievements(stats.achievements);
  const lockedAchievements = getLockedAchievements(stats.achievements);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Leaderboard */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Users size={22} className="text-primary" />
          <h1 className="font-display font-extrabold text-2xl text-foreground">Leaderboard</h1>
        </div>

        <div className="rounded-lg border border-border bg-card overflow-hidden">
          {MOCK_LEADERBOARD.map((player, i) => {
            const RankIcon = i < 3 ? RANK_ICONS[i] : null;
            return (
              <motion.div
                key={player.rank}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center gap-4 p-4 border-b border-border/50 last:border-0 ${
                  i < 3 ? 'bg-primary/[0.03]' : ''
                }`}
              >
                <div className="w-8 text-center">
                  {RankIcon ? (
                    <RankIcon size={20} className={RANK_COLORS[i]} />
                  ) : (
                    <span className="text-sm font-display font-bold text-muted-foreground">{player.rank}</span>
                  )}
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <span className="font-display font-bold text-xs text-primary">{player.avatar}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body font-medium text-foreground truncate">{player.name}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] border-primary/20 text-primary font-display">
                      {player.title}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-body">Lvl {player.level}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-display font-bold text-sm text-foreground">{player.xp.toLocaleString()} XP</p>
                  <p className="text-xs text-muted-foreground font-body">🔥 {player.streak}</p>
                </div>
              </motion.div>
            );
          })}
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
