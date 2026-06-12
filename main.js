// ============================================================
//  CarAI — scroll-driven frame animation (Three.js)
//
//  Strategy (the Apple-style technique, taken further):
//   • A video is pre-split into 192 JPEG frames (see /frames).
//   • Scroll position inside the tall .stage maps to a *fractional*
//     frame index. Scrolling DOWN advances, UP rewinds — for free.
//   • HERO-FIRST: no blocking splash. The hero ("El valor de tu
//     garaje…") shows immediately; only frame 0 is awaited (so the
//     stage has a crisp first frame), and the other 191 frames load
//     in the background. Until a frame arrives, we show the nearest
//     already-loaded one, so nothing ever looks broken.
//   • MAX FLUIDITY: the two adjacent frames are blended in the shader
//     by the fractional index (continuous sub-frame motion), with
//     frame-rate-independent damping and a 2-texture swap pool.
//   • MOBILE: 192 frames × ~15 MB decoded ≈ 2.8 GB — Safari kills
//     the tab. On small/touch screens we use the source video instead.
// ============================================================

import * as THREE from "./vendor/three.module.js";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Any touch-primary or narrow screen gets the video path.
const isMobile = window.innerWidth < 900 || navigator.maxTouchPoints > 0;

const els = {
  mount:    document.getElementById("stageCanvas"),
  stage:    document.querySelector(".stage"),
  stageBar: document.getElementById("stageBar"),
  caps:     Array.from(document.querySelectorAll(".cap")),
};

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smoothstep = (e0, e1, x) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};

function scrollProgress() {
  const rect = els.stage.getBoundingClientRect();
  const scrollable = rect.height - window.innerHeight;
  if (scrollable <= 0) return 0;
  return clamp(-rect.top / scrollable, 0, 1);
}

function updateCaptions(p) {
  for (const cap of els.caps) {
    const from = parseFloat(cap.dataset.from);
    const to = parseFloat(cap.dataset.to);
    let o = 0;
    if (p >= from && p <= to) {
      const local = (p - from) / (to - from);
      o = Math.min(smoothstep(0, 0.18, local), 1 - smoothstep(0.82, 1, local));
    }
    cap.style.opacity = o.toFixed(3);
    cap.style.transform = `translateY(${((1 - o) * 26).toFixed(1)}px)`;
  }
}

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    const done = () => resolve(img);
    img.onload = () => (img.decode ? img.decode().catch(() => {}) : Promise.resolve()).then(done);
    img.onerror = done;
    img.src = src;
  });
}

// ------------------------------------------------------------
//  Three.js full-screen quad. Two textures, blended.
// ------------------------------------------------------------
function buildScene(mount, firstImage) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  mount.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.Camera(); // unused — quad lives in clip space

  function makeSlot() {
    const tex = new THREE.Texture();
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
    return { tex, index: -1 };
  }
  const slots = [makeSlot(), makeSlot()];

  const imgW = firstImage.naturalWidth || 2560;
  const imgH = firstImage.naturalHeight || 1440;

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTexA:        { value: slots[0].tex },
      uTexB:        { value: slots[1].tex },
      uMix:         { value: 0 },
      uImageAspect: { value: imgW / imgH },
      uViewAspect:  { value: 1 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      precision highp float;
      uniform sampler2D uTexA;
      uniform sampler2D uTexB;
      uniform float uMix;
      uniform float uImageAspect;
      uniform float uViewAspect;
      varying vec2 vUv;
      void main() {
        vec2 uv = vUv;
        // object-fit: cover (same for both frames — identical aspect)
        if (uViewAspect > uImageAspect) {
          uv.y = (uv.y - 0.5) * (uImageAspect / uViewAspect) + 0.5;
        } else {
          uv.x = (uv.x - 0.5) * (uViewAspect / uImageAspect) + 0.5;
        }
        // continuous sub-frame interpolation between the two adjacent frames
        vec3 col = mix(texture2D(uTexA, uv).rgb, texture2D(uTexB, uv).rgb, uMix);
        // cinematic vignette so frames melt into the gradient
        float vig = smoothstep(1.05, 0.35, length(vUv - 0.5));
        col *= mix(0.78, 1.0, vig);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });

  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));

  let images = null;
  let loaded = null;
  const setImages = (imgs, loadedFlags) => { images = imgs; loaded = loadedFlags; };

  // If frame `idx` hasn't loaded yet, fall back to the nearest one that has.
  function nearestLoaded(idx, count) {
    if (loaded[idx]) return idx;
    for (let d = 1; d < count; d++) {
      if (idx - d >= 0 && loaded[idx - d]) return idx - d;
      if (idx + d < count && loaded[idx + d]) return idx + d;
    }
    return 0;
  }

  // Make `idx` resident in a slot, reusing what's there and uploading only when
  // necessary. `keep` is the other index we must not evict.
  function ensure(idx, keep) {
    let s = slots.find((sl) => sl.index === idx);
    if (s) return s;
    s = slots.find((sl) => sl.index !== idx && sl.index !== keep) || slots[0];
    s.tex.image = images[idx];
    s.tex.needsUpdate = true; // the ONLY GPU upload, ≤1 per boundary crossed
    s.index = idx;
    return s;
  }

  // Point the shader at frames around fractional position `f`.
  function show(f, count) {
    let i0 = clamp(Math.floor(f), 0, count - 1);
    let i1 = Math.min(i0 + 1, count - 1);
    const frac = f - Math.floor(f);
    i0 = nearestLoaded(i0, count);
    i1 = nearestLoaded(i1, count);
    const sA = ensure(i0, i1);
    const sB = ensure(i1, i0);
    material.uniforms.uTexA.value = sA.tex;
    material.uniforms.uTexB.value = sB.tex;
    material.uniforms.uMix.value = i0 === i1 ? 0 : frac;
  }

  function resize() {
    const w = mount.clientWidth || window.innerWidth;
    const h = mount.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    material.uniforms.uViewAspect.value = w / h;
  }

  return { renderer, scene, camera, show, resize, setImages };
}

