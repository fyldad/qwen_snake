import {
  BONUS_EVERY,
  BONUS_TTL,
  COLS,
  DIFFICULTY_MAP,
  POINTS_BONUS,
  POINTS_FOOD,
  ROWS,
  type DifficultyId,
  type Status,
  type Vec,
} from "./constants";

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  color: string;
}

export interface Popup {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  max: number;
}

export interface Bonus {
  pos: Vec;
  deadline: number;
}

export interface Game {
  status: Status;
  difficulty: DifficultyId;
  snake: Vec[];
  prev: Vec[];
  dir: Vec;
  queue: Vec[];
  food: Vec;
  bonus: Bonus | null;
  eaten: number;
  score: number;
  interval: number;
  acc: number;
  time: number;
  shake: number;
  flash: number;
  particles: Particle[];
  popups: Popup[];
}

export interface StepEvents {
  ateFood: boolean;
  ateBonus: boolean;
  died: boolean;
}

const rnd = (n: number) => Math.floor(Math.random() * n);

export function createGame(difficulty: DifficultyId, status: Status = "menu"): Game {
  const cy = Math.floor(ROWS / 2);
  const cx = Math.floor(COLS / 2);
  const snake: Vec[] = [
    { x: cx, y: cy },
    { x: cx - 1, y: cy },
    { x: cx - 2, y: cy },
  ];
  const g: Game = {
    status,
    difficulty,
    snake,
    prev: snake.map((p) => ({ ...p })),
    dir: { x: 1, y: 0 },
    queue: [],
    food: { x: cx + 5, y: cy },
    bonus: null,
    eaten: 0,
    score: 0,
    interval: DIFFICULTY_MAP[difficulty].base,
    acc: 0,
    time: 0,
    shake: 0,
    flash: 0,
    particles: [],
    popups: [],
  };
  g.food = freeCell(g);
  return g;
}

function occupied(g: Game, x: number, y: number): boolean {
  if (g.snake.some((s) => s.x === x && s.y === y)) return true;
  if (g.food.x === x && g.food.y === y) return true;
  if (g.bonus && g.bonus.pos.x === x && g.bonus.pos.y === y) return true;
  return false;
}

function freeCell(g: Game): Vec {
  for (let tries = 0; tries < 400; tries++) {
    const x = rnd(COLS);
    const y = rnd(ROWS);
    if (!occupied(g, x, y)) return { x, y };
  }
  for (let y = 0; y < ROWS; y++)
    for (let x = 0; x < COLS; x++) if (!occupied(g, x, y)) return { x, y };
  return { x: 0, y: 0 };
}

/** Поставить направление в очередь (макс. 3 поворота вперёд). */
export function enqueueDir(g: Game, d: Vec) {
  if (g.status !== "playing") return;
  const last = g.queue.length ? g.queue[g.queue.length - 1] : g.dir;
  if (d.x === -last.x && d.y === -last.y) return;
  if (d.x === last.x && d.y === last.y) return;
  if (g.queue.length < 3) g.queue.push({ ...d });
}

function burst(
  g: Game,
  x: number,
  y: number,
  colors: string[],
  count: number,
  speed = 4,
) {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const v = (0.6 + Math.random()) * speed;
    g.particles.push({
      x,
      y,
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v,
      life: 0.55 + Math.random() * 0.4,
      max: 0.95,
      size: 0.1 + Math.random() * 0.16,
      color: colors[rnd(colors.length)],
    });
  }
}

function popup(g: Game, x: number, y: number, text: string, color: string) {
  g.popups.push({ x, y, text, color, life: 0.9, max: 0.9 });
}

function kill(g: Game) {
  g.status = "over";
  g.shake = 15;
  g.flash = 1;
  const head = g.snake[0];
  burst(g, head.x, head.y, ["#ff6f61", "#ffd166", "#eaf7ee", "#ff5348"], 34, 5.5);
}

/** Один логический тик змейки. */
export function stepGame(g: Game): StepEvents {
  const ev: StepEvents = { ateFood: false, ateBonus: false, died: false };
  g.prev = g.snake.map((p) => ({ ...p }));

  const d = g.queue.shift() ?? g.dir;
  g.dir = d;
  const head: Vec = { x: g.snake[0].x + d.x, y: g.snake[0].y + d.y };

  // стены
  if (head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS) {
    kill(g);
    return { ...ev, died: true };
  }

  const ateFood = head.x === g.food.x && head.y === g.food.y;
  const ateBonus = !!g.bonus && head.x === g.bonus.pos.x && head.y === g.bonus.pos.y;
  const grow = ateFood || ateBonus;

  // своё тело (хвост успевает уползти, если не растём)
  const body = grow ? g.snake : g.snake.slice(0, -1);
  if (body.some((s) => s.x === head.x && s.y === head.y)) {
    kill(g);
    return { ...ev, died: true };
  }

  g.snake = [head, ...body];

  const diff = DIFFICULTY_MAP[g.difficulty];

  if (ateFood) {
    g.eaten += 1;
    g.score += POINTS_FOOD;
    g.interval = Math.max(diff.min, diff.base - g.eaten * diff.accel);
    popup(g, head.x, head.y, `+${POINTS_FOOD}`, "#d3ff7a");
    burst(g, head.x, head.y, ["#ff6f61", "#ff8f7e", "#ffd166"], 14);
    g.food = freeCell(g);
    if (g.eaten % BONUS_EVERY === 0 && !g.bonus) {
      g.bonus = { pos: freeCell(g), deadline: g.time + BONUS_TTL };
    }
  }

  if (ateBonus && g.bonus) {
    g.score += POINTS_BONUS;
    popup(g, head.x, head.y, `+${POINTS_BONUS}`, "#ffd166");
    burst(g, head.x, head.y, ["#ffd166", "#ffe08a", "#fff3c4", "#a3ec39"], 26, 5);
    g.bonus = null;
  }

  return { ...ev, ateFood, ateBonus };
}

/** Обновление частиц, тряски и всплывающих очков. dt — секунды. */
export function updateFx(g: Game, dt: number) {
  if (g.shake > 0) g.shake = Math.max(0, g.shake - dt * 34);
  if (g.flash > 0) g.flash = Math.max(0, g.flash - dt * 2.4);

  for (let i = g.particles.length - 1; i >= 0; i--) {
    const p = g.particles[i];
    p.life -= dt;
    if (p.life <= 0) {
      g.particles.splice(i, 1);
      continue;
    }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= 0.92;
    p.vy = p.vy * 0.92 + 2.5 * dt;
  }

  for (let i = g.popups.length - 1; i >= 0; i--) {
    const p = g.popups[i];
    p.life -= dt;
    if (p.life <= 0) {
      g.popups.splice(i, 1);
      continue;
    }
    p.y -= dt * 1.6;
  }
}

export function celebrateRecord(g: Game) {
  for (let i = 0; i < 3; i++) {
    burst(
      g,
      3 + Math.random() * (COLS - 6),
      2 + Math.random() * 5,
      ["#ffd166", "#a3ec39", "#ff6f61", "#eaf7ee", "#ffe08a"],
      26,
      6,
    );
  }
}
