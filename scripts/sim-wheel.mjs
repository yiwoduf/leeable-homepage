/* eslint-disable */
// Simulation harness for the wheel pager in useSectionSnap.ts.
// Mirrors the ecd1d3d baseline gesture flow plus the Lethargy-method trackpad
// patch (intent classifier + closed re-arm + pull-start gate), and runs it
// against momentum-tail adversaries and every legit gesture shape.
//   node scripts/sim-wheel.mjs        (exits 1 on any failure)
// `patch: false` runs the bare baseline — used to PROVE the sim reproduces
// the real trackpad bugs (stuck at edge, section skip) before asserting the
// patch removes them without touching mouse behavior.

const GESTURE_GAP = 80, COMMIT = 0.26, EDGE_EPS = 4, MIN_INTERNAL = 40;
const INTENT_WIN = 100, INTENT_KEEP = 0.92, INTENT_FLOOR = 12;
const INTENT_RETAIN = 600, TAIL_DECAY_MIN = 6, TRUE_GAP = 240;
const RISE_MIN = 3, RISE_PX = 8, VEL_SANE = 12;
const GLIDE_MS = 600; // commit glide duration modeled after smoothScrollTo
const maxStep = 150;

// Geometry: section A is tall (internal scroll 0..600); its next rest is 1500.
// `fit: true` models a section that fits the viewport (restTop == restBot) —
// the arrival-section case where atEdge is trivially true.
function makeRun({ patch, fit = false }) {
  const restTop = fit ? 600 : 0, restBot = 600, nextRest = 1500;
  return function run(events, startY, opts = {}) {
    const { lockUntil = 0, startUsed = false, startClosedAt = -1e9 } = opts;
    let y = startY, lastT = -1e9, lastStampT = -1e9, lastAbsDy = 0;
    let gestureUsed = startUsed, gestureClosed = false, tailSeen = false;
    const histDn = [];
    let lastIntentDn = true, streamSparse = true, lastVel = 0, decayStreak = 0;
    let indicator = false, commits = 0, pullStarts = 0;
    const overlap = (a0, a1, b0, b1) => Math.max(0, Math.min(a1, b1) - Math.max(a0, b0));
    const classify = (d, t, stampGap) => {
      histDn.push([t, d, Math.max(1, Math.min(stampGap, INTENT_WIN * 2)), stampGap >= 40]);
      while (histDn.length && histDn[0][0] <= t - INTENT_RETAIN) histDn.shift();
      streamSparse = histDn.every((h) => h[3]);
      if (streamSparse) return true;
      let newMass = 0, oldMass = 0, older = false;
      for (const [te, de, se] of histDn) {
        const s0 = te - se;
        newMass += (de * overlap(s0, te, t - INTENT_WIN, t)) / se;
        oldMass += (de * overlap(s0, te, t - INTENT_WIN * 2, t - INTENT_WIN)) / se;
        if (te <= t - INTENT_WIN * 2) older = true;
      }
      if (newMass < INTENT_FLOOR) return false;
      if (oldMass > 0) return newMass >= oldMass * INTENT_KEEP;
      return !older;
    };
    let riseStreak = 0, closedAt = startClosedAt, glideUntil = lockUntil;
    for (const [t, raw] of events) {
      const absRaw = Math.abs(raw);
      const gap = t - lastT; lastT = t;
      const stampGap = t - lastStampT; lastStampT = t;
      const intent = raw ? classify(absRaw, t, stampGap) : false;
      const wasIntent = lastIntentDn;
      if (raw) {
        lastIntentDn = intent;
        const vel = absRaw / Math.max(4, Math.min(stampGap, INTENT_WIN * 2));
        decayStreak = vel < lastVel * 0.98 ? decayStreak + 1 : vel > lastVel * 1.15 ? 0 : decayStreak;
        riseStreak = vel <= VEL_SANE && absRaw >= RISE_PX && vel > lastVel * 1.15 ? riseStreak + 1 : 0;
        lastVel = vel;
        if (patch && gestureClosed && (!intent || decayStreak >= TAIL_DECAY_MIN)) tailSeen = true;
      }
      if (t < glideUntil) { lastAbsDy = absRaw; continue; } // isScrollLocked()
      if (gap > GESTURE_GAP) {
        gestureUsed = false;
        if (!patch || gap > TRUE_GAP || tailSeen || streamSparse || !gestureClosed) {
          gestureClosed = false; tailSeen = false;
        }
      } else if (absRaw > lastAbsDy + 16 || (patch && !streamSparse && intent && wasIntent)) {
        gestureUsed = false;
      }
      if (patch && raw && gestureClosed && tailSeen && intent) {
        gestureClosed = false; tailSeen = false;
      }
      lastAbsDy = absRaw;
      if (gestureUsed || !raw) continue;
      const dy = Math.max(-maxStep, Math.min(maxStep, raw));
      if (dy <= 0) continue;
      const eff = y;
      const atEdge = restBot - restTop <= MIN_INTERNAL || eff >= restBot - EDGE_EPS;
      if (gestureClosed || !atEdge) {
        y = Math.min(restBot, Math.max(restTop, eff + dy));
        if (y >= restBot - EDGE_EPS) {
          if (!gestureClosed) closedAt = t;
          gestureClosed = true;
        }
        continue;
      }
      if (
        patch &&
        eff <= restBot + 0.5 &&
        !streamSparse &&
        riseStreak < RISE_MIN &&
        !(intent && wasIntent && t - closedAt >= TRUE_GAP)
      )
        continue;
      if (eff <= restBot + 0.5) pullStarts += 1;
      const newY = Math.min(nextRest, Math.max(restBot, eff + dy));
      const over = newY - restBot, dist = nextRest - restBot;
      if (dist > 0 && over / dist >= COMMIT) {
        gestureUsed = true; closedAt = t; commits += 1;
        y = restBot; // re-arm geometry: model arrival at a fresh section's edge
        glideUntil = t + GLIDE_MS; // the snap glide locks input (isScrollLocked)
      } else if (over > 0) { y = newY; indicator = true; }
      else y = newY;
    }
    return { y, indicator, commits, pullStarts };
  };
}

