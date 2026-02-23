# Quickstart: Landing Page Redesign

**Branch**: `002-landing-page-redesign` | **Date**: 2026-02-20

## Prerequisites

- Node.js (version matching existing project)
- npm

## Setup

```bash
git checkout 002-landing-page-redesign
npm install
```

No new dependencies are introduced by this feature.

## Development

```bash
npm run dev
```

Navigate to `http://localhost:5173/` to see the landing page.

## Files to modify/create

| File | Action | Purpose |
|------|--------|---------|
| `app/app.css` | MODIFY | Add blue gradient keyframes and animation utilities |
| `app/routes/home.tsx` | REWRITE | Compose 5 landing page sections |
| `app/components/home/HeroSearch.tsx` | MODIFY | Restyle for blue background |
| `app/components/home/HeroSection.tsx` | CREATE | Hero with value prop + quiz CTA |
| `app/components/home/HowItWorksSection.tsx` | CREATE | 4-step visual flow |
| `app/components/home/DifferentiatorsSection.tsx` | CREATE | 4 feature cards |
| `app/components/home/StatsSection.tsx` | CREATE | Platform numbers |
| `app/components/home/FinalCtaSection.tsx` | CREATE | Bottom CTA |
| `app/components/layout/Header.tsx` | MODIFY | Transparent bg on home route |
| `app/components/layout/Footer.tsx` | MODIFY | Dark blue bg on home route |

## Testing

```bash
# Unit tests
npm run test

# E2E tests (if configured)
npx playwright test
```

## Key design decisions

1. **No new dependencies** — CSS-only animations, existing icons from lucide-react
2. **Theme isolation** — Blue gradient via wrapper div, not global CSS variable overrides
3. **Header/Footer adaptation** — Route detection via `useLocation()`, already available in both components
4. **WCAG AA** — White text on deep blue gradient provides 7:1+ contrast ratio
5. **Mobile-first** — All sections stack vertically, 44px touch targets, no horizontal overflow
