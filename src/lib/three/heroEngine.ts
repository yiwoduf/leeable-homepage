import * as THREE from 'three';
import type { Hero3DVariant } from '../../types/design';

export interface HeroOptions {
  accent?: string;
  variant?: Hero3DVariant;
  /** Motion factor, 0–1. */
  motion?: number;
  dark?: boolean;
}

/** Imperative handle returned by {@link makeHero}. */
export interface HeroController {
  setAccent(hex: string): void;
  setVariant(variant: Hero3DVariant): void;
  setMotion(motion: number): void;
  setDark(dark: boolean): void;
  destroy(): void;
}

/** Any scene object we may need to dispose (Mesh/Points/LineSegments all qualify). */
type DisposableObject = THREE.Object3D & {
  geometry?: THREE.BufferGeometry;
  material?: THREE.Material | THREE.Material[];
};

interface GridPos {
  x: number;
  y: number;
  z: number;
}
type Axis = 'x' | 'y' | 'z';

interface RubikNode {
  mesh: THREE.Mesh;
  grid: GridPos;
  lp: THREE.Vector3;
}
interface RubikMove {
  axis: Axis;
  dir: number;
  pivot: THREE.Group;
  members: RubikNode[];
  t: number;
  dur: number;
}

interface EdgeMaterial {
  m: THREE.LineBasicMaterial;
  base: number;
}
interface PuzzlePiece {
  pg: THREE.Group;
  aPos: THREE.Vector3;
  ePos: THREE.Vector3;
  eRot: { x: number; y: number; z: number };
  delay: number;
  fill: THREE.MeshBasicMaterial;
  edgeMats: EdgeMaterial[];
}
interface PieceEdges {
  top: number;
  right: number;
  bottom: number;
  left: number;
}
interface Pt {
  x: number;
  y: number;
}

/**
 * Hero 3D object engine (vanilla Three.js). Builds one of several variants,
 * animates it, and reacts to pointer parallax + drag-to-rotate. Returns a
 * controller for live restyling and teardown.
 */
