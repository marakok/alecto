/**
 * Phase 3 · the curtain, made instead of filmed (Option 3, home-3-page.js): a sheer with the sun behind it, drawn in a
 * WebGL2 shader over a small cloth simulation, so the cursor pushes the fabric and it sways back. Replaces the
 * watermarked iStock clip in Option 3's header.
 *
 *   mountCurtain(canvas, { target: heroSection })
 *
 * Options: wind (idle sway, 0..2), response (how hard the cursor pushes, 0..2), light (the window, 0.6..1.4),
 * quality (render scale, 0.4..1; it is soft anyway). Without WebGL2 the canvas gets .curtain--fallback (a still
 * gradient in home3.css). Reduced motion: no breeze, a gentler push. Pauses off screen and in a hidden tab.
 */
const VERT = `#version 300 es
in vec2 p;
void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uLight;
uniform vec2 uTexel;
uniform sampler2D uField;
out vec4 outColor;

float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }

// Fold profile of a hanging sheer. Returns (height, d height / dX).
vec2 folds(float X, float y, float t, float seed){
  float w  = 0.9 * sin(y * 1.7 + X * 0.16 + seed + t * 0.07) + 0.4 * sin(y * 3.9 - X * 0.23 + seed * 2.0);
  float dw = 0.144 * cos(y * 1.7 + X * 0.16 + seed + t * 0.07) - 0.092 * cos(y * 3.9 - X * 0.23 + seed * 2.0);
  vec4 F = vec4(1.0, 1.73, 2.91, 5.2);
  vec4 A = vec4(1.0, 0.55, 0.26, 0.10);
  float h = 0.0, s = 0.0;
  for (int i = 0; i < 4; i++) {
    float k = float(i + 1);
    float ph = F[i] * X + seed * k * 1.7 + w * k * 0.8 + t * 0.025 * k;
    h += A[i] * sin(ph);
    s += A[i] * cos(ph) * (F[i] + dw * k * 0.8);
  }
  return vec2(h, s) / 1.91;
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float yt = 1.0 - uv.y;                       // 0 at the rod, 1 at the hem
  float asp = uRes.x / uRes.y;
  vec2 fuv = vec2(uv.x, yt);
  float t = uTime;

  // cloth simulation: lateral displacement and its gradient
  float d  = texture(uField, fuv).r;
  float ex = texture(uField, fuv + vec2(uTexel.x, 0.0)).r - texture(uField, fuv - vec2(uTexel.x, 0.0)).r;

  // light from the window behind the curtain
  vec2 q = vec2(uv.x * asp, yt) - vec2(0.64 * asp, 0.30);
  q *= vec2(0.95, 0.8);
  float glow = exp(-dot(q, q) * 1.5);
  float gap  = exp(-pow((uv.x - 0.66) / 0.10, 2.0)) * (0.55 + 0.45 * (1.0 - yt));
  float L = (0.50 + 0.85 * glow + 0.45 * gap) * uLight;

  // back curtain: fine folds, in focus-ish
  float X = uv.x * asp * 26.0 + d * 0.38;
  X *= 1.0 - 0.05 * yt;                        // folds widen slightly toward the hem
  vec2 f = folds(X, yt, t, 0.0);
  float slope = f.y * 1.35;
  float thick = sqrt(1.0 + slope * slope);     // seen at an angle = more layers of thread
  float T = exp(-0.75 * thick);                // transmission of a sheer
  float grazing = pow(abs(slope) / (1.0 + abs(slope)), 3.0);
  float leak = clamp(abs(ex) * 0.5, 0.0, 0.2) * (0.4 + glow);   // pushed fabric lets light through
  float lum = L * (0.26 + 1.05 * T) + grazing * L * 0.55 + 0.10 * f.x * L + leak;

  vec3 shadowC = vec3(0.47, 0.40, 0.34);
  vec3 midC    = vec3(0.85, 0.75, 0.62);
  vec3 hiC     = vec3(1.00, 0.965, 0.90);
  vec3 col = mix(shadowC, midC, smoothstep(0.0, 0.72, lum));
  col = mix(col, hiC, smoothstep(0.62, 1.30, lum));

  // front curtain, closer and out of focus, along the left edge
  float Xf = uv.x * asp * 9.0 + d * 0.3;
  vec2 ff = folds(Xf, yt * 0.5, t * 0.7, 3.1);
  float edge = uv.x + 0.035 * sin(yt * 2.3 + t * 0.12) + 0.02 * ff.x + d * 0.003;
  float m = smoothstep(0.34, 0.08, edge);
  float fl = 0.5 + 0.5 * ff.x;
  vec3 front = mix(vec3(0.52, 0.47, 0.42), vec3(0.78, 0.71, 0.62), fl) * (0.82 + 0.25 * L);
  col = mix(col, front, m * 0.9);

  // haze, vignette, grain
  col = mix(col, hiC, 0.10 * glow);
  col *= 1.0 - 0.16 * pow(length((uv - vec2(0.6, 0.5)) * vec2(1.0, 1.2)), 2.0);
  col += (hash(gl_FragCoord.xy + fract(t * 7.0) * 113.0) - 0.5) * 0.022;

  outColor = vec4(col, 1.0);
}`;

