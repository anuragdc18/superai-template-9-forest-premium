import { Link } from "wouter";
import { ArrowRight, Check, ChevronRight, Clock } from "lucide-react";
import { waLink } from "../lib/site";
import { useSite } from "../queries/site";
import { useContent } from "../queries/content";
import { WaIcon } from "./header";
import { readingTime, type Package, type PostSummary } from "../../api/lib/content-schema";

/** Shared pieces for the Blog, Packages and Our Work pages (they follow each template's colours). */

export function PageBanner({ title, text, crumbs }: { title: string; text?: string; crumbs: { label: string; to?: string }[] }) {
  return (
    <section className="relative isolate overflow-hidden bg-navy">
      <div aria-hidden className="absolute -right-24 -top-24 -z-10 h-72 w-72 rounded-full bg-royal/30 blur-3xl" />
      <div aria-hidden className="absolute -bottom-28 left-1/3 -z-10 h-64 w-64 rounded-full bg-brand/20 blur-3xl" />
      <div className="container-x py-14 sm:py-20">
        <nav className="flex flex-wrap items-center gap-1.5 text-[13px] text-white/70">
          {crumbs.map((c, i) => (
            <span key={c.label} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5" />}
              {c.to ? (
                <Link to={c.to} className="hover:text-white">
                  {c.label}
                </Link>
              ) : (
                <span className="text-white">{c.label}</span>
              )}
            </span>
          ))}
        </nav>
        <h1 className="rise mt-4 max-w-3xl text-4xl font-extrabold !text-white sm:text-5xl">{title}</h1>
        {text && <p className="rise mt-4 max-w-2xl text-[17px] leading-relaxed text-white/80" style={{ animationDelay: "100ms" }}>{text}</p>}
      </div>
    </section>
  );
}

export const fmtDate = (iso: string) => (iso ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "");

export function PostCard({ p }: { p: PostSummary }) {
  return (
    <Link to={`/blog/${p.slug}`} className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition hover:-translate-y-1 hover:shadow-[0_24px_50px_-30px_rgba(15,23,42,0.45)]">
      <div className="aspect-[16/9] overflow-hidden bg-surface">
        {p.image ? (
          <img src={p.image} alt={p.imageAlt || p.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="grid h-full place-items-center bg-gradient-to-br from-royal/15 to-brand/15 px-6 text-center text-[17px] font-bold text-navy">{p.title}</div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2 text-[12.5px]">
          {p.category && <span className="rounded-full bg-royal/10 px-2.5 py-0.5 font-semibold text-royal">{p.category}</span>}
          <span className="text-slate-500">{fmtDate(p.publishAt)}</span>
        </div>
        <h3 className="mt-3 text-[18px] font-bold leading-snug text-navy group-hover:text-royal">{p.title}</h3>
        {p.excerpt && <p className="mt-2 line-clamp-3 text-[14.5px]">{p.excerpt}</p>}
        <span className="mt-auto inline-flex items-center gap-1 pt-4 text-[14px] font-semibold text-royal">
          Read more <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

export function ReadTime({ html }: { html: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <Clock className="h-3.5 w-3.5" /> {readingTime(html)} min read
    </span>
  );
}

const periodText = (p: Package) => (p.period === "monthly" ? "/ month" : p.period === "yearly" ? "/ year" : p.period === "custom" ? p.periodLabel : "one-time");

/** Package cards (used on /packages and on service pages). */
export function PackageCards({ packages, compact = false }: { packages: Package[]; compact?: boolean }) {
  const site = useSite();
  if (!packages.length) return null;
  const cols = packages.length >= 3 ? "lg:grid-cols-3" : packages.length === 2 ? "md:grid-cols-2" : "";
  return (
    <div className={`grid gap-6 ${cols} ${compact ? "" : "items-stretch"}`}>
      {packages.map((p) => {
        const text = `Hi ${site.siteName}, I'm interested in the ${p.name} package${p.price ? ` (${p.price})` : ""}.`;
        return (
          <div
            key={p.id}
            className={`relative flex flex-col rounded-2xl border bg-white p-7 transition hover:-translate-y-1 ${
              p.popular ? "border-royal shadow-[0_30px_60px_-34px_rgba(15,23,42,0.55)] ring-2 ring-royal" : "border-line"
            }`}
          >
            {p.popular && <span className="absolute -top-3 left-7 rounded-full bg-brand px-3 py-1 text-[11.5px] font-bold uppercase tracking-wider text-white">Most Popular</span>}
            <h3 className="text-[20px] font-bold text-navy">{p.name}</h3>
            {p.description && <p className="mt-1.5 text-[14.5px]">{p.description}</p>}
            <div className="mt-5 flex flex-wrap items-end gap-2">
              {p.price && <span className="text-[34px] font-extrabold leading-none text-navy">{p.price}</span>}
              {p.oldPrice && p.period !== "custom" && <span className="pb-1 text-[15px] text-slate-400 line-through">{p.oldPrice}</span>}
              {p.price && <span className="pb-1 text-[14px] text-slate-500">{periodText(p)}</span>}
            </div>
            <ul className="mt-6 space-y-2.5">
              {p.features.map((f) => (
                <li key={f} className="flex gap-2.5 text-[14.5px]">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-royal/10 text-royal">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-7">
              {p.button === "whatsapp" ? (
                <a href={waLink(site.whatsapp, text)} target="_blank" rel="noreferrer" className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25d366] px-5 py-3 text-[15px] font-bold text-white hover:brightness-95">
                  <WaIcon /> {p.buttonText || "Chat on WhatsApp"}
                </a>
              ) : (
                <Link to={`/contact?service=${encodeURIComponent(`${p.name} package`)}`} className={`${p.popular ? "btn-brand" : "btn-brand"} w-full`}>
                  {p.buttonText || "Get Started"}
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Packages that belong to a service page. */
export function usePackagesFor(catSlug: string, serviceName?: string) {
  const content = useContent();
  return content.packages.filter((p) => p.category === catSlug && (!p.service || p.service === serviceName));
}

/** Extra menu links (Packages, Blog, Our Work) — only the ones turned on and with content. */
export function useExtraLinks() {
  const c = useContent();
  return [
    c.packagesSection.show && c.packages.length ? { to: "/packages", label: "Packages" } : null,
    c.blog.show && c.posts.length ? { to: "/blog", label: c.blog.title || "Blog" } : null,
    c.gallerySection.show && c.gallery.length ? { to: "/gallery", label: c.gallerySection.title || "Our Work" } : null,
  ].filter(Boolean) as { to: string; label: string }[];
}
