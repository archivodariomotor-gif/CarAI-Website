<!--
Sync Impact Report
- Version change: (template) → 1.0.0
- Principles added: I. Honest Copy · II. Performance Budget · III. One Design System ·
  IV. Accessible & Responsive by Default · V. Zero-Build Simplicity · VI. Bilingual Parity
- Sections added: Technical Constraints · Quality Gates
- Templates: plan/spec/tasks templates read this file at runtime — no edits needed.
- Deferred TODOs: none
-->

# CarAI Website Constitution

## Core Principles

### I. Honest Copy (NON-NEGOTIABLE)

Every claim on the site MUST be true of the app currently published in the App Store.
Metrics, user counts, ratings, testimonials and press logos MUST NOT be invented — use a
real figure or leave the slot out. Features that exist in code but are not yet released
MUST be labelled "Próximamente / Coming soon". Valuations MUST be described as
estimates, never as professional appraisals.

Rationale: CarAI's promise is "que no te engañen". A site that overstates breaks that
promise before the user installs the app.

### II. Performance Budget

The landing MUST reach Largest Contentful Paint < 2.5 s on a mid-range phone over 4G.
Critical path (HTML + CSS + fonts + hero image) MUST stay under 400 KB transferred.
Heavy media (animation frames, video) MUST load only when its section approaches the
viewport, and render loops MUST stop when off-screen or when the tab is hidden.
No third-party scripts except self-hosted or Google Fonts.

Rationale: Most visitors arrive from Instagram on mobile data; every second lost is a
lost install.

### III. One Design System

All pages (landing ES/EN, legal, support) MUST share one token set (`tokens.css`):
colour, type, spacing, radius, motion. Page CSS MUST reference tokens by name — no raw
hex/OKLCH values outside `tokens.css`. The web palette MUST stay aligned with the app
(navy canvas, CarAI blue accent, green = good deal, red = bad deal).

Rationale: The site should feel like the app's front door, not a separate product.

### IV. Accessible & Responsive by Default

Every page MUST render without horizontal scroll at 320, 375, 414, 768 and 1440 px,
meet WCAG 2.2 AA contrast, provide visible `:focus-visible` rings, support keyboard
navigation, and honour `prefers-reduced-motion` (spatial motion collapses to fades,
the scroll animation becomes a still frame).

### V. Zero-Build Simplicity

The site MUST remain static HTML/CSS/vanilla JS servable from any static host by
copying the folder. No bundler, framework or package install is required to run it.
New dependencies MUST be justified in the plan; vendored libraries are preferred to
CDNs.

### VI. Bilingual Parity

Spanish (`index.html`) and English (`index-en.html`) MUST carry the same sections,
the same claims and the same prices. A change to one language is incomplete until the
other matches.

## Technical Constraints

- Hosting: static files at `https://joincarai.com/` (canonical URLs and OG tags MUST
  stay valid).
- Store links: App Store `id6781012726` is live; Google Play MUST stay hidden or marked
  "soon" until published.
- Prices shown MUST match the README "Precios" section and carry the store disclaimer.

## Quality Gates

Before a change is considered done:

1. Headless screenshots at 375 and 1440 px reviewed, no horizontal overflow.
2. No console errors on load and full scroll.
3. ES/EN diff reviewed for parity.
4. Critical-path weight checked against the Performance Budget.

## Governance

This constitution supersedes ad-hoc preferences for the website repo. Amendments MUST
be recorded here with a version bump (MAJOR: principle removed/redefined; MINOR:
principle added; PATCH: wording). Every spec and plan MUST include a Constitution Check
against Principles I–VI.

**Version**: 1.0.0 | **Ratified**: 2026-10-05 | **Last Amended**: 2026-10-05
