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
- **Hosting:** Vercel

---

## Project Structure

```
strategygrader/
├── app/
│   ├── api/
│   │   └── analyze/
│   │       └── route.ts          # POST /api/analyze
│   ├── report/
│   │   └── page.tsx              # Report display page
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                  # Homepage + form
├── config/
│   └── assetClasses.ts           # ADR lookup table
├── lib/
│   └── scoringEngine.ts          # Pure scoring logic
├── types/
│   └── strategy.ts               # All TypeScript types
└── CLAUDE.md                     # This file
```

---

## Current State (as of Session 2)

### What's Built (MVP — Complete)
- Strategy input form (`app/page.tsx`)
- Scoring engine (`lib/scoringEngine.ts`) — pure function, no DB dependency
- API route (`app/api/analyze/route.ts`) — POST /api/analyze with Zod validation
- Report page (`app/report/page.tsx`)
- Asset class config (`config/assetClasses.ts`)
- All TypeScript types (`types/strategy.ts`)

### What's NOT Built Yet
- Supabase database tables (blank — no tables exist yet)
- Authentication (starting from scratch)
- Any Phase 2 features

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

## Database Schema (Designed — Not Yet Created)

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
| Auth approach | Supabase Auth from scratch | Nothing built yet |

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
- Designed full Supabase database schema (see above)
- Decided on soft delete for strategy_submissions
- Decided on JSONB for score_breakdown and ai_feedback
- Established session workflow: user uploads changed files, Claude generates CLAUDE.md + session summary at end of session
- **Next session:** Create Supabase tables + set up Supabase Auth

---

## Next Session Checklist
- [ ] Create Supabase tables (SQL migrations)
- [ ] Set up Supabase Auth
- [ ] Wire up auth to Next.js
- [ ] Begin Phase 2 — AI feedback layer