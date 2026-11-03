

export const HERO_TIMELINE = (() => {
  const burstStart = 200;
  const wordDur = 350;
  const threeDur = 250;
  const wordSettle = burstStart + wordDur + 90; // 640
  const threeBurstStart = wordSettle + 100; // 740
  const threeSettle = threeBurstStart + threeDur + 70; // 1060
  const contentStart = threeSettle + 70; // 1130
  return { burstStart, wordDur, wordSettle, threeBurstStart, threeDur, threeSettle, contentStart };
})();

const PALETTE = ["#FF3D82", "#FF3D82", "#FF3D82", "#FF6FA8", "#FF8A3D", "#8C5CF6"];
const AMBIENT_PALETTE = ["#FF3D82", "#FF3D82", "#FF2E6B", "#FF6FA8", "#FF7A5A", "#FF8A3D", "#8C5CF6", "#A88BE8"];
const pickColor = (palette: string[]) => palette[(Math.random() * palette.length) | 0];
const rnd = (a: number, b: number) => a + Math.random() * (b - a);

type Point = { x: number; y: number };

type Fragment = {
  x: number;
  y: number;
  origin: Point;
  control: Point;
  target: Point;
  rot: number;
  rotSpeed: number;
  size: number;
  color: string;
  delay: number;
  opacity: number;
};

type Ember = {
  x: number;
  y: number;
  origin: Point;
  anchorX: number;
  anchorY: number;
  control: Point;
  rot: number;
  rotSpeed: number;
  size: number;
  color: string;
  delay: number;
  phaseOffset: number;
  sway: number;
  opacity: number;
};

type AmbientKind = "far" | "mid" | "near" | "radial" | "streak";

type AmbientPart = {
  kind: AmbientKind;
  color: string;
  rot: number;
  dir: number;
  curve: number;
  x: number;
  y: number;
  ox: number;
  oy: number;
  speed: number;
  shape: "dot" | "tri" | "streak";
  size: number;
  maxOp: number;
  rotSpeed: number;
  span: number;
  depth: number;
  vy0: number;
  life: number;
  pushX: number;
  pushY: number;
};

function samplePoints(el: HTMLElement, refRect: DOMRect, step: number, max: number): Point[] {
  const rect = el.getBoundingClientRect();
  const cs = getComputedStyle(el);
  const off = document.createElement("canvas");
  off.width = Math.max(1, Math.ceil(rect.width));
  off.height = Math.max(1, Math.ceil(rect.height + 40));
  const octx = off.getContext("2d");
  if (!octx) return [];
  octx.font = `${cs.fontWeight} ${parseFloat(cs.fontSize)}px ${cs.fontFamily}`;
  octx.fillStyle = "#fff";
  octx.textBaseline = "alphabetic";
  octx.fillText(el.textContent || "", 0, rect.height * 0.78);
  const data = octx.getImageData(0, 0, off.width, off.height).data;
  const pts: Point[] = [];
  for (let y = 0; y < off.height; y += step) {
    for (let x = 0; x < off.width; x += step) {
      if (data[(y * off.width + x) * 4 + 3] > 120) {
        pts.push({ x: rect.left - refRect.left + x, y: rect.top - refRect.top + y });
      }
    }
  }
  for (let i = pts.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [pts[i], pts[j]] = [pts[j], pts[i]];
  }
  return pts.slice(0, max);
}

function makeFragment(target: Point, origin: Point, maxDelay: number): Fragment {
  const angle = Math.random() * Math.PI * 2;
  const dist = 60 + Math.random() * 160;
  return {
    x: origin.x,
    y: origin.y,
    origin,
    target,
    control: { x: origin.x + Math.cos(angle) * dist, y: origin.y + Math.sin(angle) * dist },
    rot: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 10,
    size: 3 + Math.random() * 6,
    color: pickColor(PALETTE),
    delay: Math.random() * maxDelay,
    opacity: 0,
  };
}

