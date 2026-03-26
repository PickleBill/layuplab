

## Plan: Enhanced Onboarding + Guided First-Time Experience

### Problem
Onboarding is too bare (just name + commitment), the AI coach auto-opens and overlays the dashboard immediately, and new users face 8 nav tabs with no guidance.

### Changes

#### 1. Expand Onboarding with Optional Detail Panel (`src/pages/Onboarding.tsx`)

Keep the current name + commitment as the top section. Below it, add a collapsible/expandable "Customize your plan" panel with:

- **Session length** — 3 toggle buttons: 30 / 45 / 60 min (default 45)
- **What to focus on** — Goal chips (Shooting, Ball Handling, Speed & Agility, Conditioning) as multi-select toggles, with "Overall" as default if none selected
- **Training days** — 7 day-of-week toggle buttons (default all selected)

The panel has a subtle header like "Optional — customize your training" with a chevron to expand/collapse. Collapsed by default so users can skip it entirely.

The "Let's Go" button stays always visible below everything. Whether they customize or not, it works — defaults are already sensible.

#### 2. Stop Auto-Opening Coach Chat (`src/components/app/AppLayout.tsx`)

Remove the `useEffect` that auto-opens the chat and fires a greeting when `!hasDetailedProfile()`. The coach button stays floating — users open it when ready.

#### 3. Add First-Time Guided Welcome to Dashboard (`src/pages/app/Dashboard.tsx`)

When `!hasDetailedProfile()` (user skipped customization) OR on first visit (detect via a `layuplab_welcomed` localStorage flag), show a **welcome overlay/banner** at the top of the dashboard:

- **Welcome card** with the user's name: "Welcome to the court, [Name]! Here's how to get started:"
- **3 guided action cards** in a horizontal scroll/grid:
  1. 🏀 **"Start Today's Workout"** — "Your first session is ready. Tap to begin." → navigates to `/app/train`
  2. 📚 **"Browse the Drill Library"** — "Explore 50+ drills with video demos." → navigates to `/app/drills`
  3. 💬 **"Talk to Your Coach"** — "Ask Kobe, LeBron, or Curry anything." → opens the coach chat
- A small "Dismiss" link that sets `layuplab_welcomed = true` and hides the card permanently

This guides without blocking — it's a prominent but dismissable section at the top of the dashboard.

#### 4. Files Modified

| File | Change |
|------|--------|
| `src/pages/Onboarding.tsx` | Add collapsible customization panel (session length, goals, training days) |
| `src/components/app/AppLayout.tsx` | Remove auto-open chat `useEffect` |
| `src/pages/app/Dashboard.tsx` | Add first-time welcome guide with 3 action cards |
| `src/lib/storage.ts` | Add `hasBeenWelcomed()` / `setWelcomed()` helpers |

