// driftEngine.ts — real pixel-based drift recovery for DRIFT-SENSE.
// Methods:
//   NCC           → zero-mean normalized cross-correlation on intensity
//   Feature-Based → ZNCC on Sobel gradient magnitude (illumination/contrast robust)
//   Hybrid AI     → coarse-to-fine pyramid: ZNCC at 1/2 res, then ±3px refine at full res
// Every result also gets a sub-pixel parabolic peak fit and a peak-to-sidelobe ratio (PSR).
//
// With one uploaded image there is no second frame, so the engine injects a KNOWN
// sub-pixel drift (+ sensor noise) into a copy and recovers it. `groundTruth` and
// `errorNm` report how accurate the recovery really was.

export type Method = "NCC" | "Feature-Based" | "Hybrid AI";
export interface EngineParams { patchSize: number; searchRadius: number; threshold: number; method: Method; }
export interface EngineResult {
  confidence: number; driftX: number; driftY: number;
  correctionX: number; correctionY: number; processingTime: number;
  bbox: { x: number; y: number; w: number; h: number };
  success: boolean; imgComplexity: number; featureDensity: number; noiseLevel: number;
  peak: number; psr: number; errorNm: number; groundTruth: { x: number; y: number };
  surface: { w: number; h: number; data: Float32Array };
}

const FOV_NM = 10_000; // 10 µm field of view (matches the spec sheet in the UI)
const round = (v: number, d = 1) => Math.round(v * 10 ** d) / 10 ** d;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

// ── cooperative yielding so the UI animation never freezes ─────────────────────
let lastYield = 0;
async function maybeYield() {
  const now = performance.now();
  if (now - lastYield > 10) { await new Promise(r => setTimeout(r, 0)); lastYield = performance.now(); }
}

// ── image loading ──────────────────────────────────────────────────────────────
interface Gray { g: Float32Array; w: number; h: number; }

async function loadGray(file: File, maxDim = 512): Promise<Gray> {
  const bmp = await createImageBitmap(file);
  const s = Math.min(1, maxDim / Math.max(bmp.width, bmp.height));
  const w = Math.max(32, Math.round(bmp.width * s)), h = Math.max(32, Math.round(bmp.height * s));
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(bmp, 0, 0, w, h); bmp.close?.();
  const d = ctx.getImageData(0, 0, w, h).data;
  const g = new Float32Array(w * h);
  for (let i = 0; i < g.length; i++) g[i] = (0.299 * d[4 * i] + 0.587 * d[4 * i + 1] + 0.114 * d[4 * i + 2]) / 255;
  return { g, w, h };
}

function downsample2({ g, w, h }: Gray): Gray {
  const nw = w >> 1, nh = h >> 1, o = new Float32Array(nw * nh);
  for (let y = 0; y < nh; y++) for (let x = 0; x < nw; x++) {
    const i = 2 * y * w + 2 * x;
    o[y * nw + x] = (g[i] + g[i + 1] + g[i + w] + g[i + w + 1]) / 4;
  }
  return { g: o, w: nw, h: nh };
}

function sobel({ g, w, h }: Gray): Gray {
  const o = new Float32Array(w * h);
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = y * w + x;
    const gx = g[i - w + 1] + 2 * g[i + 1] + g[i + w + 1] - g[i - w - 1] - 2 * g[i - 1] - g[i + w - 1];
    const gy = g[i + w - 1] + 2 * g[i + w] + g[i + w + 1] - g[i - w - 1] - 2 * g[i - w] - g[i - w + 1];
    o[i] = Math.hypot(gx, gy);
  }
  return { g: o, w, h };
}

// ── synthetic acquisition: sub-pixel shift (bilinear) + gaussian noise ──────────
function gauss(): number {
  let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
function acquire({ g, w, h }: Gray, dx: number, dy: number, sigma: number): Gray {
  const o = new Float32Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const sx = clamp(x - dx, 0, w - 1.001), sy = clamp(y - dy, 0, h - 1.001);
    const x0 = sx | 0, y0 = sy | 0, fx = sx - x0, fy = sy - y0, i = y0 * w + x0;
    o[y * w + x] = (g[i] * (1 - fx) + g[i + 1] * fx) * (1 - fy) + (g[i + w] * (1 - fx) + g[i + w + 1] * fx) * fy + gauss() * sigma;
  }
  return { g: o, w, h };
}

