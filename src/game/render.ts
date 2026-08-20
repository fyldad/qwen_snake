import { COLS, ROWS } from "./constants";
import type { Game } from "./engine";

function mixHex(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const r = Math.round(((pa >> 16) & 255) + (((pb >> 16) & 255) - ((pa >> 16) & 255)) * t);
  const g = Math.round(((pa >> 8) & 255) + (((pb >> 8) & 255) - ((pa >> 8) & 255)) * t);
  const bl = Math.round((pa & 255) + ((pb & 255) - (pa & 255)) * t);
  return `rgb(${r},${g},${bl})`;
}

function ramp(t: number): string {
  return t < 0.5 ? mixHex("#245c3e", "#3fae5c", t * 2) : mixHex("#3fae5c", "#b9f656", (t - 0.5) * 2);
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function draw(ctx: CanvasRenderingContext2D, g: Game, cell: number, now: number) {
  const size = cell * COLS;
  ctx.clearRect(0, 0, size, size);
  ctx.save();

  if (g.shake > 0.2) {
    ctx.translate((Math.random() - 0.5) * g.shake, (Math.random() - 0.5) * g.shake);
  }

  /* ----- доска ----- */
  roundedRect(ctx, 0, 0, size, size, cell * 0.8);
  ctx.fillStyle = "#0b2015";
  ctx.fill();

  ctx.save();
  roundedRect(ctx, 0, 0, size, size, cell * 0.8);
  ctx.clip();

  ctx.fillStyle = "rgba(234,247,238,0.022)";
  for (let y = 0; y < ROWS; y++) {
    for (let x = (y % 2); x < COLS; x += 2) {
      ctx.fillRect(x * cell, y * cell, cell, cell);
    }
  }

  const vg = ctx.createRadialGradient(size / 2, size / 2, size * 0.25, size / 2, size / 2, size * 0.72);
  vg.addColorStop(0, "rgba(3,10,6,0)");
  vg.addColorStop(1, "rgba(3,10,6,0.5)");
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, size, size);

  /* ----- еда ----- */
  drawApple(ctx, g.food.x, g.food.y, cell, now, "#ff9d7e", "#ff4b3e", "rgba(255,83,72,0.75)", false, 0);

  if (g.bonus) {
    const remain = g.bonus.deadline - g.time;
    const frac = Math.max(0, remain / 6500);
    const blink = remain < 2000 ? 0.4 + 0.6 * Math.abs(Math.sin(now / 95)) : 1;
    ctx.globalAlpha = blink;
    drawApple(ctx, g.bonus.pos.x, g.bonus.pos.y, cell, now, "#ffe9a8", "#f2a93b", "rgba(255,209,102,0.8)", true, frac);
    ctx.globalAlpha = 1;
  }

  /* ----- змейка ----- */
  const t = g.status === "playing" ? Math.min(1, g.acc / g.interval) : 1;
  const pts = g.snake.map((p, i) => {
    const q = g.prev.length
      ? i === 0
        ? g.prev[0]
        : g.prev[i - 1] ?? g.prev[g.prev.length - 1]
      : p;
    return {
      x: (q.x + (p.x - q.x) * t + 0.5) * cell,
      y: (q.y + (p.y - q.y) * t + 0.5) * cell,
    };
  });

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // мягкое свечение
  ctx.beginPath();
  pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
  ctx.strokeStyle = "rgba(163,236,57,0.08)";
  ctx.lineWidth = cell * 1.35;
  ctx.stroke();

  // тело: хвост → голова
  const n = pts.length;
  for (let i = n - 1; i >= 1; i--) {
    const f = 1 - i / Math.max(1, n - 1);
    ctx.beginPath();
    ctx.moveTo(pts[i].x, pts[i].y);
    ctx.lineTo(pts[i - 1].x, pts[i - 1].y);
    ctx.strokeStyle = ramp(f);
    ctx.lineWidth = cell * (0.5 + 0.26 * f);
    ctx.stroke();
  }

  // голова
  const head = pts[0];
  const dir = g.dir;
  const hr = cell * 0.44;
  ctx.save();
  ctx.shadowColor = "rgba(185,246,86,0.65)";
  ctx.shadowBlur = cell * 0.7;
  ctx.beginPath();
  ctx.arc(head.x, head.y, hr, 0, Math.PI * 2);
  ctx.fillStyle = "#c8fa62";
  ctx.fill();
  ctx.restore();

  // язычок
  if (g.status === "playing" && Math.sin(now / 170) > 0.55) {
    const tx = head.x + dir.x * cell * 0.62;
    const ty = head.y + dir.y * cell * 0.62;
    ctx.beginPath();
    ctx.moveTo(head.x + dir.x * cell * 0.36, head.y + dir.y * cell * 0.36);
    ctx.lineTo(tx, ty);
    ctx.strokeStyle = "#ff6f61";
    ctx.lineWidth = cell * 0.07;
    ctx.stroke();
  }

  // глаза
  const px = -dir.y;
  const py = dir.x;
  const dead = g.status === "over";
  for (const s of [1, -1]) {
    const ex = head.x + dir.x * cell * 0.13 + px * s * cell * 0.18;
    const ey = head.y + dir.y * cell * 0.13 + py * s * cell * 0.18;
    ctx.beginPath();
    ctx.arc(ex, ey, cell * 0.115, 0, Math.PI * 2);
    ctx.fillStyle = "#f4ffe8";
    ctx.fill();
    if (dead) {
      ctx.strokeStyle = "#0c2418";
      ctx.lineWidth = cell * 0.05;
      const k = cell * 0.07;
      ctx.beginPath();
      ctx.moveTo(ex - k, ey - k);
      ctx.lineTo(ex + k, ey + k);
      ctx.moveTo(ex + k, ey - k);
      ctx.lineTo(ex - k, ey + k);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(ex + dir.x * cell * 0.05, ey + dir.y * cell * 0.05, cell * 0.058, 0, Math.PI * 2);
      ctx.fillStyle = "#07130c";
      ctx.fill();
    }
  }

  /* ----- частицы ----- */
  for (const p of g.particles) {
    const a = Math.max(0, p.life / p.max);
    ctx.globalAlpha = a;
    ctx.beginPath();
    ctx.arc((p.x + 0.5) * cell, (p.y + 0.5) * cell, p.size * cell * (0.5 + a * 0.7), 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  /* ----- всплывающие очки ----- */
  for (const p of g.popups) {
    const a = Math.max(0, p.life / p.max);
    ctx.globalAlpha = a;
    ctx.font = `800 ${Math.round(cell * 0.62)}px Unbounded, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const x = (p.x + 0.5) * cell;
    const y = (p.y + 0.5) * cell;
    ctx.lineWidth = cell * 0.14;
    ctx.strokeStyle = "rgba(5,14,9,0.6)";
    ctx.strokeText(p.text, x, y);
    ctx.fillStyle = p.color;
    ctx.fillText(p.text, x, y);
  }
  ctx.globalAlpha = 1;

  // красная вспышка при смерти
  if (g.flash > 0) {
    ctx.fillStyle = `rgba(255,83,72,${(g.flash * 0.3).toFixed(3)})`;
    ctx.fillRect(0, 0, size, size);
  }

  ctx.restore();

  /* ----- рамка ----- */
  roundedRect(ctx, 1, 1, size - 2, size - 2, cell * 0.8);
  ctx.strokeStyle = "rgba(185,246,86,0.16)";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawApple(
  ctx: CanvasRenderingContext2D,
  gx: number,
  gy: number,
  cell: number,
  now: number,
  inner: string,
  outer: string,
  glow: string,
  isBonus: boolean,
  frac: number,
) {
  const cx = (gx + 0.5) * cell;
  const cy = (gy + 0.5) * cell;
  const pulse = 1 + Math.sin(now / 240 + gx) * 0.07;
  const r = cell * 0.32 * pulse;

  ctx.save();
  ctx.shadowColor = glow;
  ctx.shadowBlur = cell * 0.8;
  const grad = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.4, r * 0.15, cx, cy, r);
  grad.addColorStop(0, inner);
  grad.addColorStop(1, outer);
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.restore();

  // блик
  ctx.beginPath();
  ctx.arc(cx - r * 0.32, cy - r * 0.36, r * 0.2, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.fill();

  // плодоножка и листик
  ctx.beginPath();
  ctx.moveTo(cx, cy - r * 0.9);
  ctx.quadraticCurveTo(cx + r * 0.15, cy - r * 1.25, cx + r * 0.05, cy - r * 1.35);
  ctx.strokeStyle = "#8a5a3b";
  ctx.lineWidth = cell * 0.06;
  ctx.lineCap = "round";
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(cx + r * 0.5, cy - r * 1.05, r * 0.34, r * 0.16, -0.6, 0, Math.PI * 2);
  ctx.fillStyle = "#7bd88f";
  ctx.fill();

  // кольцо-таймер у золотого яблока
  if (isBonus) {
    ctx.beginPath();
    ctx.arc(cx, cy, cell * 0.46, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,209,102,0.22)";
    ctx.lineWidth = cell * 0.07;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, cell * 0.46, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac);
    ctx.strokeStyle = "#ffd166";
    ctx.lineWidth = cell * 0.07;
    ctx.lineCap = "round";
    ctx.stroke();

    // искры
    for (let i = 0; i < 3; i++) {
      const a = now / 700 + (i * Math.PI * 2) / 3;
      const sx = cx + Math.cos(a) * cell * 0.62;
      const sy = cy + Math.sin(a) * cell * 0.62;
      ctx.beginPath();
      ctx.arc(sx, sy, cell * 0.045, 0, Math.PI * 2);
      ctx.fillStyle = "#ffe08a";
      ctx.fill();
    }
  }
}
