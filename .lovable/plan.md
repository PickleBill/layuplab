

## Plan: Build the Layup Lab Demo App

Transform the landing page into a functional app with training plan generation, progress tracking, gamification, and AI video analysis. All data stored in localStorage for now (auth added later).

---

### Architecture

```text
/                  → Landing page (existing)
/onboarding        → Skill assessment quiz (3-4 steps)
/app               → Main app shell with sidebar/bottom nav
/app/dashboard     → Player card, streaks, weekly overview
/app/train         → Today's workout with drill cards + timer
/app/plan          → Full weekly plan view
/app/progress      → Charts, skill ratings, history
/app/analyze       → Upload video for AI form analysis
/app/challenges    → Daily challenges + leaderboard
```

### Phase 1: Core Data & Layout (foundation)

**New files:**
- `src/lib/storage.ts` — localStorage helpers for player profile, drill history, XP, streaks
- `src/lib/drills.ts` — Drill database (50+ drills across categories: shooting, dribbling, footwork, conditioning, agility) with difficulty levels, equipment requirements, duration, and technique tips
- `src/lib/plan-generator.ts` — Algorithm that builds a weekly plan based on skill level, goals, available time, and equipment. Balances categories across the week.
- `src/types/app.ts` — TypeScript types for Player, Drill, WorkoutPlan, DrillSession, Challenge, etc.

**New layout:**
- `src/components/app/AppLayout.tsx` — App shell with sidebar (desktop) / bottom tab bar (mobile), maintains the dark HUD aesthetic
- `src/components/app/AppSidebar.tsx` — Navigation: Dashboard, Train, Plan, Progress, Analyze, Challenges

### Phase 2: Onboarding Flow

**`src/pages/Onboarding.tsx`** — Multi-step form:
1. Skill level (Beginner / Intermediate / Advanced)
2. Primary goals (multi-select: shooting accuracy, ball handling, speed/agility, conditioning, overall)
3. Available equipment (hoop, cones, resistance band, jump rope, none)
4. Days per week + session length (30/45/60 min)

Saves profile to localStorage, generates first weekly plan, redirects to `/app/dashboard`.

### Phase 3: Dashboard & Player Card

**`src/pages/app/Dashboard.tsx`**:
- **Player Card** — Avatar initials, username, level, XP bar, current streak
- **Today's Workout** — Preview of today's drills with "Start Workout" CTA
- **Weekly Progress Ring** — Completed vs planned sessions
- **Recent Achievements** — Latest badges/milestones

### Phase 4: Training Session

**`src/pages/app/Train.tsx`**:
- Shows today's drill list with estimated times
- Each drill card: name, category badge, duration, difficulty dots, micro-learning tip
- "Start Drill" opens a **drill execution view** with:
  - Countdown timer (3-2-1)
  - Active timer with pause/resume
  - Technique tip overlay
  - "Complete" / "Skip" buttons
  - Rep counter for rep-based drills
- Post-drill: rate difficulty (easy/good/hard) — feeds back into plan generator
- Post-workout summary: XP earned, drills completed, streak update

### Phase 5: Weekly Plan View

**`src/pages/app/Plan.tsx`**:
- 7-day calendar grid showing each day's focus (e.g., Mon: Shooting + Footwork, Tue: Handles + Conditioning)
- Drill list per day, expandable
- "Regenerate Plan" button to get a new week
- Rest days included and marked

### Phase 6: Progress Dashboard

**`src/pages/app/Progress.tsx`**:
- **Skill radar chart** (shooting, dribbling, footwork, conditioning, agility) using Recharts
- **Workout history** — calendar heatmap of completed sessions
- **Stats cards** — Total drills completed, total training time, longest streak, current level
- **Trend lines** — Drills per week over time

### Phase 7: AI Video Analysis

**`src/pages/app/Analyze.tsx`**:
- Video upload or record from camera (using browser MediaRecorder API)
- Select analysis type: Shooting Form, Dribbling, Footwork
- Upload sends video frame(s) to a Lovable Cloud edge function
- **Edge function** (`supabase/functions/analyze-form/index.ts`): Sends frames to Gemini vision model via Lovable AI gateway, returns structured feedback (strengths, corrections, drill recommendations)
- Results display: feedback cards with specific corrections, links to relevant drills
- Requires enabling Lovable Cloud

### Phase 8: Gamification

**`src/components/app/` gamification components:**
- XP system: Earn XP for completing drills (10 XP), workouts (50 XP), challenges (100 XP), streaks (bonus multiplier)
- Level system: Every 500 XP = level up, with title progression (Rookie → Starter → Varsity → All-Star → MVP → Elite)
- **Daily Challenges** page: 3 random challenges per day (e.g., "Complete 100 free throws", "Do 5 minutes of cone drills")
- Streak tracking with visual fire/flame indicator
- Achievement badges (first workout, 7-day streak, 100 drills, etc.)

### Phase 9: Landing Page Integration

- Update "Start Your 7-Day Free Trial" button on landing page to link to `/onboarding`
- Update navbar "Start Free Trial" to link to `/onboarding`

---

### Files Summary

| Area | Files |
|------|-------|
| Types & data | `src/types/app.ts`, `src/lib/storage.ts`, `src/lib/drills.ts`, `src/lib/plan-generator.ts`, `src/lib/xp.ts` |
| Layout | `src/components/app/AppLayout.tsx`, `src/components/app/AppSidebar.tsx` |
| Pages | `src/pages/Onboarding.tsx`, `src/pages/app/Dashboard.tsx`, `src/pages/app/Train.tsx`, `src/pages/app/Plan.tsx`, `src/pages/app/Progress.tsx`, `src/pages/app/Analyze.tsx`, `src/pages/app/Challenges.tsx` |
| Components | Drill cards, timer, player card, skill radar, XP bar, challenge cards, achievement badges |
| Backend | `supabase/functions/analyze-form/index.ts` (AI video analysis) |
| Routing | `src/App.tsx` updated with all new routes |

### Tech Stack

- **State**: localStorage + React state (zustand if needed)
- **Charts**: Recharts (already in project dependencies or add it)
- **Video**: Browser MediaRecorder API + canvas frame extraction
- **AI**: Lovable AI gateway (Gemini vision) via edge function
- **Animations**: framer-motion (already installed)

### Recommended Build Order

Given scope, I recommend building in 3 messages:
1. **Foundation + Onboarding + Dashboard + Training** (types, drills DB, plan generator, app layout, onboarding, dashboard, train page)
2. **Progress + Plan View + Gamification** (charts, weekly view, XP/levels/streaks/challenges)
3. **AI Video Analysis** (edge function, video capture UI, results display)

