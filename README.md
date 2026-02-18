# StrategyGrader — MVP

A web application that evaluates trading strategies and provides structured feedback on risk, expectancy, and logical weaknesses.

## Stack

- **Frontend + API**: Next.js 14 (App Router)
- **Styling**: TailwindCSS + IBM Plex Mono
- **Validation**: Zod
- **Database (Phase 2)**: Supabase (Postgres)
- **Hosting**: Vercel

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
│   └── assetClasses.ts           # ADR lookup table (typed config)
├── lib/
│   └── scoringEngine.ts          # Pure scoring logic (decoupled from HTTP)
├── types/
│   └── strategy.ts               # All TypeScript types
├── .env.example
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Copy env file
cp .env.example .env.local
# (Leave Supabase vars empty for MVP — not required for core scoring)

# 3. Run dev server
npm run dev

# 4. Open http://localhost:3000
```

---

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login and deploy
vercel

# Set env vars in Vercel dashboard or via CLI:
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Or connect your GitHub repo directly in the Vercel dashboard — it will auto-deploy on push.

---

## Scoring Engine

The engine is a pure function in `lib/scoringEngine.ts`. It takes a `StrategyInput` and returns a `StrategyReport`. It has **zero dependencies** on HTTP, database, or framework code — making it independently testable and reusable.

### Weights (from design doc)
| Category | Weight |
|---|---|
| Risk/Reward | 30% |
| Risk per trade | 25% |
| Expectancy | 25% |
| Volatility fit | 20% |

### Grade Scale
| Score | Grade |
|---|---|
| 90–100 | A |
| 75–89 | B |
| 60–74 | C |
| 40–59 | D |
| < 40 | F |

---

## Phase 2 Roadmap

- [ ] Supabase anonymous session storage for report history
- [ ] Optional "Save report" → magic link signup
- [ ] Strategy comparison view
- [ ] Monte Carlo simulation module
- [ ] Stripe subscription billing
- [ ] PDF export (server-side)
- [ ] PineScript parsing service
- [ ] AI suggestion engine

---

## Disclaimer

StrategyGrader provides mathematical analysis for educational purposes only. Not financial advice.
