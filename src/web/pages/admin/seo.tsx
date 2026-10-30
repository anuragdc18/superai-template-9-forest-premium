import { useMemo, useState } from "react";
import { ChevronDown, Loader2, Plus, Search, Trash2 } from "lucide-react";
import { AdminLayout, Card, Field } from "./layout";
import { ImagePicker, SaveRow, input, useEditable } from "./ui";
import { SchemaBox } from "./schema-box";
import { client } from "../../lib/api";
import { CATEGORIES } from "../../lib/site";
import { allPages, type SeoCtx } from "../../lib/seo";
import { SITE_ORIGIN } from "../../components/seo-head";
import { useAllContent, useContentAction } from "../../queries/content";
import { useSite } from "../../queries/site";
import { BUSINESS_TYPES, DAYS, publicContent, type SeoSettings } from "../../../api/lib/content-schema";

const TYPE_LABEL: Record<(typeof BUSINESS_TYPES)[number], string> = {
  ProfessionalService: "Professional services (consultants, agencies)",
  LocalBusiness: "Local business (general)",
  AccountingService: "Accounting / tax / CA firm",
  LegalService: "Legal services",
  FinancialService: "Financial services",
  EducationalOrganization: "Training institute / education",
  Store: "Shop / store",
  Organization: "Company / organisation (no walk-in office)",
};

/** How the page looks in Google search results. */
function GooglePreview({ url, title, description }: { url: string; title: string; description: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 font-[arial,sans-serif]">
      <p className="truncate text-[12.5px] text-[#202124]">{url}</p>
      <p className="mt-0.5 line-clamp-1 text-[18px] leading-snug text-[#1a0dab]">{title}</p>
      <p className="mt-1 line-clamp-2 text-[13.5px] leading-snug text-[#4d5156]">{description}</p>
    </div>
  );
}

const counter = (s: string, max: number) => (
  <span className={s.length > max ? "font-semibold text-red-600" : "text-slate-400"}>
    {s.length}/{max}
  </span>
);

