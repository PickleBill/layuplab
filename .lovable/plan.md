

## Plan: Layup Lab V2 — Full Enhancement Pass

This is a large but well-scoped update across 9 areas. All changes modify existing files — no new pages needed except one new edge function for the AI chatbot coach.

---

### 1. Pricing Overhaul (`src/components/PricingSection.tsx`)

Replace the `tiers` array with Ava's exact model:
- **Prove It** — $25/mo, commitment-focused copy, CTA "I'm Ready"
- **Lock In** — $50/mo, highlighted, CTA "Level Up"  
- **No Limits** — $100/mo, CTA "Go Elite"

Tone: aspirational/exclusive ("Are you that type of person?"), NOT skill-based. Keep existing card layout, animations, glow border.

### 2. Form Shooting Always First (`src/lib/plan-generator.ts`)

After `pickDrillsForDay` builds the drill list, force `shooting-1` (or `shooting-2` fallback) to index 0 of every training day. If it's already present, move it; if not, insert it and drop the last drill if needed to stay within the time budget. This goes in the day-building loop inside `generateWeeklyPlan`.

### 3. Onboarding Overhaul (`src/pages/Onboarding.tsx`, `src/types/app.ts`)

**Types changes:**
- Add `CommitmentLevel = 'starting' | 'working' | 'competing'`
- Add `CoachStyle = 'motivator' | 'drill_sergeant' | 'technician'`
- Add `Tier = 'prove_it' | 'lock_in' | 'no_limits'`
- Add these fields to `PlayerProfile`, keep `skillLevel` for internal drill filtering (map commitment → skillLevel internally)

**6-step onboarding flow:**
1. Profile + Commitment ("How serious are you?" with 3 cards replacing skill level)
2. Goals (unchanged)
3. Coach Style (NEW — 3 personality cards: Motivator, Drill Sergeant, Technician)
4. Equipment (unchanged)
5. Training Schedule (unchanged day picker + session length)
6. Tier Selection (show 3 pricing cards matching PricingSection design, stored as `tier`)

Update progress bar from 4 to 6 segments. Map commitment internally: starting→beginner, working→intermediate, competing→advanced.

### 4. Daily Challenges Confirmation (`src/pages/app/Challenges.tsx`)

Replace the instant `completeChallenge` call with an `AlertDialog`:
- "Did you actually complete [Challenge Name]?"
- "Yes, I did it" (awards XP) / "Not yet" (dismisses)
- Add note below cards: "Be honest — your progress depends on it. Real verification coming soon."

### 5. Landing Page Tone (`src/components/HeroSection.tsx`, `src/components/ProblemSection.tsx`)

**Hero body copy:** "Most hoopers can't afford a private coach. Layup Lab puts one in your pocket — AI that watches your form, builds your plan, and pushes you to prove yourself. No gym membership required. Just your phone and a court."

**Problem body copy:** "You're putting in the hours, but nobody's watching. No coach. No feedback. No structure. Just you and a hoop — grinding without knowing if you're getting better or just getting tired. Layup Lab changes that."

Update the `$100/hour` callout text.

### 6. Leaderboard → Strava-Style Feed (`src/pages/app/Leaderboard.tsx`)

Replace current content with:
- "Your Training Feed" header
- 3-4 mock Strava-style activity cards (e.g., "completed a 45-min shooting session")
- "Training feed launching soon" note about public-by-default accountability
- Email signup input with toast confirmation
- Keep user's own stats card at top

### 7. Branding Cleanup (`index.html`)

- `twitter:site` → `@LayupLab`
- Remove both `og:image` and `twitter:image` meta tags (expired CDN URLs)

### 8. Dashboard Weekly Progress Fix (`src/pages/app/Dashboard.tsx`)

Replace `const completedDays = 0;` with real calculation using `getSessions()` — count sessions whose date falls within the current week. Display as "X/Y days this week".

### 9. Navbar Updates (`src/components/Navbar.tsx`)

- Add "How It Works" link between Features and Pricing (anchors to `#how-it-works`)
- Change "Start Free Trial" to "Get Started" linking to `/onboarding`
- On the landing page CTA buttons, also update copy from "Start Your 7-Day Free Trial" to "Get Started" in `HeroSection.tsx`

### 10. AI Coach Chatbot (NEW edge function + app integration)

Create `supabase/functions/coach-chat/index.ts` — a conversational AI coach that:
- Uses the player's `coachStyle` to set personality in the system prompt
- Accepts text messages and returns coaching responses
- Uses Gemini 2.5 Flash via Lovable AI gateway

Add a floating "Ask Coach" button in `AppLayout.tsx` that opens a chat drawer/dialog. The coach can:
- Answer technique questions ("How do I improve my crossover?")
- Give motivational nudges based on stats
- Suggest drills and tips contextually

The coach personality adjusts based on the selected style (Motivator = encouraging, Drill Sergeant = direct/pushing, Technician = analytical).

### 11. Contextual Tips in Dashboard

Add a "Coach's Tip" card on the Dashboard that uses the coach style to display a rotating tip. Pull from a static array of tips categorized by drill type, with tone matching the selected coach personality.

---

### Files Modified

| File | Changes |
|------|---------|
| `src/types/app.ts` | Add CommitmentLevel, CoachStyle, Tier types; update PlayerProfile |
| `src/components/PricingSection.tsx` | New tier data |
| `src/lib/plan-generator.ts` | Force shooting-1 first |
| `src/pages/Onboarding.tsx` | 6-step flow with commitment + coach style + tier |
| `src/pages/app/Challenges.tsx` | Confirmation dialog |
| `src/components/HeroSection.tsx` | New copy + "Get Started" CTA |
| `src/components/ProblemSection.tsx` | New copy |
| `src/pages/app/Leaderboard.tsx` | Strava-style feed |
| `index.html` | Fix meta tags |
| `src/pages/app/Dashboard.tsx` | Real weekly progress + Coach's Tip card |
| `src/components/Navbar.tsx` | Add "How It Works" link, "Get Started" CTA |
| `src/components/app/AppLayout.tsx` | Floating "Ask Coach" button + chat drawer |
| `src/lib/storage.ts` | Add coach style getter helper |
| `supabase/functions/coach-chat/index.ts` | NEW — AI chatbot edge function |

