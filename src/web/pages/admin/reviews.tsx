import { Loader2, Star } from "lucide-react";
import { AdminLayout, Card, Field } from "./layout";
import { AddButton, RowTools, SaveRow, Toggle, input, move, useEditable } from "./ui";
import { client } from "../../lib/api";
import { useAllContent, useContentAction } from "../../queries/content";
import { uid, type Content, type Review } from "../../../api/lib/content-schema";

type State = { reviews: Review[]; section: Content["reviewsSection"] };

function Stars({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n} stars`} onClick={() => onChange(n)}>
          <Star className={`h-6 w-6 ${n <= value ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
        </button>
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const { data } = useAllContent();
  const act = useContentAction();
  const ed = useEditable<State>(data ? { reviews: data.reviews, section: data.reviewsSection } : undefined, (v) => act(() => client.content.saveReviews(v)));
  const v = ed.value;
  const patch = (i: number, p: Partial<Review>) => ed.update((s) => ({ ...s, reviews: s.reviews.map((r, j) => (j === i ? { ...r, ...p } : r)) }));
  const sec = (p: Partial<State["section"]>) => ed.update((s) => ({ ...s, section: { ...s.section, ...p } }));

  return (
    <AdminLayout title="Reviews" subtitle="Customer reviews shown on your website. Please add only real reviews from real customers.">
      {!v ? (
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      ) : (
        <>
          <Card title="Reviews section" subtitle="Your Google rating and how reviews appear.">
            <div className="grid gap-5 sm:grid-cols-3">
              <Field label="Google rating" hint="e.g. 4.8 — leave empty to hide">
                <input aria-label="Google rating" className={input} value={v.section.rating} onChange={(e) => sec({ rating: e.target.value })} />
              </Field>
              <Field label="Number of Google reviews" hint="Optional">
                <input aria-label="Number of Google reviews" className={input} inputMode="numeric" value={v.section.ratingCount} onChange={(e) => sec({ ratingCount: e.target.value })} />
              </Field>
              <Field label="Google reviews link" hint="Your Google Business Profile reviews page">
                <input aria-label="Google reviews link" className={input} value={v.section.googleUrl} onChange={(e) => sec({ googleUrl: e.target.value })} />
              </Field>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Toggle checked={v.section.show} onChange={(x) => sec({ show: x })} label="Show reviews on the website" />
              <Toggle
                checked={v.section.inStructuredData}
                onChange={(x) => sec({ inStructuredData: x })}
                label="Show star rating to Google"
                hint="Turn on only when the rating and reviews are real — Google can penalise fake reviews."
              />
            </div>
          </Card>

          <div className="mt-6 space-y-4">
            {v.reviews.map((r, i) => (
              <Card key={r.id} bodyClass="p-5">
                <div className="flex flex-wrap items-start gap-4">
                  <div className="grid min-w-[260px] flex-1 gap-3">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <input aria-label="Customer name" className={input} placeholder="Customer name" value={r.name} onChange={(e) => patch(i, { name: e.target.value })} />
                      <input aria-label="City or company" className={input} placeholder="City / company" value={r.place} onChange={(e) => patch(i, { place: e.target.value })} />
                      <input aria-label="Review date" type="date" className={input} value={r.date} onChange={(e) => patch(i, { date: e.target.value })} />
                    </div>
                    <textarea aria-label="Review" className={`${input} !h-24 py-3`} placeholder="What the customer said" value={r.text} onChange={(e) => patch(i, { text: e.target.value })} />
                    <div className="flex flex-wrap items-center gap-6">
                      <Stars value={r.rating} onChange={(n) => patch(i, { rating: n })} />
                      <input aria-label="Source" className={`${input} !h-10 max-w-[200px]`} placeholder="Source (Google, WhatsApp…)" value={r.source} onChange={(e) => patch(i, { source: e.target.value })} />
                      <Toggle checked={r.visible} onChange={(x) => patch(i, { visible: x })} label="Show on website" />
                    </div>
                  </div>
                  <RowTools
                    i={i}
                    count={v.reviews.length}
                    label="review"
                    onMove={(a, b) => ed.update((s) => ({ ...s, reviews: move(s.reviews, a, b) }))}
                    onRemove={() => ed.update((s) => ({ ...s, reviews: s.reviews.filter((_, j) => j !== i) }))}
                  />
                </div>
              </Card>
            ))}
          </div>
          <div className="mt-4">
            <AddButton onClick={() => ed.update((s) => ({ ...s, reviews: [...s.reviews, { id: uid(), name: "", place: "", rating: 5, text: "", date: "", source: "", visible: true }] }))}>
              Add review
            </AddButton>
          </div>
          <SaveRow {...ed} onSave={ed.save} />
        </>
      )}
    </AdminLayout>
  );
}