export default function SeoPage() {
  const site = useSite();
  const { data } = useAllContent();
  const act = useContentAction();
  const ed = useEditable<SeoSettings>(data?.seo, (v) =>
    act(() =>
      client.content.saveSeo({
        ...v,
        sameAs: v.sameAs.filter((s) => s.trim()),
        pages: Object.fromEntries(Object.entries(v.pages).filter(([, p]) => p.title.trim() || p.description.trim() || p.image || p.schema?.trim())),
      }),
    ),
  );
  const v = ed.value;
  const set = (p: Partial<SeoSettings>) => ed.update((s) => ({ ...s, ...p }));
  const [q, setQ] = useState("");
  const [openPage, setOpenPage] = useState<string | null>("/");
  const [showLd, setShowLd] = useState(false);

  // pages with automatic titles (owner's own titles removed so we can show the defaults)
  const ctx: SeoCtx | null = useMemo(() => {
    if (!data || !v) return null;
    return { site, content: publicContent({ ...data, seo: { ...v, pages: {} } }), categories: CATEGORIES };
  }, [data, v, site]);
  const pages = useMemo(() => (ctx ? allPages(SITE_ORIGIN, ctx).filter((p) => !p.path.startsWith("/blog/")) : []), [ctx]);
  const shown = pages.filter((p) => !q || p.path.includes(q.toLowerCase()) || p.title.toLowerCase().includes(q.toLowerCase())).slice(0, 60);
  const homeLd = useMemo(() => (ctx && v ? allPages(SITE_ORIGIN, { ...ctx, content: { ...ctx.content, seo: v } })[0].jsonLd : []), [ctx, v]);

  return (
    <AdminLayout title="SEO & Google" subtitle="How your business appears on Google: analytics, business details, structured data and page titles.">
      {!v ? (
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-2">
            <Card title="Google Analytics" subtitle="See how many people visit and which pages bring leads.">
              <Field label="Measurement ID" hint="analytics.google.com → Admin → Data streams → your website. Looks like G-XXXXXXXXXX.">
                <input aria-label="Google Analytics ID" className={input} placeholder="G-XXXXXXXXXX" value={v.gaId} onChange={(e) => set({ gaId: e.target.value.trim() })} />
              </Field>
              <p className="mt-3 text-[12.5px] text-slate-500">Leads, WhatsApp clicks and call clicks are recorded automatically as events.</p>
            </Card>
            <Card title="Google Search Console" subtitle="Proves to Google that you own this website.">
              <Field label="Verification code" hint='Search Console → Add property → "HTML tag" → copy only the code inside content="…"'>
                <input aria-label="Search Console code" className={input} value={v.searchConsole} onChange={(e) => set({ searchConsole: e.target.value.trim() })} />
              </Field>
              <p className="mt-3 text-[12.5px] text-slate-500">
                Your sitemap: <a className="font-semibold text-blue-600 hover:underline" href="/sitemap.xml" target="_blank" rel="noreferrer">/sitemap.xml</a> — submit it in Search Console → Sitemaps.
              </p>
            </Card>
          </div>

          <Card title="Business details for Google" subtitle="Used in your structured data (what Google reads about your business). Name, phone, email and socials come from Contact Info.">
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              <Field label="Type of business">
                <select aria-label="Type of business" className={input} value={v.businessType} onChange={(e) => set({ businessType: e.target.value as SeoSettings["businessType"] })}>
                  {BUSINESS_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {TYPE_LABEL[t]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Price range" hint="e.g. ₹₹ or ₹1,000 – ₹50,000">
                <input aria-label="Price range" className={input} value={v.priceRange} onChange={(e) => set({ priceRange: e.target.value })} />
              </Field>
              <Field label="Year started">
                <input aria-label="Year started" className={input} inputMode="numeric" maxLength={4} value={v.foundingYear} onChange={(e) => set({ foundingYear: e.target.value.replace(/\D/g, "") })} />
              </Field>
              <div className="sm:col-span-2 xl:col-span-3">
                <Field label="Business description for Google" hint="1–2 sentences. Empty = written automatically from your services.">
                  <textarea aria-label="Business description" className={`${input} !h-20 py-2.5`} value={v.description} onChange={(e) => set({ description: e.target.value })} />
                </Field>
              </div>
              <Field label="Street address">
                <input aria-label="Street address" className={input} value={v.street} onChange={(e) => set({ street: e.target.value })} />
              </Field>
              <Field label="City">
                <input aria-label="City" className={input} placeholder={site.city.split(",")[0]} value={v.locality} onChange={(e) => set({ locality: e.target.value })} />
              </Field>
              <Field label="State">
                <input aria-label="State" className={input} placeholder={site.city.split(",")[1]?.trim() ?? ""} value={v.region} onChange={(e) => set({ region: e.target.value })} />
              </Field>
              <Field label="PIN code">
                <input aria-label="PIN code" className={input} inputMode="numeric" value={v.postalCode} onChange={(e) => set({ postalCode: e.target.value })} />
              </Field>
              <Field label="Google Maps link">
                <input aria-label="Google Maps link" className={input} value={v.mapsUrl} onChange={(e) => set({ mapsUrl: e.target.value })} />
              </Field>
              <Field label="Areas served" hint="Comma separated, e.g. Hyderabad, Secunderabad, India">
                <input aria-label="Areas served" className={input} value={v.areaServed} onChange={(e) => set({ areaServed: e.target.value })} />
              </Field>
              <Field label="Latitude (optional)">
                <input aria-label="Latitude" className={input} placeholder="17.3850" value={v.latitude} onChange={(e) => set({ latitude: e.target.value })} />
              </Field>
              <Field label="Longitude (optional)">
                <input aria-label="Longitude" className={input} placeholder="78.4867" value={v.longitude} onChange={(e) => set({ longitude: e.target.value })} />
              </Field>
            </div>
          </Card>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card title="Opening hours" subtitle="Shown to Google (and in Maps results).">
              <div className="space-y-4">
                {v.hours.map((h, i) => (
                  <div key={i} className="rounded-md border border-slate-200 p-3">
                    <div className="flex flex-wrap gap-1.5">
                      {DAYS.map((d) => {
                        const on = h.days.includes(d);
                        return (
                          <button
                            key={d}
                            type="button"
                            onClick={() => set({ hours: v.hours.map((x, j) => (j === i ? { ...x, days: on ? x.days.filter((y) => y !== d) : DAYS.filter((y) => x.days.includes(y) || y === d) } : x)) })}
                            className={`rounded-full px-3 py-1 text-[12.5px] font-semibold ${on ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}
                          >
                            {d.slice(0, 3)}
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-[13.5px]">
                      <input aria-label="Opens" type="time" className={`${input} !h-10 !w-32`} value={h.opens} onChange={(e) => set({ hours: v.hours.map((x, j) => (j === i ? { ...x, opens: e.target.value } : x)) })} />
                      to
                      <input aria-label="Closes" type="time" className={`${input} !h-10 !w-32`} value={h.closes} onChange={(e) => set({ hours: v.hours.map((x, j) => (j === i ? { ...x, closes: e.target.value } : x)) })} />
                      <button type="button" aria-label="Remove hours" onClick={() => set({ hours: v.hours.filter((_, j) => j !== i) })} className="ml-auto rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => set({ hours: [...v.hours, { days: ["Sunday"], opens: "10:00", closes: "14:00" }] })} className="flex items-center gap-1 text-[13.5px] font-semibold text-blue-600 hover:underline">
                  <Plus className="h-4 w-4" /> Add different hours (e.g. Sunday)
                </button>
              </div>
            </Card>
            <Card title="Other profiles" subtitle="Links to your business elsewhere: Google Business Profile, JustDial, IndiaMART, Sulekha… (social media links come from Contact Info).">
              <div className="space-y-2.5">
                {v.sameAs.map((s, i) => (
                  <div key={i} className="flex gap-2">
                    <input aria-label={`Profile link ${i + 1}`} className={input} placeholder="https://" value={s} onChange={(e) => set({ sameAs: v.sameAs.map((x, j) => (j === i ? e.target.value : x)) })} />
                    <button type="button" aria-label="Remove link" onClick={() => set({ sameAs: v.sameAs.filter((_, j) => j !== i) })} className="grid h-12 w-12 shrink-0 place-items-center rounded-md text-slate-400 hover:bg-red-50 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => set({ sameAs: [...v.sameAs, ""] })} className="flex items-center gap-1 text-[13.5px] font-semibold text-blue-600 hover:underline">
                  <Plus className="h-4 w-4" /> Add profile link
                </button>
              </div>
            </Card>
          </div>

          <Card title="Page titles, descriptions & schema" subtitle="Every page already has an automatic title, description and structured data. Open a page to type your own or add schema for that page only. Blog posts have these inside the post editor." bodyClass="">
            <div className="border-b border-slate-100 p-4">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input aria-label="Search pages" className={`${input} !pl-11`} placeholder={`Search ${pages.length} pages…`} value={q} onChange={(e) => setQ(e.target.value)} />
              </label>
            </div>
            <div className="divide-y divide-slate-100">
              {shown.map((p) => {
                const own = v.pages[p.path] ?? { title: "", description: "", image: "", schema: "" };
                const setOwn = (x: Partial<typeof own>) => set({ pages: { ...v.pages, [p.path]: { ...own, ...x } } });
                const custom = !!(own.title || own.description || own.image);
                const hasSchema = !!own.schema?.trim();
                const isOpen = openPage === p.path;
                return (
                  <div key={p.path}>
                    <button type="button" onClick={() => setOpenPage(isOpen ? null : p.path)} className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-slate-50">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-semibold text-slate-700">{own.title || p.title}</span>
                        <span className="block truncate text-[12.5px] text-slate-400">{p.path}</span>
                      </span>
                      {hasSchema && <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[11.5px] font-semibold text-violet-700">Schema</span>}
                      {custom && <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11.5px] font-semibold text-blue-700">Custom</span>}
                      <ChevronDown className={`h-4 w-4 text-slate-400 transition ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                    {isOpen && (
                      <div className="grid gap-5 px-5 pb-5 lg:grid-cols-[1fr_380px]">
                        <div className="grid gap-4">
                          <Field label="Title">
                            <input aria-label="Page title" className={input} placeholder={p.title} value={own.title} onChange={(e) => setOwn({ title: e.target.value })} />
                            <span className="text-right text-[12px]">{counter(own.title || p.title, 65)}</span>
                          </Field>
                          <Field label="Description">
                            <textarea aria-label="Page description" className={`${input} !h-24 py-2.5`} placeholder={p.description} value={own.description} onChange={(e) => setOwn({ description: e.target.value })} />
                            <span className="text-right text-[12px]">{counter(own.description || p.description, 160)}</span>
                          </Field>
                        </div>
                        <div className="grid content-start gap-3">
                          <span className="text-[13.5px] font-semibold text-slate-700">Google preview</span>
                          <GooglePreview url={SITE_ORIGIN.replace(/^https?:\/\//, "") + p.path} title={own.title || p.title} description={own.description || p.description} />
                          <ImagePicker label="Share image (WhatsApp / Facebook)" aspect="aspect-[1200/630]" value={own.image} onChange={(url) => setOwn({ image: url })} />
                        </div>
                        <div className="lg:col-span-2">
                          <SchemaBox
                            value={own.schema ?? ""}
                            onChange={(schema) => setOwn({ schema })}
                            url={SITE_ORIGIN + (p.path === "/" ? "/" : p.path)}
                            title={own.title || p.title}
                            description={own.description || p.description}
                            image={own.image || p.image || ""}
                            brand={site.siteName}
                            origin={SITE_ORIGIN}
                            auto={p.jsonLd}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {pages.length > shown.length && <p className="px-5 py-3 text-[13px] text-slate-500">Showing {shown.length} of {pages.length} — search to find a page.</p>}
            </div>
          </Card>

          <Card title="Structured data (advanced)" subtitle="What Google reads about your business, built from the details above. Add extra schema.org JSON-LD below if you need it.">
            <button type="button" onClick={() => setShowLd((x) => !x)} className="flex items-center gap-1 text-[13.5px] font-semibold text-blue-600">
              <ChevronDown className={`h-4 w-4 transition ${showLd ? "rotate-180" : ""}`} /> {showLd ? "Hide" : "Show"} current structured data
            </button>
            {showLd && <pre className="mt-3 max-h-80 overflow-auto rounded-md bg-slate-900 p-4 text-[12px] leading-relaxed text-slate-100">{JSON.stringify(homeLd, null, 2)}</pre>}
            <div className="mt-5">
              <Field label="Extra structured data (JSON-LD)" hint='Optional. One object or a list, e.g. {"@type":"Event", …}. Test it at search.google.com/test/rich-results.'>
                <textarea aria-label="Extra structured data" spellCheck={false} className={`${input} !h-40 py-2.5 font-mono text-[12.5px]`} value={v.customJsonLd} onChange={(e) => set({ customJsonLd: e.target.value })} />
              </Field>
            </div>
          </Card>

          <SaveRow {...ed} onSave={ed.save} />
        </div>
      )}
    </AdminLayout>
  );
}