// ── integral images → O(1) window mean/variance ────────────────────────────────
interface Integral { S: Float64Array; Q: Float64Array; w: number; }
function integral({ g, w, h }: Gray): Integral {
  const W = w + 1, S = new Float64Array(W * (h + 1)), Q = new Float64Array(W * (h + 1));
  for (let y = 1; y <= h; y++) {
    let rs = 0, rq = 0;
    for (let x = 1; x <= w; x++) {
      const v = g[(y - 1) * w + x - 1]; rs += v; rq += v * v;
      S[y * W + x] = S[(y - 1) * W + x] + rs; Q[y * W + x] = Q[(y - 1) * W + x] + rq;
    }
  }
  return { S, Q, w: W };
}
function winStat(I: Integral, x: number, y: number, p: number) {
  const W = I.w, a = y * W + x, b = y * W + x + p, c = (y + p) * W + x, d = (y + p) * W + x + p, n = p * p;
  const s = I.S[d] - I.S[b] - I.S[c] + I.S[a], q = I.Q[d] - I.Q[b] - I.Q[c] + I.Q[a];
  const mean = s / n; return { mean, varSum: Math.max(0, q - n * mean * mean) };
}

// ── template choice: most textured patch whose search window fits in-frame ─────
function pickTemplate(img: Gray, p: number, margin: number) {
  const I = integral(img); let best = { x: 0, y: 0, v: -1 };
  const lo = margin, hx = img.w - p - margin, hy = img.h - p - margin, step = Math.max(2, p >> 2);
  for (let y = lo; y <= hy; y += step) for (let x = lo; x <= hx; x += step) {
    const { varSum } = winStat(I, x, y, p); if (varSum > best.v) best = { x, y, v: varSum };
  }
  return best;
}

// ── ZNCC search ────────────────────────────────────────────────────────────────
interface SearchOut { peak: number; px: number; py: number; sub: [number, number]; psr: number; surface: Float32Array; side: number; }

async function zncc(src: Gray, frame: Gray, tx: number, ty: number, p: number, cu: number, cv: number, r: number): Promise<SearchOut> {
  const n = p * p, tpl = new Float32Array(n); let tm = 0;
  for (let y = 0; y < p; y++) for (let x = 0; x < p; x++) { const v = src.g[(ty + y) * src.w + tx + x]; tpl[y * p + x] = v; tm += v; }
  tm /= n; let tvar = 0; for (let i = 0; i < n; i++) { tpl[i] -= tm; tvar += tpl[i] * tpl[i]; }
  const tstd = Math.sqrt(tvar) || 1e-9;
  const F = integral(frame), side = 2 * r + 1, surf = new Float32Array(side * side).fill(-1);
  let peak = -2, bx = 0, by = 0;
  for (let v = -r; v <= r; v++) {
    for (let u = -r; u <= r; u++) {
      const x0 = tx + cu + u, y0 = ty + cv + v;
      if (x0 < 0 || y0 < 0 || x0 + p > frame.w || y0 + p > frame.h) continue;
      const { mean, varSum } = winStat(F, x0, y0, p), fstd = Math.sqrt(varSum);
      if (fstd < 1e-6) continue;
      let dot = 0;
      for (let y = 0; y < p; y++) { const fo = (y0 + y) * frame.w + x0, to = y * p; for (let x = 0; x < p; x++) dot += tpl[to + x] * (frame.g[fo + x] - mean); }
      const c = dot / (tstd * fstd); surf[(v + r) * side + (u + r)] = c;
      if (c > peak) { peak = c; bx = u; by = v; }
    }
    await maybeYield();
  }
  // sub-pixel parabolic refinement
  const at = (u: number, v: number) => (u < -r || u > r || v < -r || v > r) ? NaN : surf[(v + r) * side + (u + r)];
  const par = (l: number, c: number, rr: number) => { const d = l - 2 * c + rr; return Number.isFinite(d) && Math.abs(d) > 1e-9 ? clamp(0.5 * (l - rr) / d, -0.5, 0.5) : 0; };
  const sx = par(at(bx - 1, by), peak, at(bx + 1, by)), sy = par(at(bx, by - 1), peak, at(bx, by + 1));
  // peak-to-sidelobe ratio (exclude 5×5 around the peak)
  let m = 0, m2 = 0, cnt = 0;
  for (let v = -r; v <= r; v++) for (let u = -r; u <= r; u++) {
    if (Math.abs(u - bx) <= 2 && Math.abs(v - by) <= 2) continue;
    const c = surf[(v + r) * side + (u + r)]; if (c <= -1) continue; m += c; m2 += c * c; cnt++;
  }
  const mean = cnt ? m / cnt : 0, sd = cnt ? Math.sqrt(Math.max(1e-12, m2 / cnt - mean * mean)) : 1;
  return { peak, px: cu + bx, py: cv + by, sub: [sx, sy], psr: (peak - mean) / sd, surface: surf, side };
}

