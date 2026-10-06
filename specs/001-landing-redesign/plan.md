# Implementation Plan: Landing Redesign — Mass-Market, Premium, Fast

**Branch**: `001-landing-redesign` | **Date**: 2026-10-05 | **Spec**: [spec.md](spec.md)

## Summary

Rebuild the visual and interaction layer of joincarai.com around the mass-market promise
("know what a used car is worth before you pay"), in a dark-premium fintech register aligned with
the app's palette. Keep the signature scroll-scrubbed car animation but make it lazy, paused when
off-screen and Three.js-free. Unify all pages (landing ES/EN, legal, support) on one token file.

Design decisions (Hallmark `redesign`, multi-page → `design.md` locked system):

- **Genre**: modern-minimal (dark) · **Theme**: custom, anchored on the app's CarAI blue
- **Macrostructure**: 16 · Feature Stack (sticky copy + scrolling real screens for the buyer journey)
- **Hero**: H2 Split diptych (copy left, two real app screens right)
- **Nav**: N10 Floating-on-scroll morph · **Footer**: Ft5 Statement
- **Enrichment**: existing cinematic frame sequence (kept, optimised) — no new imagery

## Technical Context

**Language/Version**: HTML5, CSS (custom properties, OKLCH, container-safe grid), ES2020 modules
**Primary Dependencies**: none at runtime (Three.js removed); Google Fonts (Geist, Geist Mono)
**Storage**: N/A
**Testing**: Playwright-core screenshot + network/console audit script (dev-only, outside repo)
**Target Platform**: Evergreen browsers; iOS Safari 15+ (Instagram in-app browser)
**Project Type**: static marketing website
**Performance Goals**: LCP < 2.5 s on 4G; ≤ 1 MB before first scroll; render loop idle off-screen
**Constraints**: zero build, static hosting, ES/EN parity, honest copy
**Scale/Scope**: 8 HTML pages (index, index-en, 2× terms, 2× privacy, 2× support)

## Constitution Check

| Principle | How the plan complies | Status |
|---|---|---|
| I. Honest Copy | Only App Store features presented as live; app specs 001–003 labelled "Próximamente"; no metrics/testimonials | PASS |
| II. Performance Budget | Lazy stage, IO-paused render loop, WebP screens, small logo, Three.js removed | PASS |
| III. One Design System | `tokens.css` + `design.md`; page CSS references tokens only | PASS |
| IV. Accessible & Responsive | `<details>` FAQ, focus rings, reduced-motion still frame, 320–1440 checks | PASS |
| V. Zero-Build | Plain files; image conversion is a one-off dev step, outputs committed | PASS |
| VI. Bilingual Parity | ES and EN rewritten from the same section skeleton | PASS |

Post-design re-check: PASS (no violations, Complexity Tracking empty).

## Project Structure

### Documentation (this feature)

```text
specs/001-landing-redesign/
├── plan.md · research.md · data-model.md · quickstart.md
├── contracts/page-structure.md
├── checklists/requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
index.html, index-en.html          # landing ES/EN (rewritten markup)
terminos|terms|privacidad|privacy|soporte|support.html   # header/footer swapped
tokens.css                         # NEW — locked tokens (design.md mirror)
style.css                          # rewritten — page CSS, tokens only
main.js                            # rewritten — nav morph, stage (raw WebGL), lazy load
design.md                          # NEW — locked design system
.hallmark/log.json                 # NEW — Hallmark project memory
assets/brand/                      # NEW — logo-64/128/180 png+webp, favicon
assets/screens/*.webp              # NEW — WebP versions of screenshots
assets/og-cover.jpg                # regenerated for new positioning
vendor/three.module.js             # no longer referenced (kept; deletion needs approval)
```

**Structure Decision**: keep the flat static layout; add `tokens.css`, `design.md` and optimised
assets. No file deletions.

## Complexity Tracking

None.
