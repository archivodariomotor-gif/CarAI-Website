# CarAI — landing web

Landing page para **CarAI**, la app para coleccionistas de coches (portfolio,
watchlist con alertas, inteligencia de mercado y dossiers en PDF). El centro de
la página es una **animación controlada por scroll** hecha con Three.js: el
vídeo `transition.mp4` avanza al bajar y retrocede al subir.

## Stack

HTML + CSS + JavaScript (vanilla) con **Three.js alojado en local**
(`vendor/three.module.js`, sin CDN). Sin build, sin dependencias que instalar —
funciona abriendo un servidor estático.
> Sugeriste Next.js + Tailwind + Framer Motion: se puede portar, pero la
> animación de scroll ya queda fluida y lista en vanilla. Dímelo si la quieres
> en Next.js.

## Cómo funciona la animación

`transition.mp4` se pre-divide en 192 fotogramas JPEG (carpeta `frames/`) — la
técnica estilo Apple, mucho más fluida de "scrubbear" en ambos sentidos que un
`<video>`. La posición de scroll dentro de la sección `.stage` se mapea a un
índice de fotograma fraccionario.

**Pantalla de carga (robusta, nunca se atasca):** el loader muestra una barra de
progreso real (0→100% según se cargan los fotogramas) y revela la web al terminar.
Protecciones para que **nunca** se quede colgada (p. ej. en 0%):
- `loadImage()` resuelve incluso si un fotograma falla → el contador siempre avanza.
- Timeout de 8 s en `main.js`: revela aunque la conexión sea lenta; el resto de
  fotogramas siguen cargando de fondo (se muestra el más cercano ya cargado).
- `main().catch` revela ante cualquier error.
- Failsafe inline de 12 s en `index.html`: oculta el loader aunque el módulo
  (Three.js / main.js) no llegara a cargar.

> Nota: si el loader y `main.js` se desincronizan (loader en el HTML pero main.js
> sin controlarlo, o al revés) la pantalla se queda en 0%. Mantén ambos a la vez.

**Fluidez máxima:** en lugar de mostrar un fotograma "redondeado", el shader
**mezcla (cross-fade) los dos fotogramas adyacentes** según la parte
fraccionaria → movimiento continuo, sub-fotograma, sin saltos. Además el
suavizado es **independiente de la tasa de refresco** (igual de fino a 60 o
120 Hz) y un pool de 2 texturas con swap sube como mucho 1 textura por
fotograma cruzado. Ajusta la respuesta con `TAU` en `main.js` (menor = más
directo).

## Estructura

| Archivo | Qué es |
|---|---|
| `index.html` | Estructura: hero, animación, funciones, precios, testimonios, CTA |
| `style.css` | Estilos, tema oscuro, fondo degradado, responsive |
| `main.js` | Three.js: quad a pantalla completa con shader cover-fit + viñeta, movido por scroll |
| `frames/` | 192 fotogramas (2560×1440, alta resolución) + `manifest.json` (~23 MB) |
| `assets/appstore-badge.png`, `assets/googleplay-badge.png` | Badges oficiales de las tiendas (ya recortados, fondo transparente) |
| `assets/logo.png` | **Logo de la app** (icono). Sustitúyelo aquí si cambia. |
| `terminos.html` | Términos y Condiciones (plantilla, con índice) |
| `privacidad.html` | Política de Privacidad / RGPD (plantilla, con índice) |
| `transition.mp4` | Vídeo original |

## Ejecutar

Usa `fetch()` y módulos ES, así que necesita servirse por HTTP (no vale abrir el
`file://` directamente):

```bash
cd "assets for website"
python3 -m http.server 8765
# abre http://127.0.0.1:8765
```

## Qué tienes que rellenar (placeholders)

- **Enlaces de descarga** → los badges ya son los oficiales (imágenes en
  `assets/`); solo falta poner la URL real: busca `[enlace]` en `index.html`
  (en el hero y en el CTA). El icono de la app se muestra en el hero desde
  `assets/logo.png`.
- **Páginas legales** (`terminos.html`, `privacidad.html`) → son **plantillas**.
  Sustituye todos los campos `[entre corchetes]` (razón social, NIF/CIF, domicilio,
  emails, DPO, proveedores…) y **haz que un abogado las revise** antes de publicar.
  Ajusta especialmente la sección de **CarAI Vision** al tratamiento real de las
  imágenes y, si añades analítica/publicidad, incorpora un banner de cookies.
- **Capturas de la app** → sección "Pensada para el móvil": cada placeholder es
  un `<figure class="phone phone--ph">`. Sustituye el texto interior por
  `<img src="assets/tu-captura.png" alt="…">` y quita la clase `phone--ph`.
  Las dos capturas reales (`iphone.jpg`, `iphone with graph and car.jpg`) ya se
  usan en la sección "Funciones".
- **Testimonios** → busca `[Sustituir por testimonio real…]` y `[Nombre]`.
- **Logo** → ya está en `assets/logo.png` (convertido desde tu `CarAI logo-2.jpg`).

## Precios (ya cargados)

- Mensual **11,99 €/mes** · Anual **69,99 €/año** (toggle; el anual marca
  "−51% · Mejor valor").
- Founders (pago único) **179 €**.
- Tabla comparativa Gratis vs Premium incluida.

## Regenerar los fotogramas

Si cambias `transition.mp4`, re-extrae y actualiza `count` en
`frames/manifest.json`:

```bash
rm -rf frames && mkdir frames
ffmpeg -i transition.mp4 -vf "scale=1600:-2" -q:v 4 frames/frame_%04d.jpg
```

Velocidad del scrub: regla `.stage { height: 520vh }` en `style.css` (más alto =
más lento). Suavidad: variable `smoothing` en `main.js`.

## Accesibilidad

Tema oscuro nativo, contraste cuidado, `alt` en imágenes, `aria-label` en
iconos/botones, navegación por teclado con `:focus-visible` y enlace "saltar al
contenido", y respeto a `prefers-reduced-motion`.
