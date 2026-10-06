# CarAI — landing web

Landing de **CarAI**: "Sabe lo que vale. Antes de pagar." — la app que identifica cualquier
coche con unas fotos y da su precio justo de mercado, su coste real y argumentos para
negociar. Las funciones de coleccionista (garaje, escenarios, Garage Card) aparecen como
sección "para entusiastas". El centro visual es una **animación controlada por scroll**:
avanza al bajar y retrocede al subir.

> Las valoraciones de CarAI son **estimaciones** basadas en datos de mercado, no
> tasaciones profesionales. La copy del sitio refleja ese matiz a propósito.

## Stack

HTML + CSS + JavaScript vanilla, **sin dependencias** (Three.js ya no se usa: el render es
WebGL nativo en `main.js`). Sin build — funciona sirviendo la carpeta por HTTP.
Sistema de diseño bloqueado en [`design.md`](design.md) + [`tokens.css`](tokens.css).
Spec Kit: constitución en `.specify/memory/constitution.md`, especificaciones en `specs/`.

## Cómo funciona la animación

- **Carga perezosa:** no se descarga nada de la animación hasta que el visitante hace scroll
  y el escenario está a menos de ¾ de pantalla. La primera pantalla pesa ~270 KB.
- **Escritorio:** 192 fotogramas WebP dibujados con un quad WebGL nativo que mezcla los dos
  fotogramas adyacentes (cross-fade sub-fotograma), con viñeta y **dither triangular** para
  eliminar el banding. Se usa `frames/1600/` (7 MB) salvo que el lienzo necesite más de
  1700 px de dispositivo; entonces `frames/` (2560 px, 28 MB). Los fotogramas cargan de
  grueso a fino (cada 16, 8, 4, 2, 1) para que todo el recorrido sea "scrubbeable" pronto.
- **Bucle de render inactivo:** solo dibuja si el escenario está en pantalla, la pestaña es
  visible y el fotograma cambia.
- **Móvil/táctil:** bucle boomerang `transition-loop.mp4`, `src` asignado al acercarse y
  pausado fuera de pantalla.
- **`prefers-reduced-motion`:** solo el fotograma póster; los textos siguen el scroll.

## Estructura

| Archivo | Qué es |
|---|---|
| `index.html` / `index-en.html` | Landing ES / EN (misma estructura; auto-redirección por idioma) |
| `tokens.css` | Tokens de color, tipografía, espaciado y movimiento (fuente única) |
| `style.css` | Estilos de todas las páginas (solo usa tokens) |
| `main.js` | Nav flotante, pasos de "Cómo funciona", escenario WebGL/vídeo perezoso |
| `design.md` | Sistema de diseño bloqueado (Hallmark) |
| `frames/` · `frames/1600/` | 192 fotogramas WebP 2560 px y 1600 px + `manifest.json` |
| `transition.mp4` / `transition-loop.mp4` | Vídeo fuente 4K / bucle móvil 720p |
| `assets/stage-poster.webp` | Póster del escenario (sin JS, reduced-motion, mientras carga) |
| `assets/og-cover.jpg` · `og-cover-en.jpg` | Imágenes para compartir (1200×630) |
| `assets/brand/` | Logo en 32/64/180/512 px |
| `assets/screens/` | Capturas reales de la app (WebP + JPG de respaldo) |
| `terminos` · `privacidad` · `soporte` `.html` (+ EN) | Legales y soporte |
| `specs/001-landing-redesign/` | Spec, plan y tareas de este rediseño (Spec Kit) |
| `vendor/three.module.js` | Ya no se referencia; se puede borrar |

## Ejecutar

Usa `fetch()` y módulos ES → hay que servirlo por HTTP (no vale `file://`):

```bash
cd "assets for website"
python3 -m http.server 8765   # abre http://127.0.0.1:8765
```

## Regenerar los assets de la animación

Si cambias `transition.mp4`, regenera **fotogramas + bucle móvil** con el mismo
pipeline (deband para eliminar el banding de origen; WebP q90; boomerang móvil):

```bash
# 1) Fotogramas WebP debandeados (escritorio) → frames/frame_0001.webp …
rm -rf /tmp/fr && mkdir -p /tmp/fr
ffmpeg -i transition.mp4 \
  -vf "scale=2560:1440:flags=lanczos,deband=1thr=0.015:2thr=0.015:3thr=0.015:4thr=0.015:range=22:blur=1" \
  -start_number 1 /tmp/fr/frame_%04d.png
rm -f frames/frame_*.webp
for f in /tmp/fr/frame_*.png; do
  cwebp -quiet -q 90 -m 6 -sharp_yuv "$f" -o "frames/$(basename "$f" .png).webp"
done
# Actualiza "count" en frames/manifest.json si cambia el nº de fotogramas.
# Versión ligera 1600 px:
mkdir -p frames/1600
for f in frames/frame_*.webp; do cwebp -quiet -q 80 -resize 1600 900 "$f" -o "frames/1600/$(basename "$f")"; done

# 2) Bucle boomerang móvil (720p, sin corte de loop, faststart)
ffmpeg -i transition.mp4 -filter_complex \
 "[0:v]scale=1280:720:flags=lanczos,deband=1thr=0.015:2thr=0.015:3thr=0.015:4thr=0.015:range=22:blur=1,split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1[v]" \
 -map "[v]" -an -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 20 -preset slow \
 -movflags +faststart transition-loop.mp4
```

Velocidad del scrub: `main > .stage { height }` en `style.css` (más alto = más lento).
Suavidad del seguimiento: `TAU` en `main.js` (menor = más directo).

## Precios (ya cargados)

- **Gratis** (1 análisis completo de por vida + CarAI Vision hasta 10 escaneos/día).
- **Llaves** — 4,99 € (1) · 9,99 € (3, −33%). Sin suscripción, no caducan.
- **CarAI Collector** — 14,99 €/mes o 119,99 €/año. Ilimitado.

*Precios orientativos para España; el precio final lo fija la tienda.*

## Datos de la app (App Store, ago-2026)

Nombre **CarAI**, categoría **Estilo de vida**, gratis, idiomas EN/FR/DE/ES,
iOS 15+. Ficha: <https://apps.apple.com/us/app/carai/id6781012726>.

## Accesibilidad

Tema oscuro nativo, contraste AA verificado (texto ≥ 6,4:1), FAQ con `<details>` nativo, `alt` en imágenes, `aria-label` en
iconos/botones, navegación por teclado con `:focus-visible`, enlace "saltar al
contenido" y respeto a `prefers-reduced-motion` (en móvil el vídeo se congela).
