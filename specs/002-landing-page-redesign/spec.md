# Feature Specification: Landing Page Redesign

**Feature Branch**: `002-landing-page-redesign`
**Created**: 2026-02-20
**Status**: Draft
**Input**: Redesign the landing page (/) to be a captivating, conversion-focused page that sells users on "Encontre o Meu Carro" over traditional car search engines. Switch from white to blue gradient background, highlight the quiz as the core differentiator, add real information sections, and create a premium, trustworthy feel.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - First-time visitor understands the value proposition (Priority: P1)

A first-time visitor arrives at the landing page and immediately understands what "Encontre o Meu Carro" offers and why it's different from traditional car search sites. The hero section communicates the core message: instead of browsing endless filters, users describe what matters to them and get matched to the right car. The visitor is drawn to start the quiz as the primary call-to-action.

**Why this priority**: The hero is the first thing every visitor sees. If it fails to communicate value and drive action, nothing else on the page matters. This is the highest-impact area for conversion.

**Independent Test**: Can be fully tested by loading the landing page and verifying the hero section renders with the blue gradient background, value proposition text, quiz CTA button, and secondary search bar. Delivers immediate visual impact and a clear path to the quiz.

**Acceptance Scenarios**:

1. **Given** a user navigates to `/`, **When** the page loads, **Then** they see a hero section with a dark blue gradient background, a headline communicating preference-based car discovery, a prominent "Fazer o quiz" button, and a secondary search bar
2. **Given** a user is on the hero section, **When** they click the quiz CTA button, **Then** they are navigated to `/quiz`
3. **Given** a user is on the hero section, **When** they type a query in the search bar and submit, **Then** they are navigated to `/results?q={query}&mode=browse`
4. **Given** a user views the page on a mobile device (320px width), **When** the hero renders, **Then** all text is readable, buttons are tappable (min 44x44px touch targets), and no horizontal overflow occurs

---

### User Story 2 - Visitor learns how the quiz works (Priority: P1)

Below the hero, the visitor sees a clear "How It Works" section that explains the quiz flow in 3-4 simple visual steps. This demystifies the process and reduces friction before they commit to starting the quiz.

**Why this priority**: Users won't start the quiz if they don't understand what it involves. This section bridges the gap between interest (hero) and action (starting the quiz), making it critical for conversion.

**Independent Test**: Can be tested by scrolling below the hero and verifying a step-by-step section appears with numbered/illustrated steps showing: (1) answer 4 quick questions about your priorities, (2) get cars ranked by match percentage, (3) compare side-by-side, (4) save your favorites. Each step has an icon and brief description.

**Acceptance Scenarios**:

1. **Given** a user scrolls past the hero, **When** the "How It Works" section enters the viewport, **Then** they see 4 visual steps with icons, titles, and short descriptions explaining the quiz flow
2. **Given** a user views the steps on mobile, **When** the section renders, **Then** the steps stack vertically and remain fully readable
3. **Given** a user reads the final step, **When** they look for a next action, **Then** there is a CTA button to start the quiz

---

### User Story 3 - Visitor sees real differentiators (Priority: P2)

The visitor scrolls to a "Why Us" section that explains concrete differentiators with real data: preference-based matching (not just filters), enriched data from official Brazilian sources (FIPE pricing, Inmetro fuel data), comparison of up to 4 cars with radar charts, and no account required.

**Why this priority**: Differentiators build trust and convince the visitor that this tool offers genuine value over competitors like KBB Brasil or generic car listing sites. Important for conversion but secondary to the hero and how-it-works flow.

**Independent Test**: Can be tested by scrolling to the differentiators section and verifying 4 feature cards are displayed, each with an icon, title, and description containing real, factual information about the platform's capabilities.

**Acceptance Scenarios**:

1. **Given** a user scrolls past the "How It Works" section, **When** the differentiators section enters the viewport, **Then** they see 4 feature cards explaining: preference matching, enriched real data, side-by-side comparison, and no-account-needed instant use
2. **Given** a user reads the "enriched data" card, **When** they examine the content, **Then** it mentions real sources (FIPE, Inmetro) and concrete examples (400km trip calculation, trunk capacity in suitcases)
3. **Given** a user views the section on mobile, **When** the cards render, **Then** they stack vertically with proper spacing

---

### User Story 4 - Visitor sees credibility stats (Priority: P2)

A stats/social-proof section displays real platform numbers: cars cataloged, preference dimensions measured, official data sources used. This builds credibility through concrete numbers rather than vague claims.

**Why this priority**: Numbers create trust. After understanding what the platform does (stories 1-3), seeing real data points reinforces credibility and nudges the visitor toward action.

**Independent Test**: Can be tested by scrolling to the stats section and verifying at least 3 stat items are displayed with numeric values and labels.

**Acceptance Scenarios**:

1. **Given** a user scrolls to the stats section, **When** the section renders, **Then** they see at least 3 stat counters with real numbers (e.g., "200+ carros catalogados", "4 dimensoes de preferencia", "Dados oficiais FIPE & Inmetro")
2. **Given** the stats are displayed, **When** the user reads them, **Then** all numbers reflect real platform data, not inflated marketing figures

---

### User Story 5 - Visitor reaches final CTA and starts the quiz (Priority: P1)

At the bottom of the page, before the footer, a final call-to-action section provides one last compelling push to start the quiz. This catches visitors who scrolled through all content and are now convinced but haven't acted yet.

