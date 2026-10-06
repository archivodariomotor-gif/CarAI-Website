# Feature Specification: Landing Redesign — Mass-Market, Premium, Fast

**Feature Branch**: `001-landing-redesign`

**Created**: 2026-10-05

**Status**: Draft

**Input**: User description: "Analyze the whole distribution of my website using hallmark skill.
Level up my website so its efficiency and UI is improved to the highest level. Make my website
look like professional app websites such as Rever, Revolut and similar tech startup websites."
Decisions taken with the user: mass-market positioning (pivot of 2026-09-22), dark premium
look, keep the scroll animation but optimise it, Spec Kit installed in repo.

## Context — audit of the current site (2026-10-05)

| Area | Today | Problem |
|---|---|---|
| Positioning | "Collector Intelligence", "El valor de tu garaje" | Speaks to collectors only; the app pivoted to "compra usado bien, que no te engañen" |
| Hero | Centered-left text, app icon, gradient headline, badge | No product visible above the fold; generic AI-landing gradient text |
| Story | 3 phone-left/right blocks, 6 icon cards, 6-step strip, 2 showcase items | Same rhythm repeated; feature list, not a narrative; reader has to infer the benefit |
| Pricing | 3 cards + FAQ as static list | Fine content; FAQ not collapsible, long scroll on mobile |
| Animation | 192 WebP frames (28 MB) + Three.js (1.2 MB) | All frames download at load, render loop runs forever even off-screen or in a hidden tab |
| Assets | `logo.png` 681 KB used as favicon + nav icon | Critical-path bloat |
| System | Hex tokens, mint/blue/violet gradients | Palette drifts from the app (navy + CarAI blue + green/red verdicts) |

## User Scenarios & Testing *(mandatory)*

### User Story 1 - "Am I about to overpay?" understood in 5 seconds (Priority: P1)

A Spanish visitor coming from Instagram on a phone, about to buy a second-hand car, lands on
joincarai.com. Above the fold they read what CarAI does for them (know the fair price of any
used car before paying), see the real app producing a verdict, and can tap "Descargar en App
Store" without scrolling.

**Why this priority**: The landing exists to convert Instagram traffic into installs.

**Independent Test**: Load the page at 375 × 812; the headline, a real app screen and the App
Store button are all visible without scrolling; a first-time reader can paraphrase the value.

**Acceptance Scenarios**:

1. **Given** a 375 px viewport, **When** the page loads, **Then** headline, sub-line, App Store
   button and a real product screen are visible in the first viewport.
2. **Given** a 1440 px viewport, **When** the page loads, **Then** the hero shows copy on one side
   and the product on the other, with no element below 4.5:1 text contrast.
3. **Given** a non-Spanish browser, **When** visiting `/`, **Then** the English page with the same
   structure is served (existing redirect preserved).

---

### User Story 2 - A clear story from "scan" to "negotiate" (Priority: P1)

The visitor scrolls and follows one narrative: identify any car (Vision) → see its fair price
and comparables → know the true cost of owning it → get negotiation arguments and a PDF
report. Each step shows a real app screenshot. Collector tools (portfolio, scenarios, Garage
Card) appear afterwards as "for enthusiasts", not as the front door.

**Why this priority**: Explains the product in the order the buyer actually needs it.

**Independent Test**: Scroll the page top to bottom; every section answers one buyer question
and maps to a feature that exists in the published app.

**Acceptance Scenarios**:

1. **Given** the story sections, **When** reviewed against the App Store build, **Then** every
   feature claimed as available exists; unreleased ones are labelled "Próximamente".
2. **Given** the scroll animation section, **When** the user scrolls down/up on desktop, **Then**
   the car sequence scrubs forward/backward smoothly as today.

---

### User Story 3 - Fast and light on mobile data (Priority: P1)

The visitor on 4G gets a usable page quickly; heavy animation media downloads only if they
reach it.

**Why this priority**: Instagram traffic is mobile; slow pages lose installs.

**Independent Test**: Load the page with network logging; before scrolling, no animation frames
and no video have been requested; total transfer before first scroll stays under the budget.

**Acceptance Scenarios**:

1. **Given** a fresh load, **When** the user has not scrolled, **Then** no `frames/*` and no
   `transition-loop.mp4` request has been made.
