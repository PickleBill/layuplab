import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";
import { getPlan, getProfile, savePlan } from "@/lib/storage";
import { generateWeeklyPlan } from "@/lib/plan-generator";
import { getDrillById } from "@/lib/drills";
import { DayOfWeek } from "@/types/app";
import { useState } from "react";

const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu',
  friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
};

const Plan = () => {
  const [plan, setPlan] = useState(getPlan());
  const profile = getProfile();
  const todayIndex = (new Date().getDay() + 6) % 7;

  const regenerate = () => {
    if (!profile) return;
    const newPlan = generateWeeklyPlan(profile);
    savePlan(newPlan);
    setPlan(newPlan);
  };

  if (!plan) return (
    <div className="p-6 text-center py-20">
      <p className="text-muted-foreground font-body">No plan found. Complete onboarding first.</p>
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-extrabold text-2xl text-foreground">Weekly Plan</h1>
          <p className="text-sm text-muted-foreground font-body">Week of {plan.weekOf}</p>
        </div>
        <Button variant="outline" onClick={regenerate}>
          <RefreshCw size={16} /> Regenerate
        </Button>
      </div>

      <div className="space-y-3">
        {plan.days.map((day, i) => {
          const drills = day.drills.map(id => getDrillById(id)).filter(Boolean);
          const isToday = i === todayIndex;
          return (
            <div
              key={day.day}
              className={`rounded-lg border p-4 transition-all ${
                isToday ? 'border-primary/40 bg-primary/5 glow-orange-border' : 'border-border bg-card'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className={`font-display font-bold text-sm ${isToday ? 'text-primary' : 'text-foreground'}`}>
                    {DAY_LABELS[day.day]}
                  </span>
                  {isToday && <Badge className="text-[10px]">TODAY</Badge>}
                </div>
                {day.isRestDay ? (
                  <Badge variant="secondary" className="text-[10px] font-display">REST</Badge>
                ) : (
                  <div className="flex gap-1">
                    {day.focus.map(f => (
                      <Badge key={f} variant="outline" className="text-[10px] uppercase font-display border-primary/20 text-primary">
                        {f}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              {!day.isRestDay && drills.length > 0 && (
                <div className="mt-2 space-y-1">
                  {drills.map(d => d && (
                    <div key={d.id} className="flex items-center gap-2 text-sm font-body text-muted-foreground">
                      <span className="w-1 h-1 rounded-full bg-primary" />
                      <span className="flex-1">{d.name}</span>
                      <span className="text-xs">{Math.round(d.duration / 60)}m</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Plan;
