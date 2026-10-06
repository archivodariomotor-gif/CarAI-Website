# Data Model — 001 Landing Redesign

Static content only; entities describe what each page section must carry.

## Plan

| Field | Rule |
|---|---|
| name | Gratis · Llaves · CarAI Collector |
| price | 0 € · 4,99 € (1) / 9,99 € (3, −33 %) · 14,99 €/mes or 119,99 €/año |
| features | 4–6 bullets, from the README price section |
| cta | links to the App Store |
| disclaimer | "Precio orientativo para España; el precio final lo fija tu tienda" |

## Journey step

| Field | Rule |
|---|---|
| index | 1–4 (identify → fair price → real cost → negotiate & report) |
| question | the buyer's question, ≤ 8 words |
| answer | ≤ 40 words, no invented figures |
| screen | real screenshot from `assets/screens/` |
| status | `live` (default) or `soon` → renders a "Próximamente" label |

## Coming-soon item

Paste a listing link → verdict · History & odometer check · Invite friends, earn analyses.
All `status: soon` until released in the App Store.