2. **Given** the animation is off-screen or the tab is hidden, **When** measured, **Then** no
   render frames are being drawn.
3. **Given** `prefers-reduced-motion`, **When** the page loads, **Then** a still frame replaces the
   animation and reveals are opacity-only.

---

### User Story 4 - Pricing understood without reading a wall of text (Priority: P2)

The visitor compares Gratis / Llaves / Collector at a glance, sees what is free forever, and
opens only the FAQ answers they care about.

**Independent Test**: At 375 px, the three plans and the FAQ fit in ≤ 2.5 screens when FAQ
items are collapsed; each FAQ item opens with keyboard and mouse.

**Acceptance Scenarios**:

1. **Given** the pricing section, **When** displayed, **Then** prices match the README exactly,
   with the store disclaimer.
2. **Given** an FAQ item, **When** activated by click, Enter or Space, **Then** it expands, and
   its state is exposed to assistive technology.

---

### User Story 5 - Same polish on every page (Priority: P3)

Legal and support pages (ES/EN) share the new header, footer, typography and colours.

**Independent Test**: Open `terminos.html`, `privacy.html`, `soporte.html`; they use the shared
tokens and match the landing's header/footer.

### Edge Cases

- JavaScript disabled: all content, links and prices remain readable; animation shows a poster.
- WebGL unavailable: animation falls back to the poster frame without errors.
- Very slow network: hero renders with text and screen before fonts finish (font-display swap).
- Wide screens (≥ 1920 px): content stays within a max width; animation still covers.
- Narrow screens (320 px): no horizontal scroll, buttons never wrap to two lines.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The hero MUST state the mass-market promise (fair price of any used car, don't
  get ripped off) in ≤ 8 words, with a supporting line and the App Store button.
- **FR-002**: The hero MUST show a real CarAI app screenshot, not a drawn mock.
- **FR-003**: The page MUST present the buyer journey in this order: identify → fair price &
  comparables → real ownership cost → negotiation & PDF report.
- **FR-004**: Collector features MUST appear in a secondary "for enthusiasts" section.
- **FR-005**: Features not yet published MUST carry a "Próximamente / Coming soon" label.
- **FR-006**: The scroll-scrub animation MUST be kept on desktop and the boomerang video on
  mobile, both loaded lazily when the section nears the viewport.
- **FR-007**: The animation render loop MUST pause when off-screen or the tab is hidden.
- **FR-008**: Pricing MUST show the three existing plans with unchanged prices and disclaimer.
- **FR-009**: FAQ MUST be collapsible using native disclosure semantics.
- **FR-010**: The header MUST stay reachable while scrolling and offer a persistent download
  action, plus ES/EN switch.
- **FR-011**: ES and EN pages MUST have identical structure and claims.
- **FR-012**: Legal/support pages MUST use the shared design tokens, header and footer.
- **FR-013**: The estimate disclaimer MUST remain visible in the footer.
- **FR-014**: OG/Twitter meta, canonical and hreflang MUST remain valid; description updated
  to the new positioning.

### Key Entities

- **Plan**: name, price(s), billing note, feature list, CTA.
- **Feature step**: buyer question, answer, app screenshot, availability (live / soon).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Bytes transferred before first scroll ≤ 1 MB (today: animation frames start
  downloading immediately — tens of MB).
- **SC-002**: Critical CSS+HTML+fonts+hero image ≤ 400 KB.
- **SC-003**: Zero console errors and zero horizontal overflow at 320/375/414/768/1440 px.
- **SC-004**: All text meets WCAG AA contrast; every interactive element has a visible focus ring.
- **SC-005**: 5 of 5 test readers can say what CarAI does after viewing only the first screen.
- **SC-006**: No invented metric, rating, testimonial or logo anywhere on the site.

## Assumptions

- Published app features (App Store build 1.0.x): CarAI Vision identification (free, 10/day),
  full analysis (fair price, market range, comparables, negotiation arguments, value history,
  PDF dossier), ownership cost breakdown, garage/portfolio, collector scenarios, Garage Card,
  Descubre, keys and Collector subscription.
- In code but treated as **not yet published**: paste-a-listing analyzer (spec 001 of the app),
  vehicle history / odometer check (002), referral rewards (003). Labelled "Próximamente".
- Existing app screenshots in `assets/screens/` are the only product imagery; no new photos.
- No analytics or tracking is added in this feature.
