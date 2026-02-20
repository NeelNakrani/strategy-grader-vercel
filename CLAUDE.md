# CLAUDE.md — StrategyGrader Project Context

> This file is the source of truth for Claude across sessions.
> Updated at the end of every session. Commit this file after every session.

---

## Project Overview

**Product:** StrategyGrader — a web app that evaluates trading strategies and provides structured feedback on risk, expectancy, and logical weaknesses.

**Tagline:** "Is your strategy structurally sound — or are you just gambling?"

**Target Users:** Retail traders, prop firm aspirants, TradingView users, trading educators.

---

## Tech Stack

- **Frontend + API:** Next.js 14 (App Router)
- **Styling:** TailwindCSS + IBM Plex Mono
- **Validation:** Zod
- **Database:** Supabase (Postgres)
- **Auth:** Supabase Auth — Email+Password + Google OAuth
- **Hosting:** Vercel

---

## Project Structure

```
strategygrader/
├── app/
│   ├── api/
│   │   └── analyze/
│   │       └── route.ts          # POST /api/analyze
│   ├── auth/
│   │   ├── callback/
│   │   │   └── route.ts          # OAuth + email confirmation handler
│   │   ├── sign-in/
│   │   │   └── page.tsx
│   │   └── sign-up/
│   │       └── page.tsx
│   ├── report/
│   │   └── page.tsx              # Report display page
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                  # Homepage + form
├── config/
│   └── assetClasses.ts           # ADR lookup table
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser client
│   │   └── server.ts             # Server client
│   └── scoringEngine.ts          # Pure scoring logic
├── types/
│   └── strategy.ts               # All TypeScript types
├── middleware.ts                  # Session refresh — lives at project ROOT
└── CLAUDE.md                     # This file
```

---

## Current State (as of Session 3)

### What's Built (MVP — Complete)
- Strategy input form (`app/page.tsx`)
- Scoring engine (`lib/scoringEngine.ts`) — pure function, no DB dependency
- API route (`app/api/analyze/route.ts`) — POST /api/analyze with Zod validation
- Report page (`app/report/page.tsx`)
- Asset class config (`config/assetClasses.ts`)
- All TypeScript types (`types/strategy.ts`)

### What's Built (Session 3 — Auth)
- Supabase browser client (`lib/supabase/client.ts`)
- Supabase server client (`lib/supabase/server.ts`)
- Middleware for session refresh (`middleware.ts`) — at project root
- Sign-in page (`app/auth/sign-in/page.tsx`) — Email+Password + Google OAuth
- Sign-up page (`app/auth/sign-up/page.tsx`) — Email+Password + Google OAuth + email confirmation success state
- Auth callback route (`app/auth/callback/route.ts`) — handles OAuth redirect + email confirmation

### What's NOT Built Yet
- Wiring auth state into existing pages (header sign in/out button, save prompt on report page)
- Saving analyses to Supabase (currently only stored in sessionStorage)
- Any Phase 2 features

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
SUPABASE_SECRET_KEY=your_secret_key
```

**Important:** Using new Supabase key format — publishable + secret. NOT the legacy anon/service_role keys.

---

## Supabase Setup Checklist
- [x] Supabase project created and connected
- [x] All database tables created (see schema below)
- [x] `@supabase/ssr` installed
- [ ] Google OAuth provider enabled in Supabase dashboard (Authentication → Providers → Google)
- [ ] Redirect URLs configured in Supabase dashboard (Authentication → URL Configuration):
  - `http://localhost:3000/auth/callback`
  - `https://your-app.vercel.app/auth/callback`

---

## Scoring Engine — How It Works

**Weights:**
| Category | Weight |
|---|---|
| Risk/Reward | 30% |
| Risk per trade | 25% |
| Expectancy | 25% |
| Volatility fit | 20% |

**Grade Scale:**
| Score | Grade |
|---|---|
| 90–100 | A |
| 75–89 | B |
| 60–74 | C |
| 40–59 | D |
| < 40 | F |

