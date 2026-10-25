import { BadgeCheck } from "lucide-react";

const HEX = "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)";

function Hex({ code, name, size, tone, className = "", delay = 0 }: {
  code: string; name: string; size: number; tone: string; className?: string; delay?: number;
}) {
  return (
    <div className={`float-y absolute drop-shadow-[0_18px_30px_rgba(3,10,30,0.55)] ${className}`} style={{ animationDelay: `${delay}ms` }}>
      <div className="grid place-items-center bg-gradient-to-b from-[#f5d77a] via-[#d4a63c] to-[#a8781c] p-[5px]" style={{ width: size, height: size * 1.1, clipPath: HEX }}>
        <div
          className="flex h-full w-full flex-col items-center justify-center pb-[12%] text-center text-white"
          style={{ clipPath: HEX, background: tone }}
        >
          <span className="font-semibold uppercase leading-tight tracking-[0.16em] text-white/80" style={{ fontSize: size * 0.05 }}>
            Microsoft
            <br />
            Certified
          </span>
          <span className="mt-1 font-extrabold leading-none" style={{ fontSize: size * 0.2 }}>{code}</span>
          <span className="mt-1.5 max-w-[70%] font-medium leading-tight text-white/90" style={{ fontSize: size * 0.065 }}>{name}</span>
        </div>
      </div>
      <div
        className="absolute left-1/2 -translate-x-1/2 rounded-md bg-gradient-to-b from-[#f5d77a] to-[#c8952e] px-3 py-1 font-bold uppercase tracking-[0.14em] text-[#3a2a06] shadow-md"
        style={{ bottom: size * 0.1, fontSize: Math.max(9, size * 0.055) }}
      >
        Fundamentals
      </div>
    </div>
  );
}

function Stamp() {
  const text = "GET MICROSOFT CERTIFIED • EXPERT TRAINING • ";
  return (
    <div className="absolute grid h-[132px] w-[132px] place-items-center rounded-full bg-brand text-white shadow-[0_16px_34px_-10px_rgba(255,122,26,0.7)] ring-4 ring-white/90">
      <svg viewBox="0 0 120 120" className="spin-slow absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <path id="stamp-circle" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" />
        </defs>
        <text fill="white" fontSize="9.6" fontWeight="700" letterSpacing="1.4">
          <textPath href="#stamp-circle">{text}</textPath>
        </text>
      </svg>
      <div className="grid place-items-center rounded-full border-2 border-dashed border-white/70 p-3">
        <BadgeCheck className="h-9 w-9" />
      </div>
    </div>
  );
}

/** Decorative badge cluster for the Microsoft Certifications hero slide (desktop only). */
export function CertBadges() {
  return (
    <div className="pointer-events-none absolute inset-y-0 left-[45%] hidden w-[300px] xl:block" aria-hidden>
      <div className="rise relative h-full" style={{ animationDelay: "200ms" }}>
        <Hex code="AI-901" name="Azure AI" size={190} tone="linear-gradient(160deg,#2b6cf0,#0b2a7a)" className="left-[40px] top-[90px]" />
        <Hex code="AZ-900" name="Azure" size={124} tone="linear-gradient(160deg,#1aa0e8,#0b4a8f)" className="left-[-30px] top-[30px]" delay={600} />
        <Hex code="AB-900" name="Copilot & Agents" size={124} tone="linear-gradient(160deg,#7b4dff,#3a1a9a)" className="left-[175px] top-[272px]" delay={1200} />
        <div className="absolute left-[-20px] top-[290px]">
          <Stamp />
        </div>
      </div>
    </div>
  );
}
