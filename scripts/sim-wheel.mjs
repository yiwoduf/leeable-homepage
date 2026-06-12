/* eslint-disable */
// Simulation harness for the wheel momentum/intent model in useSectionSnap.ts.
// Mirrors the gesture-boundary + pull-gate decision flow exactly and runs it
// against an adversarial event-merging model plus every legit gesture shape.
// Run: node scripts/sim-wheel.mjs   (exits 1 on any failure)

const GESTURE_GAP = 80, COMMIT = 0.26, EDGE_EPS = 4, MIN_INTERNAL = 40;
const RISE_MIN = 3, RISE_PX = 8, VEL_SANE = 12, INTENT_VEL = 0.35;
const BURST_WIN = 90, LIFT_RATIO = 0.85, MIN_BURST = 18, SPAN_CAP = 400, PULL_SLOP = 12;
const TAIL_ENV_TAU = 900, ENV_DENSE_GAP = 48, TAIL_DECAY_MIN = 6;
const restTop = 0, restBot = 600, nextRest = 1500, maxStep = 150;

// opts: { lockUntil, startUsed } — lockUntil simulates a commit glide
// (isScrollLocked); startUsed models arriving right after a commit.
function run(events, startY, opts = {}) {
  const { lockUntil = 0, startUsed = false } = opts;
  let y = startY, lastT = -1e9, lastAbsDy = 0, lastVel = 0, riseStreak = 0, decayStreak = 0;
  const burst = [];
  let burstAccel = false, tailEnv = 0, fingersLifted = false, fingerProven = false;
  let gestureUsed = startUsed, gestureClosed = false;
  let pullAcc = 0, pullDir = 0, pullEngaged = false;
  let indicator = false, committed = false;
  for (const [t, raw] of events) {
    if (!raw) continue;
    const absRaw = Math.abs(raw);
    const gap = t - lastT; lastT = t;
    const vel = absRaw / Math.max(4, gap);
    const sane = vel <= VEL_SANE;
    const rising = sane && absRaw >= RISE_PX && vel > lastVel * 1.15;
    const riseNow = rising ? riseStreak + 1 : 0;
    const mass = absRaw * Math.min(1, BURST_WIN / Math.max(1, Math.min(gap, SPAN_CAP)));
    burst.push([t, mass]);
    let recentMass = 0, priorMass = 0;
    for (let k = burst.length - 1; k >= 0; k -= 1) {
      const age = t - burst[k][0];
      if (age >= BURST_WIN * 2) { burst.splice(0, k + 1); break; }
      if (age < BURST_WIN) recentMass += burst[k][1];
      else priorMass += burst[k][1];
    }
    const envBefore = tailEnv * Math.exp(-Math.min(2000, gap) / TAIL_ENV_TAU);
    const burstVel = absRaw / Math.max(4, Math.min(gap, BURST_WIN));
    const quietBurst = recentMass >= MIN_BURST && priorMass < MIN_BURST && envBefore < INTENT_VEL
      && burstVel >= INTENT_VEL * 0.5;
    const fingerEvidence =
      (sane && riseNow >= RISE_MIN && vel >= INTENT_VEL) || (quietBurst && burstAccel);
    const lifting = priorMass >= MIN_BURST && recentMass < priorMass * LIFT_RATIO;
    const track = () => {
      burstAccel = quietBurst;
      decayStreak = vel < lastVel * 0.98 ? decayStreak + 1 : rising ? 0 : decayStreak;
      if (lifting || decayStreak >= TAIL_DECAY_MIN) fingersLifted = true;
      riseStreak = riseNow;
      tailEnv = sane && gap <= ENV_DENSE_GAP ? Math.max(envBefore, vel) : envBefore;
      lastVel = vel; lastAbsDy = absRaw;
    };
    if (lockUntil && t < lockUntil) {
      if (fingerEvidence) { fingerProven = true; gestureUsed = false; }
      track();
      continue;
    }
    if (gap > GESTURE_GAP || (fingersLifted && fingerEvidence)) {
      gestureUsed = false; gestureClosed = false; fingersLifted = false; fingerProven = false;
      pullAcc = 0; pullEngaged = false;
    } else if (absRaw > lastAbsDy + 16) {
      gestureUsed = false;
    }
    if (fingerEvidence) fingerProven = true;
    track();
    if (gestureUsed) continue;
    const dy = Math.max(-maxStep, Math.min(maxStep, raw));
    if (dy <= 0) continue;
    const eff = y;
    const atEdge = restBot - restTop <= MIN_INTERNAL || eff >= restBot - EDGE_EPS;
    if (gestureClosed || !atEdge) {
      y = Math.min(restBot, Math.max(restTop, eff + dy));
      if (y >= restBot - EDGE_EPS) gestureClosed = true;
      continue;
    }
    let step = dy;
    if (!pullEngaged) {
      if (eff > restBot + 0.5) { pullEngaged = true; }
      else {
        if (!fingerProven) continue;
        if (pullDir !== 1) { pullDir = 1; pullAcc = 0; }
        pullAcc += dy;
        if (pullAcc <= PULL_SLOP) continue;
        pullEngaged = true; step = pullAcc - PULL_SLOP;
      }
    }
    const newY = Math.min(nextRest, Math.max(restBot, eff + step));
    const over = newY - restBot, dist = nextRest - restBot;
    if (dist > 0 && over / dist >= COMMIT) {
      gestureUsed = true; fingerProven = false; fingersLifted = false;
      committed = true; y = nextRest;
    } else if (over > 0) { y = newY; indicator = true; }
    else y = newY;
  }
  return { y, indicator, committed };
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
// Event merging under jank; mode = which creation timestamp the merge keeps.
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

// G: violent/medium swipe -> edge; jank-merged tail. Real browsers stamp
// coalesced events with the LATEST input ('last') — that mode is asserted.
// 'first' is a theoretical worst case (stacked merge inflations can defeat
// ramp detection); reported for awareness, not asserted.
for (const v0 of [8, 4]) for (const tau of [330, 650]) for (const mode of ['last', 'first']) {
  let adv = 0, ind = 0;
  for (let seed = 1; seed <= 500; seed += 1) {
    const s = swipe(0, v0 === 8 ? 60 : 30);
    const tl = coalesce(rawTail(endOf(s) + 8, v0, tau), seed, mode, true);
    const g = run([...s, ...tl], 300);
    if (g.committed) adv += 1;
    if (g.indicator) ind += 1;
  }
  if (mode === 'last') {
    check('G last v0=' + v0 + ' tau=' + tau + ' (adv=' + adv + ' ghost=' + ind + ')', adv === 0 && ind === 0);
  } else {
    console.log('INFO G first (theoretical stamp model) v0=' + v0 + ' tau=' + tau + ': adv=' + adv + ' ghost=' + ind);
  }
}
// S1: THE reported stuck case — previous commit's glide still playing (used=true),
// the next swipe ramps DURING the glide and plateaus after release.
{
  const ramp = [[600, 4], [612, 10], [624, 20], [636, 32], [648, 40], [660, 44], [672, 46], [684, 46], [696, 46]];
  const plateau = Array.from({ length: 20 }, (_, i) => [708 + i * 12, 46]);
  const S1 = run([...ramp, ...plateau], restBot, { lockUntil: 700, startUsed: true });
  check('S1 swipe ramped during glide engages after release', S1.indicator || S1.committed);
}
// S2: discrete swipe shortly after arrival (the up-section bottom-edge case).
{
  const S2 = run(swipe(1000, 30), restBot, { lockUntil: 700, startUsed: true });
  check('S2 swipe after arrival engages', S2.indicator || S2.committed);
}
// S3: the committing flick's own tail keeps streaming through and after the
// glide — must NOT pull at the arrival section (stale-proof check).
{
  const tl = rawTail(20, 6, 330); // tail of the flick that just committed
  const S3 = run(tl, restBot, { lockUntil: 700, startUsed: true });
  check('S3 leftover tail after commit stays inert', S3.y === restBot && !S3.indicator && !S3.committed);
}
// B: gentle re-swipe 30ms after killing a strong tail (ramp path).
{
  const s = swipe(0, 60);
  const tl = rawTail(endOf(s) + 8, 8, 330).filter((e) => e[0] < endOf(s) + 168);
  const t0 = endOf(tl);
  const re = [[t0 + 30, 2], [t0 + 42, 5], [t0 + 54, 9], [t0 + 66, 14], [t0 + 78, 20], [t0 + 90, 26], [t0 + 102, 30]];
  const B = run([...s, ...tl, ...re], 300);
  check('B gentle re-swipe mid-tail engages', B.indicator || B.committed);
}
// C: flick-flick (new flick lands while the tail is alive).
{
  const s = swipe(0, 40);
  const tl = rawTail(endOf(s) + 8, 5, 330).slice(0, 12);
  const tc = endOf(tl);
  const f2 = [[tc + 12, 12], [tc + 20, 24], [tc + 28, 38], [tc + 36, 48], [tc + 44, 52]];
  const C = run([...s, ...tl, ...f2], 300);
  check('C flick-flick engages', C.indicator || C.committed);
}
// R: re-swipe after a true pause.
{
  const s = swipe(0, 60), tl = rawTail(endOf(s) + 8, 8, 330);
  const R = run([...s, ...tl, ...swipe(endOf(tl) + 300, 25)], 300);
  check('R re-swipe after pause engages', R.indicator || R.committed);
}
// D: ONE continuous accelerating swipe must stop at the edge.
{
  const acc = Array.from({ length: 18 }, (_, i) => [i * 8, Math.min(100, 3 + i * 7)]);
  const D = run(acc, 300);
  check('D single-swipe roll-through blocked', D.y === restBot && !D.indicator);
}
// M: mouse — commit from rest; spin stops at a closed edge; re-burst after a pause crosses.
{
  const M1 = run([[0, 120], [55, 120], [110, 120], [165, 120]], restBot);
  check('M1 mouse from rest commits', M1.committed);
  const M2 = run(Array.from({ length: 8 }, (_, i) => [i * 50, 120]), 300);
  check('M2 mouse spin stops at edge', M2.y === restBot && !M2.committed && !M2.indicator);
  const M3 = run([[0, 120], [50, 120], [100, 120], [150, 120], [400, 120], [455, 120], [510, 120]], 300);
  check('M3 mouse re-burst after pause crosses', M3.committed || M3.indicator);
}
// A: sparse dying remnants stay inert.
{
  const s = swipe(0, 40), t1 = rawTail(endOf(s) + 8, 3.5, 330);
  const t0 = endOf(t1);
  const rem = [[t0 + 45, 3], [t0 + 100, 2], [t0 + 160, 2], [t0 + 245, 1]];
  const A = run([...s, ...t1, ...rem], 300);
  check('A sparse remnants inert', A.y === restBot && !A.indicator);
}
// P: ordinary pull from rest at the edge.
{
  const P = run(swipe(0, 40), restBot);
  check('P pull from edge engages', P.indicator || P.committed);
}
// UG: ultra-gentle pull (sub-RISE_PX deltas) from idle.
{
  const ug = Array.from({ length: 40 }, (_, i) => [5000 + i * 14, 3 + Math.min(3, i * 0.2)]);
  const UG = run(ug, restBot);
  check('UG ultra-gentle pull engages', UG.indicator || UG.committed);
}

console.log(fails.length ? 'FAILURES: ' + fails.join(', ') : 'ALL CLEAN');
process.exit(fails.length ? 1 : 0);
