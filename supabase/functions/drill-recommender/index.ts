import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    // Fetch user data
    const [statsRes, sessionsRes, profileRes] = await Promise.all([
      supabase.from("player_stats").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("workout_sessions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
      supabase.from("player_profiles").select("*").eq("user_id", user.id).maybeSingle(),
    ]);

    const stats = statsRes.data;
    const sessions = sessionsRes.data || [];
    const profile = profileRes.data;

    // Build context for AI
    const skillRatings = stats?.skill_ratings || { shooting: 10, dribbling: 10, footwork: 10, conditioning: 10, agility: 10 };
    const weakestSkill = Object.entries(skillRatings as Record<string, number>).sort((a, b) => a[1] - b[1])[0];
    const strongestSkill = Object.entries(skillRatings as Record<string, number>).sort((a, b) => b[1] - a[1])[0];

    // Count drills by category from recent sessions
    const categoryCounts: Record<string, number> = {};
    for (const session of sessions) {
      const drills = (session.drills as any[]) || [];
      for (const drill of drills) {
        // We don't have category in drill session, but we have drillId
        categoryCounts[drill.drillId] = (categoryCounts[drill.drillId] || 0) + 1;
      }
    }

    const prompt = `You are a basketball training AI analyst for Layup Lab. Analyze this player's data and recommend 5 personalized drills for this week.

Player Profile:
- Username: ${profile?.username || 'Player'}
- Commitment: ${profile?.commitment_level || 'starting'}
- Goals: ${(profile?.goals || ['overall']).join(', ')}
- Equipment: ${(profile?.equipment || ['none']).join(', ')}
- Session length: ${profile?.session_length || 30} minutes
- Skill level: ${profile?.skill_level || 'beginner'}

Player Stats:
- XP: ${stats?.xp || 0}, Level: ${stats?.level || 1}
- Total drills completed: ${stats?.total_drills_completed || 0}
- Total training minutes: ${stats?.total_training_minutes || 0}
- Current streak: ${stats?.current_streak || 0} days
- Weakest skill: ${weakestSkill?.[0]} (${weakestSkill?.[1]}/100)
- Strongest skill: ${strongestSkill?.[0]} (${strongestSkill?.[1]}/100)
- Skill ratings: ${JSON.stringify(skillRatings)}

Recent activity: ${sessions.length} sessions in history

AVAILABLE DRILL IDS (use these exact IDs):
Shooting: s1 (Form Shooting), s2 (Free Throw Routine), s3 (Elbow Jumpers), s4 (Catch & Shoot 3s), s5 (Pull-Up Jumpers), s6 (Bank Shot), s7 (Floater), s8 (Spot-Up Shooting), s9 (Off-Screen Shooting), s10 (One-Dribble Pull-Up)
Dribbling: d1 (Pound Dribble), d2 (Crossover Series), d3 (Full-Court Dribbling), d4 (Cone Weave), d5 (Spider Dribble), d6 (Two-Ball), d7 (Tennis Ball), d8 (Kill Dribble), d9 (Figure-8), d10 (Retreat Dribble)
Footwork: f1 (Triple Threat Pivots), f2 (Defensive Slides), f3 (Drop Step), f4 (Euro Step), f5 (Jab Step), f6 (Closeout), f7 (Ladder Quick Feet), f8 (Spin Move), f9 (Step-Back), f10 (Box Jump to Sprint)
Conditioning: c1 (Suicides), c2 (Jump Rope), c3 (Wall Sits), c4 (Burpee Sprint), c5 (Plank Push-Up), c6 (Mountain Climbers), c7 (Band Squats), c8 (17s), c9 (Lunge Walk), c10 (Box Jumps)
Agility: a1 (Cone Shuffle), a2 (T-Drill), a3 (Pro Agility), a4 (Zig-Zag Sprint), a5 (Reaction Sprint), a6 (Lateral Bound), a7 (Backpedal Sprint), a8 (Dot Drill), a9 (Karaoke), a10 (4-Corner Sprint)

Return recommendations focusing on their weakest skills and goals. Be encouraging but specific about WHY each drill was chosen.`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a basketball training analyst. Return structured drill recommendations." },
          { role: "user", content: prompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "recommend_drills",
            description: "Return personalized drill recommendations for the player",
            parameters: {
              type: "object",
              properties: {
                recommendations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      drillId: { type: "string", description: "The drill ID from the available list" },
                      reason: { type: "string", description: "Why this drill is recommended (1-2 sentences)" },
                      priority: { type: "string", enum: ["high", "medium", "low"] },
                      focusArea: { type: "string", description: "The skill area this targets" },
                    },
                    required: ["drillId", "reason", "priority", "focusArea"],
                  },
                },
                overallReasoning: { type: "string", description: "2-3 sentence summary of the recommendation strategy" },
              },
              required: ["recommendations", "overallReasoning"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "recommend_drills" } },
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited — try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error: " + aiResponse.status);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in AI response");

    const result = JSON.parse(toolCall.function.arguments);

    // Save to database
    await supabase.from("drill_recommendations").upsert({
      user_id: user.id,
      recommendations: result.recommendations,
      reasoning: result.overallReasoning,
      generated_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }, { onConflict: "user_id" });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("drill-recommender error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