function rawTail(t0, v0, tau) {
  const a = []; let t = t0;
  for (;;) {
    const v = v0 * Math.exp(-(t - t0) / tau); const d = v * 8;
    if (d < 0.4) break;
    a.push([t, d]); t += 8;
  }
  return a;
}
// Event merging under jank; mode = which creation timestamp survives a merge.
function coalesce(ev, seed, mode, heavy) {
  const out = []; let i = 0, s = seed;
  while (i < ev.length) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    let n = 1; const r = (s >> 16) % 100;
    if (heavy && r < 12) n = 7 + ((s >> 8) % 6);
    else if (r < 40) n = 2 + ((s >> 8) % 2);
    let d = 0, tf = ev[i][0], tl = tf;
    for (let k = 0; k < n && i < ev.length; k += 1, i += 1) { d += ev[i][1]; tl = ev[i][0]; }
    out.push([mode === 'first' ? tf : tl, d]);
  }
  return out;
}
const swipe = (t0, peak) => {
  const a = []; let t = t0;
  for (const f of [0.12, 0.35, 0.65, 0.9, 1, 0.97]) { a.push([t, peak * f]); t += 8; }
  return a;
};
const endOf = (ev) => ev[ev.length - 1][0];

const fails = [];
const check = (name, ok) => {
  console.log((ok ? 'PASS ' : 'FAIL ') + name);
  if (!ok) fails.push(name);
};
const runP = makeRun({ patch: true });
const runP_fit = makeRun({ patch: true, fit: true });
const runB = makeRun({ patch: false });
const runB_fit = makeRun({ patch: false, fit: true });

