# CarAI — landing web

Landing de **CarAI — Collector Intelligence**, la app para coleccionistas de
coches: portfolio digital, **CarAI Vision** (identifica y estima el valor de
cualquier coche), inteligencia de mercado, informes en PDF y "Descubre". El
centro de la página es una **animación controlada por scroll** hecha con
Three.js: la secuencia avanza al bajar y retrocede al subir.

> Las valoraciones de CarAI son **estimaciones** basadas en datos de mercado, no
> tasaciones profesionales. La copy del sitio refleja ese matiz a propósito.

## Stack

HTML + CSS + JavaScript (vanilla) con **Three.js alojado en local**
(`vendor/three.module.js`, sin CDN). Sin build, sin dependencias que instalar —
funciona sirviendo la carpeta por HTTP.

## Cómo funciona la animación

- **Escritorio (`main.js`, path Three.js):** `transition.mp4` se pre-divide en
  **192 fotogramas WebP** (`frames/`, 2560×1440) — la técnica estilo Apple,
  mucho más fina de "scrubbear" en ambos sentidos que un `<video>`. La posición
  de scroll dentro de `.stage` mapea a un índice de fotograma **fraccionario**;
  el shader **mezcla los dos fotogramas adyacentes** (cross-fade sub-fotograma)
  con suavizado independiente de la tasa de refresco (`TAU` en `main.js`).
- **Móvil (`transition-loop.mp4`):** cargar 192 bitmaps decodificados (~2,8 GB)
  cierra Safari en iOS, así que en móvil se reproduce un **bucle boomerang
  perfecto** (el clip + su reverso), de forma que **nunca hay corte** en el punto
  de loop. Las captions siguen igualmente el scroll.
- **Sin banding (limpieza "de raíz"):** los fotogramas se extraen con el filtro
  **`deband`** de ffmpeg y el shader añade un **dither triangular en espacio de
  pantalla** (±1 LSB), que disuelve el banding del degradado oscuro tanto de los
  fotogramas como de la viñeta CSS. Nada de bloques ni escalones en los negros.
- **Hero-first:** no hay splash bloqueante. El hero se muestra al instante; solo
  se espera el fotograma 0 y el resto carga de fondo (hasta que llega cada uno se
  muestra el más cercano ya cargado, así nada parece roto). `main().catch`
  revela ante cualquier error.

## Estructura

| Archivo | Qué es |
|---|---|
| `index.html` / `index-en.html` | Página ES / EN (auto-redirección por idioma del navegador) |
| `style.css` | Estilos, tema oscuro, degradado, responsive |
| `main.js` | Three.js: quad a pantalla completa, shader cover-fit + viñeta + dither, movido por scroll; path de vídeo boomerang en móvil |
| `frames/` | 192 fotogramas WebP (2560×1440) + `manifest.json` (~28 MB) |
| `transition.mp4` | Vídeo original 4K (fuente de los fotogramas) |
| `transition-loop.mp4` | Bucle boomerang 720p para el path móvil |
| `assets/og-cover.jpg` | Imagen de compartición social (Open Graph, 1200×630) |
| `assets/logo.png` | **Logo de la app** (icono) |
| `assets/screens/` | Capturas reales de la app |
| `terminos.html` · `privacidad.html` · `soporte.html` (+ EN) | Legales y soporte |

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

# 2) Bucle boomerang móvil (720p, sin corte de loop, faststart)
ffmpeg -i transition.mp4 -filter_complex \
 "[0:v]scale=1280:720:flags=lanczos,deband=1thr=0.015:2thr=0.015:3thr=0.015:4thr=0.015:range=22:blur=1,split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1[v]" \
 -map "[v]" -an -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 20 -preset slow \
 -movflags +faststart transition-loop.mp4
```

Velocidad del scrub: `.stage { height }` en `style.css` (más alto = más lento).
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

Tema oscuro nativo, contraste cuidado, `alt` en imágenes, `aria-label` en
iconos/botones, navegación por teclado con `:focus-visible`, enlace "saltar al
contenido" y respeto a `prefers-reduced-motion` (en móvil el vídeo se congela).
