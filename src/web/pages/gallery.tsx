import { useEffect, useMemo, useState } from "react";
import { ExternalLink, X } from "lucide-react";
import { useContent } from "../queries/content";
import { PageBanner } from "../components/content-ui";
import { CtaBand } from "./index";
import type { GalleryItem } from "../../api/lib/content-schema";

export default function GalleryPage() {
  const content = useContent();
  const s = content.gallerySection;
  const [cat, setCat] = useState("");
  const [open, setOpen] = useState<GalleryItem | null>(null);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open]);
  const cats = useMemo(() => Array.from(new Set(content.gallery.map((g) => g.category).filter(Boolean))), [content.gallery]);
  const items = content.gallery.filter((g) => !cat || g.category === cat);

  return (
    <>
      <PageBanner title={s.title || "Our Work"} text={s.subtitle} crumbs={[{ label: "Home", to: "/" }, { label: s.title || "Our Work" }]} />
      <section className="py-14 sm:py-16">
        <div className="container-x">
          {cats.length > 1 && (
            <div className="mb-8 flex flex-wrap gap-2">
              {["", ...cats].map((c) => (
                <button key={c || "all"} type="button" onClick={() => setCat(c)} className={`rounded-full px-4 py-2 text-[14px] font-semibold ${cat === c ? "bg-navy text-white" : "bg-surface text-navy hover:bg-royal/10"}`}>
                  {c || "All"}
                </button>
              ))}
            </div>
          )}
          {items.length === 0 ? (
            <p className="py-16 text-center text-[16px]">Work samples will be added soon.</p>
          ) : (
            <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
              {items.map((g) => (
                <button key={g.id} type="button" onClick={() => setOpen(g)} className="group mb-5 block w-full break-inside-avoid overflow-hidden rounded-2xl border border-line bg-white text-left">
                  <img src={g.image} alt={g.title || "Work sample"} loading="lazy" className="w-full transition duration-500 group-hover:scale-[1.03]" />
                  {(g.title || g.category) && (
                    <span className="block p-4">
                      {g.category && <span className="block text-[12px] font-bold uppercase tracking-wider text-brand">{g.category}</span>}
                      {g.title && <span className="mt-1 block font-semibold text-navy">{g.title}</span>}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
      {open && (
        <div role="dialog" aria-modal="true" aria-label={open.title || "Photo"} className="fixed inset-0 z-[70] grid place-items-center bg-black/85 p-4" onClick={() => setOpen(null)}>
          <div className="relative max-h-full w-full max-w-4xl overflow-auto rounded-2xl bg-white" onClick={(e) => e.stopPropagation()}>
            <button type="button" aria-label="Close" onClick={() => setOpen(null)} className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-navy shadow">
              <X className="h-5 w-5" />
            </button>
            <img src={open.image} alt={open.title || "Work sample"} className="w-full" />
            {(open.title || open.description || open.link) && (
              <div className="p-5">
                {open.title && <h2 className="text-[20px] font-bold">{open.title}</h2>}
                {open.description && <p className="mt-1.5">{open.description}</p>}
                {open.link && (
                  <a href={open.link} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 font-semibold text-royal hover:underline">
                    View project <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      <CtaBand />
    </>
  );
}
