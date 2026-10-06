// ============================================================
//  CarAI — site script (no dependencies)
//
//  1. Nav morph (N10): bar → floating pill past 80 px.
//  2. Journey: highlights the step whose screen is in view.
//  3. Cinematic stage — the scroll-scrubbed car sequence:
//     • Nothing loads until the visitor scrolls and the stage is
//       within ~¾ of a viewport.
//     • Desktop: 192 WebP frames drawn with a tiny raw-WebGL quad
//       (replaces Three.js). Two adjacent frames are blended by the
//       fractional index; same cover-fit + vignette + triangular
//       dither shader as before, so no banding in the dark gradient.
//       Frames load coarse → fine (every 16th, 8th … 1st) so the whole
//       range is scrubbable early; until a frame arrives the nearest
//       loaded one is shown. The 1600 px set is used unless the canvas
//       really needs 2560 px.
//     • The render loop only runs while the stage is on screen and the
//       tab is visible, and only draws when the frame changes.
//     • Mobile/touch: boomerang video, src attached lazily, paused
//       off-screen (192 decoded bitmaps would crash iOS Safari).
//     • prefers-reduced-motion: poster frame only, captions still fade.
// ============================================================

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smoothstep = (e0, e1, x) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};

// ── 1. Nav morph ─────────────────────────────────────────────
(() => {
  const nav = document.querySelector("[data-nav]");
  if (!nav) return;
  const THRESHOLD = 80;
  let floating = false;
  let ticking = false;
  const update = () => {
    const next = window.scrollY > THRESHOLD;
    if (next !== floating) {
      floating = next;
      nav.classList.toggle("is-floating", floating);
    }
  };
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { update(); ticking = false; });
  }, { passive: true });
  update();
})();

// Remember an explicit choice of Spanish so the auto-redirect doesn't bounce the user.
document.querySelectorAll('[data-lang-switch="es"]').forEach((a) =>
  a.addEventListener("click", () => {
    try { sessionStorage.setItem("carai-force-es", "1"); } catch (_) { /* private mode */ }
  })
);

// ── 2. Journey step highlight ────────────────────────────────
(() => {
  const journey = document.querySelector(".journey");
  if (!journey || !("IntersectionObserver" in window)) return;
  const steps = Array.from(journey.querySelectorAll(".step"));
  journey.classList.add("is-enhanced");
  steps[0]?.classList.add("is-active");
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      steps.forEach((s) => s.classList.toggle("is-active", s === e.target));
    }
  }, { rootMargin: "-45% 0px -45% 0px" });
  steps.forEach((s) => io.observe(s));
})();

// ── 3. Cinematic stage ───────────────────────────────────────
const stage = document.querySelector("[data-stage]");
if (stage) initStage(stage);

