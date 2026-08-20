import type { ReactNode } from "react";
import { DIRS, type Status, type Vec } from "../game/constants";
import { IconChevron, IconPause, IconPlay, IconRestart } from "./Icons";

interface Props {
  status: Status;
  steer: (d: Vec) => void;
  center: () => void;
}

function PadBtn({
  onPress,
  children,
  label,
  className = "",
}: {
  onPress: () => void;
  children: ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`pad-btn h-14 w-14 sm:h-16 sm:w-16 ${className}`}
      onPointerDown={(e) => {
        e.preventDefault();
        onPress();
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {children}
    </button>
  );
}

/** Экранный крестовидный пульт для сенсорных устройств. */
export function TouchPad({ status, steer, center }: Props) {
  return (
    <div className="mx-auto grid w-fit select-none grid-cols-3 gap-2">
      <span />
      <PadBtn label="Вверх" onPress={() => steer(DIRS.up)}>
        <IconChevron dir="up" size={26} />
      </PadBtn>
      <span />
      <PadBtn label="Влево" onPress={() => steer(DIRS.left)}>
        <IconChevron dir="left" size={26} />
      </PadBtn>
      <PadBtn
        label={status === "playing" ? "Пауза" : "Продолжить"}
        onPress={center}
        className="!border-lime-600/50 !bg-pine-700 text-lime-300"
      >
        {status === "playing" ? (
          <IconPause size={22} />
        ) : status === "over" ? (
          <IconRestart size={22} />
        ) : (
          <IconPlay size={22} />
        )}
      </PadBtn>
      <PadBtn label="Вправо" onPress={() => steer(DIRS.right)}>
        <IconChevron dir="right" size={26} />
      </PadBtn>
      <span />
      <PadBtn label="Вниз" onPress={() => steer(DIRS.down)}>
        <IconChevron dir="down" size={26} />
      </PadBtn>
      <span />
    </div>
  );
}
