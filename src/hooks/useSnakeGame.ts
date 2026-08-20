import { useCallback, useEffect, useRef, useState } from "react";
import { SoundKit } from "../game/audio";
import {
  COLS,
  DIFFICULTY_MAP,
  DIRS,
  loadMuted,
  loadRecords,
  saveMuted,
  saveRecord,
  type DifficultyId,
  type Records,
  type Status,
  type Vec,
} from "../game/constants";
import {
  celebrateRecord,
  createGame,
  enqueueDir,
  stepGame,
  updateFx,
  type Game,
} from "../game/engine";
import { draw } from "../game/render";

export interface UiState {
  status: Status;
  score: number;
  records: Records;
  record: number;
  difficulty: DifficultyId;
  eaten: number;
  length: number;
  speed: number;
  newRecord: boolean;
  muted: boolean;
}

export function useSnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Game>(createGame("normal"));
  const [sound] = useState(() => new SoundKit());

  const [ui, setUi] = useState<UiState>(() => {
    const records = loadRecords();
    return {
      status: "menu",
      score: 0,
      records,
      record: records.normal,
      difficulty: "normal",
      eaten: 0,
      length: 3,
      speed: 1,
      newRecord: false,
      muted: loadMuted(),
    };
  });

  useEffect(() => {
    sound.muted = ui.muted;
  }, [sound, ui.muted]);

  const syncUi = useCallback((extra?: Partial<UiState>) => {
    const g = gameRef.current;
    const records = loadRecords();
    setUi((prev) => ({
      ...prev,
      status: g.status,
      score: g.score,
      records,
      record: records[g.difficulty],
      difficulty: g.difficulty,
      eaten: g.eaten,
      length: g.snake.length,
      speed: DIFFICULTY_MAP[g.difficulty].base / g.interval,
      ...extra,
    }));
  }, []);

  /* ---------- действия ---------- */

  const start = useCallback(() => {
    const g = gameRef.current;
    gameRef.current = createGame(g.difficulty, "playing");
    sound.unlock();
    sound.start();
    syncUi({ newRecord: false });
  }, [sound, syncUi]);

  const restart = useCallback(() => {
    if (gameRef.current.status !== "menu") start();
  }, [start]);

  const toMenu = useCallback(() => {
    gameRef.current = createGame(gameRef.current.difficulty, "menu");
    syncUi({ newRecord: false });
  }, [syncUi]);

  const pause = useCallback(() => {
    const g = gameRef.current;
    if (g.status === "playing") {
      g.status = "paused";
      g.acc = 0;
      sound.pause();
      syncUi();
    }
  }, [sound, syncUi]);

  const resume = useCallback(() => {
    const g = gameRef.current;
    if (g.status === "paused") {
      g.status = "playing";
      sound.resume();
      syncUi();
    }
  }, [sound, syncUi]);

  const togglePause = useCallback(() => {
    if (gameRef.current.status === "playing") pause();
    else resume();
  }, [pause, resume]);

  const setDifficulty = useCallback(
    (id: DifficultyId) => {
      if (gameRef.current.status === "playing") return;
      gameRef.current = createGame(id, "menu");
      syncUi({ newRecord: false });
    },
    [syncUi],
  );

  const steer = useCallback(
    (d: Vec) => {
      const g = gameRef.current;
      if (g.status === "menu") {
        start();
        enqueueDir(gameRef.current, d);
      } else {
        enqueueDir(g, d);
      }
    },
    [start],
  );

  const tapBoard = useCallback(() => {
    const s = gameRef.current.status;
    if (s === "playing") pause();
    else if (s === "paused") resume();
    else if (s === "menu") start();
  }, [pause, resume, start]);

  const toggleMute = useCallback(() => {
    setUi((prev) => {
      const muted = !prev.muted;
      sound.muted = muted;
      saveMuted(muted);
      return { ...prev, muted };
    });
  }, [sound]);

  /* ---------- игровой цикл ---------- */

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let cell = 20;
    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const side = Math.max(180, Math.floor(Math.min(rect.width, rect.height)));
      cell = Math.max(8, Math.floor(side / COLS));
      const px = cell * COLS;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(px * dpr);
      canvas.height = Math.round(px * dpr);
      canvas.style.width = `${px}px`;
      canvas.style.height = `${px}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const handleDeath = (g: Game) => {
      const before = loadRecords();
      const isNew = g.score > 0 && g.score > before[g.difficulty];
      if (isNew) {
        saveRecord(g.difficulty, g.score);
        celebrateRecord(g);
      }
      sound.die();
      if (isNew) setTimeout(() => sound.bonus(), 350);
      syncUi({ newRecord: isNew });
    };

    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const g = gameRef.current;

      if (g.status === "playing") {
        g.time += dt * 1000;
        if (g.bonus && g.time > g.bonus.deadline) g.bonus = null;
        g.acc += dt * 1000;
        while (g.acc >= g.interval && g.status === "playing") {
          g.acc -= g.interval;
          const ev = stepGame(g);
          if (ev.died) {
            handleDeath(g);
            break;
          }
          if (ev.ateFood) sound.eat();
          if (ev.ateBonus) sound.bonus();
          if (ev.ateFood || ev.ateBonus) syncUi();
        }
      }

      updateFx(g, dt);
      draw(ctx, g, cell, now);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const onVisibility = () => {
      const g = gameRef.current;
      if (document.hidden && g.status === "playing") {
        g.status = "paused";
        g.acc = 0;
        sound.pause();
        syncUi();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [sound, syncUi]);

  /* ---------- клавиатура ---------- */

  useEffect(() => {
    const dirMap: Record<string, Vec> = {
      ArrowUp: DIRS.up,
      KeyW: DIRS.up,
      ArrowDown: DIRS.down,
      KeyS: DIRS.down,
      ArrowLeft: DIRS.left,
      KeyA: DIRS.left,
      ArrowRight: DIRS.right,
      KeyD: DIRS.right,
    };
    const onKey = (e: KeyboardEvent) => {
      const g = gameRef.current;
      const d = dirMap[e.code];
      if (d) {
        e.preventDefault();
        steer(d);
        return;
      }
      switch (e.code) {
        case "Space":
          e.preventDefault();
          if (g.status === "menu" || g.status === "over") start();
          else togglePause();
          break;
        case "Enter":
          if (g.status === "menu" || g.status === "over") {
            e.preventDefault();
            start();
          }
          break;
        case "KeyR":
          if (g.status !== "menu") {
            e.preventDefault();
            start();
          }
          break;
        case "Escape":
          if (g.status === "playing") pause();
          else if (g.status === "paused") resume();
          else if (g.status === "over") toMenu();
          break;
        case "KeyM":
          toggleMute();
          break;
        case "Digit1":
          if (g.status === "menu") setDifficulty("easy");
          break;
        case "Digit2":
          if (g.status === "menu") setDifficulty("normal");
          break;
        case "Digit3":
          if (g.status === "menu") setDifficulty("hard");
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [steer, start, togglePause, pause, resume, toMenu, toggleMute, setDifficulty]);

  return {
    canvasRef,
    wrapRef,
    ui,
    start,
    restart,
    toMenu,
    pause,
    resume,
    togglePause,
    setDifficulty,
    steer,
    tapBoard,
    toggleMute,
  };
}
