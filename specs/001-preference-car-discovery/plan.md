# Implementation Plan: Preference-Based Car Discovery

**Branch**: `001-preference-car-discovery` | **Date**: 2026-02-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-preference-car-discovery/spec.md`

## Summary

Build a preference-based car discovery website for the Brazilian
market. Users complete a quiz to express priorities (comfort,
economy, performance, space) and receive a ranked list of cars by
match percentage. Each car displays enriched, human-readable data
(400km trip fuel stops, trunk in suitcases, range on a full tank).
Users can compare 2-4 cars side by side and save favorites to a
local garage. An automated daily ingestion pipeline populates the
catalog from FIPE pricing, Inmetro fuel data, and LLM-enriched
specs, with admin moderation before publication.

The frontend is built from scratch. Backend logic (scoring,
matching, DB schema, utilities) is reused from the existing
codebase with targeted modifications.

## Technical Context

**Language/Version**: TypeScript 5.x, strict mode, ES2022 target
**Primary Dependencies**: React 19, React Router v7 (SSR), Tailwind
CSS 4, shadcn/ui (New York style), Zustand, Zod, Prisma 5.x
**Storage**: PostgreSQL (Neon) via Prisma ORM
**Testing**: Vitest (unit) + Playwright (E2E)
**Target Platform**: Web (SSR, mobile-first responsive)
**Project Type**: Web application (single project, full-stack SSR)
**Performance Goals**: TTFB < 200ms p95, TTI < 3s on 4G, bundle
< 200KB gzipped, DB queries < 100ms p95
**Constraints**: LCP < 2.5s, CLS < 0.1, mobile-first (320px min)
**Scale/Scope**: ~200-500 cars, ~6 user-facing routes + admin,
daily ingestion of ~415 API requests

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Type-Safe Code Quality | PASS | TypeScript strict, Zod at boundaries, .server.ts for DB logic, ~/  aliases |
| II. Testing Discipline | PASS | Vitest for scoring/matching/utils, Playwright for all user journeys |
| III. User Experience Consistency | PASS | Skeleton states, error handling, state preservation via Zustand, pt-BR, WCAG 2.1 AA |
| IV. Modern & Scalable Interface | PASS | Tailwind-only, shadcn/ui, composition pattern, mobile-first 320px, 44px touch targets |
| V. Performance Standards | PASS | SSR for TTFB, bundle budget, Prisma select/include, image optimization, Core Web Vitals targets |

**Gate result**: ALL PASS. No violations. Proceed.

## Project Structure

### Documentation (this feature)

```text
specs/001-preference-car-discovery/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0: data sources & decisions
├── data-model.md        # Phase 1: entity definitions
├── quickstart.md        # Phase 1: setup guide
├── contracts/
│   └── api.md           # Phase 1: API contracts
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
app/
├── components/          # NEW — all components from scratch
│   ├── ui/              # shadcn/ui primitives (Button, Card, etc.)
│   ├── quiz/            # Quiz step components
│   ├── car/             # CarCard, CarDetail, EnrichedMetrics
│   ├── comparison/      # ComparisonTable, MetricRow
│   ├── garage/          # GarageList, GarageActions
│   ├── admin/           # ModerationQueue, CarForm, IngestionStatus
│   └── layout/          # Header, Footer, Navigation, SkipLink
├── routes/              # NEW — all routes from scratch
│   ├── home.tsx         # / — Quiz CTA + Browse link
│   ├── quiz.tsx         # /quiz — Preference sliders
│   ├── results.tsx      # /results — Ranked/browse car list
│   ├── car-detail.tsx   # /carros/:id — Enriched car page
│   ├── compare.tsx      # /compare — Side-by-side (2-4 cars)
│   ├── garage.tsx       # /garagem — Favorites
│   ├── admin.tsx        # /admin — Moderation queue
│   ├── admin.cars.new.tsx    # /admin/cars/new
│   ├── admin.cars.$id.tsx    # /admin/cars/:id
│   ├── api.cars.tsx     # /api/cars (GET)
│   ├── api.cars.search.tsx   # /api/cars/search (GET)
│   ├── api.feedback.tsx # /api/feedback (POST)
│   └── resource.og.tsx  # /resource.og (GET)
├── services/            # NEW + MODIFIED
│   ├── ingestion/       # NEW — ingestion pipeline
│   │   ├── parallelum.server.ts  # FIPE API client
│   │   ├── inmetro.server.ts     # PDF parser
│   │   ├── llm-enrichment.server.ts  # Claude API specs
│   │   ├── image-fetcher.server.ts   # KBB + Wikimedia
│   │   └── runner.server.ts      # Orchestrator
│   ├── fipe.server.ts   # REUSED (mock data for testing)
│   └── kbb.server.ts    # REUSED (mock data for testing)
├── utils/               # REUSED — mostly unchanged
│   ├── score.server.ts  # REUSED as-is (calculateScores)
│   ├── match.server.ts  # REUSED as-is (calculateMatch)
│   ├── metrics.ts       # REUSED as-is (format helpers)
│   ├── price.ts         # REUSED as-is (toPriceNumber)
│   ├── deep-links.ts    # REUSED as-is (marketplace URLs)
│   ├── db.server.ts     # REUSED as-is (Prisma singleton)
│   ├── admin-auth.server.ts  # REUSED as-is (Basic auth)
│   └── enriched-metrics.server.ts  # NEW — 400km trip, suitcases
├── schemas/
│   └── car.ts           # MODIFIED — add tank_capacity, moderation
├── stores/
│   ├── comparison.ts    # MODIFIED — increase max from 2 to 4
│   └── favorites.ts     # REUSED as-is
├── lib/
│   └── utils.ts         # shadcn/ui cn() helper
├── root.tsx             # NEW — root layout
├── routes.ts            # NEW — route configuration
└── app.css              # NEW — Tailwind + CSS variables

