import { useState, useEffect } from "react";
import { Flame, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { getStats } from "@/lib/storage";
import { getXpProgress, getXpForCurrentLevel, XP_PER_LEVEL } from "@/lib/xp";

const XpBar = () => {
  const [stats, setStats] = useState(getStats());

  useEffect(() => {
    // Poll localStorage for XP changes every 2 seconds
    const interval = setInterval(() => {
      const current = getStats();
      if (current.xp !== stats.xp || current.currentStreak !== stats.currentStreak) {
        setStats(current);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [stats.xp, stats.currentStreak]);

  const xpProgress = getXpProgress(stats.xp) * 100;
  const xpCurrent = getXpForCurrentLevel(stats.xp);

  return (
    <div className="bg-card/80 backdrop-blur-sm border-b border-border px-4 py-1.5 flex items-center gap-3">
      <div className="flex items-center gap-1.5">
        <Zap size={12} className="text-primary" />
        <span className="font-display font-bold text-[10px] text-foreground">Lvl {stats.level}</span>
        <span className="font-display font-bold text-[10px] text-primary">{stats.levelTitle}</span>
      </div>
      <div className="flex-1 max-w-[200px]">
        <Progress value={xpProgress} className="h-1.5" />
      </div>
      <span className="text-[10px] text-muted-foreground font-body">{xpCurrent}/{XP_PER_LEVEL}</span>
      {stats.currentStreak > 0 && (
        <span className="flex items-center gap-0.5 text-[10px]">
          <Flame size={10} className="text-primary" />
          <span className="text-primary font-bold font-display">{stats.currentStreak}</span>
        </span>
      )}
    </div>
  );
};

export default XpBar;
