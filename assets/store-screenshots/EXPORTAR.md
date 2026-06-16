# Exportar screenshots para App Store

Tamaño objetivo: **1284 × 2778 px** (iPhone 6.5" — requerido por Apple)

---

## Método recomendado — Chrome DevTools (gratis, sin instalar nada)

1. Abre cada HTML en **Google Chrome**
2. Abre DevTools: `Cmd + Opt + I`
3. Activa el modo responsive: `Cmd + Shift + M` (icono de teléfono en la barra)
4. En la barra superior del simulador, elige **"Edit…" → Add custom device**:
   - Nombre: `AppStore`
   - Width: `1284`
   - Height: `2778`
   - Device pixel ratio: `1`
5. Selecciona ese dispositivo en el menú desplegable
6. Haz clic en los **tres puntos (⋮)** del panel de simulación → **"Capture screenshot"**
7. Se descarga un PNG de exactamente 1284 × 2778 px ✓

Repite para los 5 archivos.

---

## Archivos

| # | Archivo | Pantalla | Mensaje |
|---|---------|----------|---------|
| 1 | `01_portfolio.html` | Mi Colección | "Toda tu colección, valorada al céntimo." |
| 2 | `02_vision.html` | CarAI Vision (identificación) | "¿Qué coche es ese? Apúntale y descúbrelo." |
| 3 | `03_collector.html` | Collector Intelligence | "Tres escenarios. Una decisión clara." |
| 4 | `04_ownership.html` | Ownership Intelligence | "Cuánto cuesta de verdad cada coche." |
| 5 | `05_dossier.html` | Dossier analítico PDF | "Informe profesional en PDF. Siempre listo." |

---

## Notas para Apple Developer

- Apple requiere mínimo **3 screenshots** del tamaño 1284 × 2778 (6.5")
- Estos 5 cubren las funciones principales en el orden recomendado de App Store
- Sube los PNG directamente en App Store Connect → Tu app → Versión → Screenshots
- Si también quieres subir para iPad, necesitas un tamaño diferente (2048 × 2732)
