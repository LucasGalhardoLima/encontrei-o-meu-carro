# Quickstart: Preference-Based Car Discovery

**Feature Branch**: `001-preference-car-discovery`
**Date**: 2026-02-18

## Prerequisites

- Node.js 20+
- PostgreSQL (Neon connection string or local)
- npm

## Setup

```bash
# 1. Clone and checkout branch
git checkout 001-preference-car-discovery

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with:
#   DATABASE_URL=postgresql://...
#   ADMIN_USER=admin
#   ADMIN_PASSWORD=<your-password>
#   PARALLELUM_TOKEN=<optional-for-higher-rate-limits>
#   ANTHROPIC_API_KEY=<for-llm-enrichment>

# 4. Run database migrations
npx prisma migrate dev

# 5. Seed initial data
npx prisma db seed

# 6. Start development server
npm run dev
```

## Verify It Works

1. Open `http://localhost:5173` — homepage with quiz CTA.
2. Complete the quiz — see ranked results with match percentages.
3. Tap a car — see enriched detail page with 400km trip metric.
4. Select 2-4 cars — compare side by side.
5. Favorite a car — check garage page persists across refresh.
6. Visit `http://localhost:5173/admin` — log in with admin
   credentials, see moderation queue.

## Run Tests

```bash
# Unit tests
npm run test:unit

# E2E tests (requires dev server running)
npm run test:e2e

# Type checking
npm run typecheck
```

## Trigger Ingestion Manually

```bash
# Via admin UI
# Navigate to /admin → click "Run Ingestion"

# Via CLI (future)
npx tsx scripts/run-ingestion.ts
```

## Key Routes

| Route | Description |
|-------|-------------|
| `/` | Homepage — quiz CTA + "Browse all" link |
| `/quiz` | Interactive preference quiz (4 sliders) |
| `/results` | Ranked results (match mode) or catalog (browse mode) |
| `/carros/:id` | Car detail with enriched metrics |
| `/compare` | Side-by-side comparison (2-4 cars) |
| `/garagem` | Personal garage (favorites) |
| `/admin` | Moderation queue + catalog management |

## Architecture Notes

- **SSR**: All public pages are server-side rendered via React
  Router v7 loaders. Match scoring happens server-side.
- **Client state**: Quiz preferences, comparison selections, and
  favorites are stored in Zustand (localStorage). No user accounts.
- **Ingestion**: Daily cron at 3 AM BRT. Sources: Parallelum FIPE
  (pricing) → Inmetro PBE (fuel efficiency) → LLM (specs) → KBB/
  Wikimedia (images). All new cars enter moderation queue.
- **Scoring**: Pre-calculated at ingestion/approval time via
  `calculateScores()`. Match percentages computed per-request
  against user weights via `calculateMatch()`.