function initStage(stage) {
  const mount = stage.querySelector("[data-stage-mount]");
  const bar = stage.querySelector("[data-stage-bar]");
  const caps = Array.from(stage.querySelectorAll(".cap"));
  const isTouch = window.innerWidth < 900 || navigator.maxTouchPoints > 0;

  let near = false;     // within ~1 viewport → keep captions + media alive
  let onScreen = false; // actually intersecting → render / play
  let renderer = null;  // { start(), stop() }

  const progress = () => {
    const r = stage.getBoundingClientRect();
    const scrollable = r.height - window.innerHeight;
    return scrollable > 0 ? clamp(-r.top / scrollable, 0, 1) : 0;
  };

  function updateOverlay(p) {
    if (bar) bar.style.transform = `scaleX(${p.toFixed(4)})`;
    for (const cap of caps) {
      const from = +cap.dataset.from;
      const to = +cap.dataset.to;
      let o = 0;
      if (p >= from && p <= to) {
        const local = (p - from) / (to - from);
        o = Math.min(smoothstep(0, 0.18, local), 1 - smoothstep(0.82, 1, local));
      }
      cap.style.opacity = o.toFixed(3);
      if (!reduceMotion) cap.style.transform = `translateY(${((1 - o) * 24).toFixed(1)}px)`;
    }
  }

  // Media only starts after the visitor actually scrolls *and* the stage is near:
  // a first screen that never scrolls costs zero animation bytes.
  let scrolled = window.scrollY > 0;
  function maybeCreate() {
    if (!near || !scrolled || renderer || reduceMotion) return;
    renderer = isTouch ? videoRenderer() : (webglRenderer() || null);
    sync();
  }

  let overlayTicking = false;
  window.addEventListener("scroll", () => {
    if (!scrolled) { scrolled = true; maybeCreate(); }
    if (!near || overlayTicking) return;
    overlayTicking = true;
    requestAnimationFrame(() => { updateOverlay(progress()); overlayTicking = false; });
  }, { passive: true });
  updateOverlay(progress());

  const lazyIO = new IntersectionObserver(([e]) => {
    near = e.isIntersecting;
    maybeCreate();
    if (near) updateOverlay(progress());
  }, { rootMargin: "75% 0px 75% 0px" });
  lazyIO.observe(stage);

  const visIO = new IntersectionObserver(([e]) => {
    onScreen = e.isIntersecting;
    sync();
  });
  visIO.observe(stage);
  document.addEventListener("visibilitychange", sync);

  function sync() {
    if (!renderer) return;
    if (onScreen && !document.hidden) renderer.start();
    else renderer.stop();
  }

  // ── Mobile: boomerang video ──
  function videoRenderer() {
    const video = document.createElement("video");
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "auto";
    video.disablePictureInPicture = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.setAttribute("aria-hidden", "true");
    video.poster = "assets/stage-poster.webp";
    video.src = "transition-loop.mp4";
    video.addEventListener("playing", () => stage.classList.add("is-live"), { once: true });
    mount.appendChild(video);
    return {
      start() { video.play().catch(() => {}); },
      stop() { video.pause(); },
    };
  }

  // ── Desktop: raw WebGL frame scrub ──
  function webglRenderer() {
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    const gl = canvas.getContext("webgl", { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: "high-performance" });
    if (!gl) return null; // poster stays
    mount.appendChild(canvas);

    const VS = `
      attribute vec2 aPos;
      varying vec2 vUv;
      void main() { vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;
    const FS = `
      precision highp float;
      uniform sampler2D uTexA;
      uniform sampler2D uTexB;
      uniform float uMix;
      uniform float uImageAspect;
      uniform float uViewAspect;
      varying vec2 vUv;
      // Screen-space hash → triangular-PDF dither (±1 LSB). Keyed to the pixel,
      // so it stays still while frames morph — dissolves banding in the darks.
      float hash12(vec2 p) {
        vec3 p3 = fract(vec3(p.xyx) * 0.1031);
        p3 += dot(p3, p3.yzx + 33.33);
        return fract((p3.x + p3.y) * p3.z);
      }
      void main() {
        vec2 uv = vUv;
        if (uViewAspect > uImageAspect) uv.y = (uv.y - 0.5) * (uImageAspect / uViewAspect) + 0.5;
        else                            uv.x = (uv.x - 0.5) * (uViewAspect / uImageAspect) + 0.5;
        vec3 col = mix(texture2D(uTexA, uv).rgb, texture2D(uTexB, uv).rgb, uMix);
        float vig = smoothstep(1.05, 0.35, length(vUv - 0.5));
        col *= mix(0.78, 1.0, vig);
        float d = hash12(gl_FragCoord.xy) + hash12(gl_FragCoord.xy + 41.7) - 1.0;
        gl_FragColor = vec4(col + d / 255.0, 1.0);
      }`;
    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.remove(); return null; }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const U = (n) => gl.getUniformLocation(prog, n);
    const uMix = U("uMix"), uImageAspect = U("uImageAspect"), uViewAspect = U("uViewAspect");
    gl.uniform1i(U("uTexA"), 0);
    gl.uniform1i(U("uTexB"), 1);
    gl.uniform1f(uImageAspect, 16 / 9);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    const slots = [0, 1].map(() => {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return { tex, index: -1 };
    });

    let count = 192;
    let images = [];
    let loaded = new Uint8Array(0);
    let anyLoaded = false;
    let dirty = true;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(mount.clientWidth * dpr);
      const h = Math.round(mount.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
        gl.uniform1f(uViewAspect, w / h);
        dirty = true;
      }
    }
    resize();
    window.addEventListener("resize", resize, { passive: true });

    const nearestLoaded = (idx) => {
      if (loaded[idx]) return idx;
      for (let d = 1; d < count; d++) {
        if (idx - d >= 0 && loaded[idx - d]) return idx - d;
        if (idx + d < count && loaded[idx + d]) return idx + d;
      }
      return -1;
    };
    // Make frame `idx` resident in a texture slot; upload only on change.
    function ensure(idx, keep) {
      let s = slots.find((sl) => sl.index === idx);
      if (s) return s;
      s = slots.find((sl) => sl.index !== keep) || slots[0];
      gl.bindTexture(gl.TEXTURE_2D, s.tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, images[idx]);
      s.index = idx;
      return s;
    }
    function draw(f) {
      let i0 = clamp(Math.floor(f), 0, count - 1);
      let i1 = Math.min(i0 + 1, count - 1);
      const frac = f - Math.floor(f);
      i0 = nearestLoaded(i0);
      i1 = nearestLoaded(i1);
      if (i0 < 0) return;
      const a = ensure(i0, i1);
      const b = ensure(i1, i0);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, a.tex);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, b.tex);
      gl.uniform1f(uMix, i0 === i1 ? 0 : frac);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    // Coarse-to-fine load order, 6 in flight.
    async function loadFrames() {
      const manifest = await fetch("frames/manifest.json").then((r) => r.json());
      count = manifest.count;
      gl.uniform1f(uImageAspect, manifest.aspect || 16 / 9);
      const needsFull = mount.clientWidth * Math.min(window.devicePixelRatio || 1, 2) > 1700;
      const base = needsFull ? manifest.basePath : `${manifest.basePath}1600/`;
      const url = (i) => `${base}${manifest.prefix}${String(i + 1).padStart(manifest.padding, "0")}${manifest.ext}`;
      images = new Array(count);
      loaded = new Uint8Array(count);

      const order = [];
      const seen = new Uint8Array(count);
      for (const step of [16, 8, 4, 2, 1]) {
        for (let i = 0; i < count; i += step) if (!seen[i]) { seen[i] = 1; order.push(i); }
      }
      if (!seen[count - 1]) order.push(count - 1);

      let cursor = 0;
      const worker = async () => {
        while (cursor < order.length) {
          const i = order[cursor++];
          const img = new Image();
          img.decoding = "async";
          img.src = url(i);
          try { await img.decode(); } catch (_) { continue; }
          images[i] = img;
          loaded[i] = 1;
          dirty = true;
          if (!anyLoaded) { anyLoaded = true; stage.classList.add("is-live"); }
        }
      };
      await Promise.all(Array.from({ length: 6 }, worker));
    }
    loadFrames().catch((err) => console.warn("CarAI stage: frames unavailable", err));

    canvas.addEventListener("webglcontextlost", (e) => {
      e.preventDefault();
      stop();
      stage.classList.remove("is-live");
    });

    let raf = 0;
    let current = -1;
    let shown = -1;
    let lastT = 0;
    const TAU = 0.10; // s — damping time constant (lower = snappier)

    function tick(now) {
      raf = requestAnimationFrame(tick);
      const dt = lastT ? Math.min((now - lastT) / 1000, 0.05) : 0;
      lastT = now;
      const target = progress() * (count - 1);
      if (current < 0) current = target;
      current += (target - current) * (1 - Math.exp(-dt / TAU));
      if (Math.abs(target - current) < 0.004) current = target;
      if (anyLoaded && (dirty || Math.abs(current - shown) > 0.001)) {
        draw(current);
        shown = current;
        dirty = false;
      }
    }
    function start() { if (!raf) { lastT = 0; raf = requestAnimationFrame(tick); } }
    function stop() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }
    return { start, stop };
  }
}
