import type { CSSProperties } from "react";

interface Fly {
  left: string;
  top: string;
  size: number;
  color: string;
  delay: string;
  dur: string;
  dx: string;
  dy: string;
  op: number;
}

const FLIES: Fly[] = [
  { left: "8%", top: "22%", size: 5, color: "#b9f656", delay: "0s", dur: "14s", dx: "46px", dy: "-60px", op: 0.5 },
  { left: "16%", top: "70%", size: 4, color: "#ffd166", delay: "-3s", dur: "17s", dx: "-38px", dy: "-70px", op: 0.4 },
  { left: "28%", top: "38%", size: 3, color: "#8fd98f", delay: "-6s", dur: "12s", dx: "60px", dy: "40px", op: 0.45 },
  { left: "72%", top: "18%", size: 5, color: "#b9f656", delay: "-2s", dur: "16s", dx: "-50px", dy: "55px", op: 0.5 },
  { left: "84%", top: "58%", size: 4, color: "#ff8f7e", delay: "-8s", dur: "19s", dx: "36px", dy: "-64px", op: 0.35 },
  { left: "62%", top: "80%", size: 3, color: "#ffd166", delay: "-5s", dur: "13s", dx: "-56px", dy: "-46px", op: 0.4 },
  { left: "44%", top: "12%", size: 4, color: "#8fd98f", delay: "-10s", dur: "18s", dx: "44px", dy: "50px", op: 0.45 },
  { left: "92%", top: "32%", size: 3, color: "#b9f656", delay: "-1s", dur: "15s", dx: "-40px", dy: "62px", op: 0.4 },
  { left: "6%", top: "48%", size: 4, color: "#ffe08a", delay: "-12s", dur: "20s", dx: "52px", dy: "-40px", op: 0.35 },
  { left: "55%", top: "55%", size: 3, color: "#b9f656", delay: "-7s", dur: "14s", dx: "-46px", dy: "-58px", op: 0.3 },
];

/** Многослойный живой фон: свечения, сетка, светлячки, виньетка. */
export function Ambient() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(900px 620px at 12% -10%, rgba(163,236,57,0.10), transparent 60%)," +
            "radial-gradient(820px 620px at 106% 12%, rgba(255,209,102,0.08), transparent 55%)," +
            "radial-gradient(1000px 720px at 50% 118%, rgba(38,100,68,0.22), transparent 62%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(234,247,238,0.035) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(234,247,238,0.035) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse 90% 80% at 50% 42%, black 30%, transparent 78%)",
          WebkitMaskImage: "radial-gradient(ellipse 90% 80% at 50% 42%, black 30%, transparent 78%)",
        }}
      />
      {FLIES.map((f, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={
            {
              left: f.left,
              top: f.top,
              width: f.size,
              height: f.size,
              background: f.color,
              boxShadow: `0 0 ${f.size * 3}px ${f.color}`,
              opacity: 0,
              animation: `firefly ${f.dur} linear ${f.delay} infinite`,
              "--fly-dx": f.dx,
              "--fly-dy": f.dy,
              "--fly-op": f.op,
            } as CSSProperties
          }
        />
      ))}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 52%, rgba(3,8,5,0.75) 100%)",
        }}
      />
    </div>
  );
}
