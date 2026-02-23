<!--
  Sync Impact Report
  ==================
  Version change: N/A → 1.0.0 (initial adoption)

  Added principles:
    - I. Type-Safe Code Quality
    - II. Testing Discipline
    - III. User Experience Consistency
    - IV. Modern & Scalable Interface
    - V. Performance Standards

  Added sections:
    - Technical Constraints
    - Development Workflow
    - Governance

  Templates requiring updates:
    - .specify/templates/plan-template.md        ✅ compatible (Constitution Check section exists)
    - .specify/templates/spec-template.md         ✅ compatible (Success Criteria aligns with perf standards)
    - .specify/templates/tasks-template.md        ✅ compatible (test-first flow matches Principle II)
    - .specify/templates/checklist-template.md    ✅ compatible (generic structure supports all principles)

  Deferred items: None
-->

# Encontre o Meu Carro Constitution

## Core Principles

### I. Type-Safe Code Quality

All application code MUST be written in TypeScript with strict mode
enabled. The following rules are non-negotiable:

- Every module MUST compile with zero `tsc` errors before merge.
- Usage of `any` is forbidden. Use `unknown`, generics, or explicit
  types instead. Existing `any` types MUST be eliminated on contact.
- Zod schemas MUST validate all external boundaries: API request
  payloads, route params, query strings, and environment variables.
- Server-only logic (database queries, external API calls) MUST
  reside in `.server.ts` files to prevent client bundle leakage.
- Shared utilities MUST be pure functions with explicit input/output
  types and zero side effects.
- Path aliases (`~/`) MUST be used for all imports within the `app/`
  directory. Relative imports beyond one level up are prohibited.

**Rationale**: Strict typing catches defects at compile time, reduces
runtime surprises, and makes refactoring safe across a growing
codebase. Zod validation at boundaries ensures data integrity without
coupling internal types to external contracts.

### II. Testing Discipline

Every feature MUST ship with tests proportional to its risk. The
project maintains two testing layers:

- **Unit tests** (Vitest): MUST cover all scoring algorithms, match
  logic, utility functions, and Zod schema validations. Unit tests
  MUST run in under 5 seconds total and MUST NOT depend on network,
  database, or filesystem state.
- **End-to-end tests** (Playwright): MUST cover every critical user
  journey (quiz flow, search, comparison, favorites, car detail).
  E2E tests MUST be deterministic—no flaky selectors, no race
  conditions, no hard-coded timeouts.

Testing standards:

- New server utilities MUST have unit tests before merge.
- Bug fixes MUST include a regression test that fails without the fix.
- Test files MUST be colocated: unit tests as `*.test.ts` next to
  source, E2E tests in `tests/` directory.
- Tests MUST NOT import from `node_modules` internals or rely on
  implementation details (test behavior, not structure).
- CI MUST pass all unit and E2E tests before a branch can merge.

**Rationale**: A car discovery app depends on accurate scoring and
ranking. Untested match algorithms directly erode user trust. E2E
coverage ensures real user journeys work after every change.

### III. User Experience Consistency

The application MUST deliver a coherent, predictable experience
across every interaction:

- Every user-facing action MUST provide immediate visual feedback
  (loading states, optimistic updates, or skeleton screens).
- Error states MUST be human-readable and actionable—never expose
  raw error codes, stack traces, or empty screens to users.
- Navigation MUST preserve user context: filters, quiz progress,
  scroll position, and comparison selections MUST survive route
  transitions via Zustand stores or URL state.
- The quiz, search, comparison, and garage features MUST share a
  unified visual language: consistent spacing, color palette,
  typography, and interaction patterns.
- All interactive elements MUST be accessible: keyboard navigable,
  screen-reader labeled (ARIA), and meeting WCAG 2.1 AA contrast
  ratios.
- Portuguese (pt-BR) MUST be the primary language for all
  user-facing text. Labels, messages, and metadata MUST use
  consistent terminology throughout the app.

**Rationale**: Users comparing cars make high-stakes decisions.
Inconsistent UX erodes confidence in recommendations. Accessibility
ensures the widest possible audience can use the tool.

### IV. Modern & Scalable Interface

The UI MUST feel contemporary, responsive, and maintainable as the
feature set grows:

- All styling MUST use Tailwind CSS utility classes. Custom CSS is
  prohibited except for Tailwind `@layer` extensions and CSS
  variables defined in `app.css`.