// ---------- 0. Prove the sim reproduces the BASELINE trackpad bugs ----------
{
  // STUCK: swipe -> edge -> live tail -> re-flick during the tail.
  const s = swipe(0, 50), tl = rawTail(endOf(s) + 8, 6, 330);
  const cut = tl.filter((e) => e[0] < endOf(s) + 360); // re-touch kills tail at ~350ms
  const re = swipe(endOf(cut) + 40, 50); // re-swipe 40ms later (gap < GESTURE_GAP)
  const tail2 = rawTail(endOf(re) + 8, 6, 330);
  const b = runB([...s, ...cut, ...re, ...tail2], 300);
  check('0a baseline reproduces STUCK (re-flick during tail cannot pull)', b.pullStarts === 0);
  // SKIP: commit -> glide -> tail outlives glide, delta spike resets `used`,
  // arrival section fits the viewport so atEdge is trivially true.
  const flick = swipe(0, 80);
  const tail = coalesce(rawTail(endOf(flick) + 8, 8, 420), 7, 'last', true);
  const skip = runB_fit([...flick, ...tail], 600, { lockUntil: 320 });
  check('0b baseline reproduces SKIP (tail commits again after the glide)', skip.commits >= 2);
}

// ---------- 1. Patch fixes the two reported trackpad bugs -------------------
{
  const s = swipe(0, 50), tl = rawTail(endOf(s) + 8, 6, 330);
  const cut = tl.filter((e) => e[0] < endOf(s) + 360);
  const re = swipe(endOf(cut) + 40, 50);
  const tail2 = rawTail(endOf(re) + 8, 6, 330);
  const p = runP([...s, ...cut, ...re, ...tail2], 300);
  check('1a STUCK fixed: re-flick during tail pulls', p.pullStarts >= 1);
  const flick = swipe(0, 80);
  const tail = coalesce(rawTail(endOf(flick) + 8, 8, 420), 7, 'last', true);
  const skip = runP_fit([...flick, ...tail], 600, { lockUntil: 320 });
  check('1b SKIP fixed: tail cannot commit again after the glide', skip.commits <= 1);
}

// ---------- 2. Adversarial: jank-merged tails can never open a pull ---------
// Real browsers/OSes stamp merged wheel events with the LATEST input — that
// mode is asserted. Earliest-stamping is a theoretical worst case (stacked
// merge inflation can fake a 3-rise ramp) — reported, not asserted.
for (const v0 of [8, 4]) for (const tau of [330, 650]) for (const mode of ['last', 'first']) {
  let starts = 0, comms = 0;
  for (let seed = 1; seed <= 500; seed += 1) {
    const s = swipe(0, v0 === 8 ? 60 : 30);
    const tl = coalesce(rawTail(endOf(s) + 8, v0, tau), seed, mode, true);
    // tall section: swipe closes at the edge, tail must die there
    const g = runP([...s, ...tl], 300);
    starts += g.pullStarts; comms += g.commits;
    // post-commit arrival at a fitting section: the committing gesture's tail
    // streams through and past the snap glide (commit at t≈0 → closedAt set,
    // glide ≈ GLIDE_MS) and must not pull at the trivially-at-edge arrival.
    const g2 = runP_fit([...s, ...tl], 600, { lockUntil: GLIDE_MS, startUsed: true, startClosedAt: 0 });
    starts += g2.pullStarts; comms += g2.commits;
  }
  if (mode === 'last') {
    check('2 tail inert last v0=' + v0 + ' tau=' + tau + ' (starts=' + starts + ' commits=' + comms + ')', starts === 0 && comms === 0);
  } else {
    console.log('INFO 2 earliest-stamp (theoretical) v0=' + v0 + ' tau=' + tau + ': starts=' + starts + ' commits=' + comms);
  }
}

// ---------- 3. Mouse: baseline parity (patch must change nothing) -----------
{
  const cases = [
    ['M notch pull+commit from edge', [[0, 120], [55, 120], [110, 120]], 600, {}],
    ['M fast spin from mid-section', Array.from({ length: 8 }, (_, i) => [i * 50, 120]), 300, {}],
    ['M slow notches at closed edge', [[0, 120], [50, 120], [100, 120], [150, 120], [400, 120], [455, 120], [510, 120]], 300, {}],
    ['M single notch after long idle', [[0, 120], [5000, 120], [5055, 120], [5110, 120]], 600, {}],
    // Found by adversarial review: a SUSTAINED notch train outlasting the
    // commit glide must still advance exactly one section per burst — the
    // deliberate-pair `gestureUsed` release must never fire for sparse trains.
    ['M sustained spin outlasting the glide', Array.from({ length: 32 }, (_, i) => [i * 50, 120]), 600, {}],
  ];
  for (const [name, ev, y0, opts] of cases) {
    const a = runB(ev, y0, opts), b = runP(ev, y0, opts);
    const same = a.y === b.y && a.indicator === b.indicator && a.commits === b.commits && a.pullStarts === b.pullStarts;
    check('3 ' + name + ' — patched ≡ baseline', same);
  }
}