**Key logic notes:**
- Win rate is optional — defaults to conservative 45% assumption if not provided
- Win rate score and expectancy score are averaged into one 25% bucket (they're mathematically linked)
- Volatility fit uses `adrTypical` from `assetClasses.ts` — stop is compared against typical daily range
- Score breakdown stored as JSONB in DB (not individual columns) for flexibility

---

## Database Schema (Created in Supabase)

### `profiles`
Extends Supabase Auth. Created automatically on user signup via trigger.
| Column | Type | Notes |
|---|---|---|
| id | uuid | FK to auth.users |
| username | text | |
| plan_tier | text | 'free' or 'pro' |
| created_at | timestamptz | |

### `strategy_submissions`
Every analysis run is auto-saved. Users can soft-delete.
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK to profiles |
| created_at | timestamptz | |
| is_deleted | boolean | Soft delete — filter out of UI, keep in DB |
| strategy_name | text | |
| market | text | Asset class id |
| timeframe | text | scalp / intraday / swing / position |
| stop_pct | numeric | |
| target_pct | numeric | |
| risk_per_trade_pct | numeric | |
| avg_trades_per_week | numeric | |
| win_rate_pct | numeric | nullable — null means 45% assumption was used |
| rr_ratio | numeric | Computed |
| required_win_rate | numeric | Computed |
| expectancy | numeric | Computed |
| final_score | integer | 0–100 |
| grade | text | A / B / C / D / F |
| score_breakdown | jsonb | Full sub-scores object |
| ai_feedback | jsonb | null for now — Phase 2 |

### `playbook_entries`
User explicitly saves and names an analysis.
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK to profiles |
| submission_id | uuid | FK to strategy_submissions |
| name | text | User-given name |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `playbook_notes`
Notes attached to a playbook entry over time.
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| playbook_entry_id | uuid | FK to playbook_entries |
| note_text | text | |
| created_at | timestamptz | |

### `strategy_templates`
Pre-built templates (Phase 2 — read only).
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| name | text | e.g. "Breakout Strategy" |
| market | text | |
| timeframe | text | |
| stop_pct | numeric | |
| target_pct | numeric | |
| risk_per_trade_pct | numeric | |
| avg_trades_per_week | numeric | |
| description | text | |
| is_active | boolean | |

---

## Key Decisions Made

| Decision | Choice | Reason |
|---|---|---|
| Auto-save analyses | Yes, with soft delete | Users see full progression, can clean up junk runs |
| score_breakdown storage | JSONB | Flexibility to evolve scoring model without migrations |
| ai_feedback storage | JSONB | Phase 2 — null for now |
| Win rate default | 45% conservative assumption | Flagged clearly in output when assumed |
| Auth methods | Email+Password + Google OAuth | Covers majority of users, low friction |
| Auth flow | Anonymous first, prompt to save after | Removes signup friction, value before commitment |
| Supabase key format | Publishable + Secret (new format) | Not legacy anon/service_role keys |

---

## Auth Flow (Important)

Users do NOT need to log in to run an analysis. The flow is:
1. User runs analysis anonymously
2. Report page shows results
3. A save prompt appears encouraging them to sign up / sign in to save
4. On sign up, Supabase sends confirmation email → user clicks link → `/auth/callback` exchanges code for session → redirects to `/`

**This wiring (save prompt + actually saving to DB) is NOT built yet — next session.**

---

## Session Workflow (How We Work Together)

- User uploads changed files at start of each session
- Claude generates updated CLAUDE.md + session summary at end of each session
- User commits CLAUDE.md to repo after every session

---

## Phase 2 Feature Priority

### Current Phase 2 (in order):
1. AI feedback layer
2. Personal playbook & strategy diary
3. Risk of ruin calculator
4. Monte Carlo simulation
5. Pre-built strategy templates

### Next Phase:
- Lightweight backtesting against benchmark data
- Prop firm challenge simulator
- Consistency analysis
- Community benchmarking
- Strategy health alerts

---

## Session Log

### Session 1
- Built full MVP: form, scoring engine, API route, report page
- Defined asset classes with ADR typical values
- Established TypeScript types

### Session 2
- Reviewed Phase 2 feature priority — confirmed order is good
- Designed full Supabase database schema
- Decided on soft delete for strategy_submissions
- Decided on JSONB for score_breakdown and ai_feedback
- Established session workflow

### Session 3
- Created all Supabase tables via SQL migration (including RLS policies + triggers)
- Installed `@supabase/ssr`
- Built Supabase browser + server clients (`lib/supabase/`)
- Built middleware.ts (session refresh — lives at project root)
- Built sign-in page, sign-up page, auth callback route
- Confirmed: new Supabase key format (publishable/secret, not legacy anon)
- Confirmed: middleware.ts lives at root, not inside app/
- **Still needs:** Google OAuth enabled in Supabase dashboard + redirect URLs configured

---

## Next Session Checklist
- [ ] Confirm auth is working locally (test sign up + Google OAuth)
- [ ] Add auth state to header (sign in / sign out button)
- [ ] Wire up save prompt on report page after anonymous analysis
- [ ] Wire up saving analysis to `strategy_submissions` table on sign in
- [ ] Begin Phase 2 — AI feedback layer