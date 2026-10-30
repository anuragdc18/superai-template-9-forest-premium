import { useState } from "react";
import { ChevronDown, ExternalLink, Wand2 } from "lucide-react";

/** Ready examples the owner can insert and then edit. */
function examples(o: { url: string; title: string; description: string; image: string; brand: string; origin: string }) {
  const biz = { "@id": `${o.origin}/#business` };
  return {
    Service: { "@type": "Service", name: o.title, description: o.description, url: o.url, provider: biz, areaServed: { "@type": "City", name: "Your city" }, offers: { "@type": "Offer", price: "4999", priceCurrency: "INR" } },
    "FAQ (questions & answers)": {
      "@type": "FAQPage",
      mainEntity: [
        { "@type": "Question", name: "Question 1?", acceptedAnswer: { "@type": "Answer", text: "Answer 1." } },
        { "@type": "Question", name: "Question 2?", acceptedAnswer: { "@type": "Answer", text: "Answer 2." } },
      ],
    },
    "Product / package with price": {
      "@type": "Product",
      name: o.title,
      description: o.description,
      ...(o.image ? { image: o.image } : {}),
      brand: { "@type": "Brand", name: o.brand },
      offers: { "@type": "Offer", price: "999", priceCurrency: "INR", availability: "https://schema.org/InStock", url: o.url },
    },
    Course: { "@type": "Course", name: o.title, description: o.description, provider: biz, offers: { "@type": "Offer", price: "0", priceCurrency: "INR", category: "Paid" } },
    "Event / webinar": {
      "@type": "Event",
      name: o.title,
      description: o.description,
      startDate: "2026-12-01T10:00:00+05:30",
      endDate: "2026-12-01T11:00:00+05:30",
      eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
      eventStatus: "https://schema.org/EventScheduled",
      location: { "@type": "VirtualLocation", url: o.url },
      organizer: biz,
    },
    "How-to steps": {
      "@type": "HowTo",
      name: o.title,
      step: [
        { "@type": "HowToStep", name: "Step 1", text: "What to do first." },
        { "@type": "HowToStep", name: "Step 2", text: "What to do next." },
      ],
    },
    "Video": { "@type": "VideoObject", name: o.title, description: o.description, thumbnailUrl: o.image || `${o.origin}/og-image.png`, uploadDate: new Date().toISOString().slice(0, 10), embedUrl: "https://www.youtube.com/embed/VIDEO_ID" },
    "Article": { "@type": "Article", headline: o.title, description: o.description, ...(o.image ? { image: o.image } : {}), author: { "@type": "Organization", name: o.brand }, publisher: biz },
  } as Record<string, Record<string, unknown>>;
}

const check = (s: string): string | null => {
  if (!s.trim()) return null;
  try {
    const v = JSON.parse(s);
    if (typeof v !== "object" || v === null) return "Must be a JSON object { … } or a list [ … ].";
    const list = Array.isArray(v) ? v : [v];
    if (list.some((x) => !x || typeof x !== "object" || !("@type" in x))) return 'Each item needs an "@type", e.g. "Service".';
    return null;
  } catch (e) {
    return `Not valid JSON: ${(e as Error).message}`;
  }
};

/**
 * Structured data (JSON-LD) box for one page or post: insert an example, edit, check, test in Google.
 * "@context" is added automatically when published.
 */
export function SchemaBox({
  value,
  onChange,
  url,
  title,
  description,
  image = "",
  brand,
  origin,
  auto,
}: {
  value: string;
  onChange: (v: string) => void;
  url: string;
  title: string;
  description: string;
  image?: string;
  brand: string;
  origin: string;
  /** Structured data the page already gets automatically (shown for reference). */
  auto?: Record<string, unknown>[];
}) {
  const [showAuto, setShowAuto] = useState(false);
  const err = check(value);
  const ex = examples({ url, title, description, image, brand, origin });

  const insert = (key: string) => {
    if (!key) return;
    const item = ex[key];
    let next: unknown = item;
    if (value.trim() && !err) {
      const cur = JSON.parse(value);
      next = [...(Array.isArray(cur) ? cur : [cur]), item];
    } else if (value.trim() && !confirm("The box has text that isn't valid JSON. Replace it with the example?")) return;
    onChange(JSON.stringify(next, null, 2));
  };

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[13.5px] font-semibold text-slate-700">Structured data for this page (schema / JSON-LD)</span>
        <span className="text-[12px] text-slate-400">optional</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <label className="relative">
          <Wand2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-600" />
          <select
            aria-label="Insert schema example"
            className="h-9 appearance-none rounded-md border border-blue-200 bg-blue-50 pl-9 pr-8 text-[13px] font-semibold text-blue-700"
            value=""
            onChange={(e) => insert(e.target.value)}
          >
            <option value="">Insert example…</option>
            {Object.keys(ex).map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-600" />
        </label>
        {value.trim() && !err && (
          <button type="button" onClick={() => onChange(JSON.stringify(JSON.parse(value), null, 2))} className="h-9 rounded-md border border-slate-200 px-3 text-[13px] font-semibold text-slate-600 hover:bg-slate-50">
            Tidy up
          </button>
        )}
        {value.trim() && (
          <button type="button" onClick={() => confirm("Remove this page's structured data?") && onChange("")} className="h-9 rounded-md px-3 text-[13px] font-semibold text-red-600 hover:bg-red-50">
            Clear
          </button>
        )}
        <a
          href={`https://search.google.com/test/rich-results?url=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noreferrer"
          className="ml-auto inline-flex items-center gap-1 text-[13px] font-semibold text-blue-600 hover:underline"
        >
          Test in Google <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
      <textarea
        aria-label="Structured data for this page"
        spellCheck={false}
        className={`field !h-48 py-2.5 font-mono text-[12.5px] ${err ? "!border-red-400" : ""}`}
        placeholder='{ "@type": "Service", "name": "…" }  — or pick "Insert example…" above'
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {err ? (
        <span className="text-[12.5px] font-medium text-red-600">{err}</span>
      ) : (
        <span className="text-[12.5px] text-slate-500">Published on this page after you save. Test it in Google after publishing (the live page must be online).</span>
      )}
      {auto && auto.length > 0 && (
        <div>
          <button type="button" onClick={() => setShowAuto((x) => !x)} className="flex items-center gap-1 text-[12.5px] font-semibold text-slate-500 hover:text-blue-600">
            <ChevronDown className={`h-3.5 w-3.5 transition ${showAuto ? "rotate-180" : ""}`} /> {showAuto ? "Hide" : "Show"} structured data this page already has automatically ({auto.length})
          </button>
          {showAuto && <pre className="mt-2 max-h-64 overflow-auto rounded-md bg-slate-900 p-3 text-[11.5px] leading-relaxed text-slate-100">{JSON.stringify(auto, null, 2)}</pre>}
        </div>
      )}
    </div>
  );
}
