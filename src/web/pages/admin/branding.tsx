import { useEffect } from "react";
import { ImagePlus, RotateCcw, Trash2 } from "lucide-react";
import { AdminLayout, Card, Field, SaveBar } from "./layout";
import { ColorPicker } from "../../components/color-picker";
import { FALLBACK_SITE, type SiteSettings } from "../../queries/site";
import { useSiteForm } from "./use-site-form";

const COLOR_FIELDS: { key: keyof SiteSettings["colors"]; label: string; hint: string }[] = [
  { key: "navy", label: "Main colour", hint: "Top bar, headings, footer" },
  { key: "royal", label: "Second colour", hint: "Icons, links, highlights" },
  { key: "brand", label: "Button colour", hint: "Buttons and call-to-action" },
];

function applyColors(c: SiteSettings["colors"]) {
  const root = document.documentElement.style;
  root.setProperty("--color-navy", c.navy);
  root.setProperty("--color-royal", c.royal);
  root.setProperty("--color-brand", c.brand);
}

export default function BrandingPage() {
  const { site, form, set, submit, saved, error, setError, dirty, pending } = useSiteForm();

  // live preview of colours across the whole page
  useEffect(() => {
    applyColors(form.colors);
  }, [form.colors]);
  // restore saved colours when leaving without saving
  useEffect(() => () => applyColors(site.colors), [site.colors]);

  const onLogo = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Please choose an image file (PNG, JPG, SVG, WebP).");
    if (file.size > 500_000) return setError("Logo is too big. Please use an image under 500 KB.");
    setError(null);
    const reader = new FileReader();
    reader.onload = () => set("logo", String(reader.result));
    reader.readAsDataURL(file);
  };

  return (
    <AdminLayout title="Logo & Colours" subtitle="Change how your website looks. Business name, phone and address are in Contact Info.">
      <form onSubmit={submit}>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
        <div className="space-y-6">
          <Card title="Logo" subtitle="Upload your logo and set its size in the website header.">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Logo image" hint="PNG with transparent background works best. Max 500 KB.">
                <div className="flex items-center gap-2">
                  <label className="flex h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-royal/40 bg-royal/5 text-[14px] font-semibold text-royal hover:bg-royal/10">
                    <ImagePlus className="h-4 w-4" /> Upload logo
                    <input
                      aria-label="Upload logo"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => onLogo(e.target.files?.[0])}
                    />
                  </label>
                  {form.logo && (
                    <button
                      type="button"
                      onClick={() => set("logo", "")}
                      aria-label="Remove logo"
                      className="grid h-12 w-12 place-items-center rounded-xl border border-line text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </Field>
              <Field label={`Logo size: ${form.logoHeight}px tall`}>
                <input
                  aria-label="Logo height"
                  type="range"
                  min={20}
                  max={80}
                  value={form.logoHeight}
                  onChange={(e) => set("logoHeight", Number(e.target.value))}
                  className="accent-[var(--color-royal)]"
                />
              </Field>
            </div>
          </Card>

          <Card
            title="Brand Colours"
            subtitle="See the preview on the right. Click Save to apply on the website."
            right={
              <button
                type="button"
                onClick={() => set("colors", FALLBACK_SITE.colors)}
                className="flex items-center gap-1.5 text-[13px] font-semibold text-royal hover:underline"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset to default
              </button>
            }
          >
            <div className="grid gap-5 sm:grid-cols-3">
              {COLOR_FIELDS.map((c) => (
                <Field key={c.key} label={c.label} hint={c.hint}>
                  <ColorPicker
                    label={c.label}
                    value={form.colors[c.key]}
                    onChange={(v) => set("colors", { ...form.colors, [c.key]: v })}
                  />
                </Field>
              ))}
            </div>
          </Card>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="overflow-hidden rounded-md bg-white shadow-[0_1px_15px_rgba(69,65,78,0.08)]">
            <p className="border-b border-line px-5 py-3 text-[13px] font-semibold uppercase tracking-[0.1em] text-slate-500">Preview</p>
            <div className="flex h-24 items-center justify-center px-5">
              {form.logo ? (
                <img src={form.logo} alt="Logo preview" style={{ height: form.logoHeight }} className="max-w-full object-contain" />
              ) : (
                <span className="text-[26px] font-extrabold" style={{ color: form.colors.navy }}>
                  {form.siteName}
                  <span style={{ color: form.colors.brand }}>.</span>
                </span>
              )}
            </div>
            <div className="space-y-3 px-5 py-5" style={{ background: form.colors.navy }}>
              <p className="text-[15px] font-semibold text-white">Start Your Business the Right Way</p>
              <div className="flex gap-2">
                <span className="rounded-lg px-3 py-2 text-[13px] font-semibold text-white" style={{ background: form.colors.brand }}>
                  Get Free Consultation
                </span>
                <span className="rounded-lg bg-white px-3 py-2 text-[13px] font-semibold" style={{ color: form.colors.royal }}>
                  Learn More
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
      <SaveBar pending={pending} saved={saved} error={error} dirty={dirty} />
      </form>
    </AdminLayout>
  );
}
