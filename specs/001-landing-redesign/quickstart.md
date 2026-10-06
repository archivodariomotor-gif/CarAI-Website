# Quickstart — validate 001 Landing Redesign

## Run

```bash
cd "assets for website"
python3 -m http.server 8765        # http://127.0.0.1:8765/index.html
```

## Validate

1. **First screen (US1)** — open at 375×812 and 1440×900: headline, lede, App Store badge and
   a real app screen visible without scrolling.
2. **Lazy media (US3)** — DevTools → Network, reload, don't scroll: no `frames/*` or
   `transition-loop.mp4` requests. Scroll to the stage: frames start loading.
3. **Idle loop (US3)** — Performance panel: scroll past the stage; no WebGL draws recorded.
4. **Scrub (US2)** — scroll down/up through the stage on desktop: sequence moves both ways.
5. **Reduced motion** — emulate `prefers-reduced-motion: reduce`: still frame, no slides.
6. **FAQ (US4)** — Tab to a question, press Enter/Space: opens/closes.
7. **Widths** — 320 / 375 / 414 / 768 / 1440: no horizontal scroll, no two-line buttons.
8. **Parity** — compare section list of `index.html` vs `index-en.html` (contract table).
9. **Legal pages (US5)** — `terminos.html`, `privacy.html`, `soporte.html` share header/footer.
