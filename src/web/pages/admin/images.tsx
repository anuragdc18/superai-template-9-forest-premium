import { useEffect, useRef, useState } from "react";
import { Eye, ImagePlus, Loader2, RotateCcw } from "lucide-react";
import { AdminLayout, Card } from "./layout";
import { SaveRow, useEditable } from "./ui";
import { client } from "../../lib/api";
import { siteImages, type SiteImage } from "../../lib/site-images";
import { useAllContent, useContentAction, uploadImage } from "../../queries/content";
import { CATEGORIES } from "../../lib/site";
import { assetPath } from "../../lib/demo";
import { LivePreview } from "./live-preview";

/** Website page where an image is shown (category photos → that services page, others → home). */
const pageFor = (path: string) => {
  const c = CATEGORIES.find((x) => assetPath(x.image) === path);
  return c ? `/services/${c.slug}` : "/";
};

/** Original file address in this website (works under a sub-folder too). */
const original = (path: string) => import.meta.env.BASE_URL.replace(/\/$/, "") + path;

function ImageCard({ img, value, onChange, onPreview }: { img: SiteImage; value?: string; onChange: (url: string | undefined) => void; onPreview: () => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    const i = new Image();
    i.onload = () => setSize({ w: i.naturalWidth, h: i.naturalHeight });
    i.src = original(img.path);
  }, [img.path]);

  const pick = async (file?: File) => {
    if (!file) return;
    setErr(null);
    setBusy(true);
    try {
      onChange(await uploadImage(file, 2000));
      onPreview();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed. Is the database connected?");
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  };

  return (
    <Card bodyClass="p-0" className="overflow-hidden">
      <div className="relative bg-slate-100" style={{ aspectRatio: size ? `${size.w} / ${size.h}` : "16 / 9" }}>
        <img src={value || original(img.path)} alt={img.label} className="h-full w-full object-cover" />
        {value && <span className="absolute left-2 top-2 rounded-full bg-blue-600 px-2.5 py-0.5 text-[11.5px] font-bold text-white">Replaced</span>}
        {busy && (
          <div className="absolute inset-0 grid place-items-center bg-white/70">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-[14px] font-semibold text-slate-800">{img.label}</p>
        <p className="mt-0.5 text-[12.5px] text-slate-500">{size ? `Best size: ${size.w} × ${size.h} px (same shape)` : img.path}</p>
        {err && <p className="mt-1 text-[12.5px] font-medium text-red-600">{err}</p>}
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => ref.current?.click()} className="flex h-9 items-center gap-1.5 rounded-md bg-blue-600 px-3 text-[13px] font-semibold text-white hover:bg-blue-700">
            <ImagePlus className="h-4 w-4" /> {value ? "Change" : "Replace image"}
          </button>
          <button type="button" onClick={onPreview} className="flex h-9 items-center gap-1.5 rounded-md border border-slate-200 px-3 text-[13px] font-semibold text-slate-600 hover:bg-slate-50">
            <Eye className="h-4 w-4" /> See on website
          </button>
          {value && (
            <button type="button" onClick={() => onChange(undefined)} className="flex h-9 items-center gap-1.5 rounded-md border border-slate-200 px-3 text-[13px] font-semibold text-slate-600 hover:bg-slate-50">
              <RotateCcw className="h-4 w-4" /> Use original
            </button>
          )}
        </div>
        <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
      </div>
    </Card>
  );
}

export default function ImagesPage() {
  const { data } = useAllContent();
  const act = useContentAction();
  const ed = useEditable<Record<string, string>>(data?.images, (v) => act(() => client.content.saveImages(v)));
  const list = siteImages();
  const groups = Array.from(new Set(list.map((x) => x.group)));
  const [previewPath, setPreviewPath] = useState("/");

  return (
    <AdminLayout title="Banners & Images" subtitle="Replace the banner photos and other pictures on your website. Use photos of the same shape for the best look.">
      {!ed.value ? (
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      ) : (
        <LivePreview draft={{ images: ed.value }} path={previewPath}>
        <div className="space-y-8">
          {groups.map((g) => (
            <section key={g}>
              <h2 className="mb-3 text-[15px] font-semibold text-slate-700">{g}</h2>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {list
                  .filter((x) => x.group === g)
                  .map((img) => (
                    <ImageCard
                      key={img.path}
                      img={img}
                      value={ed.value![img.path]}
                      onPreview={() => setPreviewPath(pageFor(img.path))}
                      onChange={(url) =>
                        ed.update((m) => {
                          const next = { ...m };
                          if (url) next[img.path] = url;
                          else delete next[img.path];
                          return next;
                        })
                      }
                    />
                  ))}
              </div>
            </section>
          ))}
          <p className="text-[13px] text-slate-500">Your logo is changed in Logo & Colours. Blog, package and gallery photos are added on their own pages.</p>
          <SaveRow {...ed} onSave={ed.save} />
        </div>
        </LivePreview>
      )}
    </AdminLayout>
  );
}
