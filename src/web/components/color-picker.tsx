import { useEffect, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { Check } from "lucide-react";

const PRESETS = [
  "#0B1F4B", "#1E293B", "#111827", "#14532D", "#7F1D1D", "#4C1D95",
  "#1E4FD8", "#2563EB", "#0891B2", "#059669", "#7C3AED", "#DB2777",
  "#FF7A1A", "#F59E0B", "#EF4444", "#22C55E", "#E11D48", "#0EA5E9",
];

const isHex = (v: string) => /^#[0-9a-f]{6}$/i.test(v);

/** Colour swatch that opens a small popover. Picking a preset closes it; Done / outside click / Esc also close. */
export function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [hex, setHex] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHex(value);
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pick = (v: string, close = false) => {
    onChange(v.toUpperCase());
    if (close) setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center gap-2 rounded-xl border border-line bg-surface p-1.5">
        <button
          type="button"
          aria-label={`${label} picker`}
          onClick={() => setOpen((o) => !o)}
          className="h-9 w-11 shrink-0 cursor-pointer rounded-lg ring-1 ring-black/10"
          style={{ background: value }}
        />
        <input
          aria-label={`${label} hex`}
          className="w-full bg-transparent font-mono text-[14px] uppercase text-navy outline-none"
          value={hex}
          maxLength={7}
          onChange={(e) => {
            const v = e.target.value.startsWith("#") ? e.target.value : `#${e.target.value}`;
            setHex(v);
            if (isHex(v)) pick(v);
          }}
          onBlur={() => setHex(value)}
        />
      </div>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-2 w-[248px] rounded-2xl border border-line bg-white p-3 shadow-[0_20px_40px_-16px_rgba(15,23,42,0.35)]">
          <HexColorPicker color={value} onChange={(v) => pick(v)} style={{ width: "100%", height: 150 }} />
          <div className="mt-3 grid grid-cols-6 gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                aria-label={`Use ${p}`}
                onClick={() => pick(p, true)}
                className="grid aspect-square place-items-center rounded-md ring-1 ring-black/10 transition hover:scale-110"
                style={{ background: p }}
              >
                {p.toUpperCase() === value.toUpperCase() && <Check className="h-3.5 w-3.5 text-white drop-shadow" />}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-3 w-full rounded-lg bg-slate-900 py-2 text-[13px] font-semibold text-white hover:bg-slate-800"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}
