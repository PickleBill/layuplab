import { useTrial } from "@/hooks/use-trial";
import { Clock, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function TrialBanner() {
  const { status, daysLeft } = useTrial();
  const navigate = useNavigate();

  if (status === "loading" || status === "subscribed") return null;

  if (status === "expired") {
    return (
      <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Lock size={18} className="text-destructive" />
          <div>
            <p className="text-sm font-bold text-destructive">Free trial ended</p>
            <p className="text-xs text-muted-foreground">Upgrade to keep training with AI coaching, video analysis & more.</p>
          </div>
        </div>
        <Button size="sm" variant="hero" onClick={() => navigate("/#pricing")}>
          <Sparkles size={14} className="mr-1" /> Upgrade
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-2 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Clock size={16} className="text-primary" />
        <p className="text-sm text-foreground">
          <span className="font-bold">{daysLeft} day{daysLeft !== 1 ? 's' : ''}</span> left in your free trial
        </p>
      </div>
      <Button size="sm" variant="outline" onClick={() => navigate("/#pricing")} className="text-xs">
        See Plans
      </Button>
    </div>
  );
}
