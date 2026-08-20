import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 18, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const IconPlay = (p: IconProps) => (
  <Svg {...p}>
    <path d="M7 4.5v15l12-7.5L7 4.5Z" fill="currentColor" stroke="none" />
  </Svg>
);

export const IconPause = (p: IconProps) => (
  <Svg {...p}>
    <rect x="6" y="4.5" width="4" height="15" rx="1.2" fill="currentColor" stroke="none" />
    <rect x="14" y="4.5" width="4" height="15" rx="1.2" fill="currentColor" stroke="none" />
  </Svg>
);

export const IconRestart = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 12a9 9 0 1 0 2.6-6.3" />
    <path d="M3 4v5h5" />
  </Svg>
);

export const IconHome = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 11.5 12 4l9 7.5" />
    <path d="M5.5 10v9.5h13V10" />
  </Svg>
);

export const IconVolume = (p: IconProps) => (
  <Svg {...p}>
    <path d="M11 5 6.5 9H3v6h3.5L11 19V5Z" fill="currentColor" stroke="none" />
    <path d="M15 9.5a4 4 0 0 1 0 5" />
    <path d="M17.5 7a7.5 7.5 0 0 1 0 10" />
  </Svg>
);

export const IconMute = (p: IconProps) => (
  <Svg {...p}>
    <path d="M11 5 6.5 9H3v6h3.5L11 19V5Z" fill="currentColor" stroke="none" />
    <path d="m15.5 9.5 5 5M20.5 9.5l-5 5" />
  </Svg>
);

export const IconTrophy = (p: IconProps) => (
  <Svg {...p}>
    <path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" />
    <path d="M8 5H4.5v1.5A3.5 3.5 0 0 0 8 10M16 5h3.5v1.5A3.5 3.5 0 0 1 16 10" />
    <path d="M12 13v3.5M8.5 20h7M10 16.5h4V20h-4v-3.5Z" />
  </Svg>
);

export const IconBolt = (p: IconProps) => (
  <Svg {...p}>
    <path d="M13 2 4.5 13.5H11L9.5 22 19 10h-6.5L13 2Z" fill="currentColor" stroke="none" />
  </Svg>
);

export const IconApple = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 7.5c-3.6-2-7 .8-7 4.6 0 3.4 2.6 7.4 4.8 7.4 1 0 1.4-.6 2.2-.6s1.2.6 2.2.6c2.2 0 4.8-4 4.8-7.4 0-3.8-3.4-6.6-7-4.6Z" fill="currentColor" stroke="none" />
    <path d="M12 7.5c0-2 1-3.5 3-4" />
  </Svg>
);

export const IconRuler = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="5" cy="12" r="2" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
    <circle cx="19" cy="12" r="2" fill="currentColor" stroke="none" />
    <path d="M7 12h3M14 12h3" />
  </Svg>
);

export const IconChevron = ({ dir, ...p }: IconProps & { dir: "up" | "down" | "left" | "right" }) => {
  const rot = { up: 0, right: 90, down: 180, left: 270 }[dir];
  return (
    <Svg {...p} style={{ transform: `rotate(${rot}deg)`, ...p.style }}>
      <path d="m5 14.5 7-7 7 7" />
    </Svg>
  );
};

export const IconKeyboard = (p: IconProps) => (
  <Svg {...p}>
    <rect x="2.5" y="6" width="19" height="12" rx="2" />
    <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h.01M18 14h.01M9 14h6" />
  </Svg>
);

export const IconSwipe = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9 11.5V5a1.8 1.8 0 0 1 3.6 0v6" />
    <path d="M12.6 11.8V9.4a1.7 1.7 0 0 1 3.4.3v2.6a1.6 1.6 0 0 1 3.1.7c0 4.6-1.7 8.5-6.4 8.5-3.6 0-4.6-1.6-6.9-5.3-.5-.9-.1-2 .8-2.4.8-.4 1.7 0 2.4.9l1 1.2" />
    <path d="M6.5 5.5 9 3l2.5 2.5" />
  </Svg>
);

/** Фирменный знак — ползущая змейка. */
export function SnakeMark({ size = 64, animate = true }: { size?: number; animate?: boolean }) {
  return (
    <svg
      width={size}
      height={size * 0.58}
      viewBox="0 0 124 72"
      fill="none"
      aria-hidden="true"
      style={animate ? { animation: "bob 4.5s ease-in-out infinite" } : undefined}
    >
      <defs>
        <linearGradient id="snake-body" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#2f8f52" />
          <stop offset="0.6" stopColor="#5ec95e" />
          <stop offset="1" stopColor="#c8fa62" />
        </linearGradient>
      </defs>
      <path
        d="M12 56c0-10 8-18 18-18h44c8 0 14-6 14-14"
        stroke="url(#snake-body)"
        strokeWidth="14"
        strokeLinecap="round"
        pathLength={260}
        strokeDasharray="260"
        style={animate ? { animation: "crawl 3.4s ease-in-out infinite alternate" } : undefined}
      />
      <circle cx="88" cy="22" r="11" fill="#c8fa62" />
      <circle cx="85" cy="19" r="2.6" fill="#07130c" />
      <circle cx="93" cy="19" r="2.6" fill="#07130c" />
      <path d="M96 27c2 2 5 2 6 0" stroke="#07130c" strokeWidth="2" strokeLinecap="round" />
      <circle cx="110" cy="52" r="9" fill="#ff5348" />
      <circle cx="107" cy="49" r="2.4" fill="rgba(255,255,255,0.55)" />
      <path d="M110 43c0-3 1.5-4.5 4-5" stroke="#7bd88f" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
