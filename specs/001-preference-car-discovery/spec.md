# Feature Specification: Preference-Based Car Discovery

**Feature Branch**: `001-preference-car-discovery`
**Created**: 2026-02-17
**Status**: Draft
**Input**: User description: "Build a website that helps users find matching cars to buy based on personal preferences instead of the regular maker/model/year filters we currently have with main competitors, I want each car to be enriched with data that is relevant to the user like: trunk size, how economic it actually is, not just based on km per liter, but something like: if the user would need to stop at a gas station for a 400km trip or something like that. The website should provide real cars and real photos. The website should contain a matching system that provide the best match regarding the user preferences. The user should also be able to compare at least 3 cars. Should work flawlessly on mobile."

## Clarifications

### Session 2026-02-17

- Q: Build scope — new from scratch or partial rewrite? → A: Frontend is built completely from scratch (new UI, new components, new routes). Backend logic (Prisma schema, scoring algorithms, match engine, services, seed data) and database layer are reused from the existing codebase.
- Q: Homepage entry point — quiz-first, browse-first, or dual? → A: Quiz-first with skip. The homepage prominently features the quiz as the main path, but includes a secondary "Browse all cars" link for users who want to skip preferences.
- Q: Admin interface — keep existing, rebuild, or defer? → A: Rebuild admin from scratch as part of this feature scope, using the new design system alongside the user-facing pages.
- Q: Economy metric — standard reference trip, personalized commute, or both? → A: Standard 400km reference trip. Economy shown as "Completes 400km on one tank" or "Needs X fuel stop(s)." No user commute input. Requires adding tank capacity (liters) to the data model.
- Q: Catalog population — manual admin entry or automated? → A: Automated ingestion pipeline. Cars sold in Brazil are populated automatically via multi-source ingestion (APIs, web scraping, AI enrichment — whatever it takes). Admin role shifts from creator to moderator: review, approve/reject, and correct auto-ingested cars. A scheduled job (cron) keeps the catalog fresh.
- Q: Ingestion frequency? → A: Daily at 3 AM BRT. Good balance of catalog freshness and infrastructure simplicity. Can be increased later if needed.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Priority Quiz & Preference Capture (Priority: P1)

A first-time visitor arrives at the website wanting to find a car
but unsure where to start. The homepage prominently features an
interactive quiz that asks about their lifestyle and priorities: Do
they value comfort, fuel economy, performance, or cargo space? A
secondary "Browse all cars" link is available for users who prefer
to skip the quiz and explore directly.

The system captures these preferences and uses them to rank every
car in the catalog by how well it matches what the user actually
cares about.

**Why this priority**: This is the core differentiator of the
product. Without preference-based matching, the site is just another
car listing. The quiz is the entry point that unlocks personalized
results.

**Independent Test**: A user can complete the quiz and immediately
see a ranked list of cars ordered by match percentage, even without
using any other feature.

**Acceptance Scenarios**:

1. **Given** a new visitor on the homepage, **When** they land on
   the page, **Then** the quiz is the primary call-to-action with a
   secondary "Browse all cars" link visible but not competing.
2. **Given** a new visitor on the homepage, **When** they start the
   quiz and answer all preference questions, **Then** the system
   displays a ranked list of cars sorted by match score (highest
   first) with a visible match percentage for each car.
3. **Given** a user completing the quiz, **When** they prioritize
   fuel economy above all else, **Then** the top-ranked cars MUST
   be those with the best real-world economy metrics, not just the
   highest km/L spec.
4. **Given** a user who has completed the quiz, **When** they
   return to the results page, **Then** their preferences are
   preserved and results remain ranked accordingly.
5. **Given** a user who skips the quiz via "Browse all cars",
   **When** they view the results page, **Then** cars are displayed
   without match scores (or with a prompt to take the quiz for
   personalized ranking).
6. **Given** a user on any device (320px to 1440px+), **When** they
   interact with the quiz, **Then** all questions, sliders, and
   controls are fully usable with touch or mouse without horizontal
   scrolling.

---

### User Story 2 - Enriched Car Profiles with Real-World Data (Priority: P1)

A user taps on a car from the results list and sees a detailed
profile page. Instead of dry spec sheets, the page presents data
that is meaningful to their life: "This car can do the SP-Rio trip
(400km) on a single tank," "The trunk fits 3 large suitcases,"
"Range: 620km on a full tank."

Each car displays real photos and links to external marketplaces
where the user can actually purchase the vehicle.

**Why this priority**: Enriched, human-readable data is what makes
the matching trustworthy. Users need to validate that the match
score reflects reality by seeing tangible, relatable metrics.

**Independent Test**: A user can navigate to any car's detail page
and see real photos, real-world economy translations, trunk capacity
in practical terms, and external purchase links—without needing to
complete the quiz first.

