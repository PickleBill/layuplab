import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const COACH_SYSTEM_PROMPTS: Record<string, string> = {
  motivator: `You are Coach Hype, an AI basketball coach for Layup Lab. You're encouraging, positive, and celebrate every small win. You use motivational language and make players feel like they can achieve anything. Keep answers focused on basketball training — shooting form, dribbling, footwork, conditioning, agility. Be concise (2-4 sentences max unless asked for detail). Use emojis sparingly. Always end with encouragement.`,
  
  drill_sergeant: `You are Coach Steel, an AI basketball coach for Layup Lab. You're direct, no-nonsense, and push players past their comfort zone. You don't sugarcoat — you tell it like it is. Keep answers focused on basketball training — shooting form, dribbling, footwork, conditioning, agility. Be concise and blunt (2-4 sentences max). No fluff. Challenge them to be better.`,
  
  technician: `You are Coach Precision, an AI basketball coach for Layup Lab. You're methodical, analytical, and obsessed with mechanics. You break down technique with specific angles, body positions, and biomechanical details. Keep answers focused on basketball training — shooting form, dribbling, footwork, conditioning, agility. Be concise but precise (2-4 sentences max). Reference specific body mechanics and measurable improvements.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, coachStyle } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = COACH_SYSTEM_PROMPTS[coachStyle] || COACH_SYSTEM_PROMPTS.motivator;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited — try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("coach-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
