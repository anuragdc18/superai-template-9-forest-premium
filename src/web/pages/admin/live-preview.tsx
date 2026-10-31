import { useCallback, useEffect, useRef, useState } from "react";
import { Eye, Monitor, Smartphone, X } from "lucide-react";
import { PREVIEW_MESSAGE, PREVIEW_READY, type PreviewDraft } from "../../lib/preview-draft";

/**
 * "Live preview" for an admin page: shows the website next to the form, with the UNSAVED change
 * applied (logo, colours, images, blog post). Nothing is published until the page's own Save button.
 *
 * Usage: <LivePreview draft={...} path="/">…page content…</LivePreview>
 */
const DEVICES = {
  phone: { label: "Phone", icon: Smartphone, width: 390, height: 800 },
  desktop: { label: "Desktop", icon: Monitor, width: 1366, height: 900 },
} as const;
type Device = keyof typeof DEVICES;

const store = (k: string, v?: string) => {
  try {
    if (v === undefined) return localStorage.getItem(k) ?? undefined;
    localStorage.setItem(k, v);
  } catch {
    /* storage not available */
  }
  return undefined;
};

export function LivePreview({
  draft,
  path,
  children,
  label = "Live preview",
}: {
  draft: PreviewDraft;
  path: string;
  /** page content; a function receives whether the preview panel is open (to adjust the layout) */
  children: React.ReactNode | ((open: boolean) => React.ReactNode);
  label?: string;
}) {
  const [open, setOpen] = useState(() => store("live-preview-open") === "1");
  const [device, setDevice] = useState<Device>(() => (store("live-preview-device") as Device) || "phone");
  const [stamp, setStamp] = useState(() => Date.now());
  const frame = useRef<HTMLIFrameElement | null>(null);
  const draftRef = useRef(draft);
  draftRef.current = draft;

  const toggle = (v: boolean) => {
    setOpen(v);
    store("live-preview-open", v ? "1" : "0");
  };
  const pick = (d: Device) => {
    setDevice(d);
    store("live-preview-device", d);
  };

  const send = useCallback(() => {
    const w = frame.current?.contentWindow;
    if (w) w.postMessage({ type: PREVIEW_MESSAGE, draft: draftRef.current }, window.location.origin);
  }, []);

  // send the draft whenever it changes (small delay while typing)
  const key = JSON.stringify(draft);
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(send, 250);
    return () => clearTimeout(t);
  }, [key, open, send]);

  // the website inside the frame says "ready" once it has started → send the current draft
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.origin === window.location.origin && e.source === frame.current?.contentWindow && (e.data as { type?: string })?.type === PREVIEW_READY) send();
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [send]);

  // reload the frame when the page to show changes
  useEffect(() => setStamp(Date.now()), [path]);

  const d = DEVICES[device];
  const [boxW, setBoxW] = useState(0);
  const ro = useRef<ResizeObserver | null>(null);
  const boxRef = useCallback((el: HTMLDivElement | null) => {
    ro.current?.disconnect();
    if (!el) return;
    setBoxW(el.clientWidth);
    ro.current = new ResizeObserver(([e]) => setBoxW(e.contentRect.width));
    ro.current.observe(el);
  }, []);
  useEffect(() => () => ro.current?.disconnect(), []);
  const scale = boxW ? Math.min(1, boxW / d.width) : 1;
  const src = `${path}${path.includes("?") ? "&" : "?"}preview=${stamp}`;

  return (
    <>
      <div className={open ? "xl:pr-[476px]" : ""}>
        <div className="mb-4 flex justify-end">
          {!open && (
            <button
              type="button"
              onClick={() => toggle(true)}
              className="flex h-10 items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 text-[13.5px] font-semibold text-blue-700 hover:bg-blue-100"
            >
              <Eye className="h-4 w-4" /> Show {label.toLowerCase()}
            </button>
          )}
        </div>
        {typeof children === "function" ? children(open) : children}
      </div>

      {open && (
        <aside
          aria-label={label}
          className="fixed inset-0 z-[70] flex flex-col bg-white xl:inset-auto xl:bottom-0 xl:right-0 xl:top-16 xl:w-[460px] xl:border-l xl:border-slate-200 xl:shadow-[-8px_0_30px_-18px_rgba(15,23,42,0.35)]"
        >
          <div className="flex items-center gap-2 border-b border-slate-200 px-3 py-2.5">
            <Eye className="h-4 w-4 text-blue-600" />
            <p className="flex-1 text-[14px] font-semibold text-slate-800">
              {label} <span className="font-normal text-slate-500">· not saved yet</span>
            </p>
            <div className="flex rounded-md border border-slate-200 p-0.5">
              {(Object.keys(DEVICES) as Device[]).map((k) => {
                const x = DEVICES[k];
                return (
                  <button
                    key={k}
                    type="button"
                    title={x.label}
                    aria-label={x.label}
                    aria-pressed={device === k}
                    onClick={() => pick(k)}
                    className={`grid h-8 w-8 place-items-center rounded ${device === k ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-100"}`}
                  >
                    <x.icon className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
            <button type="button" onClick={() => toggle(false)} aria-label="Close preview" className="grid h-8 w-8 place-items-center rounded text-slate-500 hover:bg-slate-100">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div ref={boxRef} className="min-h-0 flex-1 overflow-auto bg-slate-100 p-3" style={{ contain: "inline-size" }}>
            <div className="mx-auto overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm" style={{ width: d.width * scale, height: d.height * scale }}>
              <iframe
                key={`${src}-${device}`}
                ref={frame}
                title={label}
                src={src}
                onLoad={send}
                style={{ width: d.width, height: d.height, transform: `scale(${scale})`, transformOrigin: "0 0", border: 0, display: "block" }}
              />
            </div>
          </div>
          <p className="border-t border-slate-200 px-3 py-2 text-[12px] text-slate-500">
            Only you see this preview. Visitors see the change after you click <b>Save</b>.
          </p>
        </aside>
      )}
    </>
  );
}