**Why this priority**: The final CTA captures bottom-of-page visitors who consumed all content. It's the last conversion opportunity before they leave, making it critical for the page's overall effectiveness.

**Independent Test**: Can be tested by scrolling to the bottom of the landing page and verifying a CTA section appears with a compelling headline and a button linking to `/quiz`.

**Acceptance Scenarios**:

1. **Given** a user scrolls to the bottom of the page, **When** the final CTA section renders, **Then** they see a compelling headline and a prominent button to start the quiz
2. **Given** a user clicks the final CTA button, **When** the navigation occurs, **Then** they are taken to `/quiz`

---

### User Story 6 - Consistent blue theme across the page (Priority: P1)

The entire landing page uses a rich blue gradient background instead of the current white. Text is white/light for contrast. Cards and sections use subtle elevated backgrounds (glassmorphism or semi-transparent cards) that sit on top of the blue gradient. The design feels premium, modern, and trustworthy.

**Why this priority**: The visual theme is the foundation of the page's appeal. Every other section depends on the blue background to look correct. Without this, the page looks inconsistent.

**Independent Test**: Can be tested by loading the page and verifying the background is a blue gradient (not white), text is light-colored with sufficient contrast (WCAG AA), and card elements have distinct elevated backgrounds.

**Acceptance Scenarios**:

1. **Given** a user loads the landing page, **When** the page renders, **Then** the background is a dark blue gradient (not white) across all sections
2. **Given** the blue background is applied, **When** text is rendered, **Then** all body text and headings meet WCAG AA contrast ratio (4.5:1 for normal text, 3:1 for large text)
3. **Given** content cards are displayed on the blue background, **When** they render, **Then** they have visually distinct elevated backgrounds (semi-transparent white, subtle blur, or similar treatment)
4. **Given** a user switches to dark mode, **When** the landing page renders, **Then** the blue gradient is preserved (the landing page has its own theme independent of the global light/dark toggle)

---

### Edge Cases

- What happens when the page is viewed on extremely narrow screens (320px)? All content must remain readable with no horizontal scrolling.
- What happens when a user has reduced-motion preferences enabled? Scroll animations should be disabled or minimized per `prefers-reduced-motion`.
- What happens when the page loads slowly on a 3G connection? The page should render meaningful content (text, CTAs) before images/icons load — progressive enhancement.
- What happens when the header/footer from the global layout conflict with the blue background? The header must adapt (transparent or matching blue) so it doesn't create a jarring white bar on top of the blue gradient.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The landing page MUST display a hero section with a dark blue gradient background, a headline about preference-based car discovery, a primary quiz CTA button, and a secondary search input
- **FR-002**: The quiz CTA button MUST navigate users to `/quiz` when clicked
- **FR-003**: The search input MUST navigate users to `/results?q={query}&mode=browse` on submission
- **FR-004**: The landing page MUST include a "How It Works" section with 4 visual steps explaining the quiz flow (answer preferences, get matches, compare, save)
- **FR-005**: The landing page MUST include a differentiators section with 4 feature cards highlighting: preference matching, enriched real data (FIPE/Inmetro), comparison with radar charts, and no-account-needed use
- **FR-006**: The landing page MUST include a stats section displaying real platform numbers (cars cataloged, preference dimensions, data sources)
- **FR-007**: The landing page MUST include a final CTA section at the bottom with a compelling message and quiz button
- **FR-008**: All text content MUST be in Brazilian Portuguese (pt-BR)
- **FR-009**: The landing page MUST use a blue gradient background across all sections, with white/light text for contrast meeting WCAG AA standards
- **FR-010**: Cards and elevated content areas MUST have visually distinct backgrounds (semi-transparent, blurred, or elevated) that contrast with the blue gradient
- **FR-011**: The landing page MUST be fully responsive, with a minimum supported viewport width of 320px and touch targets of at least 44x44px
- **FR-012**: Scroll-triggered animations MUST respect the user's `prefers-reduced-motion` setting
- **FR-013**: The page header MUST adapt to the blue background (transparent or matching) so it does not create a visual conflict
- **FR-014**: The landing page's blue theme MUST be self-contained and not affect other pages in the application

### Assumptions

- The landing page is purely presentational — no server-side data fetching is required for the landing content itself (stats can be hardcoded initially and updated as the catalog grows)
- The existing search functionality (HeroSearch component) will be reused and restyled to match the new theme
- The global header and footer will be adapted for the landing page's blue background but remain structurally the same
- The blue gradient is applied to the landing page only; other pages retain their current theme (light/dark mode)
- Animations are CSS-based (no heavy JS animation libraries) to keep the bundle small

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of landing page text meets WCAG AA contrast ratio against the blue gradient background
- **SC-002**: The landing page renders all above-the-fold content (hero, headline, CTA) within 3 seconds on a simulated 4G connection
- **SC-003**: The primary quiz CTA is visible without scrolling on both mobile (375px) and desktop (1440px) viewports
- **SC-004**: All 6 content sections (hero, how-it-works, differentiators, stats, final CTA, adapted header) render correctly on viewports from 320px to 2560px wide
- **SC-005**: No horizontal scrollbar appears at any viewport width between 320px and 2560px
- **SC-006**: The page achieves a Lighthouse Performance score of 90+ on mobile