prisma/
├── schema.prisma        # MODIFIED — new models + fields
├── migrations/          # NEW migrations for schema changes
└── seed.ts              # MODIFIED — set existing cars to approved

scripts/
├── run-ingestion.ts     # NEW — CLI trigger for ingestion
├── parse-inmetro-pdf.ts # NEW — Inmetro PBE parser
├── crawl-car-images.ts  # EXISTING — image crawler
└── ingest-data.ts       # EXISTING — data comparison

tests/
├── quiz-flow.spec.ts    # NEW — E2E quiz → results
├── car-detail.spec.ts   # NEW — E2E enriched data
├── comparison.spec.ts   # NEW — E2E compare 2-4 cars
├── garage.spec.ts       # NEW — E2E favorites
├── admin.spec.ts        # NEW — E2E moderation
├── browse.spec.ts       # NEW — E2E browse without quiz
└── seo.spec.ts          # NEW — E2E OG images + meta
```

**Structure Decision**: Single full-stack project using React
Router v7 SSR. No separate frontend/backend split. This matches the
existing architecture and constitution constraints. The ingestion
pipeline lives under `app/services/ingestion/` as server-only code.

## Complexity Tracking

> No Constitution Check violations. No complexity justifications needed.

## Post-Design Constitution Re-Check

| Principle | Status | Verification |
|-----------|--------|--------------|
| I. Type-Safe Code Quality | PASS | All new code is .ts/.tsx strict. Zod validates API inputs, route params, ingestion data. Server logic in .server.ts files. Path aliases used throughout. |
| II. Testing Discipline | PASS | Unit tests planned for: enriched-metrics, ingestion parsers, score/match (existing). E2E tests planned for all 6 user journeys + admin + browse. |
| III. User Experience Consistency | PASS | Skeleton states in all loaders. Error boundaries per route. Zustand preserves quiz/comparison/favorites. pt-BR throughout. ARIA labels on all interactive elements. |
| IV. Modern & Scalable Interface | PASS | All styling via Tailwind. All primitives via shadcn/ui. Component composition pattern. Mobile-first 320px. No component > 200 lines JSX (split into sub-components). |
| V. Performance Standards | PASS | SSR loaders for TTFB. Only approved cars queried (indexed). Prisma select for minimal data. Lazy image loading. Bundle monitored. |

**Final gate result**: ALL PASS. Ready for task generation.
