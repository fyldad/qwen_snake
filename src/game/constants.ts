export const COLS = 21;
export const ROWS = 21;

export type Vec = { x: number; y: number };
export type Status = "menu" | "playing" | "paused" | "over";
export type DifficultyId = "easy" | "normal" | "hard";

export interface Difficulty {
  id: DifficultyId;
  label: string;
  tag: string;
  /** стартовый интервал тика, мс */
  base: number;
  /** минимальный интервал тика, мс */
  min: number;
  /** ускорение за каждое съеденное яблоко, мс */
  accel: number;
  /** цветовой акцент сложности */
  hue: string;
}

export const DIFFICULTIES: Difficulty[] = [
  {
    id: "easy",
    label: "Легко",
    tag: "Спокойный темп, чтобы размяться",
    base: 190,
    min: 118,
    accel: 3.4,
    hue: "#8fd98f",
  },
  {
    id: "normal",
    label: "Средне",
    tag: "Классическая скорость змейки",
    base: 134,
    min: 80,
    accel: 2.8,
    hue: "#ffd166",
  },
  {
    id: "hard",
    label: "Сложно",
    tag: "Тут решает реакция и хладнокровие",
    base: 96,
    min: 58,
    accel: 2.2,
    hue: "#ff6f61",
  },
];

export const DIFFICULTY_MAP: Record<DifficultyId, Difficulty> = {
  easy: DIFFICULTIES[0],
  normal: DIFFICULTIES[1],
  hard: DIFFICULTIES[2],
};

export const DIRS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
} as const;

export const POINTS_FOOD = 10;
export const POINTS_BONUS = 50;
export const BONUS_TTL = 6500;
export const BONUS_EVERY = 5;

/* ---------- рекорды в localStorage ---------- */

const RECORDS_KEY = "snake.records.v1";

export type Records = Record<DifficultyId, number>;

export function loadRecords(): Records {
  const fallback: Records = { easy: 0, normal: 0, hard: 0 };
  try {
    const raw = localStorage.getItem(RECORDS_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<Records>;
    return {
      easy: Number(parsed.easy) || 0,
      normal: Number(parsed.normal) || 0,
      hard: Number(parsed.hard) || 0,
    };
  } catch {
    return fallback;
  }
}

export function saveRecord(id: DifficultyId, score: number): Records {
  const records = loadRecords();
  if (score > records[id]) {
    records[id] = score;
    try {
      localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
    } catch {
      /* приватный режим — просто не сохраняем */
    }
  }
  return records;
}

const MUTE_KEY = "snake.muted.v1";

export function loadMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

export function saveMuted(muted: boolean) {
  try {
    localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
  } catch {
    /* noop */
  }
}
