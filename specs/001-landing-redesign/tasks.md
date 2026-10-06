# Tasks: Landing Redesign — Mass-Market, Premium, Fast

**Input**: plan.md, research.md, data-model.md, contracts/page-structure.md
**Tests**: manual/scripted validation per quickstart.md (no unit-test framework in a static site)

## Phase 1: Setup

- [x] T001 Write locked design system `design.md` and `.hallmark/log.json`
- [x] T002 [P] Create `tokens.css` (colour, type, space, radius, motion tokens)
- [x] T003 [P] Generate `assets/brand/` logo sizes (32/64/180 PNG + 128 WebP) from `assets/logo.png`
- [x] T004 [P] Generate WebP versions of `assets/screens/*.jpg`

## Phase 2: Foundational (blocks all stories)

- [x] T005 Rewrite `style.css` base: reset, typography, layout primitives, buttons, focus, reduced motion
- [x] T006 Header N10 (floating-on-scroll morph) + Ft5 footer components in `style.css`
- [x] T007 `main.js` module skeleton: nav morph, journey step highlight, language-switch persistence

## Phase 3: US1 — Five-second understanding (P1) 🎯 MVP

- [x] T008 [US1] Hero H2 split + facts strip markup in `index.html`
- [x] T009 [US1] Hero/facts styles in `style.css`
- [x] T010 [US1] Update meta description / OG / Twitter copy in `index.html`

## Phase 4: US2 — Buyer journey story (P1)

- [x] T011 [US2] Cinematic stage markup + new captions in `index.html`
- [x] T012 [US2] Buyer-journey Feature Stack (4 steps) in `index.html` + styles
- [x] T013 [US2] Coming-soon rows + For-enthusiasts section in `index.html` + styles

## Phase 5: US3 — Fast & light (P1)

- [x] T014 [US3] Raw-WebGL stage renderer replacing Three.js in `main.js`
- [x] T015 [US3] Lazy start (IntersectionObserver), coarse-to-fine frame loading, idle loop
- [x] T016 [US3] Mobile video path: deferred `src`, pause off-screen, reduced-motion still

## Phase 6: US4 — Pricing & FAQ (P2)

- [x] T017 [US4] Pricing plans + `<details>` FAQ markup and styles

## Phase 7: US1–US4 parity

- [x] T018 Build `index-en.html` from the same skeleton (VI. Bilingual Parity)

## Phase 8: US5 — Shared chrome on every page (P3)

- [x] T019 [P] [US5] Swap header/footer + head links in `terminos.html`, `terms.html`
- [x] T020 [P] [US5] Same for `privacidad.html`, `privacy.html`
- [x] T021 [P] [US5] Same for `soporte.html`, `support.html`
- [x] T022 [US5] Legal page styles (`.legal*`) on tokens in `style.css`

## Phase 9: Polish & validation

- [x] T023 Regenerate `assets/og-cover.jpg` for the new positioning
- [x] T024 Run quickstart validation: widths 320–1440, console, network-before-scroll, parity
- [x] T025 Hallmark slop test; stamp `style.css`; update README (stack, structure)

## Dependencies

Setup → Foundational → US1 → (US2, US3, US4 in any order) → EN parity → US5 → Polish.
T003/T004 parallel; T019–T021 parallel.
