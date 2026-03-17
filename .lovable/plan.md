

## Plan: Build Out "How the AI Works," Features, and Results Sections

Currently the landing page has placeholder-level content for these areas. Here's how to make each section feel like a real product.

---

### 1. "How It Works" Section (new component)

Replace the "Watch How the AI Works" button's implicit promise with a dedicated section between ProblemSection and FeaturesSection.

- **3-step visual flow** with numbered steps, icons, and short descriptions:
  1. **Set Up Your Phone** — "Prop your phone against a fence or lean it on the ground. No tripod, no extra gear." (Smartphone icon)
  2. **AI Analyzes Your Movement** — "Our computer vision tracks 17 skeletal joints in real-time, measuring shooting arc, release angle, and footwork patterns." (Eye/Scan icon)
  3. **Get Instant Corrections** — "Receive on-screen coaching cues and post-session breakdowns that pinpoint exactly what to fix." (Zap/Target icon)

- Visual: Horizontal stepped layout on desktop (connected by a dashed line/arrow), stacked vertically on mobile. Each step gets an animated icon container with the HUD aesthetic (border glow, subtle scanline).

- The hero "Watch How the AI Works" button scrolls to this section (`id="how-it-works"`).

### 2. Expand Features Section

Upgrade from the current simple 2x2 grid to richer feature cards with more detail:

- Add a **short tagline** above each description (e.g., "See what the pros see" for VisionForm).
- Add **mock metric badges** inside each card (e.g., "17 joint points tracked", "60-min custom plans", "15-sec breakdowns", "Global leaderboard").
- Add a subtle **animated illustration/icon area** per card — a small HUD-style visual element (e.g., a simplified arc diagram for VisionForm, a calendar grid for Adaptive Drills, a play button for Microlab, a rank badge for Gamification).
- Increase grid to show more visual weight — keep 2-col on desktop but make cards taller with internal layout (icon + tagline top, description middle, metric badge bottom).

### 3. Expand Results/Testimonials Section

Replace the single testimonial with a multi-testimonial section that builds credibility:

- **3 testimonial cards** in a grid/carousel:
  1. Tyler Vance (existing) — Varsity Guard, Lincoln High
  2. Maria Santos — "The adaptive drills fixed my weak-hand finishing. My left-side layup percentage went from 32% to 61% in 8 weeks." — AAU Forward
  3. Coach Davis — "I use the Coach's Corner reports to track my whole team's off-season progress. Game-changer for recruiting packets." — HS Head Coach

- Each card gets: avatar placeholder (initials-based), quote, name, role, and a **key stat badge** (e.g., "+18 PPG", "32% → 61%", "12 players tracked").

- Add a **results stats bar** above testimonials showing aggregate numbers: "10,000+ Athletes", "2.3M Shots Analyzed", "47% Avg. Improvement".

### 4. Wire Up Navigation

- Hero "Watch How the AI Works" button gets `onClick` to smooth-scroll to `#how-it-works`.
- Navbar "Results" link already points to `#testimonials` — keep as-is.

### Files Changed

| File | Change |
|------|--------|
| `src/components/HowItWorksSection.tsx` | New component — 3-step flow |
| `src/components/FeaturesSection.tsx` | Richer cards with taglines and metric badges |
| `src/components/TestimonialSection.tsx` | 3 testimonials + stats bar |
| `src/components/HeroSection.tsx` | Wire secondary CTA to scroll to `#how-it-works` |
| `src/pages/Index.tsx` | Add HowItWorksSection between ProblemSection and FeaturesSection |

All components will follow the existing pattern: `framer-motion` animations, Montserrat/Inter fonts, Electric Orange accent, dark card backgrounds, `lucide-react` icons.

