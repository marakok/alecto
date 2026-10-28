/**
 * Phase 3 · the curtain, made instead of filmed (Option 3, home-3-page.js): one sheer in a room, the sun behind it,
 * drawn in a WebGL2 shader over a small cloth simulation. A few deep folds lit for real (light through the fabric,
 * glowing edges, the room's own light from the left), a band of morning light that crosses it slowly, dust in the
 * beam. It breathes on its own, the cursor nudges it, and pressing and holding opens it to let the light in.
 *
 *   mountCurtain(canvas, { target: heroSection, hint: hintElement })
 *
 * Options: wind (breathing, 0..2), response (how hard the cursor pushes, 0..2), light (the window, 0.6..1.4),
 * quality (render scale, 0.4..1). Without WebGL2 the canvas gets .curtain--fallback (a still gradient in home3.css).
 * Reduced motion: no breathing, no moving light, a gentler push; holding still opens it. Pauses off screen and in a
 * hidden tab.
 */
const VERT = `#version 300 es
in vec2 p;
void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uLight;
uniform float uOpen;     // 0 closed .. 1 held open
uniform float uIntro;    // 0 .. 1, the light coming up on load
uniform vec2 uTexel;
uniform sampler2D uField;
out vec4 outColor;

const float PI = 3.14159265;
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }

// A hanging sheer: a few deep folds, slightly wider toward the hem, drifting very slowly. X in folds (1 = one fold).
float folds(float X, float y, float t, float seed){
  float a = X * 2.0 * PI + 0.45 * sin(y * 1.4 + seed + t * 0.05) + seed;
  return 0.78 * sin(a) + 0.26 * sin(a * 2.13 + 1.7 + seed + 0.6 * y) + 0.09 * sin(a * 3.71 + 0.4 * y - t * 0.03);
}

vec3 aces(vec3 x){ return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float yt = 1.0 - uv.y;                       // 0 at the rod, 1 at the hem
  float asp = uRes.x / uRes.y;
  float t = uTime;

  // the window: where the sun sits behind the curtain, and the band of light crossing it (about 26 s each way)
  vec2 sunP = vec2(0.70 + 0.015 * sin(t * 0.07), 0.30);
  vec2 sq = (vec2(uv.x, yt) - sunP) * vec2(asp, 1.0);
  float r2 = dot(sq, sq);
  float core = exp(-r2 * 38.0), halo = exp(-r2 * 3.2), wide = exp(-r2 * 0.7);
  float cx = 0.52 + 0.40 * sin(t * 2.0 * PI / 52.0);
  float band = exp(-pow((uv.x + 0.20 * (yt - 0.5) - cx) / 0.14, 2.0));
  float B = (0.30 + 1.9 * halo + 0.6 * wide + 4.5 * core) * (1.0 + 0.55 * band) * uLight * mix(0.45, 1.0, uIntro);

  // opening: two panels part at the window, more in the middle where a hand would push them
  float gx = 0.70;
  float w = uOpen * 0.30 * (0.7 + 0.5 * sin(yt * PI));
  float eL = gx - w * 0.5, eR = gx + w * 0.5;
  bool left = uv.x < gx;
  float fx = left ? uv.x / max(eL, 1e-3) * gx : gx + (uv.x - eR) / max(1.0 - eR, 1e-3) * (1.0 - gx);
  float edgeD = left ? eL - uv.x : uv.x - eR;  // < 0 inside the gap

  // cloth simulation: lateral displacement, in fabric coordinates
  vec2 fuv = vec2(clamp(fx, 0.0, 1.0), yt);
  float d = texture(uField, fuv).r;

  // the folds and their normal
  float nF = 2.2 + 1.4 * asp;
  float X = fx * nF * (1.0 - 0.10 * yt) + d * 0.09;
  float e = 0.012;
  float h  = folds(X, yt, t, 0.0);
  float hx = (folds(X + e, yt, t, 0.0) - h) / e;
  float hy = (folds(X, yt + 0.02, t, 0.0) - h) / 0.02;
  vec3 n = normalize(vec3(-hx * 0.2, hy * 0.08, 1.0));

  // light: through the sheer (more layers where it is seen at an angle), scattered in it, the room's light from the
  // left, and the fold edges glowing against the window
  float thick = 1.0 / max(n.z, 0.25);
  float T = exp(-0.95 * thick);
  float through = B * T;
  float scatter = B * 0.30 * (1.0 - T);
  float room = 0.20 + 0.30 * max(dot(n, normalize(vec3(-0.55, 0.35, 0.75))), 0.0);
  room *= 1.0 - 0.5 * smoothstep(0.2, 1.0, uv.x);
  float rim = pow(1.0 - n.z, 2.2) * B * 1.6;
  float crest = smoothstep(0.35, 1.0, h) * band * 0.22 * uLight;   // the light catching the tops of the folds
  float ao = mix(0.42, 1.0, smoothstep(-1.1, 0.9, h));             // the valleys, deeper

  vec3 sunC = vec3(1.00, 0.80, 0.56);
  vec3 roomC = vec3(0.92, 0.91, 0.90);
  vec3 cloth = vec3(1.00, 0.93, 0.84);
  vec3 col = cloth * (room * roomC + (through + scatter) * sunC) * ao + (rim + crest) * sunC;

  // where the panels overlap, a soft shadow; once parted, their edges catch the light coming in
  col *= 1.0 - 0.22 * exp(-abs(uv.x - gx) / 0.006) * (1.0 - smoothstep(0.0, 0.2, uOpen)) * (left ? 1.0 : 0.0);
  col += sunC * B * 0.9 * exp(-max(edgeD, 0.0) / 0.018) * smoothstep(0.0, 0.25, uOpen);

  // the gap: the day outside, overexposed and warm
  vec3 outside = sunC * (1.25 + 2.2 * halo + 3.0 * core) * uLight * mix(0.45, 1.0, uIntro) + vec3(0.18, 0.2, 0.22) * (1.0 - yt);
  float inGap = smoothstep(0.004, -0.004, edgeD);
  col = mix(col, outside, inGap);

  // the near curtain, out of focus, along the left edge: a soft, darker fold the words sit in front of
  float Xf = uv.x * asp * 1.4 + d * 0.04;
  float ff = folds(Xf, yt * 0.5, t * 0.6, 3.1);
  float edge = uv.x + 0.03 * sin(yt * 2.1 + t * 0.09) + 0.02 * ff;
  float m = smoothstep(0.30, 0.06, edge);
  vec3 front = cloth * (0.30 + 0.16 * (0.5 + 0.5 * ff) + 0.25 * halo) * roomC;
  col = mix(col, front, m * 0.85);

  // dust in the beam: three depths, drifting up and sideways, seen only where the light is
  float beam = clamp(0.25 * halo + 0.9 * band * (0.3 + halo) + 0.8 * uOpen * exp(-pow((uv.x - gx) / 0.16, 2.0)), 0.0, 1.4);
  vec2 dp = vec2(uv.x * asp, yt);
  float dust = 0.0;
  for (int i = 0; i < 3; i++) {
    float k = float(i);
    float s = 7.0 + k * 6.0;
    vec2 q = dp * s + vec2(0.35 * sin(t * 0.05 + k), t * (0.025 + 0.012 * k));
    vec2 c = floor(q);
    float r = hash(c + k * 19.7);
    vec2 o = vec2(hash(c + 3.1), hash(c + 7.7)) - 0.5;
    o = o * 0.6 + 0.12 * vec2(sin(t * 0.21 + r * 6.3), cos(t * 0.17 + r * 4.1));
    float sz = mix(0.10, 0.045, k * 0.5);
    float mote = smoothstep(sz, sz * 0.35, length(fract(q) - 0.5 - o)) * step(0.78, r);
    dust += mote * (0.35 + 0.65 * hash(c + 1.3)) * mix(0.55, 1.0, k * 0.5);
  }
  col += sunC * dust * beam * 0.7;

  // exposure, filmic, a soft vignette, grain
  col *= 1.3;
  col = aces(col);
  col *= 1.0 - 0.14 * pow(length((uv - vec2(0.62, 0.5)) * vec2(1.0, 1.25)), 2.0);
  col = pow(col, vec3(0.92));
  col += (hash(gl_FragCoord.xy + fract(t * 7.0) * 113.0) - 0.5) * 0.018;

  outColor = vec4(col, 1.0);
}`;

