import type { ReactNode } from "react";
import { DIFFICULTIES, type DifficultyId } from "../game/constants";
import type { UiState } from "../hooks/useSnakeGame";
import {
  IconHome,
  IconKeyboard,
  IconPlay,
  IconRestart,
  IconSwipe,
  IconTrophy,
  SnakeMark,
} from "./Icons";

interface OverlayProps {
  ui: UiState;
  start: () => void;
  resume: () => void;
  restart: () => void;
  toMenu: () => void;
  setDifficulty: (id: DifficultyId) => void;
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div
      className="absolute inset-0 z-20 flex overflow-y-auto bg-pine-950/85 backdrop-blur-[7px]"
      style={{ animation: "fade-in 0.25s ease both" }}
    >
      <div
        className="m-auto w-full max-w-sm px-5 py-6 text-center"
        style={{ animation: "rise-in 0.42s cubic-bezier(0.2, 1.4, 0.4, 1) both" }}
      >
        {children}
      </div>
    </div>
  );
}

/* ---------------- МЕНЮ ---------------- */

export function MenuOverlay({ ui, start, setDifficulty }: OverlayProps) {
  return (
    <Shell>
      <div className="flex justify-center">
        <SnakeMark size={110} />
      </div>
      <h1 className="mt-1 font-display text-[34px] font-black leading-none tracking-wide text-lime-300">
        ЗМЕЙКА
      </h1>
      <p className="mx-auto mt-2 max-w-[300px] text-[13px] leading-relaxed text-mint-400">
        Собирай яблоки, расти и не врезайся в стены и собственный хвост. Каждые 5 яблок — золотое,
        оно дороже, но тает на глазах.
      </p>

      <div className="mt-5 space-y-2 text-left">
        {DIFFICULTIES.map((d, i) => {
          const selected = ui.difficulty === d.id;
          return (
            <button
              key={d.id}
              onClick={() => setDifficulty(d.id)}
              className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border px-4 py-2.5 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-400 ${
                selected
                  ? "border-lime-400/70 bg-pine-700/90 shadow-[0_8px_28px_-12px_rgba(163,236,57,0.45)]"
                  : "border-pine-600 bg-pine-800/60 hover:border-pine-500 hover:bg-pine-800"
              }`}
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: d.hue, boxShadow: `0 0 10px ${d.hue}` }}
              />
              <span className="min-w-0 flex-1">
                <span className="block font-body text-sm font-extrabold text-mint-100">
                  {d.label}
                  <span className="ml-2 text-[10px] font-bold text-mint-500">клавиша {i + 1}</span>
                </span>
                <span className="block truncate text-[11px] text-mint-400">{d.tag}</span>
              </span>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-pine-600 bg-pine-900/70 px-2.5 py-1 text-[11px] font-extrabold text-gold-300">
                <IconTrophy size={12} />
                {ui.records[d.id]}
              </span>
            </button>
          );
        })}
      </div>

      <button onClick={start} className="btn-primary mt-5 w-full rounded-xl px-6 py-3.5 text-base">
        <IconPlay size={18} />
        Играть
        <span className="kbd ml-1 !border-lime-600/50 !bg-pine-900/25 !text-pine-900 !shadow-none">
          Enter
        </span>
      </button>

      <div className="mt-4 flex items-center justify-center gap-4 text-[11px] font-semibold text-mint-500">
        <span className="inline-flex items-center gap-1.5">
          <IconKeyboard size={14} className="text-mint-400" />
          Стрелки / WASD
        </span>
        <span className="h-3 w-px bg-pine-600" />
        <span className="inline-flex items-center gap-1.5">
          <IconSwipe size={14} className="text-mint-400" />
          Свайпы по полю
        </span>
      </div>
    </Shell>
  );
}

/* ---------------- ПАУЗА ---------------- */

export function PauseOverlay({ ui, resume, restart, toMenu }: OverlayProps) {
  return (
    <Shell>
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-pine-600 bg-pine-800 text-gold-300 shadow-[0_0_40px_-8px_rgba(255,209,102,0.35)]">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <rect x="6" y="4.5" width="4" height="15" rx="1.2" />
          <rect x="14" y="4.5" width="4" height="15" rx="1.2" />
        </svg>
      </div>
      <h2 className="mt-4 font-display text-3xl font-black tracking-wide text-mint-100">ПАУЗА</h2>
      <p className="mt-2 text-[13px] text-mint-400">Змейка замерла и ждёт. Счёт: {ui.score}</p>

      <div className="mt-6 space-y-2.5">
        <button onClick={resume} className="btn-primary w-full px-6 py-3 text-sm">
          <IconPlay size={16} />
          Продолжить
          <span className="kbd ml-1 !border-lime-600/50 !bg-pine-900/25 !text-pine-900 !shadow-none">
            Space
          </span>
        </button>
        <div className="flex gap-2.5">
          <button onClick={restart} className="btn-ghost flex-1 px-4 py-2.5 text-sm">
            <IconRestart size={15} />
            Заново
          </button>
          <button onClick={toMenu} className="btn-ghost flex-1 px-4 py-2.5 text-sm">
            <IconHome size={15} />
            В меню
          </button>
        </div>
      </div>
    </Shell>
  );
}

/* ---------------- ФИНАЛ ---------------- */

export function GameOverOverlay({ ui, start, toMenu }: OverlayProps) {
  return (
    <Shell>
      <p
        className="font-display text-xs font-bold tracking-[0.35em] text-coral-300"
        style={{ animation: "fade-in 0.3s ease 0.15s both" }}
      >
        ИГРА ОКОНЧЕНА
      </p>

      <div
        className="stat-num mt-3 text-6xl font-black text-mint-100"
        style={{ animationDelay: "0.1s", fontSize: "3.6rem" }}
        key={ui.score}
      >
        {ui.score}
      </div>
      <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-mint-500">очков</p>

      {ui.newRecord ? (
        <div
          className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full border border-gold-400/70 bg-gold-400/15 px-4 py-1.5 text-sm font-extrabold text-gold-300"
          style={{ animation: "badge-pulse 1.4s ease-in-out infinite" }}
        >
          <IconTrophy size={16} />
          Новый рекорд!
        </div>
      ) : (
        <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-mint-300">
          <IconTrophy size={15} className="text-gold-400" />
          Рекорд на «{labelOf(ui.difficulty)}»: {ui.record}
        </p>
      )}

      <div className="mt-5 flex items-center justify-center gap-2">
        <StatChip label="Яблоки" value={String(ui.eaten)} />
        <StatChip label="Длина" value={String(ui.length)} />
        <StatChip label="Темп" value={`×${ui.speed.toFixed(1)}`} />
      </div>

      <div className="mt-6 space-y-2.5">
        <button onClick={start} className="btn-primary w-full px-6 py-3 text-sm">
          <IconRestart size={16} />
          Ещё раз
          <span className="kbd ml-1 !border-lime-600/50 !bg-pine-900/25 !text-pine-900 !shadow-none">
            R
          </span>
        </button>
        <button onClick={toMenu} className="btn-ghost w-full px-6 py-2.5 text-sm">
          <IconHome size={15} />
          Сменить сложность
        </button>
      </div>
    </Shell>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-pine-600 bg-pine-800/80 px-3.5 py-2">
      <div className="font-display text-base font-bold text-lime-300">{value}</div>
      <div className="text-[10px] font-bold uppercase tracking-wider text-mint-500">{label}</div>
    </div>
  );
}

function labelOf(id: DifficultyId): string {
  return DIFFICULTIES.find((d) => d.id === id)?.label ?? "";
}
