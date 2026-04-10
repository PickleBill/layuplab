import { useTrial } from "@/hooks/use-trial";
import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface PremiumGateProps {
  children: React.ReactNode;
  feature?: string;
}

export default function PremiumGate({ children, feature = "This feature" }: PremiumGateProps) {
  const { isPremiumLocked, status } = useTrial();
  const navigate = useNavigate();

  if (status === "loading") return null;
  if (!isPremiumLocked) return <>{children}</>;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
        <Lock size={28} className="text-muted-foreground" />
      </div>
      <h2 className="text-xl font-display font-bold text-foreground">{feature} is locked</h2>
      <p className="text-sm text-muted-foreground max-w-sm">
        Your 3-day free trial has ended. Upgrade your plan to unlock AI coaching, video analysis, personalized plans & more.
      </p>
      <Button variant="hero" onClick={() => navigate("/#pricing")} className="gap-1">
        <Sparkles size={14} /> Upgrade Now
      </Button>
    </div>
  );
}