// Cloth grid. Row 0 hangs from the rod and is pinned.
const GW = 96, GH = 60;

export function mountCurtain(canvas, opts = {}) {
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const o = Object.assign({ wind: reduced ? 0 : 1, response: reduced ? 0.4 : 1, light: 1, quality: 1 }, opts);
  const target = o.target || canvas.parentElement;

  const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, depth: false, powerPreference: 'low-power' });
  if (!gl) {
    canvas.classList.add('curtain--fallback');
    o.hint?.setAttribute('hidden', '');
    return { set() {}, destroy() {}, supported: false };
  }

  const compile = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  };
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const U = {};
  for (const n of ['uRes', 'uTime', 'uLight', 'uOpen', 'uIntro', 'uTexel', 'uField']) U[n] = gl.getUniformLocation(prog, n);

  const u = new Float32Array(GW * GH);
  const v = new Float32Array(GW * GH);
  const vp = new Float32Array(GW * GH);
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16F, GW, GH, 0, gl.RED, gl.FLOAT, u);
  gl.uniform1i(U.uField, 0);
  gl.uniform2f(U.uTexel, 1 / GW, 1 / GH);

  // ---- pointer -> forces, softened: the cloth follows a lagging hand, and the push is let out over a few frames
  const hand = { x: 0, y: 0, tx: 0, ty: 0, push: 0, on: false };
  let last = null;
  const onMove = (e) => {
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    if (x < 0 || x > 1 || y < 0 || y > 1) { last = null; return; }
    if (last) hand.push += (x - last.x) * GW + (y - last.y) * GH * 0.15;
    if (!hand.on) { hand.x = x; hand.y = y; hand.on = true; }
    hand.tx = x; hand.ty = y;
    last = { x, y };
  };
  const onLeave = () => { last = null; };
  target.addEventListener('pointermove', onMove, { passive: true });
  target.addEventListener('pointerleave', onLeave);

  // ---- press and hold: the curtain parts to let the light in (not on the words, links or buttons)
  let held = false, open = 0, opened = false;
  const onDown = (e) => {
    if (e.button !== 0 || e.target.closest('a, button, input, .hero-copy')) return;
    held = true;
    if (!opened) { opened = true; o.hint?.classList.add('is-used'); }
  };
  const onUp = () => { held = false; };
  const noMenu = (e) => e.preventDefault();
  target.addEventListener('pointerdown', onDown);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);
  canvas.addEventListener('contextmenu', noMenu);

  // ---- simulation step (fixed 60 Hz)
  const K = 0.12, CX = 1.0, CY = 0.6, VISC = 0.18, SPRING = 0.005, DAMP = 0.982, R = 10;
  let simT = 0;
  function step() {
    simT += 1 / 60;
    // the cursor pushes the cloth sideways, more freely lower down
    if (hand.on) {
      hand.x += (hand.tx - hand.x) * 0.08; hand.y += (hand.ty - hand.y) * 0.08;
      const out = hand.push * 0.12;
      hand.push -= out;
      const push = Math.max(-1.2, Math.min(1.2, out)) * 0.16 * o.response;
      if (Math.abs(push) > 1e-4) {
        const cx = hand.x * GW, cy = hand.y * GH;
        const x0 = Math.max(0, Math.floor(cx - R * 2)), x1 = Math.min(GW - 1, Math.ceil(cx + R * 2));
        const y0 = Math.max(1, Math.floor(cy - R * 2)), y1 = Math.min(GH - 1, Math.ceil(cy + R * 2));
        for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
          const dx = x - cx, dy = (y - cy) * 0.7;
          const g = Math.exp(-(dx * dx + dy * dy) / (R * R));
          v[y * GW + x] += push * g * (0.25 + 0.75 * y / GH);
        }
      }
    }
    // breathing: one slow, broad swell about every ten seconds
    if (o.wind > 0) {
      const breath = Math.sin(simT * 0.62) * (0.7 + 0.3 * Math.sin(simT * 0.11));
      for (let x = 0; x < GW; x++) {
        const w = (Math.sin(x * 0.07 + simT * 0.21) * 0.6 + 0.4) * breath * 0.0011 * o.wind;
        for (let y = 1; y < GH; y++) v[y * GW + x] += w * (y / GH);
      }
    }
    // damped wave equation with viscosity, anisotropic (fabric carries motion sideways more than down)
    vp.set(v);
    for (let y = 1; y < GH; y++) {
      const ym = y - 1, yp = y < GH - 1 ? y + 1 : y;
      for (let x = 0; x < GW; x++) {
        const i = y * GW + x;
        const xm = x > 0 ? i - 1 : i, xp = x < GW - 1 ? i + 1 : i;
        const c = u[i];
        const lap = (u[xm] + u[xp] - 2 * c) * CX + (u[ym * GW + x] + u[yp * GW + x] - 2 * c) * CY;
        const vc = vp[i];
        const lapV = vp[xm] + vp[xp] + vp[ym * GW + x] + vp[yp * GW + x] - 4 * vc;
        v[i] = (vc + lap * K + lapV * VISC - c * SPRING) * DAMP;
      }
    }
    for (let i = GW; i < u.length; i++) u[i] = Math.max(-3, Math.min(3, u[i] + v[i]));
    // opening eases in over about a second and a half, and falls back a little slower
    const goal = held ? 1 : 0;
    open += (goal - open) * (goal > open ? 0.03 : 0.018);
  }

  // ---- render loop
  let w = 0, h = 0;
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const nw = Math.max(1, Math.round(canvas.clientWidth * dpr * o.quality));
    const nh = Math.max(1, Math.round(canvas.clientHeight * dpr * o.quality));
    if (nw !== w || nh !== h) { w = canvas.width = nw; h = canvas.height = nh; gl.viewport(0, 0, w, h); }
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  let raf = 0, visible = true, acc = 0, prev = performance.now(), t0 = prev;
  function frame(now) {
    raf = 0;
    acc += Math.min(0.1, (now - prev) / 1000);
    prev = now;
    let n = 0;
    while (acc >= 1 / 60 && n < 3) { step(); acc -= 1 / 60; n++; }
    if (n === 3) acc = 0;
    const s = (now - t0) / 1000;
    const intro = reduced ? 1 : 1 - Math.pow(1 - Math.min(1, s / 2.6), 3);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, GW, GH, gl.RED, gl.FLOAT, u);
    gl.uniform2f(U.uRes, w, h);
    gl.uniform1f(U.uTime, reduced ? 0 : s);
    gl.uniform1f(U.uLight, o.light);
    gl.uniform1f(U.uOpen, open * open * (3 - 2 * open));
    gl.uniform1f(U.uIntro, intro);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    schedule();
  }
  function schedule() {
    if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);
  }
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; schedule(); });
  io.observe(canvas);
  const onVis = () => schedule();
  document.addEventListener('visibilitychange', onVis);
  schedule();

  return {
    supported: true,
    set(key, value) { o[key] = value; if (key === 'quality') resize(); },
    destroy() {
      cancelAnimationFrame(raf); raf = 0;
      ro.disconnect(); io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      target.removeEventListener('pointermove', onMove);
      target.removeEventListener('pointerleave', onLeave);
      target.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      canvas.removeEventListener('contextmenu', noMenu);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}
