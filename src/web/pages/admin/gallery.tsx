import { Loader2 } from "lucide-react";
import { AdminLayout, Card, Field } from "./layout";
import { AddButton, ImagePicker, RowTools, SaveRow, Toggle, input, move, useEditable } from "./ui";
import { client } from "../../lib/api";
import { useAllContent, useContentAction } from "../../queries/content";
import { uid, type Content, type GalleryItem } from "../../../api/lib/content-schema";

type State = { items: GalleryItem[]; section: Content["gallerySection"] };

export default function GalleryPage() {
  const { data } = useAllContent();
  const act = useContentAction();
  const ed = useEditable<State>(data ? { items: data.gallery, section: data.gallerySection } : undefined, (v) =>
    act(() => client.content.saveGallery({ ...v, items: v.items.filter((g) => g.image) })),
  );
  const v = ed.value;
  const patch = (i: number, p: Partial<GalleryItem>) => ed.update((s) => ({ ...s, items: s.items.map((x, j) => (j === i ? { ...x, ...p } : x)) }));
  const sec = (p: Partial<State["section"]>) => ed.update((s) => ({ ...s, section: { ...s.section, ...p } }));

  return (
    <AdminLayout title="Gallery / Our Work" subtitle="Photos of your work, shown on the Our Work page. The page appears once you add a photo.">
      {!v ? (
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      ) : (
        <>
          <Card title="Our Work page">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Heading">
                <input aria-label="Heading" className={input} value={v.section.title} onChange={(e) => sec({ title: e.target.value })} />
              </Field>
              <Field label="Short line under the heading">
                <input aria-label="Subheading" className={input} value={v.section.subtitle} onChange={(e) => sec({ subtitle: e.target.value })} />
              </Field>
            </div>
            <div className="mt-5">
              <Toggle checked={v.section.show} onChange={(x) => sec({ show: x })} label="Show the Our Work page and menu link" />
            </div>
          </Card>
          <div className="mt-6 grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
            {v.items.map((g, i) => (
              <Card key={g.id} bodyClass="p-4">
                <ImagePicker label="Photo" value={g.image} onChange={(url) => patch(i, { image: url })} aspect="aspect-[4/3]" />
                <div className="mt-3 grid gap-3">
                  <input aria-label="Title" className={input} placeholder="Title (e.g. Logo for Sri Sai Foods)" value={g.title} onChange={(e) => patch(i, { title: e.target.value })} />
                  <input aria-label="Category" className={input} placeholder="Category (e.g. Logo, Website)" value={g.category} onChange={(e) => patch(i, { category: e.target.value })} />
                  <textarea aria-label="Description" className={`${input} !h-20 py-2.5`} placeholder="Short description (optional)" value={g.description} onChange={(e) => patch(i, { description: e.target.value })} />
                  <input aria-label="Link" className={input} placeholder="Link (optional, e.g. the live website)" value={g.link} onChange={(e) => patch(i, { link: e.target.value })} />
                  <div className="flex items-center justify-between gap-3">
                    <Toggle checked={g.visible} onChange={(x) => patch(i, { visible: x })} label="Show" />
                    <RowTools
                      i={i}
                      count={v.items.length}
                      label="photo"
                      onMove={(a, b) => ed.update((s) => ({ ...s, items: move(s.items, a, b) }))}
                      onRemove={() => ed.update((s) => ({ ...s, items: s.items.filter((_, j) => j !== i) }))}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <div className="mt-4">
            <AddButton onClick={() => ed.update((s) => ({ ...s, items: [...s.items, { id: uid(), title: "", image: "", category: "", link: "", description: "", visible: true }] }))}>
              Add photo
            </AddButton>
          </div>
          <SaveRow {...ed} onSave={ed.save} />
        </>
      )}
    </AdminLayout>
  );
}
