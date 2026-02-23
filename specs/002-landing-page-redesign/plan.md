# Implementation Plan: Landing Page Redesign

**Branch**: `002-landing-page-redesign` | **Date**: 2026-02-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-landing-page-redesign/spec.md`

## Summary

Redesign the landing page (`/`) from a minimal white-background page into a conversion-focused, blue-gradient landing page that sells users on preference-based car discovery via the quiz. The approach is purely frontend: restructure the home route into 5 distinct sections (hero, how-it-works, differentiators, stats, final CTA) on a blue gradient background, adapt the header for transparent overlay on the landing page, and restyle the search component for the dark background. No new dependencies, no API changes, no data model changes.

## Technical Context

**Language/Version**: TypeScript 5.x, strict mode, ES2022 target
**Primary Dependencies**: React 19, React Router v7 (SSR), Tailwind CSS 4, shadcn/ui (Radix UI), lucide-react
**Storage**: N/A (purely presentational — no data fetching for landing content)
**Testing**: Vitest (unit), Playwright (E2E)
**Target Platform**: Web (SSR), mobile-first responsive (320px–2560px)
**Project Type**: Web application (React Router v7 SSR)
**Performance Goals**: LCP < 2.5s, TTI < 3s on 4G, Lighthouse 90+ mobile, CLS < 0.1
**Constraints**: Bundle < 200KB gzipped, no new runtime dependencies, CSS-only animations
**Scale/Scope**: 1 route, ~6 new section components, 2 modified layout components (Header, home route)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Type-Safe Code Quality | PASS | All new components in TypeScript strict mode. No external data boundaries (no Zod needed). Server-only files not affected. |
| II. Testing Discipline | PASS | Landing page is presentational. E2E test for quiz CTA navigation covers the critical user journey. No scoring/matching logic touched. |
| III. User Experience Consistency | PASS | Blue theme is scoped to landing page only. Maintains WCAG AA contrast. Portuguese (pt-BR) text. Accessible keyboard navigation and ARIA labels preserved. |
| IV. Modern & Scalable Interface | PASS | All styling via Tailwind utilities. New sections are small, composable components (<200 LOC each). Mobile-first with 44px touch targets. No custom CSS except `@layer` extensions in app.css for gradient variables. |
| V. Performance Standards | PASS | No new dependencies (zero bundle impact). CSS-only animations with `prefers-reduced-motion` respect. No database queries. Static content SSR'd on first byte. |

**Gate result**: ALL PASS — no violations, no complexity tracking needed.

## Project Structure

### Documentation (this feature)

```text
specs/002-landing-page-redesign/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (minimal — no data model changes)
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (empty — no API changes)
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
app/
├── app.css                              # MODIFY: add blue gradient CSS variables in @layer
├── root.tsx                             # NO CHANGE (header adapts itself via useLocation)
├── routes/
│   └── home.tsx                         # REWRITE: full landing page with 5 sections
├── components/
│   ├── home/
│   │   ├── HeroSearch.tsx               # MODIFY: restyle for blue background
│   │   ├── HeroSection.tsx              # NEW: hero with value prop + quiz CTA
│   │   ├── HowItWorksSection.tsx        # NEW: 4-step visual flow
│   │   ├── DifferentiatorsSection.tsx   # NEW: 4 feature cards
│   │   ├── StatsSection.tsx             # NEW: platform numbers
│   │   └── FinalCtaSection.tsx          # NEW: bottom CTA
│   └── layout/
│       └── Header.tsx                   # MODIFY: conditional transparent bg on home route
```

**Structure Decision**: Follows existing React Router v7 SSR structure. Each landing page section is a standalone component in `app/components/home/` composed by the home route. This matches the project's composition-over-inheritance pattern (Constitution IV) and keeps each file under 200 lines.

## Design Decisions

### D1: Blue gradient approach — CSS variables in `app.css`

Define scoped CSS custom properties for the landing page gradient in `app.css` using `@layer base`. The home route wrapper div applies these via Tailwind arbitrary values. This keeps the blue theme self-contained (FR-014) without affecting other routes.

**Gradient colors** (oklch, consistent with existing color system):
- Top: `oklch(0.30 0.15 250)` — deep navy
- Bottom: `oklch(0.22 0.12 255)` — darker midnight blue
- Card overlay: `oklch(1 0 0 / 0.08)` — semi-transparent white for glassmorphism

### D2: Header adaptation — conditional classes via `useLocation()`

The Header component already uses `useLocation()` to detect the current route. Add a conditional: when `pathname === "/"`, apply transparent background with white text. On scroll past the hero viewport, transition to the solid blue background (using IntersectionObserver or scroll listener). This avoids any root.tsx changes or context providers.

### D3: Section component composition

Each section is a self-contained React component that receives no props (all content is hardcoded in pt-BR). The home route composes them in order:

```tsx
<div className="landing-page">
  <HeroSection />
  <HowItWorksSection />
  <DifferentiatorsSection />
  <StatsSection />
  <FinalCtaSection />
</div>
```

### D4: Animations — CSS-only with reduced-motion respect

Use Tailwind's `animate-` utilities and custom `@keyframes` in `app.css` for:
- Fade-in-up on section entry (via IntersectionObserver adding a class)
- Counter number animation on stats (CSS `@property` counter if supported, fallback to static)
- All wrapped in `motion-safe:` Tailwind variant for `prefers-reduced-motion` compliance (FR-012)

### D5: No new dependencies

The feature uses only existing packages: React, React Router, Tailwind CSS, lucide-react for icons. No animation libraries (framer-motion, etc.) needed. This preserves the bundle budget (Constitution V).

### D6: Footer adaptation

The footer should also adapt when on the home route. Since the landing page has a blue gradient, the footer needs to sit on top of it seamlessly — either with a matching dark blue background or transparent with white text, consistent with the overall page feel.
