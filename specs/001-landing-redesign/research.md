# Research — 001 Landing Redesign

## R1 · Replace Three.js with a raw WebGL quad

- **Decision**: ~120-line WebGL1 renderer (one full-screen triangle pair, two textures, same
  cover-fit + vignette + triangular dither shader).
- **Rationale**: Three.js (1.2 MB unminified) only drew a 2-texture quad. Raw WebGL keeps
  identical visuals and sub-frame blending with zero dependency weight.
- **Alternatives**: Canvas2D `drawImage` with `globalAlpha` blend (no dither, more banding);
  `<video>` scrubbing via `currentTime` (stutters on seek, especially reverse).

## R2 · Lazy, progressive frame loading

- **Decision**: IntersectionObserver with `rootMargin: 100% 0px` starts the stage. Frames load in
  coarse-to-fine passes (every 16th, 8th, 4th, 2nd, then all) with 6 concurrent requests, so the
  whole scroll range is scrubbable early at low temporal resolution.
- **Rationale**: Nothing downloads before the user approaches; the nearest-loaded fallback already
  exists, so a coarse pass gives a full-range preview after ~12 frames.

## R3 · Idle render loop

- **Decision**: rAF loop runs only while the stage intersects the viewport and the document is
  visible; draws only when the smoothed frame value changes (> 0.001).
- **Rationale**: The old loop rendered a full-screen WebGL pass every frame forever.

## R4 · Typography

- **Decision**: Geist (variable 300–700) for display + body, Geist Mono 400/500 for prices, figures
  and labels. Display 700 / body 400 (≥ 300 weight contrast), tracking −0.035em on display.
- **Rationale**: modern-minimal single-family discipline; Geist's tabular figures suit prices.
  Replaces Inter (Hallmark "Inter-everywhere" anti-pattern) and the platform-dependent SF stack
  that made the site render differently on Windows/Android.

## R5 · Colour

- **Decision**: custom dark palette, hue 258 (the app's `#3B82F6` family). Accent = CarAI blue,
  used on focus rings, links, active states and the primary verdict figure only. Verdict
  semantics: green = good price, red = overpriced, always paired with a text label.
- **Rationale**: Constitution III requires app alignment; the mint→violet gradient text is a
  Hallmark critical anti-pattern (gradient headline).

## R6 · Image formats

- **Decision**: WebP (q78) for screenshots via `<picture>` with JPEG fallback; explicit
  `width`/`height`; hero screens eager + `fetchpriority="high"`, all others lazy.
- **Rationale**: ~60 % byte savings; prevents CLS; keeps LCP non-lazy.

## R7 · Mobile animation path

- **Decision**: keep the boomerang `transition-loop.mp4`, but `preload="none"` and attach `src`
  only when the stage nears the viewport; pause when off-screen.
- **Rationale**: 4.5 MB video no longer competes with the hero on first load.

## R8 · FAQ

- **Decision**: native `<details>/<summary>`.
- **Rationale**: Keyboard, screen-reader and no-JS support for free.
