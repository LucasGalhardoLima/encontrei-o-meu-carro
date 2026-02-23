# Research: Landing Page Redesign

**Branch**: `002-landing-page-redesign` | **Date**: 2026-02-20

## R1: Blue gradient color values for WCAG AA compliance

**Decision**: Use `oklch(0.30 0.15 250)` → `oklch(0.22 0.12 255)` as the gradient range, with `oklch(0.97 0 0)` (near-white) for body text.

**Rationale**: With a background lightness of 0.22–0.30 and text lightness of 0.97, the contrast ratio exceeds 7:1 (AAA level), well above the 4.5:1 AA requirement. The hue 250–255 range is consistent with the existing primary color (hue 258) creating visual harmony. Tested against WCAG 2.1 contrast requirements using oklch perceptual uniformity.

**Alternatives considered**:
- Pure `bg-blue-900` / `bg-blue-950` Tailwind classes: Less control over exact gradient, and Tailwind v4 utility colors may not perfectly match the oklch system already in use.
- Inline rgb/hex values: Would break consistency with the oklch color system used throughout `app.css`.

## R2: Header transparency on landing page

**Decision**: Use `useLocation()` in Header.tsx to conditionally apply transparent background with white text when on `/`. Add a scroll-aware state via `useEffect` + scroll listener to transition the header to a solid semi-transparent blue when the user scrolls past the hero fold.

**Rationale**: The Header already imports and uses `useLocation()` for active link highlighting. Adding a pathname check is trivial. The scroll transition provides visual feedback that the header is always accessible without blocking the hero's visual impact at page load.

**Alternatives considered**:
- React Context from root.tsx: Adds unnecessary complexity. The Header already has route awareness.
- CSS `position: sticky` with backdrop-filter only: Doesn't solve the white-on-blue text requirement.
- IntersectionObserver on hero element: More complex than a simple scroll threshold check, and requires a ref passed between components.

## R3: Section entry animations without JavaScript libraries

**Decision**: Use CSS `@keyframes` for fade-in-up animations, triggered by adding a `.visible` class via a lightweight IntersectionObserver hook. Wrap all animation classes in Tailwind's `motion-safe:` variant.

**Rationale**: CSS animations have zero bundle cost. IntersectionObserver is natively supported in all modern browsers and only requires ~10 lines of hook code. The `motion-safe:` variant automatically disables animations when `prefers-reduced-motion: reduce` is set, satisfying FR-012 and accessibility requirements.

**Alternatives considered**:
- Framer Motion: Excellent API but adds ~30KB to the bundle, violating Constitution V performance constraints.
- CSS `animation-timeline: scroll()`: Not yet widely supported (Chrome-only as of early 2026).
- No animations at all: The spec requires "smooth scroll animations" for a premium feel.

## R4: Card glassmorphism styling on blue background

**Decision**: Use `bg-white/[0.08] backdrop-blur-sm border border-white/[0.15] rounded-2xl` for card overlays on the blue gradient. For feature cards in the differentiators section, use slightly more opaque `bg-white/[0.12]` with `backdrop-blur-md` for better readability.

**Rationale**: Semi-transparent white with backdrop blur creates depth without introducing new colors. The opacity values (8%–12%) are subtle enough to maintain the blue gradient feel while providing enough contrast for card boundaries. The `border-white/15` adds a subtle edge that catches light.

**Alternatives considered**:
- Solid dark cards (`bg-slate-800`): Too heavy, breaks the gradient flow, feels like dark mode rather than a themed landing page.
- Shadow-only elevation: Shadows are nearly invisible on dark backgrounds, making cards feel flat.
- Gradient cards (different blue shades): Creates visual noise when multiple cards are adjacent.

## R5: Landing page theme isolation (FR-014)

**Decision**: The blue gradient is applied as a wrapper `div` around all landing page sections in `home.tsx`. CSS variables for the landing page are not global overrides — they are scoped utility classes. The header adapts via its own route detection. Other routes are completely unaffected.

**Rationale**: By applying the gradient as a wrapper div rather than overriding CSS custom properties, we ensure zero risk of theme leakage. Each section component uses explicit Tailwind color classes (e.g., `text-white`, `text-white/80`) rather than relying on inherited CSS variables.

**Alternatives considered**:
- CSS custom property overrides on a `.landing` class: Works but risks cascade leakage if a child component renders a portal (e.g., Sheet for mobile menu).
- Separate CSS file for landing page: Adds build complexity and risks CSS specificity wars.

## R6: Footer adaptation on landing page

**Decision**: Modify the Footer component to detect the home route via `useLocation()` (same pattern as Header) and apply a dark blue background with white text instead of the default border-top + muted-foreground style.

**Rationale**: Consistency with the full-page blue gradient feel. The footer on the landing page should blend with the gradient rather than break it with a white/light background.

**Alternatives considered**:
- Keep footer unchanged: Creates a jarring transition from blue gradient to white footer.
- Hide footer entirely on landing page: Removes useful navigation links and copyright info.
