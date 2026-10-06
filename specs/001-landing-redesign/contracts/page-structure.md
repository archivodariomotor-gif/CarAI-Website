# UI Contract — Landing page structure (ES `index.html` = EN `index-en.html`)

Section order and anchors are the public contract (shared links, nav, store listing links).

| # | Section | id | Content contract |
|---|---|---|---|
| 0 | Header (N10) | — | logo + "CarAI" · Cómo funciona · Precios · FAQ · ES/EN · "Descargar" pill |
| 1 | Hero (H2) | `top` | h1 ≤ 50 chars · lede · App Store badge (`#descargar`) · free-tier note · 2 real screens |
| 2 | Facts strip | — | Only verifiable facts (App Store, iOS 15+, languages, no mandatory subscription) |
| 3 | Cinematic stage | `story` | scroll-scrubbed frames (desktop) / looped video (mobile) + 3 captions |
| 4 | Buyer journey (F2) | `como-funciona` / `how-it-works` | 4 steps, sticky copy + real screen each |
| 5 | Coming soon | `proximamente` / `coming-soon` | 3 rows labelled Próximamente |
| 6 | For enthusiasts | `entusiastas` / `enthusiasts` | collection, scenarios, Garage Card |
| 7 | Pricing | `precios` / `pricing` | 3 plans + disclaimer |
| 8 | FAQ | `faq` | `<details>` items |
| 9 | Footer (Ft5) | — | statement line, store badge, links (support, terms, privacy), estimate disclaimer |

Legacy anchors `#features`, `#vision`, `#descargar` MUST keep resolving (aliases on the new sections).