**Acceptance Scenarios**:

1. **Given** a car detail page, **When** the user views the economy
   section, **Then** the system displays fuel consumption translated
   into practical scenarios (e.g., "Drives 400km without refueling"
   or "Requires 1 fuel stop on a 400km trip") in addition to the
   raw km/L figure.
2. **Given** a car detail page, **When** the user views trunk
   capacity, **Then** the system shows capacity in relatable terms
   (e.g., number of suitcases, stroller compatibility) alongside
   the liter measurement.
3. **Given** any car in the catalog, **When** its detail page is
   loaded, **Then** real photographs of the actual car model are
   displayed (not generic placeholders).
4. **Given** a car detail page on a mobile device, **When** the
   user scrolls through the content, **Then** photos, data cards,
   and comparison prompts render correctly within the viewport.

---

### User Story 3 - Side-by-Side Car Comparison (Priority: P2)

A user has narrowed down their choices to 2-4 cars and wants to
compare them directly. They select cars from the results list or
from their favorites and open a comparison view that places the
enriched data side by side—match scores, economy metrics, trunk
capacity, comfort ratings, and pricing references.

**Why this priority**: Comparison is the decision-making tool.
After matching narrows the field, comparison closes the deal. It
builds on the matching and enriched data from P1 stories.

**Independent Test**: A user can select 2 to 4 cars and view a
comparison table showing all enriched metrics side by side, with
clear visual indicators of which car wins in each category.

**Acceptance Scenarios**:

1. **Given** a user browsing results, **When** they select between
   2 and 4 cars for comparison, **Then** a comparison view displays
   all selected cars side by side with their enriched metrics
   aligned in comparable rows.
2. **Given** a comparison view, **When** the user examines economy
   data, **Then** each car shows the same practical economy metric
   (e.g., fuel stops for 400km) to enable direct comparison.
3. **Given** a comparison view on mobile, **When** more than 2 cars
   are compared, **Then** the interface allows horizontal scrolling
   or swipe navigation between cars while keeping the metric labels
   visible.
4. **Given** a user viewing comparison, **When** a car is clearly
   superior in a metric, **Then** the system visually highlights
   the winning value (e.g., bold, color accent) so differences are
   immediately apparent.

---

### User Story 4 - Personal Garage (Favorites) (Priority: P3)

A user finds cars they like and wants to save them for later
without creating an account. They tap a favorite/save button on any
car and it is added to their personal "Garage." The garage persists
across browser sessions and serves as a shortlist for comparison
and eventual purchase decisions.

**Why this priority**: Favorites support the decision journey but
are not required for the core discovery and comparison flow. They
add convenience and return-visit value.

**Independent Test**: A user can favorite multiple cars, close the
browser, return later, and find all favorited cars still in their
garage with the ability to compare or view details.

**Acceptance Scenarios**:

1. **Given** any car card or detail page, **When** the user taps
   the favorite button, **Then** the car is immediately added to
   their garage with visual confirmation.
2. **Given** a user with favorited cars, **When** they navigate to
   the garage page, **Then** all saved cars are displayed with
   their match scores and key enriched metrics.
3. **Given** a user who favorited cars in a previous session,
   **When** they return to the site days later, **Then** their
   garage still contains all previously saved cars.
4. **Given** the garage page, **When** the user selects 2-4 cars,
   **Then** they can launch a comparison directly from the garage.

---

### User Story 5 - Automated Catalog Ingestion (Priority: P2)

The system automatically discovers and ingests cars sold in the
Brazilian market from multiple data sources (automotive APIs, public
databases, web scraping, AI enrichment). New cars are added to a
moderation queue rather than published directly. A scheduled job
runs periodically to keep the catalog current with new models,
updated pricing, and refreshed specifications.

**Why this priority**: An automated pipeline is what makes the
catalog scalable and maintainable. Without it, the product depends
on manual data entry for every car, which is unsustainable and
limits catalog coverage.

**Independent Test**: The ingestion job can run, discover cars not
yet in the catalog, populate their specifications and photos, and
place them in the moderation queue — all without admin intervention.

**Acceptance Scenarios**:

1. **Given** the scheduled ingestion job runs, **When** it discovers
   a new car model not yet in the catalog, **Then** the car is
   added to a moderation queue with auto-populated specifications,
   pricing, photos, and a status of "pending review."
2. **Given** the ingestion job finds updated data for an existing
   car (e.g., new price), **When** the update is significant,
   **Then** the system flags the car for admin review with a diff
   of what changed.
3. **Given** an ingestion source is unavailable or returns errors,
   **When** the job encounters the failure, **Then** it logs the
   error, skips that source, and continues with remaining sources
   without crashing.
