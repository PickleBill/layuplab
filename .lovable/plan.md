

## Plan: Ava's Feedback — 5 Changes

### 1. Drill Demo Videos — "Watch how to do it"
Add a `videoUrl` field to the `Drill` type and populate it with real YouTube links to Pete Chilcut or similar coaching demos. Show a "Watch Demo" button on each drill card in the Training page that opens the video in a modal or inline player.

**Files:** `src/types/app.ts` (add `videoUrl?: string`), `src/lib/drills.ts` (add YouTube URLs to each drill), `src/pages/app/Train.tsx` (add Watch Demo button + embedded player modal)

### 2. Video Library — saved analysis uploads
Currently, uploaded videos are analyzed and discarded. Add localStorage persistence for past analyses so users can review them later. Create a new "My Videos" tab/section on the Analyze page showing a grid of thumbnails with date, analysis type, and score.

**Files:** `src/types/app.ts` (add `AnalysisRecord` type), `src/lib/storage.ts` (add `getAnalysisHistory`/`saveAnalysisRecord` helpers), `src/pages/app/Analyze.tsx` (save results after analysis, add "My Videos" tab showing history with thumbnails and scores)

### 3. Drill ordering — Form Shooting always first
The plan generator currently shuffles drills randomly within a day. Change `pickDrillsForDay` to sort shooting/form drills first (prioritize by category: shooting before others, and within shooting prioritize lower difficulty first so "Form Shooting" lands at position 1). This ensures fundamentals come before everything else every day.

**Files:** `src/lib/plan-generator.ts` (sort picked drills: shooting first, then by difficulty ascending)

### 4. Real leaderboard — remove mock data
Replace the hardcoded `MOCK_LEADERBOARD` array. Since we're localStorage-only right now, the leaderboard should show only the current user's stats (their rank, XP, level). Display a message that the leaderboard will populate as more players join. Show the user's own player card prominently instead of fake names.

**Files:** `src/pages/app/Leaderboard.tsx` (remove mock data, show user's own stats with a "leaderboard coming soon" state)

### 5. Choose specific training days
Currently onboarding asks for "days per week" (a number like 4) and the plan generator auto-distributes days. Change this to let users pick *which* specific days they want to train (e.g., Mon/Wed/Fri/Sat). Update the onboarding step and the plan generator to use those exact days.

**Files:** `src/types/app.ts` (change `daysPerWeek: number` to `trainingDays: DayOfWeek[]`, keep `daysPerWeek` as computed), `src/pages/Onboarding.tsx` (replace number selector with day-of-week multi-select toggles), `src/lib/plan-generator.ts` (use `profile.trainingDays` instead of auto-distributing)

---

### Build order
All 5 changes are independent and will be implemented together in one pass.

