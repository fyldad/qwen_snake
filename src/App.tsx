import { useEffect, useRef, useState } from "react";
import { Ambient } from "./components/Ambient";
import {
  IconApple,
  IconBolt,
  IconMute,
  IconPause,
  IconPlay,
  IconRestart,
  IconRuler,
  IconTrophy,
  IconVolume,
  SnakeMark,
} from "./components/Icons";
import { GameOverOverlay, MenuOverlay, PauseOverlay } from "./components/Overlays";
import { TouchPad } from "./components/TouchPad";
import { DIFFICULTY_MAP, DIRS, type Vec } from "./game/constants";
import { useSnakeGame } from "./hooks/useSnakeGame";

const STATUS_LABEL: Record<string, string> = {
  menu: "Готова к игре",
  playing: "Игра идёт",
  paused: "Пауза",
  over: "Финал",
};

const STATUS_DOT: Record<string, string> = {
  menu: "#93bba2",
  playing: "#b9f656",
  paused: "#ffd166",
  over: "#ff6f61",
};

export default function App() {
  const {
    canvasRef,
    wrapRef,
    ui,
    start,
    restart,
    toMenu,
    resume,
    togglePause,
    setDifficulty,
    steer,
    tapBoard,
    toggleMute,
  } = useSnakeGame();

  const [isCoarse] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches,
  );
  const touch = useRef<{ x: number; y: number; moved: boolean } | null>(null);

  // Снимаем фокус с кнопок после клика мышью, чтобы Space/Enter не «нажимали» их повторно.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.detail === 0) return; // клавиатурный «клик» не трогаем
      const b = (e.target as HTMLElement | null)?.closest?.("button");
      b?.blur();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const diff = DIFFICULTY_MAP[ui.difficulty];

  return (
    <div className="relative flex min-h-dvh flex-col font-body text-mint-100">
      <Ambient />

      {/* ---------- шапка / HUD ---------- */}
      <header className="relative z-10 mx-auto flex w-full max-w-5xl flex-wrap items-center gap-x-4 gap-y-2.5 px-4 pb-2 pt-4 sm:pt-6">
        <div className="flex items-center gap-3">
          <SnakeMark size={44} animate={ui.status !== "playing"} />
          <div>
            <h1 className="font-display text-lg font-black leading-none tracking-wider text-lime-300">
              ЗМЕЙКА
            </h1>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-mint-500">
              аркада на canvas
            </p>
          </div>
          <span className="chip ml-1 hidden sm:inline-flex">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: diff.hue, boxShadow: `0 0 8px ${diff.hue}` }}
            />
            {diff.label}
          </span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="flex flex-col items-end rounded-xl border border-pine-600 bg-pine-800/80 px-3 py-1.5 sm:px-4">
            <span className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-mint-500">
              Счёт
            </span>
            <span key={ui.score} className="stat-num text-xl leading-tight text-lime-300 sm:text-2xl">
              {ui.score}
            </span>
          </div>
          <div className="flex flex-col items-end rounded-xl border border-gold-400/25 bg-pine-800/80 px-3 py-1.5 sm:px-4">
            <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-[0.18em] text-mint-500">
              <IconTrophy size={10} className="text-gold-400" />
              Рекорд
            </span>
            <span key={ui.record} className="stat-num text-xl leading-tight text-gold-300 sm:text-2xl">
              {ui.record}
            </span>
          </div>

          <div className="ml-1 flex items-center gap-1.5">
            <button
              className="icon-btn"
              onClick={togglePause}
              aria-label={ui.status === "playing" ? "Пауза" : "Продолжить"}
              title={ui.status === "playing" ? "Пауза (Space)" : "Продолжить (Space)"}
            >
              {ui.status === "playing" ? <IconPause size={17} /> : <IconPlay size={17} />}
            </button>
            <button
              className="icon-btn disabled:cursor-not-allowed disabled:opacity-40"
              onClick={restart}
              disabled={ui.status === "menu"}
              aria-label="Начать заново"
              title="Заново (R)"
            >
              <IconRestart size={17} />
            </button>
            <button
              className="icon-btn"
              onClick={toggleMute}
              aria-label={ui.muted ? "Включить звук" : "Выключить звук"}
              title="Звук (M)"
            >
              {ui.muted ? <IconMute size={17} /> : <IconVolume size={17} />}
            </button>
          </div>
        </div>
      </header>

      {/* ---------- игровое поле ---------- */}
      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center gap-3.5 px-4 pb-4">
        <div
          ref={wrapRef}
          className="board-shell relative aspect-square w-full max-w-[min(92vw,58vh,540px)] overflow-hidden rounded-[22px] border border-pine-700 bg-pine-900"
          onTouchStart={(e) => {
            const t = e.touches[0];
            touch.current = { x: t.clientX, y: t.clientY, moved: false };
          }}
          onTouchMove={(e) => {
            const st = touch.current;
            if (!st) return;
            const t = e.touches[0];
            const dx = t.clientX - st.x;
            const dy = t.clientY - st.y;
            if (Math.hypot(dx, dy) >= 26) {
              const d: Vec =
                Math.abs(dx) > Math.abs(dy)
                  ? dx > 0
                    ? DIRS.right
                    : DIRS.left
                  : dy > 0
                    ? DIRS.down
                    : DIRS.up;
              steer(d);
              touch.current = { x: t.clientX, y: t.clientY, moved: true };
            }
          }}
          onTouchEnd={(e) => {
            const st = touch.current;
            touch.current = null;
            const el = e.target as HTMLElement | null;
            if (el?.closest?.("button")) return; // тап по кнопке оверлея — не наш случай
            if (st && !st.moved) tapBoard();
          }}
        >
          <div className="flex h-full w-full items-center justify-center">
            <canvas ref={canvasRef} className="block" />
          </div>

          {ui.status === "menu" && (
            <MenuOverlay
              ui={ui}
              start={start}
              resume={resume}
              restart={restart}
              toMenu={toMenu}
              setDifficulty={setDifficulty}
            />
          )}
          {ui.status === "paused" && (
            <PauseOverlay
              ui={ui}
              start={start}
              resume={resume}
              restart={restart}
              toMenu={toMenu}
              setDifficulty={setDifficulty}
            />
          )}
          {ui.status === "over" && (
            <GameOverOverlay
              ui={ui}
              start={start}
              resume={resume}
              restart={restart}
              toMenu={toMenu}
              setDifficulty={setDifficulty}
            />
          )}
        </div>

        {/* ---------- строка состояния ---------- */}
        <div className="flex w-full max-w-[540px] flex-wrap items-center justify-center gap-2">
          <span className="chip">
            <IconRuler size={13} className="text-lime-400" />
            Длина {ui.length}
          </span>
          <span className="chip">
            <IconApple size={13} className="text-coral-400" />
            Яблоки {ui.eaten}
          </span>
          <span className="chip">
            <IconBolt size={13} className="text-gold-400" />
            Темп ×{ui.speed.toFixed(1)}
          </span>
          <span className="chip">
            <span
              className="h-2 w-2 rounded-full"
              style={{
                background: STATUS_DOT[ui.status],
                boxShadow: `0 0 8px ${STATUS_DOT[ui.status]}`,
                animation: ui.status === "playing" ? "hint-blink 1.2s ease-in-out infinite" : undefined,
              }}
            />
            {STATUS_LABEL[ui.status]}
          </span>
        </div>

        {isCoarse && (
          <TouchPad
            status={ui.status}
            steer={steer}
            center={() => (ui.status === "over" ? start() : tapBoard())}
          />
        )}
      </main>

      {/* ---------- подсказки ---------- */}
      <footer className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-5">
        <div className="hidden flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-pine-800 pt-4 text-[11px] font-semibold text-mint-400 md:flex">
          <span className="inline-flex items-center gap-1.5">
            <span className="kbd">←</span>
            <span className="kbd">↑</span>
            <span className="kbd">↓</span>
            <span className="kbd">→</span>
            <span className="text-mint-500">/</span>
            <span className="kbd">WASD</span>
            движение
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="kbd px-2.5">Space</span> пауза
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="kbd">R</span> заново
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="kbd">M</span> звук
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="kbd">1</span>
            <span className="kbd">2</span>
            <span className="kbd">3</span>
            сложность в меню
          </span>
        </div>
        <p className="mt-3 text-center text-[10px] font-semibold tracking-wide text-mint-500/80">
          Золотое яблоко даёт +50 очков и появляется каждые 5 обычных — но тает за 6,5 секунд.
          Рекорды сохраняются отдельно для каждой сложности.
        </p>
      </footer>
    </div>
  );
}