export function makeHero(container: HTMLElement, opts: HeroOptions = {}): HeroController {
  let accent = opts.accent ?? '#FF5A1F';
  let variant: Hero3DVariant = opts.variant ?? 'network';
  let motion = opts.motion ?? 0.4;
  let dark = opts.dark !== false;

  const W = () => container.clientWidth || 480;
  const H = () => container.clientHeight || 480;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, W() / H(), 0.1, 100);
  camera.position.set(0, 0, 4.4);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(W(), H());
  container.appendChild(renderer.domElement);

  const key = new THREE.PointLight(0xffffff, 1.1);
  key.position.set(3, 4, 5);
  scene.add(key);
  const fill = new THREE.PointLight(0xffffff, 0.5);
  fill.position.set(-4, -2, 2);
  scene.add(fill);
  scene.add(new THREE.AmbientLight(0xffffff, dark ? 0.5 : 0.85));

  let group = new THREE.Group();
  scene.add(group);

  // ---- Rubik's cube state ----
  let rubik: THREE.Group | null = null;
  let nodes: RubikNode[] = [];
  let rubikAnim: RubikMove | null = null;
  let rubikTimer = 0;
  let rubikAdj: Array<[number, number]> = [];
  let rubikLines: THREE.LineSegments<THREE.BufferGeometry, THREE.LineBasicMaterial> | null = null;
  let rubikLineGeo: THREE.BufferGeometry | null = null;
  let rubikLineAttr: THREE.BufferAttribute | null = null;
  let rubikLinePos: Float32Array | null = null;
  const _rv = new THREE.Vector3();

  // ---- puzzle state ----
  let puzzle: THREE.Group | null = null;
  let puzzlePieces: PuzzlePiece[] = [];
  let puzzleT = 0;

  const neutral = () => (dark ? 0xdedede : 0x2a2a2a);

  function clearGroup() {
    scene.remove(group);
    group.traverse((obj) => {
      const o = obj as DisposableObject;
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose());
        else o.material.dispose();
      }
    });
    group = new THREE.Group();
    scene.add(group);
  }

  function build() {
    clearGroup();
    rubik = null;
    nodes = [];
    rubikAnim = null;
    puzzle = null;
    puzzlePieces = [];
    const ac = new THREE.Color(accent);
    if (variant === 'network') {
      const geo = new THREE.IcosahedronGeometry(1.5, 1);
      const edges = new THREE.EdgesGeometry(geo);
      const lines = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({ color: ac, transparent: true, opacity: 0.55 }),
      );
      group.add(lines);
      const pts = new THREE.Points(
        geo,
        new THREE.PointsMaterial({ color: neutral(), size: 0.07, sizeAttenuation: true }),
      );
      group.add(pts);
      const nodePoints = new THREE.Points(
        geo,
        new THREE.PointsMaterial({ color: ac, size: 0.13, sizeAttenuation: true, transparent: true, opacity: 0.9 }),
      );
      group.add(nodePoints);
      const core = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.42, 0),
        new THREE.MeshStandardMaterial({ color: ac, emissive: ac, emissiveIntensity: 0.5, metalness: 0.3, roughness: 0.4 }),
      );
      group.add(core);
    } else if (variant === 'crystal') {
      const outer = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.6, 0)),
        new THREE.LineBasicMaterial({ color: ac, transparent: true, opacity: 0.85 }),
      );
      group.add(outer);
      const inner = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.0, 0),
        new THREE.MeshStandardMaterial({
          color: neutral(),
          metalness: 0.6,
          roughness: 0.25,
          flatShading: true,
          transparent: true,
          opacity: 0.92,
        }),
      );
      group.add(inner);
      const glow = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.5, 0),
        new THREE.MeshStandardMaterial({ color: ac, emissive: ac, emissiveIntensity: 0.7, roughness: 0.5 }),
      );
      group.add(glow);
    } else if (variant === 'rubik') {
      buildRubik(ac);
    } else if (variant === 'puzzle') {
      buildPuzzle(ac);
    } else {
      // core
      const center = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.6, 1),
        new THREE.MeshStandardMaterial({
          color: ac,
          emissive: ac,
          emissiveIntensity: 0.55,
          metalness: 0.4,
          roughness: 0.35,
          flatShading: true,
        }),
      );
      group.add(center);
      const ringDefs = [
        { r: 1.15, t: 0.022, x: Math.PI / 2.1, y: 0, c: ac, o: 0.9 },
        { r: 1.45, t: 0.016, x: Math.PI / 3, y: Math.PI / 4, c: neutral(), o: 0.5 },
        { r: 1.75, t: 0.012, x: Math.PI / 2.6, y: -Math.PI / 5, c: ac, o: 0.6 },
      ];
      ringDefs.forEach((d, i) => {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(d.r, d.t, 12, 120),
          new THREE.MeshStandardMaterial({
            color: d.c,
            emissive: d.c,
            emissiveIntensity: 0.3,
            transparent: true,
            opacity: d.o,
            roughness: 0.4,
          }),
        );
        ring.rotation.x = d.x;
        ring.rotation.y = d.y;
        ring.userData.spin = (i % 2 === 0 ? 1 : -1) * (0.4 + i * 0.12);
        group.add(ring);
      });
      const dustGeo = new THREE.BufferGeometry();
      const N = 120;
      const arr = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) {
        const rr = 1.0 + Math.random() * 1.1;
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos(2 * Math.random() - 1);
        arr[i * 3] = rr * Math.sin(ph) * Math.cos(th);
        arr[i * 3 + 1] = rr * Math.sin(ph) * Math.sin(th);
        arr[i * 3 + 2] = rr * Math.cos(ph);
      }
      dustGeo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
      group.add(
        new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: neutral(), size: 0.025, transparent: true, opacity: 0.6 })),
      );
    }
  }

  // ---- Rubik's cube: 27 connected node-lattice + layer-turn "solving" animation ----
  function buildRubik(ac: THREE.Color) {
    rubik = new THREE.Group();
    nodes = [];
    rubikAnim = null;
    rubikTimer = 0.5;
    const SP = 0.68;
    const solidGeo = new THREE.BoxGeometry(0.34, 0.34, 0.34);
    const solidMat = new THREE.MeshBasicMaterial({ color: ac });
    for (let x = -1; x <= 1; x++)
      for (let y = -1; y <= 1; y++)
        for (let z = -1; z <= 1; z++) {
          const m = new THREE.Mesh(solidGeo, solidMat);
          m.position.set(x * SP, y * SP, z * SP);
          rubik.add(m);
          nodes.push({ mesh: m, grid: { x, y, z }, lp: new THREE.Vector3() });
        }
    rubikLinePos = new Float32Array(60 * 6);
    rubikLineGeo = new THREE.BufferGeometry();
    rubikLineAttr = new THREE.BufferAttribute(rubikLinePos, 3);
    rubikLineGeo.setAttribute('position', rubikLineAttr);
    rubikLines = new THREE.LineSegments(
      rubikLineGeo,
      new THREE.LineBasicMaterial({ color: ac, transparent: true, opacity: 0.3 }),
    );
    rubik.add(rubikLines);
    computeAdjacency();
    rubik.scale.setScalar(1.12);
    rubik.rotation.set(-0.3, 0.5, 0);
    group.add(rubik);
  }
  function computeAdjacency() {
    rubikAdj = [];
    for (let i = 0; i < nodes.length; i++)
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i].grid;
        const b = nodes[j].grid;
        if (Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z) === 1) rubikAdj.push([i, j]);
      }
  }
  function updateRubikLines() {
    if (!rubik || !rubikLines || !rubikLineGeo || !rubikLineAttr || !rubikLinePos) return;
    rubik.updateWorldMatrix(true, false);
    for (let i = 0; i < nodes.length; i++) {
      nodes[i].mesh.getWorldPosition(_rv);
      rubik.worldToLocal(_rv);
      nodes[i].lp.copy(_rv);
    }
    let k = 0;
    for (let e = 0; e < rubikAdj.length; e++) {
      const a = nodes[rubikAdj[e][0]].lp;
      const b = nodes[rubikAdj[e][1]].lp;
      rubikLinePos[k++] = a.x;
      rubikLinePos[k++] = a.y;
      rubikLinePos[k++] = a.z;
      rubikLinePos[k++] = b.x;
      rubikLinePos[k++] = b.y;
      rubikLinePos[k++] = b.z;
    }
    rubikLineGeo.setDrawRange(0, rubikAdj.length * 2);
    rubikLineAttr.needsUpdate = true;
  }
  function rotateGrid(g: GridPos, axis: Axis, dir: number): GridPos {
    const { x, y, z } = g;
    if (axis === 'x') return dir > 0 ? { x, y: -z, z: y } : { x, y: z, z: -y };
    if (axis === 'y') return dir > 0 ? { x: z, y, z: -x } : { x: -z, y, z: x };
    return dir > 0 ? { x: -y, y: x, z } : { x: y, y: -x, z };
  }
  function startMove() {
    if (!rubik) return;
    const axis = (['x', 'y', 'z'] as const)[(Math.random() * 3) | 0];
    const layer = ((Math.random() * 3) | 0) - 1;
    const dir = Math.random() < 0.5 ? 1 : -1;
    const pivot = new THREE.Group();
    rubik.add(pivot);
    const members = nodes.filter((c) => c.grid[axis] === layer);
    members.forEach((c) => pivot.attach(c.mesh));
    rubikAnim = { axis, dir, pivot, members, t: 0, dur: 0.5 / (0.55 + motion) };
  }
  function finishMove() {
    if (!rubik || !rubikAnim) return;
    const a = rubikAnim;
    a.pivot.rotation[a.axis] = (a.dir * Math.PI) / 2;
    a.pivot.updateMatrixWorld(true);
    a.members.forEach((c) => {
      rubik!.attach(c.mesh);
      c.grid = rotateGrid(c.grid, a.axis, a.dir);
    });
    rubik.remove(a.pivot);
    computeAdjacency();
    rubikAnim = null;
    rubikTimer = 0.25 + Math.random() * 0.3;
  }
  function updateRubik(dt: number) {
    if (!rubik) return;
    if (rubikAnim) {
      rubikAnim.t += dt / rubikAnim.dur;
      const tt = Math.min(1, rubikAnim.t);
      const e = tt < 0.5 ? 2 * tt * tt : 1 - Math.pow(-2 * tt + 2, 2) / 2;
      rubikAnim.pivot.rotation[rubikAnim.axis] = (rubikAnim.dir * e * Math.PI) / 2;
      if (rubikAnim.t >= 1) finishMove();
    } else {
      rubikTimer -= dt;
      if (rubikTimer <= 0) startMove();
    }
    updateRubikLines();
    if (rubikLines) {
      const tgt = rubikAnim ? 0.05 : 0.3;
      rubikLines.material.opacity += (tgt - rubikLines.material.opacity) * Math.min(1, dt * 6);
    }
  }

  // ---- jigsaw puzzle: 4 pieces (2x2) assembling, sketch-outlined, shaded accent ----
  function piecePoints(edges: PieceEdges): Pt[] {
    const pts: Pt[] = [];
    const corners = {
      tl: { x: -0.5, y: 0.5 },
      tr: { x: 0.5, y: 0.5 },
      br: { x: 0.5, y: -0.5 },
      bl: { x: -0.5, y: -0.5 },
    };
    const ang = (p: Pt) => Math.atan2(p.y, p.x);
    function edge(a: Pt, dir: Pt, perp: Pt, sign: number) {
      pts.push({ x: a.x, y: a.y });
      if (!sign) return;
      const w = 0.11;
      const r = 0.18;
      const h0 = Math.sqrt(r * r - w * w);
      const mid = { x: a.x + dir.x * 0.5, y: a.y + dir.y * 0.5 };
      const center = { x: mid.x + perp.x * sign * h0, y: mid.y + perp.y * sign * h0 };
      const nL = { x: mid.x - dir.x * w, y: mid.y - dir.y * w };
      const nR = { x: mid.x + dir.x * w, y: mid.y + dir.y * w };
      pts.push(nL);
      const aFrom = ang({ x: nL.x - center.x, y: nL.y - center.y });
      const aTo = ang({ x: nR.x - center.x, y: nR.y - center.y });
      const aOut = ang({ x: perp.x * sign, y: perp.y * sign });
      let d = aTo - aFrom;
      while (d <= -Math.PI) d += 2 * Math.PI;
      while (d > Math.PI) d -= 2 * Math.PI;
      const inc = (delta: number) => {
        let dd = aOut - aFrom;
        while (dd <= -Math.PI) dd += 2 * Math.PI;
        while (dd > Math.PI) dd -= 2 * Math.PI;
        return delta > 0 ? dd > 0 && dd < delta : dd < 0 && dd > delta;
      };
      if (!inc(d)) d = d > 0 ? d - 2 * Math.PI : d + 2 * Math.PI;
      const seg = 18;
      for (let s = 1; s < seg; s++) {
        const aa = aFrom + d * (s / seg);
        pts.push({ x: center.x + Math.cos(aa) * r, y: center.y + Math.sin(aa) * r });
      }
      pts.push(nR);
    }
    edge(corners.tl, { x: 1, y: 0 }, { x: 0, y: 1 }, edges.top);
    edge(corners.tr, { x: 0, y: -1 }, { x: 1, y: 0 }, edges.right);
    edge(corners.br, { x: -1, y: 0 }, { x: 0, y: -1 }, edges.bottom);
    edge(corners.bl, { x: 0, y: 1 }, { x: -1, y: 0 }, edges.left);
    return pts;
  }
  function buildPuzzle(ac: THREE.Color) {
    puzzle = new THREE.Group();
    puzzlePieces = [];
    puzzleT = 0;
    const white = new THREE.Color(0xffffff);
    const black = new THREE.Color(0x000000);
    const shade = (i: number) => {
      const c = ac.clone();
      if (i === 1) c.lerp(white, 0.34);
      else if (i === 2) c.lerp(black, 0.28);
      else if (i === 3) c.lerp(white, 0.16);
      return c;
    };
    const edgeC = ac.clone().lerp(dark ? white : black, dark ? 0.5 : 0.25);
    const defs = [
      { edges: { top: 1, right: 1, bottom: 1, left: -1 }, g: { x: -0.5, y: 0.5 }, i: 0 },
      { edges: { top: -1, right: 1, bottom: 1, left: -1 }, g: { x: 0.5, y: 0.5 }, i: 1 },
      { edges: { top: -1, right: 1, bottom: 1, left: -1 }, g: { x: -0.5, y: -0.5 }, i: 2 },
      { edges: { top: -1, right: 1, bottom: -1, left: -1 }, g: { x: 0.5, y: -0.5 }, i: 3 },
    ];
    defs.forEach((d) => {
      const raw = piecePoints(d.edges);
      const pts = raw.map((p) => new THREE.Vector2(p.x, p.y));
      const shp = new THREE.Shape(pts);
      const geo = new THREE.ExtrudeGeometry(shp, {
        depth: 0.14,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.03,
        bevelSegments: 1,
        steps: 1,
      });
      geo.translate(0, 0, -0.07);
      // flat hologram fill (MeshBasic → no lighting tint, stays true blue), semi-translucent
      const mat = new THREE.MeshBasicMaterial({
        color: shade(d.i),
        transparent: true,
        opacity: dark ? 0.42 : 0.5,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geo, mat);
      const pg = new THREE.Group();
      pg.add(mesh);
      // hologram outline on both faces
      const edgeMats: EdgeMaterial[] = [];
      const mkLoop = (z: number, op: number) => {
        const lm = new THREE.LineBasicMaterial({ color: edgeC, transparent: true, opacity: op });
        edgeMats.push({ m: lm, base: op });
        const lgeo = new THREE.BufferGeometry().setFromPoints(raw.map((p) => new THREE.Vector3(p.x, p.y, z)));
        return new THREE.LineLoop(lgeo, lm);
      };
      pg.add(mkLoop(0.075, 0.9));
      pg.add(mkLoop(-0.075, 0.45));
      pg.scale.setScalar(0.965); // tiny seam → no coplanar z-fighting blink
      puzzle!.add(pg);
      const gc = new THREE.Vector3(d.g.x, d.g.y, 0);
      const ePos = gc.clone().multiplyScalar(2.4);
      ePos.z = 1.0 + (d.i % 2) * 0.5;
      const eRot = { x: (d.i - 1.5) * 0.3, y: d.i % 2 ? 0.6 : -0.6, z: (d.i - 1.5) * 0.4 };
      puzzlePieces.push({ pg, aPos: gc, ePos, eRot, delay: d.i * 0.14, fill: mat, edgeMats });
    });
    puzzle.scale.setScalar(0.84);
    puzzle.rotation.set(-0.58, 0.62, 0); // isometric 2.5D tilt
    group.add(puzzle);
  }
  function updatePuzzle(dt: number) {
    if (!puzzle) return;
    puzzleT += dt * (0.55 + motion * 0.7);
    const cycle = 6.4;
    const local = puzzleT % cycle;
    const ease = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
    // breathing glow during the assembled hold (3.0s → 4.6s), ramped in/out
    let breathe = 0;
    if (local > 3.0 && local < 4.6) {
      const win = Math.min(1, (local - 3.0) / 0.5, (4.6 - local) / 0.5);
      breathe = win * (0.5 + 0.5 * Math.sin((local - 3.0) * 4.2));
    }
    puzzlePieces.forEach((pp) => {
      let g: number;
      const aStart = pp.delay;
      const aDur = 2.1;
      if (local < aStart) g = 0;
      else if (local < aStart + aDur) g = ease((local - aStart) / aDur);
      else if (local < 4.6) g = 1;
      else if (local < 5.8) g = 1 - ease((local - 4.6) / 1.2);
      else g = 0;
      pp.pg.position.set(
        pp.ePos.x + (pp.aPos.x - pp.ePos.x) * g,
        pp.ePos.y + (pp.aPos.y - pp.ePos.y) * g,
        pp.ePos.z + (0 - pp.ePos.z) * g,
      );
      pp.pg.rotation.set(pp.eRot.x * (1 - g), pp.eRot.y * (1 - g), pp.eRot.z * (1 - g));
      // assembled factor ramps smoothly (no sudden jump): soften seam outlines + breathe glow
      const af = Math.max(0, Math.min(1, (g - 0.9) / 0.1));
      pp.edgeMats.forEach((e) => {
        e.m.opacity = e.base * (1 - af * (1 - (0.55 + 0.45 * breathe)));
      });
      pp.fill.opacity = (dark ? 0.42 : 0.5) + af * breathe * 0.2;
    });
  }

  build();

  // pointer parallax
  const target = { x: 0, y: 0 };
  function onMove(e: PointerEvent) {
    const r = container.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    target.x = (e.clientX - cx) / window.innerWidth;
    target.y = (e.clientY - cy) / window.innerHeight;
  }
  window.addEventListener('pointermove', onMove);

  // drag-to-rotate (mouse + touch)
  let dragging = false;
  let lastPX = 0;
  let lastPY = 0;
  function onDragDown(e: PointerEvent) {
    dragging = true;
    lastPX = e.clientX;
    lastPY = e.clientY;
    renderer.domElement.style.cursor = 'grabbing';
  }
  function onDragUp() {
    dragging = false;
    renderer.domElement.style.cursor = 'grab';
  }
  function onDragMove(e: PointerEvent) {
    if (!dragging) return;
    group.rotation.y += (e.clientX - lastPX) * 0.008;
    group.rotation.x += (e.clientY - lastPY) * 0.008;
    lastPX = e.clientX;
    lastPY = e.clientY;
  }
  renderer.domElement.style.touchAction = 'none';
  renderer.domElement.style.cursor = 'grab';
  renderer.domElement.addEventListener('pointerdown', onDragDown);
  window.addEventListener('pointermove', onDragMove);
  window.addEventListener('pointerup', onDragUp);

  let raf = 0;
  let t0 = performance.now();
  let running = true;
  let curX = 0;
  let curY = 0;
  function loop(now: number) {
    if (!running) return;
    raf = requestAnimationFrame(loop);
    const dt = Math.min(0.05, (now - t0) / 1000);
    t0 = now;
    const spd = 0.12 + motion * 0.55;
    if (variant === 'puzzle') {
      // hold isometric tilt; gentle parallax sway, no continuous spin
      if (!dragging) {
        group.rotation.y += (curX * 0.3 - group.rotation.y) * 0.04;
        group.rotation.x += (-curY * 0.2 - group.rotation.x) * 0.04;
      }
    } else {
      if (!dragging) {
        group.rotation.y += dt * spd;
        group.rotation.x += dt * spd * 0.12;
      }
      group.rotation.y += curX * 0.0008 * (1 + motion);
    }
    // parallax lerp
    curX += (target.x - curX) * 0.05;
    curY += (target.y - curY) * 0.05;
    group.position.y = Math.sin(now / 1400) * 0.06 * (0.4 + motion);
    camera.position.x = curX * 0.6;
    camera.position.y = -curY * 0.6;
    camera.lookAt(0, 0, 0);
    if (variant === 'core') {
      group.children.forEach((c) => {
        const spin = c.userData.spin as number | undefined;
        if (spin) c.rotation.z += dt * spin * (0.5 + motion);
      });
    }
    if (variant === 'rubik') updateRubik(dt);
    if (variant === 'puzzle') updatePuzzle(dt);
    renderer.render(scene, camera);
  }
  raf = requestAnimationFrame(loop);

  function resize() {
    camera.aspect = W() / H();
    camera.updateProjectionMatrix();
    renderer.setSize(W(), H());
  }
  const ro = new ResizeObserver(resize);
  ro.observe(container);

  return {
    setAccent(hex: string) {
      accent = hex;
      build();
    },
    setVariant(v: Hero3DVariant) {
      variant = v;
      build();
    },
    setMotion(m: number) {
      motion = m;
    },
    setDark(d: boolean) {
      dark = d;
      scene.children.forEach((c) => {
        if (c instanceof THREE.AmbientLight) c.intensity = dark ? 0.5 : 0.85;
      });
      build();
    },
    destroy() {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('pointermove', onMove);
      renderer.domElement.removeEventListener('pointerdown', onDragDown);
      window.removeEventListener('pointermove', onDragMove);
      window.removeEventListener('pointerup', onDragUp);
      clearGroup();
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    },
  };
}