// ---------- 4. Legit trackpad gestures all still work -----------------------
{
  // P: ordinary flick from rest at the edge.
  const P = runP(swipe(0, 40), 600);
  check('4a flick from edge pulls', P.indicator || P.commits > 0);
  // R: re-swipe after a true pause.
  const s = swipe(0, 60), tl = rawTail(endOf(s) + 8, 8, 330);
  const R = runP([...s, ...tl, ...swipe(endOf(tl) + 300, 30), ...rawTail(endOf(tl) + 348, 4, 330)], 300);
  check('4b re-swipe after pause pulls', R.pullStarts >= 1);
  // C: flick-flick — second flick lands while the first tail is alive.
  const s2 = swipe(0, 40), t2 = rawTail(endOf(s2) + 8, 5, 330).slice(0, 14);
  const tc = endOf(t2);
  const f2 = [[tc + 12, 12], [tc + 20, 24], [tc + 28, 38], [tc + 36, 48], [tc + 44, 52], [tc + 52, 50], [tc + 60, 46]];
  const C = runP([...s2, ...t2, ...f2], 300);
  check('4c flick-flick pulls', C.pullStarts >= 1);
  // S: swipe arriving during a commit glide, plateauing after release.
  const ramp = [[600, 4], [612, 10], [624, 20], [636, 32], [648, 40], [660, 44]];
  const plateau = Array.from({ length: 20 }, (_, i) => [672 + i * 12, 44]);
  const S = runP([...ramp, ...plateau], 600, { lockUntil: 700, startUsed: true });
  check('4d swipe through glide engages after release', S.indicator || S.commits > 0);
  // G: gentle pull from rest (small deltas).
  const gentle = Array.from({ length: 30 }, (_, i) => [3000 + i * 14, Math.min(7, 2 + i)]);
  const G = runP(gentle, 600);
  check('4e gentle pull from rest engages', G.indicator || G.commits > 0);
  // D: ONE continuous accelerating swipe from mid-section stays at the edge.
  const acc = Array.from({ length: 18 }, (_, i) => [i * 8, Math.min(100, 3 + i * 7)]);
  const D = runP(acc, 300);
  check('4f single accelerating swipe stays at edge', D.y === 600 && D.pullStarts === 0);
  // A: swipe from MID-SECTION closes at the edge; sparse dying remnants after
  // the tail must stay inert (no pull ever opens).
  const s3 = swipe(0, 40), t3 = rawTail(endOf(s3) + 8, 3.5, 330);
  const t0 = endOf(t3);
  const rem = [[t0 + 45, 3], [t0 + 100, 2], [t0 + 160, 2], [t0 + 245, 1]];
  const A = runP([...s3, ...t3, ...rem], 300);
  check('4g sparse remnants inert', A.pullStarts === 0 && !A.indicator);
}

// ---------- 5. Mixed device: trackpad then mouse within INTENT_RETAIN -------
// Found by adversarial review: dense tail history makes the first PIXEL-mode
// mouse notch read non-sparse, and the tail's last classification kills the
// deliberate pair — the first notch is swallowed. Bounded cost (documented):
// the second notch must always pull.
{
  const s = swipe(0, 50), tl = rawTail(endOf(s) + 8, 5, 330);
  const notches = [[endOf(tl) + 300, 120], [endOf(tl) + 355, 120], [endOf(tl) + 410, 120]];
  const X = runP([...s, ...tl, ...notches], 300);
  check('5 mouse right after trackpad pulls by the 2nd notch', X.pullStarts >= 1);
}

console.log(fails.length ? 'FAILURES: ' + fails.join(' | ') : 'ALL CLEAN');
process.exit(fails.length ? 1 : 0);
