import { motion } from "framer-motion";
import { getStats, getSessions } from "@/lib/storage";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";

const Progress = () => {
  const stats = getStats();
  const sessions = getSessions();

  const radarData = Object.entries(stats.skillRatings).map(([key, value]) => ({
    skill: key.charAt(0).toUpperCase() + key.slice(1),
    value,
    fullMark: 100,
  }));

  const totalMinutes = stats.totalTrainingMinutes;
  const totalHours = Math.floor(totalMinutes / 60);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="font-display font-extrabold text-2xl text-foreground">Progress</h1>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {[
          { label: 'Total Drills', value: stats.totalDrillsCompleted },
          { label: 'Training Time', value: totalHours > 0 ? `${totalHours}h ${totalMinutes % 60}m` : `${totalMinutes}m` },
          { label: 'Longest Streak', value: `${stats.longestStreak} days` },
          { label: 'Level', value: `${stats.level} (${stats.levelTitle})` },
        ].map(s => (
          <div key={s.label} className="rounded-lg border border-border bg-card p-4 text-center">
            <p className="font-display font-extrabold text-xl text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground font-body mt-1">{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Skill Radar */}
      <motion.div
        className="rounded-lg border border-border bg-card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="font-display font-bold text-lg text-foreground mb-4">Skill Radar</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="skill" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontFamily: 'Inter' }} />
              <Radar
                name="Skills"
                dataKey="value"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Workout History */}
      <motion.div
        className="rounded-lg border border-border bg-card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="font-display font-bold text-lg text-foreground mb-4">Recent Workouts</h2>
        {sessions.length === 0 ? (
          <p className="text-muted-foreground font-body text-sm">No workouts yet. Start training to see your history!</p>
        ) : (
          <div className="space-y-2">
            {sessions.slice(-10).reverse().map(s => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-md bg-muted/30 border border-border/50">
                <div>
                  <p className="text-sm font-body text-foreground">
                    {new Date(s.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-xs text-muted-foreground font-body">{s.drills.length} drills</p>
                </div>
                <span className="text-sm font-display font-bold text-primary">+{s.totalXpEarned} XP</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Progress;