// ── image statistics (replace the fake filename-derived "fingerprint") ──────────
function stats(img: Gray) {
  const e = sobel(img), n = e.g.length; let sum = 0; for (let i = 0; i < n; i++) sum += e.g[i];
  const mean = sum / n, thr = mean * 1.5; let strong = 0; for (let i = 0; i < n; i++) if (e.g[i] > thr) strong++;
  let lap = 0, c = 0;
  for (let y = 1; y < img.h - 1; y += 2) for (let x = 1; x < img.w - 1; x += 2) {
    const i = y * img.w + x; lap += Math.abs(4 * img.g[i] - img.g[i - 1] - img.g[i + 1] - img.g[i - img.w] - img.g[i + img.w]); c++;
  }
  return {
    complexity: clamp(mean * 2.2, 0, 1),
    featureDensity: clamp((strong / n) * 4, 0, 1),
    noise: clamp((lap / c) * 3, 0, 1),
  };
}

// ── public API ─────────────────────────────────────────────────────────────────
export async function analyze(file: File, params: EngineParams): Promise<EngineResult> {
  const t0 = performance.now(); lastYield = t0;
  const base = await loadGray(file);
  const nmPerPx = FOV_NM / base.w;
  const p = clamp(Math.round((params.patchSize * base.w) / 1024) * 2 + 16, 16, Math.min(base.w, base.h) >> 2);
  const r = clamp(Math.round(params.searchRadius / nmPerPx), 4, 24);
  const st = stats(base);

  const { x: tx, y: ty } = pickTemplate(base, p, r + 4);
  const trueX = (Math.random() * 2 - 1) * r * 0.6, trueY = (Math.random() * 2 - 1) * r * 0.6;
  const sigma = 0.012 + st.noise * 0.03;
  const frame = acquire(base, trueX, trueY, sigma);

  let out: SearchOut;
  if (params.method === "NCC") {
    out = await zncc(base, frame, tx, ty, p, 0, 0, r);
  } else if (params.method === "Feature-Based") {
    out = await zncc(sobel(base), sobel(frame), tx, ty, p, 0, 0, r);
  } else {
    const cb = downsample2(base), cf = downsample2(frame);
    const cp = Math.max(8, p >> 1), ctx_ = tx >> 1, cty = ty >> 1;
    const coarse = await zncc(cb, cf, Math.min(ctx_, cb.w - cp), Math.min(cty, cb.h - cp), cp, 0, 0, Math.max(2, r >> 1));
    const fine = await zncc(base, frame, tx, ty, p, coarse.px * 2, coarse.py * 2, 3);
    out = { ...fine, psr: Math.max(fine.psr, coarse.psr * 0.9) };
  }

  const dxPx = out.px + out.sub[0], dyPx = out.py + out.sub[1];
  const driftX = round(dxPx * nmPerPx), driftY = round(dyPx * nmPerPx);
  const errorNm = round(Math.hypot((dxPx - trueX) * nmPerPx, (dyPx - trueY) * nmPerPx), 2);
  const conf = clamp(100 * (0.7 * Math.max(0, out.peak) + 0.3 * Math.min(1, out.psr / 12)), 0, 99.6);

  return {
    confidence: round(conf), driftX, driftY,
    correctionX: round(-driftX), correctionY: round(-driftY),
    processingTime: round((performance.now() - t0) / 1000, 2),
    bbox: { x: (tx + dxPx) / base.w, y: (ty + dyPx) / base.h, w: p / base.w, h: p / base.h },
    success: out.peak >= params.threshold && out.psr > 4,
    imgComplexity: round(st.complexity, 2), featureDensity: round(st.featureDensity, 2), noiseLevel: round(st.noise, 2),
    peak: round(out.peak, 3), psr: round(out.psr, 1), errorNm,
    groundTruth: { x: round(trueX * nmPerPx), y: round(trueY * nmPerPx) },
    surface: { w: out.side, h: out.side, data: out.surface },
  };
}