4. **Given** a car is ingested from multiple sources with
   conflicting data, **When** the system merges the data, **Then**
   it applies a source priority ranking and flags conflicts for
   admin review.

---

### User Story 6 - Admin Moderation & Catalog Management (Priority: P3)

An administrator reviews auto-ingested cars in a moderation queue,
approving correct entries, correcting inaccurate data, and rejecting
invalid entries. The admin can also manually add or edit cars when
needed. The admin interface is rebuilt with the same design system
as the user-facing pages.

**Why this priority**: Moderation ensures data quality without
requiring the admin to create every car from scratch. It builds on
the automated ingestion pipeline (US5) and can be built after core
user flows are complete.

**Independent Test**: An admin can view the moderation queue, see
auto-ingested cars with their data, approve a car to publish it,
edit incorrect fields, and verify corrections persist.

**Acceptance Scenarios**:

1. **Given** an authenticated admin, **When** they access the
   moderation queue, **Then** they see all pending cars with
   auto-populated data, source attribution, and any flagged
   conflicts.
2. **Given** a pending car in the queue, **When** the admin approves
   it, **Then** the car is published to the public catalog with
   auto-calculated normalized scores.
3. **Given** a pending car with incorrect data, **When** the admin
   edits the specifications and approves, **Then** the corrected
   data is saved and scores are recalculated.
4. **Given** an admin rejecting a car, **When** they mark it as
   rejected with a reason, **Then** the car is excluded from the
   catalog and the ingestion pipeline does not re-add it.
5. **Given** an unauthenticated user, **When** they attempt to
   access any admin route, **Then** the system returns an
   authentication challenge and blocks access.

---

### Edge Cases

- What happens when a user skips quiz questions or provides
  contradictory preferences (e.g., maximum economy AND maximum
  performance)? The system MUST still produce a ranked list using
  available answers and display a notice if results may be less
  precise.
- What happens when no car scores above a meaningful match
  threshold? The system MUST still show all cars ranked by best
  available match and display a message acknowledging that no
  perfect match was found.
- What happens when a car has incomplete data (e.g., missing trunk
  dimensions or fuel economy)? The system MUST display available
  data and mark missing fields as "Data unavailable" rather than
  showing zeros or hiding the car entirely.
- What happens on extremely slow connections (2G/3G)? The system
  MUST show skeleton loading states and progressively render
  content. Car images MUST use lazy loading.
- What happens when a user tries to compare more than 4 cars? The
  system MUST inform the user of the maximum (4) and prompt them
  to deselect one before adding another.
- What happens when a user who skipped the quiz views the results
  page? Cars are displayed in a default order (e.g., alphabetical
  or by popularity) without match scores, and a persistent prompt
  invites them to take the quiz for personalized results.
- What happens when the ingestion pipeline finds duplicate cars
  across sources? The system MUST deduplicate by brand + model +
  year, merge data using source priority, and flag conflicts for
  admin review.
- What happens when an external data source changes its API or
  structure? The ingestion job MUST fail gracefully for that source,
  log a detailed error, and alert the admin. Other sources continue
  unaffected.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide an interactive preference quiz
  that captures user priorities across at least 4 dimensions
  (e.g., comfort, economy, performance, cargo space).
- **FR-002**: System MUST calculate a match score (0-100%) for
  every car relative to the user's stated preferences.
- **FR-003**: System MUST rank and display cars by match score,
  highest first, after quiz completion.
- **FR-004**: System MUST display fuel economy as a standard 400km
  reference trip metric (e.g., "Completes 400km on one tank" or
  "Needs 1 fuel stop on a 400km trip"), calculated from
  fuel_consumption_city and tank_capacity. The raw km/L figure
  MUST also be displayed alongside.
- **FR-005**: System MUST display trunk capacity in relatable units
  (e.g., number of large suitcases, stroller fit) alongside raw
  liter measurements.
- **FR-006**: System MUST display real photographs for every car in
  the catalog (sourced from manufacturer galleries or verified
  automotive databases).
- **FR-007**: System MUST allow users to select between 2 and 4
  cars for side-by-side comparison with all enriched metrics
  aligned.
- **FR-008**: System MUST persist user favorites locally (without
  requiring account creation) across browser sessions.
- **FR-009**: System MUST provide external links to marketplaces or
  pricing references (e.g., FIPE table, KBB) for each car.
- **FR-010**: System MUST be fully functional on mobile devices
  (320px viewport minimum) with touch-optimized interactions.
- **FR-011**: System MUST preserve user state (quiz answers,
  selected filters, favorites) across page navigation within a
  session.
- **FR-012**: System MUST provide a radar/spider chart or
  equivalent visual representation of each car's strengths across
  preference dimensions.
- **FR-013**: System MUST support SEO-optimized car detail pages
  with dynamic metadata and Open Graph images for social sharing.
