import { useCallback, useEffect, useRef, useState } from "react";
import { ExternalLink, Laptop, Monitor, RefreshCw, Smartphone, Tablet } from "lucide-react";
import { AdminLayout } from "./layout";
import { CATEGORIES } from "../../lib/site";
import { useExtraLinks } from "../../components/content-ui";

/** Shows the live website inside the admin, at phone / tablet / laptop / desktop size. */
const DEVICES = [
  { id: "phone", label: "Phone", icon: Smartphone, width: 390, height: 780 },
  { id: "tablet", label: "Tablet", icon: Tablet, width: 820, height: 1080 },
  { id: "laptop", label: "Laptop", icon: Laptop, width: 1280, height: 800 },
  { id: "desktop", label: "Desktop", icon: Monitor, width: 1440, height: 900 },
] as const;
type DeviceId = (typeof DEVICES)[number]["id"];

const remember = (k: string, v?: string) => {
  try {
    if (v === undefined) return localStorage.getItem(k) ?? undefined;
    localStorage.setItem(k, v);
  } catch {
    /* storage not available */
  }
  return undefined;
};

export default function PreviewPage() {
  const extra = useExtraLinks();
  const pages = [
    { to: "/", label: "Home page" },
    ...CATEGORIES.map((c) => ({ to: `/services/${c.slug}`, label: `Services: ${c.title}` })),
    ...extra.map((l) => ({ to: l.to, label: l.label })),
    { to: "/contact", label: "Contact" },
  ];

  const [device, setDevice] = useState<DeviceId>(() => (remember("preview-device") as DeviceId) || "phone");
  const [path, setPath] = useState("/");
  const [custom, setCustom] = useState("");
  const [stamp, setStamp] = useState(() => Date.now());
  const [loading, setLoading] = useState(true);
  const [boxWidth, setBoxWidth] = useState(0);
  const observer = useRef<ResizeObserver | null>(null);
  // callback ref: works even if the layout shows its content a moment after this page mounts
  const boxRef = useCallback((el: HTMLDivElement | null) => {
    observer.current?.disconnect();
    if (!el) return;
    setBoxWidth(el.clientWidth);
    observer.current = new ResizeObserver(([e]) => setBoxWidth(e.contentRect.width));
    observer.current.observe(el);
  }, []);
  useEffect(() => () => observer.current?.disconnect(), []);

  const d = DEVICES.find((x) => x.id === device)!;
  const scale = boxWidth ? Math.min(1, boxWidth / d.width) : 1;
  const src = `${path}${path.includes("?") ? "&" : "?"}preview=${stamp}`;

  const pick = (id: DeviceId) => {
    setDevice(id);
    remember("preview-device", id);
  };
  const go = (p: string) => {
    const clean = "/" + p.trim().replace(/^https?:\/\/[^/]+/i, "").replace(/^\/+/, "");
    setPath(clean);
    setLoading(true);
    setStamp(Date.now());
  };
  const refresh = () => {
    setLoading(true);
    setStamp(Date.now());
  };

  return (
    <AdminLayout title="Preview Website" subtitle="See your website exactly as visitors do. After you save a change on any page, come back here and press Refresh.">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex rounded-lg border border-slate-200 bg-white p-1">
          {DEVICES.map((x) => (
            <button
              key={x.id}
              type="button"
              onClick={() => pick(x.id)}
              aria-pressed={device === x.id}
              className={`flex h-9 items-center gap-1.5 rounded-md px-3 text-[13.5px] font-semibold transition ${
                device === x.id ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <x.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{x.label}</span>
            </button>
          ))}
        </div>

        <select
          aria-label="Page to preview"
          className="field !h-11 !w-auto min-w-[200px] flex-1 sm:flex-none"
          value={pages.some((p) => p.to === path) ? path : ""}
          onChange={(e) => e.target.value && go(e.target.value)}
        >
          {!pages.some((p) => p.to === path) && <option value="">{path}</option>}
          {pages.map((p) => (
            <option key={p.to} value={p.to}>
              {p.label}
            </option>
          ))}
        </select>

        <button type="button" onClick={refresh} className="flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-4 text-[14px] font-semibold text-white hover:bg-blue-700">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
        <a
          href={path}
          target="_blank"
          rel="noreferrer"
          className="flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-[14px] font-semibold text-slate-700 hover:bg-slate-50"
        >
          <ExternalLink className="h-4 w-4" /> Open in new tab
        </a>
      </div>

      <form
        className="mb-4 flex max-w-xl gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (custom.trim()) go(custom);
        }}
      >
        <input
          aria-label="Any page address"
          className="field !h-10 flex-1"
          placeholder="Any other page, e.g. /about or /blog/my-post"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
        />
        <button type="submit" className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-[13.5px] font-semibold text-slate-700 hover:bg-slate-50">
          Show
        </button>
      </form>

      <div ref={boxRef} className="w-full min-w-0 overflow-hidden" style={{ contain: "inline-size" }}>
        <div
          className="mx-auto overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
          style={{ width: d.width * scale, height: d.height * scale }}
        >
          <iframe
            key={`${src}-${device}`}
            title="Website preview"
            src={src}
            onLoad={() => setLoading(false)}
            style={{ width: d.width, height: d.height, transform: `scale(${scale})`, transformOrigin: "0 0", border: 0, display: "block" }}
          />
        </div>
        <p className="mt-2 text-center text-[12.5px] text-slate-500">
          {d.label} view · {d.width}px wide{scale < 1 ? ` · shown at ${Math.round(scale * 100)}% to fit your screen` : ""}
        </p>
      </div>
    </AdminLayout>
  );
}