// Cloth grid. Row 0 hangs from the rod and is pinned.
const GW = 96, GH = 60;

export function mountCurtain(canvas, opts = {}) {
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const o = Object.assign({ wind: reduced ? 0 : 1, response: reduced ? 0.4 : 1, light: 1, quality: 0.6 }, opts);
  const target = o.target || canvas.parentElement;

  const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, depth: false, powerPreference: 'low-power' });
  if (!gl) {
    canvas.classList.add('curtain--fallback');
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
  for (const n of ['uRes', 'uTime', 'uLight', 'uTexel', 'uField']) U[n] = gl.getUniformLocation(prog, n);

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

  // ---- pointer -> forces
  const pending = [];
  let last = null;
  const onMove = (e) => {
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    if (x < 0 || x > 1 || y < 0 || y > 1) { last = null; return; }
    if (last) pending.push({ x, y, dx: (x - last.x) * GW, dy: (y - last.y) * GH });
    last = { x, y };
  };
  const onLeave = () => { last = null; };
  target.addEventListener('pointermove', onMove, { passive: true });
  target.addEventListener('pointerleave', onLeave);

  // ---- simulation step (fixed 60 Hz)
  const K = 0.12, CX = 1.0, CY = 0.6, VISC = 0.18, SPRING = 0.004, DAMP = 0.985, R = 8.5;
  let simT = 0;
  function step() {
    simT += 1 / 60;
    // cursor pushes the cloth sideways, more freely lower down
    for (const p of pending.splice(0)) {
      const cx = p.x * GW, cy = p.y * GH;
      const push = Math.max(-4, Math.min(4, p.dx + p.dy * 0.15)) * 0.14 * o.response;
      const x0 = Math.max(0, Math.floor(cx - R * 2)), x1 = Math.min(GW - 1, Math.ceil(cx + R * 2));
      const y0 = Math.max(1, Math.floor(cy - R * 2)), y1 = Math.min(GH - 1, Math.ceil(cy + R * 2));
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
        const dx = x - cx, dy = (y - cy) * 0.7;
        const g = Math.exp(-(dx * dx + dy * dy) / (R * R));
        v[y * GW + x] += push * g * (0.25 + 0.75 * y / GH);
      }
    }
    // idle breeze: broad, slow gusts
    if (o.wind > 0) {
      const gust = 0.55 + 0.45 * Math.sin(simT * 0.13);
      for (let x = 0; x < GW; x++) {
        const w = (Math.sin(x * 0.11 + simT * 0.37) + 0.6 * Math.sin(x * 0.23 - simT * 0.61 + 1.3)) * gust * 0.0017 * o.wind;
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
  }

  // ---- render loop
  let w = 0, h = 0;
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
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
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, GW, GH, gl.RED, gl.FLOAT, u);
    gl.uniform2f(U.uRes, w, h);
    gl.uniform1f(U.uTime, reduced ? 0 : (now - t0) / 1000);
    gl.uniform1f(U.uLight, o.light);
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
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}