- **FR-014**: The homepage MUST present the quiz as the primary
  call-to-action, with a secondary "Browse all cars" link for
  users who want to skip preference capture.
- **FR-015**: Users who skip the quiz MUST be able to browse the
  full catalog without match scores, and MUST see a persistent
  prompt to take the quiz for personalized results.
- **FR-016**: System MUST automatically ingest cars sold in the
  Brazilian market from multiple data sources, running daily at
  3 AM BRT.
- **FR-017**: Auto-ingested cars MUST be placed in a moderation
  queue with status "pending review" — not published directly.
- **FR-018**: System MUST auto-populate specifications, pricing,
  photos, and tank capacity for ingested cars using available
  source data and AI enrichment where gaps exist.
- **FR-019**: System MUST provide an admin moderation interface to
  review, approve, edit, or reject pending cars.
- **FR-020**: Admin interface MUST auto-calculate normalized scores
  when specifications are approved or updated.
- **FR-021**: Admin interface MUST be protected by authentication;
  unauthenticated access MUST be blocked.
- **FR-022**: Rejected cars MUST be excluded from future ingestion
  runs to prevent re-adding the same entry.
- **FR-023**: The ingestion pipeline MUST handle source failures
  gracefully — log errors, skip unavailable sources, and continue
  processing remaining sources.

### Key Entities

- **Car**: A specific vehicle model with make, model, year, and
  variant. Contains all raw specifications (engine, fuel type,
  dimensions, weight) and enriched derivative data (normalized
  scores, practical economy translations, trunk capacity labels).
- **Spec**: The normalized specification data for a car, including
  tank_capacity (liters) for range calculations and scored
  dimensions (comfort, economy, performance, space) on a
  consistent 0-10 scale used by the matching algorithm.
- **User Preference**: A set of weighted priorities captured from
  the quiz (e.g., economy: 0.4, comfort: 0.3, space: 0.2,
  performance: 0.1). Stored client-side without authentication.
- **Comparison Set**: A temporary collection of 2-4 cars selected
  by the user for side-by-side evaluation. Exists only in the
  current session state.
- **Favorite (Garage Item)**: A car saved by the user to their
  personal garage. Persisted in local browser storage with the
  car's identifier and timestamp.
- **Ingestion Job**: A scheduled run of the data pipeline that
  discovers and imports cars from external sources. Tracks run
  timestamp, source results, errors, and number of cars added or
  updated.
- **Moderation Entry**: A car in the review queue with status
  (pending, approved, rejected), source attribution, auto-populated
  data, flagged conflicts, and admin notes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users who complete the quiz MUST see their first
  ranked result within 2 seconds of submitting preferences.
- **SC-002**: At least 90% of users can complete the preference
  quiz without abandoning or navigating away.
- **SC-003**: Every car detail page MUST load with visible content
  (text + at least one photo) within 3 seconds on a 4G mobile
  connection.
- **SC-004**: Users can complete a full discovery journey (quiz →
  results → car detail → comparison) in under 5 minutes.
- **SC-005**: The comparison view MUST display all selected cars
  with aligned metrics within 2 seconds of selection.
- **SC-006**: 100% of cars in the catalog display real photographs
  and at least 3 enriched data points (practical economy, trunk
  translation, match score).
- **SC-007**: All primary user flows (quiz, results, detail,
  compare, garage) MUST be completable on a 320px mobile viewport
  without horizontal scrolling or broken layouts.
- **SC-008**: Favorited cars MUST persist across browser sessions
  with 100% reliability (no data loss on normal browser closure).
- **SC-009**: Zero accessibility violations at WCAG 2.1 AA level
  on all primary pages (verified by automated audit tools).

### Assumptions

- The car catalog is populated automatically via a multi-source
  ingestion pipeline and moderated by an admin; users do not add
  cars.
- Real car photos are sourced automatically during ingestion
  (manufacturer galleries, automotive databases, AI-assisted
  search) and stored/linked. Not uploaded by users.
- Fuel economy calculations use publicly available manufacturer
  data combined with real-world correction factors (e.g., Inmetro
  ratings for the Brazilian market).
- Trunk capacity translations (e.g., "fits X suitcases") are
  derived from liter measurements using standardized luggage
  dimensions.
- The matching algorithm weights are derived from quiz answers and
  applied equally to all cars—no paid promotion or boosted
  rankings.
- User preferences and favorites are stored client-side (browser
  local storage); no user accounts or server-side persistence is
  required for the initial release.
- The primary target market is Brazil (pt-BR language, BRL
  currency, Brazilian car models and fuel prices).
- The frontend is built from scratch with a completely new UI.
  Backend logic (database schema, scoring algorithms, match engine,
  data services, seed scripts) is reused from the existing
  codebase.
