## Plan: Drill Library, Streamlined Onboarding, and Celebrity AI Coach Onboarding

Three interconnected changes: a new Drill Library page, a drastically simplified onboarding (1-2 questions), and an AI coach chatbot that handles the detailed onboarding conversationally using celebrity basketball player personas.

---

### 1. Drill Library Page

**New file: `src/pages/app/DrillLibrary.tsx**`

A browsable grid of all 50+ drills from `drills.ts` with:

- **Filter bar** at top: Category chips (Shooting, Dribbling, Footwork, Conditioning, Agility), Difficulty selector (1/2/3 stars), Equipment multi-select
- **Drill cards** in a responsive grid showing: name, category badge, difficulty dots, duration, equipment tags, and a "Watch Demo" button that opens the YouTube video in a dialog
- **Expandable detail** on click: full description, technique tip, skill levels
- Search input for quick filtering by name

**Routing:** Add `/app/drills` route in `App.tsx`. Add a "Drills" nav item (BookOpen icon) to `AppLayout.tsx` nav between Train and Plan.

### 2. Streamlined Onboarding (1 panel, 2 questions)

**Rewrite `src/pages/Onboarding.tsx**` — collapse the current 6-step flow into a single screen:

- **Name input** — "What should we call you?"
- **Commitment level** — 3 cards: "Just getting started" / "I'm putting in work" / "This is my life"
- **"Let's Go" button** — saves a minimal profile with sensible defaults:
  - `goals: ['overall']`
  - `coachStyle: 'motivator'` (default, will be set by AI coach)
  - `equipment: ['none']`
  - `trainingDays`: all 7 days (coach will refine)
  - `sessionLength: 45`
  - `tier: 'prove_it'`
- Generates a default plan and navigates to `/app/dashboard`

This gets users into the app in under 15 seconds.

### 3. Celebrity AI Coach Onboarding Chatbot

**Update edge function `supabase/functions/coach-chat/index.ts`:**

Replace the generic coach personas with 3 celebrity basketball player personas:

- **Kobe Bryant** — Mamba Mentality. Intense, detail-oriented, demands perfection. "You think one workout is enough? Do it again."
- **LeBron James** — Strategic, team-minded, analytical. "Let's build your game systematically. What's your weakest link?"
- **Steph Curry** — Fun, creative, encouraging. "Shooting is an art — let's find your rhythm."
- add a coach perspective - a famous one
- and also a funny character ffrom  basketball lore or some other comedic type of personality 

The system prompt instructs the coach to proactively ask the new user about their goals, equipment, training schedule, and preferred session length during conversation — effectively doing the detailed onboarding through natural dialogue. When the coach has enough info, it tells the user "I've updated your plan" and returns a structured JSON block (via a `[PROFILE_UPDATE]` tag in the response) that the frontend parses to update the profile and regenerate the plan.

**Update `AppLayout.tsx` coach chat:**

- Change `COACH_NAMES` to the 3 celebrity names
- When the user first enters the app (no detailed profile yet), auto-open the chat with a welcome message from the default coach: "Hey [name]! I'm [Coach]. Let me ask you a few things so I can build your perfect training plan..."
- Parse `[PROFILE_UPDATE]{...}` JSON from coach responses to update profile/plan automatically
- Add a coach selector in the chat header (3 avatar buttons) so users can switch celebrities anytime — this updates `coachStyle` in storage and resets the chat

**Update `src/types/app.ts`:**

- Update `CoachStyle` type to `'kobe' | 'lebron' | 'curry'`

**Update `src/lib/storage.ts`:**

- Add `hasDetailedProfile(): boolean` — checks if profile has been enriched beyond defaults (e.g., goals !== ['overall'] or equipment !== ['none'])

---

### Files Summary


| File                                     | Change                                                                                                     |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `src/pages/app/DrillLibrary.tsx`         | NEW — filterable drill grid with video modals                                                              |
| `src/pages/Onboarding.tsx`               | Rewrite to single-panel 2-question flow                                                                    |
| `src/App.tsx`                            | Add `/app/drills` route                                                                                    |
| `src/components/app/AppLayout.tsx`       | Add Drills nav item, celebrity coach selector, auto-open chat for new users, parse profile updates from AI |
| `supabase/functions/coach-chat/index.ts` | Celebrity personas (Kobe/LeBron/Curry), onboarding-aware system prompt                                     |
| `src/types/app.ts`                       | Update CoachStyle to `'kobe'                                                                               |
| `src/lib/storage.ts`                     | Add `hasDetailedProfile()` helper                                                                          |