// ------------------------------------------------------------
//  Drive it all from scroll.
// ------------------------------------------------------------
async function main() {

  // ── Mobile path ──────────────────────────────────────────────
  // Loading 192 decoded JPEG bitmaps (~2.8 GB) crashes Safari on iOS.
  // Instead, play the source video in a loop; captions still follow scroll.
  if (isMobile) {
    const video = document.createElement("video");
    video.src = "transition.mp4";
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    // iOS Safari requires both the property and the attribute for autoplay
    video.setAttribute("autoplay", "");
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.style.cssText = "width:100%;height:100%;object-fit:cover;display:block;";
    els.mount.appendChild(video);

    (function tick() {
      const p = scrollProgress();
      if (els.stageBar) els.stageBar.style.width = (p * 100).toFixed(2) + "%";
      updateCaptions(p);
      requestAnimationFrame(tick);
    })();
    return;
  }

  // ── Desktop path (Three.js scroll-scrub) ─────────────────────
  const manifest = await fetch("frames/manifest.json").then((r) => r.json());
  const { count, basePath, prefix, ext, padding } = manifest;
  const url = (i) => `${basePath}${prefix}${String(i + 1).padStart(padding, "0")}${ext}`;

  const images = new Array(count);
  const loaded = new Uint8Array(count);

  // Load frame 0 first so the stage has a crisp first frame.
  images[0] = await loadImage(url(0));
  loaded[0] = 1;

  const view = buildScene(els.mount, images[0]);
  view.setImages(images, loaded);
  view.resize();
  view.show(0, count);
  view.renderer.render(view.scene, view.camera);

  // Load the rest in background; animation uses nearest loaded frame until each arrives.
  for (let i = 1; i < count; i++) {
    loadImage(url(i)).then((img) => { images[i] = img; loaded[i] = 1; });
  }

  let currentFrame = 0;            // smoothed, fractional
  const TAU = 0.10;                // seconds — damping time constant (lower = snappier)
  let lastT = performance.now();

  function tick(now) {
    const dt = Math.min((now - lastT) / 1000, 0.05); // clamp big gaps (tab switch)
    lastT = now;

    const p = scrollProgress();
    const target = p * (count - 1);

    if (prefersReducedMotion || TAU <= 0) {
      currentFrame = target;
    } else {
      currentFrame += (target - currentFrame) * (1 - Math.exp(-dt / TAU));
      if (Math.abs(target - currentFrame) < 0.004) currentFrame = target; // settle exactly
    }

    view.show(currentFrame, count);

    if (els.stageBar) els.stageBar.style.width = (p * 100).toFixed(2) + "%";
    updateCaptions(p);

    view.renderer.render(view.scene, view.camera);
    requestAnimationFrame(tick);
  }

  window.addEventListener("resize", view.resize, { passive: true });
  requestAnimationFrame(tick);
}

main().catch((err) => {
  console.error("CarAI animation failed to start:", err);
});
