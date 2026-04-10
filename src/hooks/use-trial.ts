import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type TrialStatus = "active" | "expired" | "subscribed" | "loading";

const TRIAL_DAYS = 3;

export function useTrial() {
  const [status, setStatus] = useState<TrialStatus>("loading");
  const [daysLeft, setDaysLeft] = useState(TRIAL_DAYS);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) {
        setStatus("active"); // unauthenticated → treat as active for now
        return;
      }

      const { data } = await supabase
        .from("player_profiles")
        .select("trial_started_at, subscription_status")
        .eq("user_id", user.id)
        .maybeSingle();

      if (cancelled) return;

      if (!data) {
        setStatus("active");
        setDaysLeft(TRIAL_DAYS);
        return;
      }

      if (data.subscription_status === "active") {
        setStatus("subscribed");
        setDaysLeft(0);
        return;
      }

      const trialStart = new Date(data.trial_started_at);
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24));
      const remaining = Math.max(0, TRIAL_DAYS - elapsed);

      setDaysLeft(remaining);
      setStatus(remaining > 0 ? "active" : "expired");
    }

    check();
    return () => { cancelled = true; };
  }, []);

  const isPremiumLocked = status === "expired";

  return { status, daysLeft, isPremiumLocked };
}
