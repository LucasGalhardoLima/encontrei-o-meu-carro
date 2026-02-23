# Tasks: Preference-Based Car Discovery

**Input**: Design documents from `/specs/001-preference-car-discovery/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Tests are included per constitution principle II (Testing Discipline). Unit tests for new server utilities, E2E tests for all critical user journeys.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup

**Purpose**: Clean slate for frontend rebuild while preserving reusable backend

- [x] T001 Remove all existing route files from app/routes/ (delete every file in app/routes/)
- [x] T002 Remove all existing component files from app/components/ (delete every file and subdirectory in app/components/)
- [x] T003 [P] Create new app/routes.ts with route configuration mapping all routes per plan.md: home(/), quiz(/quiz), results(/results), car-detail(/carros/:id), compare(/compare), garage(/garagem), admin(/admin), admin.cars.new, admin.cars.$id, api.cars, api.cars.search, api.feedback, resource.og
- [x] T004 [P] Create new app/app.css with Tailwind CSS 4 directives, CSS variables for the design system color palette (neutral base, accent colors), and @layer extensions for custom utilities
- [x] T005 [P] Create new app/root.tsx with root layout: html lang="pt-BR", head with meta charset/viewport, Tailwind stylesheet link, body with Outlet, error boundary
- [x] T006 [P] Install shadcn/ui base primitives via CLI: Button, Card, Slider, Tabs, Badge, Separator, ScrollArea, Progress, Checkbox, Label, Skeleton, Sheet, Dialog, DropdownMenu, Table, Tooltip

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema changes, shared layout, enriched metrics utility, modified stores

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Update prisma/schema.prisma: add fipe_code (String? @unique), moderation_status (String @default("pending")), source (String?), source_data (Json?) fields to Car model; add indexes on moderation_status and fipe_code
- [x] T008 Update prisma/schema.prisma: add tank_capacity (Int @default(0)) and fuel_consumption_highway (Float?) fields to Spec model; add index on tank_capacity
- [x] T009 [P] Create CarImage model in prisma/schema.prisma with fields: id, carId (FK → Car, cascade), url, source, isPrimary, order, createdAt; add relation Car 1-N CarImage
- [x] T010 [P] Create IngestionJob model in prisma/schema.prisma with fields: id, status, startedAt, completedAt, carsAdded, carsUpdated, carsSkipped, errors (Json?), createdAt
- [x] T011 [P] Create IngestionLog model in prisma/schema.prisma with fields: id, jobId (FK → IngestionJob, cascade), source, status, itemsProcessed, errors (Json?), startedAt, completedAt, createdAt
- [x] T012 [P] Create RejectedCar model in prisma/schema.prisma with fields: id, fipe_code (String @unique), brand, model, year, reason, rejectedAt; add composite index on brand + model + year
- [x] T013 Run prisma migrate dev to generate migration for all schema changes; update prisma/seed.ts to set moderation_status = "approved" on all existing cars and backfill tank_capacity with reasonable defaults per car type
- [x] T014 Update app/schemas/car.ts: add tank_capacity (z.number().min(0).optional()), moderation_status (z.enum(["pending","approved","rejected"]).optional()), fuel_consumption_highway (z.number().min(0).optional()), fipe_code (z.string().optional()) to CarFormSchema
- [x] T015 Update app/stores/comparison.ts: change max car limit from 2 to 4 in addCar/toggleCar logic
- [x] T016 Create app/utils/enriched-metrics.server.ts with functions: calculateRange(fuelConsumption: number, tankCapacity: number) → number (km); calculateFuelStops(rangeKm: number, tripDistance: number) → number; calculateSuitcaseCount(trunkLiters: number) → number; formatTripLabel(fuelStops: number) → string (pt-BR: "Completa 400km sem parar" or "Precisa de X parada(s)"); formatTrunkLabel(suitcaseCount: number) → string (pt-BR: "Cabe X malas grandes"); getEnrichedMetrics(spec: Spec) → EnrichedMetrics object
- [x] T017 Create unit tests for enriched metrics in app/utils/enriched-metrics.server.test.ts: test range calculation, fuel stops for various consumptions and tank sizes, suitcase count edge cases (0L, 65L, 130L, 600L), label formatting in pt-BR
- [x] T018 [P] Create app/components/layout/Header.tsx: responsive navigation bar with logo, nav links (Início, Quiz, Comparar, Garagem), mobile hamburger menu via Sheet component, 44px touch targets
- [x] T019 [P] Create app/components/layout/Footer.tsx: minimal footer with copyright, links
- [x] T020 [P] Create app/components/layout/SkipLink.tsx: accessible skip-to-content link for keyboard navigation (WCAG 2.1 AA)
- [x] T021 [P] Create app/components/ui/RadarChart.tsx: SVG-based radar/spider chart component accepting categoryScores (comfort, economy, performance, space) as props, responsive sizing, Tailwind colors
- [x] T022 [P] Create app/components/car/CarCard.tsx: reusable card component displaying car image (lazy loaded), brand/model/year, price (BRL formatted), match percentage badge (optional), favorite toggle button, compare checkbox; mobile-first layout with 44px touch targets
- [x] T023 [P] Create app/components/car/SkeletonCard.tsx: skeleton loading placeholder matching CarCard dimensions for progressive rendering

**Checkpoint**: Foundation ready — database migrated, shared components built, enriched metrics utility tested

---

## Phase 3: User Story 1 — Priority Quiz & Preference Capture (P1) 🎯 MVP

**Goal**: Users complete an interactive quiz and see ranked car results by match percentage

**Independent Test**: Complete the quiz → see ranked results with match % for each car

### Unit Tests for US1

- [x] T024 [P] [US1] Create unit test for results loader match scoring logic in app/routes/results.test.ts: verify cars are sorted by match percentage desc when weights provided, verify browse mode returns cars without match scores, verify only approved cars are returned

### Implementation for US1

- [x] T025 [US1] Create app/routes/home.tsx: homepage with hero section featuring quiz CTA button ("Encontre seu carro ideal") as primary action, secondary "Ver todos os carros" link below; SSR loader returns empty (static page); mobile-first responsive layout
- [x] T026 [US1] Create app/components/quiz/QuizStep.tsx: single quiz step component with question text, Slider component (0-100), label for current value, prev/next navigation buttons; receives step config via props
- [x] T027 [US1] Create app/components/quiz/QuizProgress.tsx: visual progress indicator showing current step out of total (e.g., "2 de 4"), uses Progress component
- [x] T028 [US1] Create app/routes/quiz.tsx: quiz page with 4 steps (Conforto, Economia, Desempenho, Espaço); each step uses QuizStep component with Slider; stores weights in URL search params on submit; navigates to /results?w_comfort=X&w_economy=Y&w_performance=Z&w_space=W&mode=match on completion; fully client-side (no loader needed); mobile-optimized with swipeable steps
- [x] T029 [US1] Create app/components/car/CarGrid.tsx: responsive grid of CarCard components with CSS grid (1 col mobile, 2 col tablet, 3 col desktop); accepts cars array with optional matchResult; shows skeleton cards during loading
- [x] T030 [US1] Create app/components/car/MatchBadge.tsx: circular badge component showing match percentage (0-100%) with color gradient (red < 50% < yellow < 75% < green); used in CarCard and results
- [x] T031 [US1] Create app/components/results/QuizPromptBanner.tsx: persistent banner for browse mode users prompting "Faça o quiz para ver resultados personalizados" with CTA link to /quiz
- [x] T032 [US1] Create app/components/results/ResultsFilter.tsx: filter bar with brand dropdown, type dropdown, price range; updates URL search params; collapses to expandable panel on mobile
- [x] T033 [US1] Create app/routes/results.tsx: results page with SSR loader that reads weight params from URL; if mode=match, loads all approved cars with spec (Prisma include), calculates match via calculateMatch() for each, sorts by percentage desc; if mode=browse, loads cars sorted by brand without scoring, shows QuizPromptBanner; renders CarGrid with pagination; includes ResultsFilter bar; handles edge case: no cars above threshold shows "Nenhum match perfeito" message with all cars still listed

**Checkpoint**: User Story 1 fully functional — quiz → ranked results with match %

---

## Phase 4: User Story 2 — Enriched Car Profiles with Real-World Data (P1)

**Goal**: Each car detail page shows real photos, 400km trip metric, trunk in suitcases, marketplace links

**Independent Test**: Navigate to any car → see enriched data, real photos, external links

### Unit Tests for US2

- [x] T034 [P] [US2] Create unit test for car detail loader in app/routes/car-detail.test.ts: verify enrichedMetrics calculation matches getEnrichedMetrics(), verify marketplace links are generated, verify 404 for non-existent or non-approved car

### Implementation for US2

- [x] T035 [US2] Create app/components/car/ImageGallery.tsx: responsive image gallery showing primary image large with thumbnails below; lazy loading with skeleton placeholder; swipe support on mobile; handles missing images with "Foto indisponível" fallback
- [x] T036 [US2] Create app/components/car/EnrichedMetrics.tsx: card grid displaying enriched metrics — trip label ("Completa 400km sem parar"), trunk label ("Cabe 4 malas grandes"), range ("Autonomia: 620km"), raw km/L, raw trunk liters; uses icons from Lucide; handles missing data with "Dados indisponíveis"
- [x] T037 [US2] Create app/components/car/SpecTable.tsx: detailed spec table with rows for all spec fields (engine, dimensions, fuel, performance); formatted via metrics.ts helpers; collapses sections on mobile
- [x] T038 [US2] Create app/components/car/MarketplaceLinks.tsx: row of external link buttons (Webmotors, OLX, Mercado Livre) using deep-links.ts; opens in new tab with rel="noopener noreferrer"
- [x] T039 [US2] Create app/routes/car-detail.tsx: car detail page at /carros/:id with SSR loader that fetches car + spec + images (approved only), computes enrichedMetrics via getEnrichedMetrics(), generates marketplace links via deep-links.ts; renders ImageGallery, RadarChart with category scores, EnrichedMetrics card, SpecTable, MarketplaceLinks; adds dynamic meta tags (title, description, og:image pointing to /resource.og?carId=id); returns 404 for invalid/non-approved IDs
- [x] T040 [US2] Create app/routes/resource.og.tsx: dynamic OG image generator at /resource.og; accepts carId query param; renders 1200x630 PNG with car name, price, primary image, and top badges; returns default fallback OG for invalid carId
- [x] T041 [US2] Add "Comparar" button and "Favoritar" button to car detail page in app/routes/car-detail.tsx: compare button adds car to comparison store and shows toast confirmation; favorite button toggles favorite state with heart icon animation

**Checkpoint**: User Story 2 fully functional — enriched detail pages with real-world data

---

## Phase 5: User Story 3 — Side-by-Side Car Comparison (P2)

**Goal**: Users compare 2-4 cars with aligned enriched metrics and visual winner highlights

**Independent Test**: Select 2-4 cars → see side-by-side comparison with highlighted winners

### Implementation for US3

- [x] T042 [US3] Create app/components/comparison/ComparisonTable.tsx: responsive comparison table with cars as columns and metrics as rows; metric rows: match %, price, 400km trip metric, trunk (suitcases + liters), fuel consumption, HP, acceleration, transmission, type; highlights winning value per row (bold + accent color); sticky left column for metric labels on mobile horizontal scroll
- [x] T043 [US3] Create app/components/comparison/ComparisonHeader.tsx: header row in comparison showing car image (thumbnail), brand/model/year, price, remove button (X) per car; responsive with horizontal scroll on mobile
- [x] T044 [US3] Create app/components/comparison/ComparisonRadar.tsx: overlaid radar charts for all compared cars with color-coded lines and legend; uses RadarChart.tsx in overlay mode
- [x] T045 [US3] Create app/components/comparison/EmptyComparison.tsx: empty state when fewer than 2 cars selected; shows message "Selecione pelo menos 2 carros para comparar" with link back to results
- [x] T046 [US3] Create app/routes/compare.tsx: comparison page at /compare with SSR loader that reads car IDs from URL params (ids=uuid1,uuid2,...); validates 2-4 UUIDs; fetches cars + specs (approved only); computes enrichedMetrics for each; renders ComparisonHeader, ComparisonRadar, ComparisonTable; handles edge case: <2 valid cars shows EmptyComparison
- [x] T047 [US3] Add compare toggle to CarCard in app/components/car/CarCard.tsx: checkbox overlay on card that adds/removes car from comparison store; shows current count badge in header nav ("Comparar (3)"); when max 4 reached, shows toast "Máximo de 4 carros" and prevents adding more

**Checkpoint**: User Story 3 fully functional — compare 2-4 cars side by side

---

## Phase 6: User Story 5 — Automated Catalog Ingestion (P2)

**Goal**: Daily pipeline discovers and ingests Brazilian cars from FIPE + Inmetro + LLM into moderation queue

**Independent Test**: Run ingestion → new cars appear in DB with status "pending" and populated specs

### Unit Tests for US5

- [x] T048 [P] [US5] Create unit test for Parallelum client in app/services/ingestion/parallelum.server.test.ts: test brand/model/year parsing, price extraction, FIPE code mapping, error handling for 429/500 responses
- [x] T049 [P] [US5] Create unit test for Inmetro parser in app/services/ingestion/inmetro.server.test.ts: test PDF table extraction, brand/model matching, consumption value parsing (city + highway), handling of missing entries
- [x] T050 [P] [US5] Create unit test for LLM enrichment in app/services/ingestion/llm-enrichment.server.test.ts: test structured output parsing, fallback for missing fields, source tagging as "ai-enriched"

### Implementation for US5

- [x] T051 [US5] Create app/services/ingestion/parallelum.server.ts: Parallelum FIPE v2 API client with functions: fetchBrands(), fetchModels(brandId), fetchYears(brandId, modelId), fetchCarDetails(brandId, modelId, yearId); includes authenticated requests (X-Subscription-Token header from env), rate limit handling (retry with backoff on 429), filtering to current year codes (2024-2026 + 32000), typed responses with Zod validation
- [x] T052 [US5] Create app/services/ingestion/inmetro.server.ts: Inmetro PBE PDF parser with functions: downloadPbePdf(url) → Buffer, parsePbeTable(buffer) → InmetroEntry[]; extracts brand, model, fuel_consumption_city, fuel_consumption_highway, fuel_type, efficiency_rating; uses pdf-parse library; matches entries to cars by normalized brand + model substring
- [x] T053 [US5] Create app/services/ingestion/llm-enrichment.server.ts: LLM enrichment service with function enrichCarSpecs(brand, model, year) → EnrichedSpecs; calls Anthropic API (Claude Haiku for cost efficiency) with structured JSON prompt requesting tank_capacity, trunk_liters, wheelbase, ground_clearance, hp, acceleration, transmission, body_type; validates response with Zod schema; flags source as "ai-enriched"
- [x] T054 [US5] Create app/services/ingestion/image-fetcher.server.ts: image fetcher with functions: fetchKbbImage(brand, model, year, bodyType) → string|null (URL with Referer header); fetchWikimediaImage(brand, model) → string|null (Wikimedia Commons API search + thumburl resolution); returns null on failure without throwing
- [x] T055 [US5] Create app/services/ingestion/runner.server.ts: ingestion orchestrator with function runIngestionJob() → IngestionJob; creates IngestionJob record; iterates brands → models → years from Parallelum; for each car: checks fipe_code against Car and RejectedCar tables (skip if exists); creates new Car (status: pending) + Spec; matches Inmetro data; calls LLM enrichment for missing specs; fetches images via image-fetcher; calculates scores via calculateScores(); updates IngestionJob with counts; logs per-source results to IngestionLog; handles source failures gracefully (catch per-source, continue others)
- [x] T056 [US5] Create scripts/run-ingestion.ts: CLI script to manually trigger ingestion; imports runner.server.ts; logs progress to stdout; exits with code 0 on success, 1 on failure
- [x] T057 [US5] Create scripts/parse-inmetro-pdf.ts: standalone CLI script to download and parse Inmetro PBE PDF; outputs parsed entries as JSON to stdout; used for initial data load and debugging

**Checkpoint**: Ingestion pipeline functional — can run manually to populate catalog

---

## Phase 7: User Story 4 — Personal Garage / Favorites (P3)

**Goal**: Users save cars to a local garage that persists across sessions and supports comparison launch

**Independent Test**: Favorite cars → close browser → reopen → garage still has all saved cars

### Implementation for US4

- [x] T058 [US4] Create app/components/car/FavoriteButton.tsx: heart icon toggle button using useFavoritesStore; filled heart when favorited, outline when not; 44px touch target; animates on toggle (scale pulse); shows toast "Adicionado à garagem" / "Removido da garagem"
- [x] T059 [US4] Create app/components/garage/GarageList.tsx: grid of CarCard components for favorited cars; shows match scores if user has quiz weights in URL/store; includes "Comparar selecionados" button that navigates to /compare?ids=... with selected car IDs; shows empty state "Sua garagem está vazia" with CTA to browse/quiz
- [x] T060 [US4] Create app/routes/garage.tsx: garage page at /garagem with SSR loader that receives favorite IDs via URL search params; fetches cars + specs from DB (approved only); renders GarageList; client-side hydration reads IDs from Zustand favorites store and sets URL params on mount
- [x] T061 [US4] Integrate FavoriteButton into CarCard (app/components/car/CarCard.tsx) and car detail page (app/routes/car-detail.tsx): add heart icon in top-right corner of card; add "Salvar na Garagem" button on detail page

**Checkpoint**: User Story 4 fully functional — favorites persist across sessions

---

## Phase 8: User Story 6 — Admin Moderation & Catalog Management (P3)

**Goal**: Admin reviews, approves, edits, and rejects auto-ingested cars; can manually add cars

**Independent Test**: Admin logs in → sees pending cars → approves one → car appears in public catalog

### Implementation for US6

- [x] T062 [US6] Create app/components/admin/ModerationQueue.tsx: table of pending cars showing brand, model, year, price, source, source_data preview, and action buttons (Approve, Edit, Reject); sortable columns; search bar for brand/model filter; shows conflict flags if source_data has discrepancies
- [x] T063 [US6] Create app/components/admin/CarForm.tsx: form component for creating/editing cars; uses CarFormSchema (Zod) for validation; fields: brand, model, year, price_avg, type (dropdown), imageUrl, trunk_liters, tank_capacity, wheelbase, ground_clearance, fuel_consumption_city, fuel_consumption_highway, hp, acceleration, transmission (dropdown), fuel_type (dropdown); uses React Hook Form with Zod resolver; shows validation errors inline
- [x] T064 [US6] Create app/components/admin/IngestionStatus.tsx: dashboard card showing recent IngestionJob records with status, timestamp, counts (added/updated/skipped/errors); "Run Ingestion Now" button that triggers manual ingestion via POST /admin/ingestion/trigger
- [x] T065 [US6] Create app/components/admin/RejectDialog.tsx: Dialog component for rejecting a car; text input for rejection reason; confirms with "Rejeitar" button; calls POST action
- [x] T066 [US6] Create app/routes/admin.tsx: admin dashboard at /admin with SSR loader that calls requireAdminAuth(); fetches pending cars (with spec + source_data), approved count, pending count, recent IngestionJobs; renders ModerationQueue + IngestionStatus; action handlers: POST approve (set moderation_status="approved", recalculate scores), POST reject (set moderation_status="rejected", create RejectedCar entry), POST trigger-ingestion (call runIngestionJob in background)
- [x] T067 [US6] Create app/routes/admin.cars.new.tsx: new car form at /admin/cars/new; SSR loader calls requireAdminAuth(); renders CarForm in create mode; action handler: POST validates via CarFormSchema, creates Car (moderation_status="approved") + Spec, calculates scores via calculateScores(), redirects to /admin/cars/:id
- [x] T068 [US6] Create app/routes/admin.cars.$id.tsx: edit car page at /admin/cars/:id; SSR loader calls requireAdminAuth(), fetches car + spec + images; renders CarForm pre-filled; action handlers: PUT updates car + spec, recalculates scores, redirects; DELETE cascading deletes car + spec + feedback + images, redirects to /admin
- [x] T069 [US6] Create app/routes/api.cars.tsx: GET /api/cars endpoint; reads ids query param (comma-separated UUIDs, max 20); validates UUIDs with regex; queries approved cars with spec and images via Prisma; returns JSON response per contracts/api.md
- [x] T070 [US6] Create app/routes/api.cars.search.tsx: GET /api/cars/search endpoint; reads brand, type, minPrice, maxPrice, page, limit, sort, order query params; builds Prisma where clause (approved only); returns paginated JSON response per contracts/api.md
- [x] T071 [US6] Create app/routes/api.feedback.tsx: POST /api/feedback endpoint; validates body with Zod (carId UUID, thumbs boolean, optional weights); verifies carId references approved car; creates Feedback record; returns { success: true }

**Checkpoint**: Admin interface functional — full CRUD + moderation + ingestion trigger

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: E2E tests, SEO, accessibility, performance optimization

- [ ] T072 [P] Create tests/quiz-flow.spec.ts: E2E test — visit homepage, click quiz CTA, complete 4 slider steps, verify results page shows ranked cars with match percentages, verify top car has highest match %
- [ ] T073 [P] Create tests/car-detail.spec.ts: E2E test — navigate to a car detail page, verify enriched metrics visible (trip label, trunk label, range), verify real photo displayed, verify marketplace links present and functional
- [ ] T074 [P] Create tests/comparison.spec.ts: E2E test — select 3 cars from results, navigate to compare, verify 3 columns with aligned metrics, verify winner highlighting, verify mobile horizontal scroll works at 320px viewport
- [ ] T075 [P] Create tests/garage.spec.ts: E2E test — favorite 2 cars, navigate to garage, verify both present, reload page, verify persistence, select both for comparison, verify navigation to compare page
- [ ] T076 [P] Create tests/admin.spec.ts: E2E test — authenticate as admin, verify moderation queue visible, approve a pending car, verify it appears in public results, reject a car, verify it disappears and is not re-ingested
- [ ] T077 [P] Create tests/browse.spec.ts: E2E test — click "Browse all" from homepage (skip quiz), verify results page shows cars without match scores, verify quiz prompt banner is visible
- [ ] T078 [P] Create tests/seo.spec.ts: E2E test — verify car detail page has correct og:title, og:description, og:image meta tags; verify /resource.og returns PNG image for valid carId
- [x] T079 Add aria-labels to all interactive elements across all components: buttons, links, sliders, checkboxes, navigation landmarks; verify screen reader navigation flow
- [x] T080 Add lazy loading to all car images across CarCard, ImageGallery, ComparisonHeader: use loading="lazy" attribute and Intersection Observer for progressive loading
- [x] T081 Audit and optimize Prisma queries across all loaders: ensure select/include is used (no full model loads), verify no N+1 queries, add appropriate where clauses for moderation_status="approved"
- [x] T082 Run bundle size analysis and optimize: verify client JS < 200KB gzipped, tree-shake unused shadcn/ui components, lazy-load RadarChart and ComparisonTable components
- [ ] T083 Run quickstart.md validation: follow every step in specs/001-preference-car-discovery/quickstart.md on a clean checkout and verify all 6 verification steps pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **US1 Quiz + Results (Phase 3)**: Depends on Foundational — first MVP deliverable
- **US2 Enriched Profiles (Phase 4)**: Depends on Foundational — can run parallel with US1
- **US3 Comparison (Phase 5)**: Depends on US1 (needs CarCard with compare toggle) + US2 (needs enriched metrics)
- **US5 Ingestion (Phase 6)**: Depends on Foundational (schema) — can run parallel with US1/US2
- **US4 Favorites (Phase 7)**: Depends on US1 (needs CarCard) — can run parallel with US3/US5
- **US6 Admin (Phase 8)**: Depends on US5 (needs ingestion runner) + Foundational
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational — No dependencies on other stories
- **US2 (P1)**: Can start after Foundational — No dependencies on other stories (parallel with US1)
- **US3 (P2)**: Depends on US1 (CarCard compare toggle) and US2 (enriched metrics in comparison)
- **US5 (P2)**: Can start after Foundational — Independent of user-facing stories
- **US4 (P3)**: Depends on US1 (CarCard for garage list display)
- **US6 (P3)**: Depends on US5 (ingestion runner for trigger button)

### Within Each User Story

- Unit tests written before implementation (where included)
- Layout/shared components before route pages
- Sub-components before parent pages that compose them
- SSR loaders implement data loading; components render it

### Parallel Opportunities

- T003, T004, T005, T006 (Setup) — all independent files
- T009, T010, T011, T012 (Schema models) — independent models
- T018, T019, T020, T021, T022, T023 (Foundational components) — independent files
- T024, T034 (Unit tests for US1 + US2) — independent test files
- T048, T049, T050 (Unit tests for US5) — independent test files
- T072-T078 (E2E tests) — all independent spec files
- US1 and US2 can proceed in parallel after Foundational
- US5 can proceed in parallel with US1/US2

---

## Parallel Example: Foundational Components

```bash
# Launch shared components in parallel:
Task: "Create Header in app/components/layout/Header.tsx"
Task: "Create Footer in app/components/layout/Footer.tsx"
Task: "Create SkipLink in app/components/layout/SkipLink.tsx"
Task: "Create RadarChart in app/components/ui/RadarChart.tsx"
Task: "Create CarCard in app/components/car/CarCard.tsx"
Task: "Create SkeletonCard in app/components/car/SkeletonCard.tsx"
```

## Parallel Example: User Stories 1 + 2 + 5

```bash
# After Foundational completes, launch in parallel:
# Developer A: US1 (Quiz + Results)
Task: "Create quiz components and results route"

