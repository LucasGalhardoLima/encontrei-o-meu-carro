# Tasks: Landing Page Redesign

**Input**: Design documents from `/specs/002-landing-page-redesign/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: No test tasks included — not explicitly requested in the feature specification.

**Organization**: Tasks grouped by user story. US6 (blue theme) is foundational since all other sections depend on the gradient background.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (CSS Foundation)

**Purpose**: Add blue gradient CSS variables, animation keyframes, and utility classes to the global stylesheet — the visual foundation everything else builds on.

- [x] T001 Add blue gradient CSS custom properties and animation keyframes to `app/app.css`: define `--landing-gradient-from: oklch(0.30 0.15 250)`, `--landing-gradient-to: oklch(0.22 0.12 255)`, `@keyframes fade-in-up` (translateY(20px) + opacity 0→1), and a `.landing-visible` utility class. Wrap animation in `@media (prefers-reduced-motion: no-preference)`. Add glassmorphism card utility: `.landing-card` with `bg-white/[0.08] backdrop-blur-sm border border-white/[0.15] rounded-2xl`.

---

## Phase 2: Foundational — Blue Theme & Layout Adaptation (US6)

**Purpose**: Adapt Header, Footer, and home route wrapper for the blue gradient. MUST complete before any section components — they all render on this blue background.

- [x] T002 [US6] Modify Header component to detect home route and apply transparent background with white text in `app/components/layout/Header.tsx`: add `const isHome = location.pathname === "/"`, apply conditional classes (transparent bg + white text when isHome, default otherwise), add scroll listener via `useEffect` to transition header to `bg-[oklch(0.25_0.14_252)]/90 backdrop-blur-md` after scrolling past 64px, adapt nav link colors and mobile Sheet trigger icon for white-on-blue
- [x] T003 [P] [US6] Modify Footer component to detect home route and apply dark blue background with white text in `app/components/layout/Footer.tsx`: add `const isHome = location.pathname === "/"` using `useLocation()`, apply conditional classes — when isHome use `bg-transparent text-white/70` with white nav links, otherwise keep default styling
- [x] T004 [US6] Rewrite home route to render blue gradient wrapper and compose section components in `app/routes/home.tsx`: replace current content with a wrapper `div` applying `bg-gradient-to-b from-[oklch(0.30_0.15_250)] to-[oklch(0.22_0.12_255)] min-h-screen`, import and render section components in order (HeroSection, HowItWorksSection, DifferentiatorsSection, StatsSection, FinalCtaSection) — use placeholder components initially that just render section names

**Checkpoint**: At this point, the page should show a blue gradient background with adapted header/footer and placeholder section labels. All other routes unaffected.

---

## Phase 3: User Story 1 — Hero Section (Priority: P1) MVP

**Goal**: First-time visitor sees a captivating hero with value proposition, quiz CTA, and search bar on the blue gradient background.

**Independent Test**: Load `/`, verify hero renders with headline, "Fazer o quiz" button linking to `/quiz`, and search bar that navigates to `/results?q={query}&mode=browse`. All above the fold on desktop and mobile.

### Implementation for User Story 1

- [x] T005 [US1] Create HeroSection component in `app/components/home/HeroSection.tsx`: full-viewport hero (`min-h-[calc(100vh-3.5rem)]`) with centered content — headline "Pare de procurar. Descubra o carro certo para você." with "certo para você" highlighted, subheadline explaining preference-based matching, primary CTA button (Link to `/quiz`, text "Fazer o quiz", large with Sparkles icon, min 44px height), embed `<HeroSearch />` below as secondary action, animated chevron-down scroll hint at bottom. All text white on blue gradient.
- [x] T006 [US1] Restyle HeroSearch component for blue background in `app/components/home/HeroSearch.tsx`: change input background to `bg-white/95 text-foreground` so it contrasts on blue, update placeholder text color, keep submit button styling compatible with white input, ensure shadow works on dark background (`shadow-lg shadow-black/20`)
- [x] T007 [US1] Update `app/routes/home.tsx` to import and render the real HeroSection component replacing the placeholder

**Checkpoint**: Hero section fully functional — quiz CTA and search bar both navigate correctly. Visible above the fold on 375px and 1440px viewports.

---

## Phase 4: User Story 2 — How It Works Section (Priority: P1)

**Goal**: Visitor scrolls past hero and sees 4 visual steps explaining the quiz flow, reducing friction before starting.

**Independent Test**: Scroll below hero, verify 4 steps render with icons, titles, and descriptions. CTA button at the bottom links to `/quiz`. Steps stack vertically on mobile.

### Implementation for User Story 2

- [x] T008 [US2] Create HowItWorksSection component in `app/components/home/HowItWorksSection.tsx`: section with `py-20 md:py-28` padding, section title "Como funciona" centered in white, 4-column grid on desktop (`md:grid-cols-4`) stacking on mobile. Each step: numbered circle (1-4), lucide-react icon (SlidersHorizontal, BarChart3, GitCompareArrows, Heart), title, and description in white/80 text. Steps: (1) "Responda 4 perguntas" — "Diga o que importa: conforto, economia, desempenho ou espaço", (2) "Veja seus matches" — "Receba carros ranqueados por compatibilidade com seu perfil", (3) "Compare lado a lado" — "Analise até 4 carros com gráficos radar e métricas reais", (4) "Salve seus favoritos" — "Monte sua garagem sem precisar criar conta". Use `landing-card` glassmorphism styling on each step card. Add CTA button at bottom: Link to `/quiz`, "Começar o quiz".
- [x] T009 [US2] Update `app/routes/home.tsx` to import and render the real HowItWorksSection component replacing the placeholder

**Checkpoint**: How It Works section renders 4 steps with icons and quiz CTA. Responsive on mobile.

---

## Phase 5: User Story 3 — Differentiators Section (Priority: P2)

**Goal**: Visitor sees 4 feature cards explaining real differentiators with concrete data about FIPE, Inmetro, matching, and comparison features.

**Independent Test**: Scroll to differentiators section, verify 4 cards render with icons, titles, and descriptions mentioning real data sources and concrete examples.

### Implementation for User Story 3

- [x] T010 [US3] Create DifferentiatorsSection component in `app/components/home/DifferentiatorsSection.tsx`: section with `py-20 md:py-28` padding, section title "Por que o Encontre o Meu Carro?" centered, subtitle "Mais do que um buscador — uma experiência de descoberta" in white/70. 2x2 grid on desktop (`md:grid-cols-2`), stacking on mobile. Each card uses `landing-card` glassmorphism with `bg-white/[0.12] backdrop-blur-md p-8`. Cards: (1) Target icon — "Match por preferência" / "Você não filtra por marca e ano. Você diz o que importa — conforto, economia, potência, espaço — e o algoritmo encontra os carros ideais, ranqueados por compatibilidade.", (2) Database icon — "Dados reais enriquecidos" / "Preços FIPE atualizados, consumo testado pelo Inmetro, autonomia real. Calculamos quantas paradas você faz em 400km e quantas malas cabem no porta-malas.", (3) GitCompareArrows icon — "Compare até 4 carros" / "Coloque os finalistas lado a lado com gráficos radar e métricas traduzidas para o dia a dia. Sem tabelas técnicas — informação que faz sentido.", (4) Zap icon — "Sem cadastro, sem fricção" / "Use tudo agora: quiz, comparação, garagem de favoritos. Seus dados ficam no seu navegador, sem login, sem e-mail."
- [x] T011 [US3] Update `app/routes/home.tsx` to import and render the real DifferentiatorsSection component replacing the placeholder

**Checkpoint**: Differentiators section renders 4 cards with real data descriptions. Responsive layout.

---

## Phase 6: User Story 4 — Stats Section (Priority: P2)

**Goal**: Visitor sees real platform numbers that build credibility through concrete data points.

**Independent Test**: Scroll to stats section, verify at least 3 stat counters render with numeric values and labels.

### Implementation for User Story 4

- [x] T012 [P] [US4] Create StatsSection component in `app/components/home/StatsSection.tsx`: section with `py-16 md:py-24` padding, horizontal divider line (`border-t border-white/20`) at top for visual separation. Display 3-4 stats in a horizontal row on desktop (`md:grid-cols-3` or `md:grid-cols-4`), stacking on mobile. Each stat: large number (text-4xl md:text-5xl font-bold text-white), label below (text-white/70). Stats: "200+" / "carros catalogados", "4" / "dimensões de preferência", "2" / "fontes oficiais (FIPE & Inmetro)", optionally "0" / "cadastros necessários". Center-aligned text in each stat block.
- [x] T013 [US4] Update `app/routes/home.tsx` to import and render the real StatsSection component replacing the placeholder

**Checkpoint**: Stats section renders real platform numbers. Clean horizontal layout on desktop, stacked on mobile.

---

## Phase 7: User Story 5 — Final CTA Section (Priority: P1)

**Goal**: Bottom-of-page visitors see a compelling final push to start the quiz before they leave.

**Independent Test**: Scroll to bottom of page (before footer), verify CTA section renders with headline and button linking to `/quiz`.

### Implementation for User Story 5

- [x] T014 [P] [US5] Create FinalCtaSection component in `app/components/home/FinalCtaSection.tsx`: section with `py-20 md:py-28` padding, centered content. Headline: "Pronto para encontrar o carro ideal?" in `text-3xl md:text-4xl font-bold text-white`, subtitle: "Responda 4 perguntas rápidas e descubra quais carros combinam com o seu estilo" in `text-lg text-white/80`, prominent CTA button (Link to `/quiz`, "Começar agora", large size, white bg with blue text for contrast — `bg-white text-[oklch(0.30_0.15_250)] hover:bg-white/90`, min-h-12, rounded-xl, px-8). Add subtle decorative element (e.g., Car icon or Sparkles) above the headline.
- [x] T015 [US5] Update `app/routes/home.tsx` to import and render the real FinalCtaSection component replacing the placeholder

**Checkpoint**: Final CTA renders with headline and quiz button. Button navigates to `/quiz`.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Add scroll animations, verify responsiveness, and finalize the page composition.

- [x] T016 Create `useIntersectionFade` custom hook in `app/components/home/useIntersectionFade.ts`: lightweight hook that uses IntersectionObserver to add `landing-visible` class when element enters viewport (threshold 0.1), returns a `ref` to attach to section wrappers. Only observes once (unobserves after first intersection).
- [x] T017 Apply `useIntersectionFade` hook to all section components (HowItWorksSection, DifferentiatorsSection, StatsSection, FinalCtaSection) — wrap each section's root element with the ref and add `opacity-0 translate-y-5 transition-all duration-700` base classes that resolve to `opacity-100 translate-y-0` when `.landing-visible` is applied. Wrap in `motion-safe:` variant per FR-012.
- [x] T018 Final responsive audit of `app/routes/home.tsx` and all section components: verify no horizontal overflow at 320px, all touch targets 44x44px minimum, text readable at all breakpoints (320px, 375px, 768px, 1024px, 1440px, 2560px), container max-width constrains content on ultra-wide screens
- [x] T019 Clean up `app/routes/home.tsx`: remove any remaining placeholder code, ensure all imports are used, verify section composition order matches spec, remove the old features section code that was replaced

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (CSS variables must exist before header/footer use them)
- **Hero (Phase 3)**: Depends on Phase 2 (needs blue gradient wrapper in home.tsx)
- **How It Works (Phase 4)**: Depends on Phase 2 only (independent of Hero content)
- **Differentiators (Phase 5)**: Depends on Phase 2 only (independent of other sections)
- **Stats (Phase 6)**: Depends on Phase 2 only (independent of other sections)
- **Final CTA (Phase 7)**: Depends on Phase 2 only (independent of other sections)
- **Polish (Phase 8)**: Depends on all section phases being complete

### User Story Dependencies

- **US6 (Blue Theme)**: Foundational — all other stories depend on this
- **US1 (Hero)**: Depends on US6 only — this is the MVP
- **US2 (How It Works)**: Depends on US6 only — can run parallel with US1
- **US3 (Differentiators)**: Depends on US6 only — can run parallel with US1/US2
- **US4 (Stats)**: Depends on US6 only — can run parallel with US1/US2/US3
- **US5 (Final CTA)**: Depends on US6 only — can run parallel with all others

### Within Each User Story

- Create section component first
- Then update home.tsx to import and render it
- No cross-section dependencies

### Parallel Opportunities

- T002 and T003 can run in parallel (Header and Footer adaptation — different files)
- T005 and T006 can run in parallel (HeroSection and HeroSearch restyle — different files)
- T008, T010, T012, T014 can all run in parallel (all section components — different files, no dependencies on each other)
- After all sections are created, T009/T011/T013/T015 compose them sequentially in home.tsx

---

## Parallel Example: Section Components

```bash
# After Phase 2 completes, launch all section components in parallel:
Task: "Create HeroSection in app/components/home/HeroSection.tsx" (T005)
Task: "Create HowItWorksSection in app/components/home/HowItWorksSection.tsx" (T008)
Task: "Create DifferentiatorsSection in app/components/home/DifferentiatorsSection.tsx" (T010)
Task: "Create StatsSection in app/components/home/StatsSection.tsx" (T012)
Task: "Create FinalCtaSection in app/components/home/FinalCtaSection.tsx" (T014)
```

---

## Implementation Strategy

### MVP First (Hero Only)

1. Complete Phase 1: CSS foundation (T001)
2. Complete Phase 2: Blue theme + header/footer adaptation (T002–T004)
3. Complete Phase 3: Hero section (T005–T007)
4. **STOP and VALIDATE**: Blue gradient visible, hero renders with quiz CTA and search, header transparent on home route
5. This alone is a shippable improvement over the white landing page

### Incremental Delivery

1. CSS + Blue Theme + Header/Footer → Foundation ready
2. Add Hero (US1) → Test → **MVP shippable**
3. Add How It Works (US2) → Test → Deploy
4. Add Differentiators (US3) + Stats (US4) → Test → Deploy
5. Add Final CTA (US5) → Test → Deploy
6. Polish animations + responsive audit → Final deploy

### Suggested MVP Scope

**Phase 1 + Phase 2 + Phase 3** (tasks T001–T007) = 7 tasks. This delivers the blue gradient, adapted header/footer, hero section with quiz CTA and search bar. The page is immediately more compelling than the current white version.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently testable after Phase 2 foundation
- No test tasks generated — not explicitly requested in the spec
- All text content is hardcoded in pt-BR as per FR-008
- Stats numbers are hardcoded initially (200+ cars, etc.) and can be made dynamic later
- Commit after each phase or logical group
