# Design — CarAI website

A locked design system for joincarai.com. Every page (landing ES/EN, legal, support) reads this
file before changing visuals. Extend or amend it here; don't override per page.
Tokens live in [`tokens.css`](tokens.css); page CSS in [`style.css`](style.css) references them by name only.

## Genre
modern-minimal, dark (premium fintech register, aligned with the iOS app)

## Macrostructure family
- Marketing pages: **Feature Stack** — H2 split hero (copy left, real app screens right) →
  verifiable facts strip → cinematic scroll stage → F2 sticky-copy journey → tabular rows →
  gallery → pricing → FAQ (`<details>`) → Ft5 statement footer.
- Content pages (legal, support): single 46 rem column, mono kicker, display h1, boxed TOC.
- Nav: **N10** floating-on-scroll morph on every page. Footer: **Ft5** on landing,
  compact variant (`.foot--compact`, no statement line) on content pages.

## Theme — custom "CarAI night" (hue 258, the app's `#3B82F6` family)
- `--color-paper`   oklch(14.5% 0.028 262) — canvas (app `bgPage`)
- `--color-paper-2` oklch(18.5% 0.032 258) — raised surface (app `bgCard`)
- `--color-ink`     oklch(96.5% 0.006 258) · `--color-ink-2` oklch(80% 0.022 255) · `--color-muted` oklch(68% 0.022 255)
- `--color-rule`    oklch(30% 0.030 255) hairlines · `--color-rule-strong` oklch(52% 0.030 255) control borders (≥ 3:1)
- `--color-accent`  oklch(68% 0.165 258) — focus, active, featured plan, progress only (≤ 3 % of a viewport)
- `--color-good`    oklch(80% 0.140 165) fair price / saving · `--color-bad` oklch(72% 0.160 22) overpriced — always with a text label
- Primary button = ink-filled pill (light on dark), never accent-filled. No gradients on text or heroes.

## Typography
- Display: Geist 700, tracking −0.04em, leading 0.98, roman only (no italic headings)
- Body: Geist 400, 17 px, leading 1.55
- Mono: Geist Mono 400/500 — step numbers, tags, the hero range chip. Prices use Geist with tabular figures.
- Scale: `--text-display` clamp(44→88 px) · `--text-4xl` 34→60 · `--text-2xl` 24→34 · `--text-lg` 18→21

## Spacing
4-point named scale (`--space-3xs` 4 px … `--space-3xl` fluid 80→144 px). Section padding varies on
purpose (stage, journey and pricing breathe more than the soon list).

## Motion
- Easings `--ease-out` cubic-bezier(0.16,1,0.3,1), `--ease-in`, `--ease-in-out`; durations 120/220/420/520 ms.
- Only `transform`/`opacity` animate (nav morph also cross-fades backgrounds per the N10 recipe).
- No scroll-reveal fades. The scroll stage *is* the motion moment; journey dims inactive steps.
- Reduced motion: transitions collapse to 1 ms, stage shows its poster frame only.

## Microinteractions stance
Silent success. Hover = colour shift only (one effect per element). Focus ring 2 px `--color-focus`, instant.

## Honest copy
No invented metrics, ratings, testimonials or logos. Unreleased features carry "Próximamente / Coming soon".
Valuations are always "estimates", never "appraisals".

## Performance rules
Hero screens eager + `fetchpriority="high"`; everything else `loading="lazy"` with width/height.
Screens ship as WebP with JPEG fallback. The stage loads nothing until the visitor scrolls near it,
uses `frames/1600/` unless the canvas needs > 1700 device px, and draws only on change while visible.
