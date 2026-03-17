import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, analysisType } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "No image data provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are an elite basketball coach and biomechanics analyst. The user has uploaded a frame from their basketball training video. Analyze what you see and provide detailed, actionable coaching feedback.

Analysis type: ${analysisType || "general"}

Respond with a JSON object using this exact structure:
{
  "overallScore": <number 1-100>,
  "summary": "<1-2 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "corrections": [
    {"area": "<body part/technique>", "issue": "<what's wrong>", "fix": "<specific correction>", "priority": "high|medium|low"},
    ...
  ],
  "drillRecommendations": ["<drill name 1>", "<drill name 2>", "<drill name 3>"],
  "detailedNotes": "<paragraph with detailed biomechanical analysis>"
}

Focus on:
- For shooting: release angle, elbow alignment, follow-through, balance, arc, footwork
- For dribbling: hand position, ball height, body posture, head position, speed
- For footwork: stance width, weight distribution, pivot technique, defensive positioning

Be specific and constructive. Reference body mechanics using proper terminology.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this basketball ${analysisType || "training"} frame and provide detailed coaching feedback in the JSON format specified.`,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage credits exhausted. Please add credits in your workspace settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI analysis failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Extract JSON from the response
    let analysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        analysis = JSON.parse(content);
      }
    } catch {
      analysis = {
        overallScore: 70,
        summary: content.substring(0, 200),
        strengths: ["Analysis completed"],
        corrections: [{ area: "General", issue: "See detailed notes", fix: "Review the full analysis", priority: "medium" }],
        drillRecommendations: ["Form Shooting", "Defensive Slides"],
        detailedNotes: content,
      };
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-form error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