- Reusable UI primitives MUST come from the project's shadcn/ui
  component library (`app/components/ui/`). New primitives MUST
  follow the existing Radix UI + Tailwind pattern.
- Component architecture MUST follow composition over inheritance:
  small, focused components composed via props and children. A
  single component file MUST NOT exceed 200 lines of JSX.
- The design MUST be mobile-first: layouts MUST render correctly on
  320px viewports and scale gracefully to desktop. Touch targets
  MUST be at least 44x44px.
- Visual hierarchy MUST guide users through discovery flows using
  consistent spacing scale (Tailwind's default 4px grid), clear
  typography hierarchy, and purposeful use of color.
- New UI patterns MUST be reviewed for visual consistency with
  existing screens before merge.

**Rationale**: A car comparison tool lives or dies by its interface.
Tailwind + shadcn/ui enforces a design system without bespoke CSS
drift. Mobile-first ensures the majority of users (phone browsers)
get the best experience.

### V. Performance Standards

The application MUST meet these performance budgets on every deploy:

- **Server response**: SSR pages MUST return first byte (TTFB)
  within 200ms at p95 under normal load.
- **Client interactivity**: Time to Interactive (TTI) MUST be under
  3 seconds on a 4G connection with a mid-range device.
- **Bundle size**: The client JavaScript bundle MUST NOT exceed
  200KB gzipped. New dependencies MUST justify their bundle cost
  and MUST be evaluated with `bundlephobia` before adoption.
- **Database queries**: No single Prisma query MUST exceed 100ms at
  p95. N+1 queries are prohibited; use `include` or `select` for
  relation loading.
- **Image assets**: All car images MUST be served in optimized
  formats (WebP/AVIF) with responsive `srcset`. No unoptimized
  images in production.
- **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1 on
  representative pages (home, results, car detail).

**Rationale**: Users searching for cars expect instant results. Slow
pages cause abandonment. SSR with React Router provides the
foundation, but performance budgets prevent regression as features
accumulate.

## Technical Constraints

The following technology decisions are fixed and MUST NOT be changed
without a constitution amendment:

- **Runtime**: Node.js with React Router v7 (SSR mode)
- **Language**: TypeScript 5.x, strict mode, ES2022 target
- **UI Framework**: React 19 + Tailwind CSS 4 + shadcn/ui (New York)
- **ORM**: Prisma with PostgreSQL (Neon)
- **State Management**: Zustand (client-side only)
- **Validation**: Zod for all schema definitions
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Deployment**: Server-side rendered via `react-router-serve`

Adding a new runtime dependency MUST be justified in the PR
description with: (a) what problem it solves, (b) bundle size
impact, and (c) maintenance status of the package.

## Development Workflow

All contributions MUST follow this workflow:

1. **Branch from `main`**: Use descriptive branch names
   (`feature/`, `fix/`, `refactor/` prefixes).
2. **Type-check before commit**: `npm run typecheck` MUST pass with
   zero errors.
3. **Test before push**: `npm run test:unit` MUST pass. E2E tests
   MUST pass for changes touching routes or user flows.
4. **Small, focused commits**: Each commit MUST represent a single
   logical change. Commit messages MUST follow conventional commits
   format (`feat:`, `fix:`, `refactor:`, `chore:`, `test:`,
   `docs:`).
5. **PR review gate**: Every PR MUST pass CI (typecheck + unit
   tests + E2E) before merge. PRs touching UI MUST include a
   screenshot or screen recording of the change.
6. **No dead code**: Unused imports, variables, functions, and
   components MUST be removed in the same PR that makes them
   obsolete.

## Governance

This constitution is the highest-authority document for the Encontre
o Meu Carro project. All code, PRs, and architectural decisions MUST
comply with its principles.

**Amendment process**:

1. Propose the change with rationale in a dedicated PR.
2. The amendment MUST document what changed, why, and its impact on
   existing code.
3. Version MUST be bumped following semantic versioning:
   - MAJOR: Principle removal or backward-incompatible redefinition.
   - MINOR: New principle or materially expanded guidance.
   - PATCH: Wording clarification or typo fix.
4. All dependent templates in `.specify/templates/` MUST be reviewed
   for consistency after any amendment.

**Compliance review**: Every PR review MUST include a mental check
against these principles. If a principle is violated, the reviewer
MUST flag it and the author MUST either fix it or propose a
constitution amendment.

**Version**: 1.0.0 | **Ratified**: 2026-02-17 | **Last Amended**: 2026-02-17
