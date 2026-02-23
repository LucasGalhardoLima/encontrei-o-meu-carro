# Research: Preference-Based Car Discovery

**Feature Branch**: `001-preference-car-discovery`
**Date**: 2026-02-18

## Decision 1: Data Sources for Automated Ingestion

**Decision**: Use a three-layer data pipeline: Parallelum FIPE API
(pricing/identity) + Inmetro PBE PDF (fuel efficiency) + LLM
enrichment (specs/dimensions).

**Rationale**: No single API provides complete Brazilian car data.
FIPE covers pricing authoritatively but has zero spec data. Inmetro
provides official lab-tested fuel consumption. LLM enrichment fills
the gap for physical specs (tank, trunk, engine) at ~$0.01/car.

**Alternatives considered**:
- BrasilAPI: Wraps FIPE but hits 429 rate limits immediately.
  Rejected for production use.
- CarQuery API: Returns 403. Global scope, poor Brazilian coverage.
- Manual data entry: Doesn't scale. Spec requires automation.
- Web scraping automotive sites (carrosnaweb, icarros): Fragile,
  sites change structure, may block scraping. Rejected as primary
  source but viable as future supplement.

## Decision 2: Primary Pricing API

**Decision**: Parallelum FIPE API v2
(`https://parallelum.com.br/fipe/api/v2/`).

**Rationale**: Best available FIPE wrapper. Verified working
2026-02-18. Free tier: 1,000 req/day with auth token. Full catalog
crawl (~15 brands, ~200 current models) requires ~415 requests,
well within daily budget.

**Key endpoints**:
- `GET /cars/brands` — list all brands (~90)
- `GET /cars/brands/{id}/models` — models per brand
- `GET /cars/brands/{id}/models/{id}/years` — year/fuel combos
- `GET /cars/brands/{id}/models/{id}/years/{yearId}` — price details
- `GET /cars/{fipeCode}/years/{yearId}/history` — price history

**Data fields**: brand, model, modelYear, price (BRL), fuel,
fuelAcronym, codeFipe, referenceMonth.

**Does NOT provide**: Engine specs, dimensions, trunk, tank,
consumption, HP, acceleration, transmission, body type.

## Decision 3: Fuel Consumption Data

**Decision**: Parse Inmetro PBE Veicular annual PDF.

**Rationale**: Official Brazilian government source with lab-tested
km/L values (city + highway, ethanol + gasoline) for 895+ models.
Published annually with mid-year updates. No API exists — PDF
parsing is required but is a well-solved problem.

**Source**: `gov.br/inmetro` PBE Veicular tables (PDF, ~16 pages).

**Fields**: Brand, model/version, fuel type, consumption city km/L,
consumption highway km/L, CO2 emissions, efficiency rating (A-E).

**Alternative considered**: Manufacturer specs. Rejected — less
standardized, no single source, Inmetro data is the official
reference.

## Decision 4: Vehicle Specifications (Physical/Engine)

**Decision**: LLM enrichment via Claude API with structured output.

**Rationale**: No free API covers Brazilian market car specs
comprehensively. LLM knowledge of popular Brazilian models is high.
Cost is ~$0.01-0.02 per car. All AI-enriched data enters the
moderation queue with `source: "ai-enriched"` flag for admin review.

**Fields enriched by LLM**: tank_capacity (L), trunk_liters (L),
wheelbase (m), ground_clearance (mm), hp, acceleration 0-100 (s),
transmission, body_type, engine_displacement (cc).

**Prompt strategy**: Structured JSON output with explicit field
names. Request Brazilian market variant specs. Flag confidence level.

**Alternative considered**: auto-data.net API (paid, custom
pricing, primarily European). Deferred for future evaluation.

## Decision 5: Car Images

**Decision**: KBB Brasil CDN as primary source, Wikimedia Commons
as fallback.

**Rationale**: KBB CDN has consistent, high-quality images for
Brazilian models. Requires `Referer: https://www.kbb.com.br/`
header. For production, images should be downloaded and self-hosted.
Wikimedia provides good coverage for popular Brazilian models (e.g.,
HB20 has 50+ results) under Creative Commons licenses.

**KBB URL pattern**:
`https://static.kbb.com.br/pkw/t/{brand}/{model}/{year}/{bodyCode}.jpg`
Body codes: 5ha (hatch), 4sa (sedan), 5od (SUV), 5pu (pickup).

**Wikimedia API**: Search by brand+model in namespace 6 (File),
resolve thumburl at 800px width.

**Alternative considered**: Manufacturer press galleries. Too many
sources to maintain, no unified API. Deferred.

## Decision 6: Ingestion Schedule & Rate Limits

**Decision**: Daily at 3 AM BRT. Use authenticated Parallelum
requests (1,000/day free tier).

**Rationale**: Car catalog doesn't change minute-by-minute. Daily
refresh captures new models and monthly FIPE price updates. ~415
requests per run leaves headroom for retries and growth.

**Budget**: 15 brand requests + 200 model requests + 200 year/detail
requests = ~415/day. Inmetro PDF is parsed annually (not counted).
LLM enrichment: ~200 calls/day max at ~$4/run.

## Decision 7: Reusable Backend Assets

**Decision**: Reuse the following from existing codebase as-is or
with minor modifications.

**As-is (no changes)**:
- `app/utils/score.server.ts` — calculateScores()
- `app/utils/match.server.ts` — calculateMatch()
- `app/utils/metrics.ts` — formatting helpers
- `app/utils/price.ts` — toPriceNumber()
- `app/utils/deep-links.ts` — marketplace URL generators
- `app/utils/db.server.ts` — Prisma singleton
- `app/utils/admin-auth.server.ts` — Basic auth middleware
- `app/stores/comparison.ts` — Zustand comparison store
- `app/stores/favorites.ts` — Zustand favorites store

**Requires modifications**:
- `prisma/schema.prisma` — Add tank_capacity to Spec, add
  moderation_status to Car, add IngestionJob + IngestionSource
  models, add RejectedCar model.
- `app/schemas/car.ts` — Add tank_capacity and moderation_status
  fields to Zod schema.

**Replaced (new from scratch)**:
- All route files (app/routes/*) — new UI
- All components (app/components/*) — new design system
- FIPE/KBB services — replaced by real ingestion pipeline

## Decision 8: Comparison Store Capacity

**Decision**: Increase comparison store max from 2 to 4 cars.

**Rationale**: Spec requires 2-4 car comparison (FR-007). Existing
store caps at 2 with FIFO. Update to cap at 4.

## Decision 9: Frontend Architecture

**Decision**: Keep React Router v7 SSR with the existing tech stack.
New components built from scratch using shadcn/ui + Tailwind CSS 4.

**Rationale**: Constitution mandates the tech stack. SSR provides
SEO for car detail pages and fast initial loads. The existing
framework is proven — only the UI layer is rebuilt.

**Route structure (new)**:
- `/` — Homepage with quiz CTA + "Browse all" link
- `/quiz` — Interactive preference quiz
- `/results` — Ranked results (with/without match scores)
- `/carros/:id` — Car detail with enriched data
- `/compare` — Side-by-side comparison (2-4 cars)
- `/garagem` — Personal garage (favorites)
- `/admin` — Moderation queue + catalog management
- `/admin/cars/new` — Manual car creation
- `/admin/cars/:id` — Edit car
- `/api/cars` — Car data endpoint
- `/api/feedback` — Feedback endpoint
- `/resource.og` — Dynamic OG image generation