function drawShard(ctx: CanvasRenderingContext2D, p: { x: number; y: number; rot: number; size: number; color: string; opacity: number }) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot);
  ctx.globalAlpha = Math.max(0, p.opacity);
  ctx.fillStyle = p.color;
  const s = p.size;
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.lineTo(s * 0.8, s * 0.6);
  ctx.lineTo(-s * 0.6, s * 0.4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawGroup(ctx: CanvasRenderingContext2D, frags: Fragment[], elapsed: number, burstStart: number, dur: number, settle: number) {
  frags.forEach((p) => {
    const local = elapsed - burstStart - p.delay;
    if (local < 0) return;
    const t = Math.min(1, local / dur);
    const eased = 1 - Math.pow(1 - t, 3);
    p.x = (1 - eased) * (1 - eased) * p.origin.x + 2 * (1 - eased) * eased * p.control.x + eased * eased * p.target.x;
    p.y = (1 - eased) * (1 - eased) * p.origin.y + 2 * (1 - eased) * eased * p.control.y + eased * eased * p.target.y;
    p.rot += p.rotSpeed * (1 - eased) * 0.02;
    let op = Math.min(1, local / 60);
    const crossStart = settle - 60;
    const crossDur = 180;
    if (elapsed > crossStart) op *= Math.max(0, 1 - (elapsed - crossStart) / crossDur);
    p.opacity = op;
    if (op > 0.01) drawShard(ctx, p);
  });
}

export type HeroTextAssemblyHandle = { stop: () => void };

/**
 * Builds and runs the full hero canvas effect on `canvas`, sized to
 * `heroEl`'s bounds: the fragment-burst text assembly converging into
 * `wordEl`/`threeEl`'s glyph shapes, then a persistent ambient particle
 * field + wordmark "embers" + drifting glow, mouse-reactive, for as long as
 * the hero stays mounted. Purely imperative/canvas-driven — no React state.
 */
export function runHeroTextAssembly(
  canvas: HTMLCanvasElement,
  heroEl: HTMLElement,
  wordEl: HTMLElement,
  threeEl: HTMLElement,
): HeroTextAssemblyHandle {
  const rawCtx = canvas.getContext("2d");
  if (!rawCtx) return { stop: () => {} };
  const ctx: CanvasRenderingContext2D = rawCtx;

  let heroRect = heroEl.getBoundingClientRect();
  let w = heroRect.width;
  let h = heroRect.height;
  let dpr = Math.min(2, window.devicePixelRatio || 1);

  const sizeCanvas = () => {
    heroRect = heroEl.getBoundingClientRect();
    w = heroRect.width;
    h = heroRect.height;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.max(1, w * dpr);
    canvas.height = Math.max(1, h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  sizeCanvas();

  const wordPts = samplePoints(wordEl, heroRect, 7, 340);
  const threePts = samplePoints(threeEl, heroRect, 6, 100);
  const wordRect = wordEl.getBoundingClientRect();
  const threeRect = threeEl.getBoundingClientRect();
  const wordOrigin = { x: wordRect.left - heroRect.left + wordRect.width / 2, y: wordRect.top - heroRect.top + wordRect.height / 2 };
  const threeOrigin = { x: threeRect.left - heroRect.left + threeRect.width / 2, y: threeRect.top - heroRect.top + threeRect.height / 2 };

  const wordFragments = wordPts.map((p) => makeFragment(p, wordOrigin, 90));
  const threeFragments = threePts.map((p) => makeFragment(p, threeOrigin, 70));

  // --- embers: drift out from the wordmark once it settles ---
  const embers: Ember[] = [];
  {
    const emberCount = 16;
    const safe = {
      x: wordRect.left - heroRect.left - 40,
      y: wordRect.top - heroRect.top - 60,
      w: Math.max(wordRect.width, threeRect.right - wordRect.left) + 120,
      h: threeRect.bottom - heroRect.top - (wordRect.top - heroRect.top) + 260,
    };
    for (let i = 0; i < emberCount; i++) {
      let ex = Math.random() * w;
      const ey = Math.random() * h;
      if (ex > safe.x && ex < safe.x + safe.w && ey > safe.y && ey < safe.y + safe.h) {
        ex = Math.random() < 0.5 ? Math.random() * Math.max(1, safe.x) : safe.x + safe.w + Math.random() * Math.max(1, w - (safe.x + safe.w));
      }
      const origin = Math.random() < 0.5 ? wordOrigin : threeOrigin;
      embers.push({
        x: origin.x,
        y: origin.y,
        origin,
        anchorX: ex,
        anchorY: ey,
        control: { x: origin.x + (ex - origin.x) * 0.5 + (Math.random() - 0.5) * 120, y: origin.y + (ey - origin.y) * 0.5 - 80 },
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 4,
        size: 2.5 + Math.random() * 4,
        color: pickColor(PALETTE),
        delay: Math.random() * 200 + 700,
        phaseOffset: Math.random() * 1000,
        sway: 6 + Math.random() * 10,
        opacity: 0,
      });
    }
  }

  // --- ambient field: far/mid/near dust + radial dust emitted from the
  // wordmark box + fast streaks ---
  const wordBox = {
    x: wordRect.left - heroRect.left,
    y: wordRect.top - heroRect.top,
    w: wordRect.width,
    h: wordRect.height,
    cx: wordRect.left - heroRect.left + wordRect.width / 2,
    cy: wordRect.top - heroRect.top + wordRect.height / 2,
  };
  const copyEl = wordEl.parentElement?.parentElement;
  const tc = (copyEl ?? wordEl).getBoundingClientRect();
  const textBox = { x: tc.left - heroRect.left - 12, y: tc.top - heroRect.top - 12, w: tc.width + 24, h: tc.height + 24 };

  function spawnPart(kind: AmbientKind, seeded: boolean): AmbientPart {
    const color = pickColor(AMBIENT_PALETTE);
    const angle = Math.random() * Math.PI * 2;
    const p: AmbientPart = {
      kind,
      color,
      rot: Math.random() * Math.PI * 2,
      dir: angle,
      curve: rnd(-0.11, 0.11),
      x: 0,
      y: 0,
      ox: 0,
      oy: 0,
      speed: 0,
      shape: "dot",
      size: 0,
      maxOp: 0,
      rotSpeed: 0,
      span: 0,
      depth: 0,
      vy0: rnd(-2.4, -0.4),
      life: 0,
      pushX: 0,
      pushY: 0,
    };

    if (kind === "radial") {
      p.x = wordBox.x + Math.random() * wordBox.w;
      p.y = wordBox.y + wordBox.h * rnd(0.05, 0.95);
      p.dir = Math.atan2(p.y - wordBox.cy, p.x - wordBox.cx) + rnd(-0.5, 0.5);
      p.speed = rnd(6, 17);
      p.shape = Math.random() < 0.6 ? "tri" : "dot";
      p.size = rnd(1.8, 4.6);
      p.maxOp = rnd(0.3, 0.55);
      p.rotSpeed = rnd(-0.5, 0.5);
      p.span = rnd(9, 16);
      p.depth = 0.8;
    } else {
      p.x = Math.random() * w;
      p.y = Math.random() * h;
      if (kind === "far") {
        p.shape = "dot";
        p.size = rnd(0.6, 1.3);
        p.speed = rnd(2.4, 7);
        p.maxOp = rnd(0.13, 0.26);
        p.rotSpeed = 0;
        p.span = rnd(18, 34);
        p.depth = 0.25;
      } else if (kind === "mid") {
        p.shape = Math.random() < 0.45 ? "tri" : "dot";
        p.size = p.shape === "tri" ? rnd(1.6, 3.2) : rnd(0.9, 1.7);
        p.speed = rnd(6, 15);
        p.maxOp = rnd(0.22, 0.4);
        p.rotSpeed = rnd(-0.35, 0.35);
        p.span = rnd(14, 26);
        p.depth = 0.55;
      } else if (kind === "near") {
        p.shape = "tri";
        p.size = rnd(3.6, 7.6);
        p.speed = rnd(10, 22);
        p.maxOp = rnd(0.4, 0.66);
        p.rotSpeed = rnd(-0.6, 0.6);
        p.span = rnd(11, 20);
        p.depth = 1;
      } else {
        p.shape = "streak";
        p.size = rnd(1.5, 2.8);
        p.speed = rnd(70, 150);
        p.maxOp = rnd(0.34, 0.55);
        p.rotSpeed = 0;
        p.span = rnd(4.5, 8.5);
        p.depth = 1;
        p.curve = rnd(-0.05, 0.05);
      }
    }
    p.life = seeded ? Math.random() * p.span : 0;
    p.ox = p.x;
    p.oy = p.y;
    return p;
  }

  const small = Math.min(w, h) < 760;
  const dens = small ? 0.42 : 1;
  const mix: Record<AmbientKind, number> = {
    far: Math.round(165 * dens),
    mid: Math.round(105 * dens),
    near: Math.round(42 * dens),
    radial: Math.round(56 * dens),
    streak: Math.round(12 * dens),
  };
  const parts: AmbientPart[] = [];
  (Object.keys(mix) as AmbientKind[]).forEach((kind) => {
    for (let i = 0; i < mix[kind]; i++) parts.push(spawnPart(kind, true));
  });

  const glowSeeds = [
    { hue: "rgba(255,61,130,", r: 0.55, px: 15000, py: 21000, ax: 0.26, ay: 0.16, ox: 0.34, oy: 0.44, a: 0.055 },
    { hue: "rgba(255,122,90,", r: 0.42, px: 19000, py: 24500, ax: 0.22, ay: 0.18, ox: 0.62, oy: 0.36, a: 0.045 },
    { hue: "rgba(255,138,61,", r: 0.34, px: 23000, py: 17500, ax: 0.2, ay: 0.14, ox: 0.48, oy: 0.68, a: 0.032 },
    { hue: "rgba(255,47,125,", r: 0.3, px: 14000, py: 18000, ax: 0.1, ay: 0.07, ox: 0.3, oy: 0.5, a: 0.062 },
  ];

  function drawGlow(tMs: number) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    glowSeeds.forEach((g) => {
      const cx = w * (g.ox + Math.sin((tMs / g.px) * Math.PI * 2) * g.ax);
      const cy = h * (g.oy + Math.cos((tMs / g.py) * Math.PI * 2) * g.ay);
      const rad = Math.max(w, h) * g.r;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
      grad.addColorStop(0, g.hue + g.a + ")");
      grad.addColorStop(0.55, g.hue + (g.a * 0.35).toFixed(4) + ")");
      grad.addColorStop(1, g.hue + "0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    });
    ctx.restore();
  }

  function textDim(x: number, y: number) {
    if (x > textBox.x && x < textBox.x + textBox.w && y > textBox.y && y < textBox.y + textBox.h) return 0.42;
    return 1;
  }

  const mouse = { x: -9999, y: -9999 };
  const onMove = (e: MouseEvent) => {
    const r = heroEl.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  };
  const onLeave = () => {
    mouse.x = -9999;
    mouse.y = -9999;
  };
  heroEl.addEventListener("mousemove", onMove);
  heroEl.addEventListener("mouseleave", onLeave);

  function updateAmbient(dt: number, fadeIn: number) {
    const pad = 90;
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      p.life += dt;
      if (p.life > p.span || p.x < -pad || p.x > w + pad || p.y < -pad || p.y > h + pad) {
        parts[i] = spawnPart(p.kind, false);
        continue;
      }
      p.dir += p.curve * dt;
      const vx = Math.cos(p.dir) * p.speed;
      const vy = Math.sin(p.dir) * p.speed + p.vy0;
      p.x += vx * dt;
      p.y += vy * dt;
      p.rot += p.rotSpeed * dt;

      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const R = 120;
      if (dist < R && dist > 0.01) {
        const f = (1 - dist / R) * 20 * p.depth;
        p.pushX += ((dx / dist) * f - p.pushX) * Math.min(1, dt * 4);
        p.pushY += ((dy / dist) * f - p.pushY) * Math.min(1, dt * 4);
      } else {
        p.pushX += -p.pushX * Math.min(1, dt * 1.4);
        p.pushY += -p.pushY * Math.min(1, dt * 1.4);
      }

      const k = p.life / p.span;
      const env = Math.min(1, k / 0.2) * Math.min(1, (1 - k) / 0.3);
      let op = p.maxOp * env * fadeIn;
      if (p.kind === "radial") {
        op *= 0.35 + 0.65 * Math.min(1, Math.hypot(p.x - p.ox, p.y - p.oy) / 90);
      }
      const px = p.x + p.pushX;
      const py = p.y + p.pushY;
      op *= textDim(px, py);
      if (op < 0.012) continue;

      if (p.shape === "dot") {
        ctx.save();
        ctx.globalAlpha = op;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (p.shape === "streak") {
        const len = p.speed * 0.09;
        ctx.save();
        ctx.globalAlpha = op;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size * 0.7;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px - Math.cos(p.dir) * len, py - Math.sin(p.dir) * len);
        ctx.stroke();
        ctx.restore();
      } else {
        drawShard(ctx, { x: px, y: py, rot: p.rot, size: p.size, color: p.color, opacity: op });
      }
    }
  }

  function drawEmbers(elapsed: number) {
    const burstStart = HERO_TIMELINE.burstStart;
    embers.forEach((p) => {
      const local = elapsed - burstStart - p.delay;
      if (local < 0) return;
      const flightDur = 900;
      const t = Math.min(1, local / flightDur);
      if (t < 1) {
        const eased = 1 - Math.pow(1 - t, 3);
        p.x = (1 - eased) * (1 - eased) * p.origin.x + 2 * (1 - eased) * eased * p.control.x + eased * eased * p.anchorX;
        p.y = (1 - eased) * (1 - eased) * p.origin.y + 2 * (1 - eased) * eased * p.control.y + eased * eased * p.anchorY;
        p.opacity = Math.min(0.5, local / 150);
      } else {
        const settleT = elapsed - (burstStart + p.delay + flightDur);
        const floatY = Math.sin((settleT + p.phaseOffset) / 1400) * p.sway - settleT * 0.004;
        const floatX = Math.sin((settleT + p.phaseOffset) / 2000) * p.sway * 0.6;
        let bx = p.anchorX + floatX;
        let by = p.anchorY + floatY;
        const dx = bx - mouse.x;
        const dy = by - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const radius = 90;
        if (dist < radius && dist > 0.01) {
          const force = (1 - dist / radius) * 26;
          bx += (dx / dist) * force;
          by += (dy / dist) * force;
        }
        p.x = bx;
        p.y = by;
        p.opacity = 0.22 + Math.sin((settleT + p.phaseOffset) / 900) * 0.08;
      }
      p.rot += p.rotSpeed * 0.01;
      if (p.opacity > 0.02) drawShard(ctx, p);
    });
  }

  const tl = HERO_TIMELINE;
  const startTime = performance.now();
  let raf = 0;
  let lastNow = 0;

  const tick = (now: number) => {
    const dt = Math.min(0.05, lastNow ? (now - lastNow) / 1000 : 0.016);
    lastNow = now;
    const elapsed = now - startTime;
    ctx.clearRect(0, 0, w, h);

    drawGlow(now);
    updateAmbient(dt, Math.max(0, Math.min(1, (elapsed - tl.contentStart) / 1200)));

    if (wordFragments.length && elapsed > 100 && elapsed < tl.burstStart + 100) {
      const a = Math.min(1, (elapsed - 100) / 100) * (elapsed > tl.burstStart ? Math.max(0, 1 - (elapsed - tl.burstStart) / 100) : 1);
      const origin = wordFragments[0].origin;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const g = ctx.createRadialGradient(origin.x, origin.y, 0, origin.x, origin.y, 26);
      g.addColorStop(0, `rgba(255,111,168,${0.9 * a})`);
      g.addColorStop(1, "rgba(255,111,168,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(origin.x, origin.y, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    drawGroup(ctx, wordFragments, elapsed, tl.burstStart, tl.wordDur, tl.wordSettle);
    drawGroup(ctx, threeFragments, elapsed, tl.threeBurstStart, tl.threeDur, tl.threeSettle);
    drawEmbers(elapsed);

    raf = requestAnimationFrame(tick);
  };

  raf = requestAnimationFrame(tick);

  const onResize = () => sizeCanvas();
  window.addEventListener("resize", onResize);

  return {
    stop: () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      heroEl.removeEventListener("mousemove", onMove);
      heroEl.removeEventListener("mouseleave", onLeave);
      ctx.clearRect(0, 0, w, h);
    },
  };
}
