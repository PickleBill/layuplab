

## Plan: Interactive Drills, Auth, Real XP Tracking, and Leaderboard

This is a large but well-structured update covering 6 areas: drill video thumbnails, real-time XP in training, drill library interactions (favorites, mark complete), authentication with email + Google/Apple SSO, unified stats tracking, and a real leaderboard.

---

### 1. Drill Video Thumbnails (`src/lib/drills.ts`, `DrillLibrary.tsx`, `Train.tsx`)

Replace raw YouTube iframes with **placeholder thumbnail images** using YouTube's thumbnail API (`https://img.youtube.com/vi/{VIDEO_ID}/mqdefault.jpg`). Each drill card shows the thumbnail with a play overlay. Clicking opens the video dialog. Update all drills to ensure `videoUrl` points to real basketball coaching videos.

- Extract video ID from URL and generate thumbnail: `https://img.youtube.com/vi/${id}/mqdefault.jpg`
- Show thumbnail image on drill cards in both DrillLibrary and Train overview
- Keep the existing dialog-based video player on click

### 2. Real-Time XP During Training (`src/pages/app/Train.tsx`)

Currently XP is only awarded at workout summary. Change to:

- Show a **running XP counter** during the active workout (visible in the active drill view)
- When a drill is completed and rated, show a **+XP toast animation** with the amount earned for that drill
- Add a **"Go Back" button** during active drill and rate screens to return to the previous drill (allow re-doing or going back if incomplete)
- Track actual elapsed time per drill to compute real training minutes

### 3. Drill Library — Favorites & Mark Complete (`src/pages/app/DrillLibrary.tsx`, `src/lib/storage.ts`, `src/types/app.ts`)

Make the drill library interactive:

- **Favorites**: Add a heart/star toggle on each drill card. Store favorites in localStorage (`layuplab_favorites: string[]`). Add filter chip "Favorites" to show only saved drills
- **Mark Complete**: Add a "Complete" button on each drill card that awards XP (same as challenge completion), records a DrillSession in history, and updates stats (drills completed, training minutes += drill duration)
- After marking complete, show the drill as checked off with a subtle green border
- Add storage helpers: `getFavorites()`, `toggleFavorite()`, `getCompletedToday()` 

### 4. Authentication — Email + Google/Apple SSO

**Database tables** (via migration):
- `profiles` table: `id (uuid, FK to auth.users)`, `username text`, `avatar_url text`, `created_at timestamp`
- RLS: users can read/update own profile only
- Trigger: auto-create profile on signup

**Auth pages**:
- `src/pages/Auth.tsx` — login/signup form with email + password, plus Google and Apple SSO buttons
- Add `/auth` route in `App.tsx`
- Update `AppLayout.tsx` to check auth state and redirect to `/auth` if not logged in
- Add logout button in the app layout (settings/profile area)
- For Google/Apple SSO, use the Lovable Cloud managed OAuth flow (`lovable.auth.signInWithOAuth`)

**Data sync**: For now, keep localStorage as primary storage. Auth gives users an account identity. Future phase will migrate localStorage data to database tables.

### 5. Unified Stats Tracking (`src/lib/storage.ts`, all pages)

Ensure ALL drill completions (from Train, DrillLibrary, Challenges) use a shared function:

- Create `completeDrillAction(drillId: string, durationSeconds: number, rating?: 'easy'|'good'|'hard')` in storage.ts
- This function: adds XP, updates streak, increments `totalDrillsCompleted`, adds actual `durationSeconds/60` to `totalTrainingMinutes`, saves a DrillSession, checks achievements
- Refactor Train.tsx, DrillLibrary.tsx, and Challenges.tsx to all use this shared function
- Dashboard minutes now reflect real accumulated training time

### 6. Real Leaderboard (`src/pages/app/Leaderboard.tsx`)

Replace mock feed with a **real leaderboard** based on the current user's stats:

- Remove fake names. Show the current user's position prominently
- Show a ranked list where the user sees themselves alongside **computed "ghost" players** based on percentile benchmarks (e.g., "Average Player" at 500 XP, "Dedicated Grinder" at 2000 XP, "Elite Trainer" at 5000 XP) — these are aspirational targets, not fake people
- As the user earns XP, they move up past these benchmarks
- Keep the achievement badges section
- Remove the "coming soon" email signup section — the feed IS the leaderboard now

---

### Files Summary

| File | Change |
|------|--------|
| `src/lib/drills.ts` | Ensure all videoUrls are real coaching videos |
| `src/pages/app/DrillLibrary.tsx` | Thumbnails, favorites toggle, mark complete button |
| `src/pages/app/Train.tsx` | Real-time XP counter, go-back button, per-drill XP animation |
| `src/lib/storage.ts` | `completeDrillAction()`, favorites helpers, completed-today tracker |
| `src/types/app.ts` | Add favorites to storage types if needed |
| `src/pages/Auth.tsx` | NEW — login/signup with email + Google/Apple SSO |
| `src/App.tsx` | Add `/auth` route |
| `src/components/app/AppLayout.tsx` | Auth state check, logout button |
| `src/pages/app/Leaderboard.tsx` | Real leaderboard with benchmark players |
| `src/pages/app/Challenges.tsx` | Use shared `completeDrillAction` |
| `src/pages/app/Dashboard.tsx` | Stats now reflect real minutes |
| **Database migration** | `profiles` table + RLS + trigger |
| **Auth config** | Configure Google + Apple SSO via Lovable Cloud tools |

### Build Order
1. Storage helpers + unified drill completion function
2. DrillLibrary interactivity (thumbnails, favorites, complete)
3. Train page enhancements (real-time XP, go-back)
4. Auth (migration, Auth page, SSO setup, layout integration)
5. Leaderboard overhaul