# Developer B: US2 (Enriched Car Detail)
Task: "Create detail page with enriched metrics"

# Developer C: US5 (Ingestion Pipeline)
Task: "Build Parallelum client, Inmetro parser, LLM enrichment"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (Quiz + Results)
4. **STOP and VALIDATE**: Quiz → ranked results works end-to-end
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 (Quiz + Results) → Test independently → **MVP!**
3. US2 (Enriched Detail) → Test independently → Deploy
4. US3 (Comparison) → Test independently → Deploy
5. US5 (Ingestion) → Test independently → Deploy
6. US4 (Favorites) → Test independently → Deploy
7. US6 (Admin) → Test independently → Deploy
8. Polish → Final validation → Ship

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: US1 (Quiz + Results)
   - Developer B: US2 (Enriched Detail)
   - Developer C: US5 (Ingestion Pipeline)
3. After US1 + US2 complete:
   - Developer A: US3 (Comparison)
   - Developer B: US4 (Favorites)
   - Developer C: US6 (Admin)
4. Polish phase: all developers

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Reused files (score.server.ts, match.server.ts, etc.) are NOT in task list — they remain as-is
- All new .server.ts files contain server-only logic (DB queries, API calls)
- All components use Tailwind CSS + shadcn/ui exclusively (no custom CSS)
- All text is pt-BR (Portuguese - Brazil)
