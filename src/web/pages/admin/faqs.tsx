import { Loader2 } from "lucide-react";
import { AdminLayout, Card } from "./layout";
import { AddButton, RowTools, SaveRow, Toggle, input, move, useEditable } from "./ui";
import { client } from "../../lib/api";
import { useAllContent, useContentAction } from "../../queries/content";
import { uid, type Faq } from "../../../api/lib/content-schema";

export default function FaqsPage() {
  const { data } = useAllContent();
  const act = useContentAction();
  const ed = useEditable<Faq[]>(data?.faqs, (v) => act(() => client.content.saveFaqs(v.filter((f) => f.q.trim() || f.a.trim()))));
  const list = ed.value;
  const patch = (i: number, p: Partial<Faq>) => ed.update((l) => l.map((f, j) => (j === i ? { ...f, ...p } : f)));

  return (
    <AdminLayout title="FAQs" subtitle="Questions and answers shown in the FAQ section of your website. Google can show them too.">
      {!list ? (
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      ) : (
        <>
          <div className="space-y-4">
            {list.map((f, i) => (
              <Card key={f.id} bodyClass="p-5">
                <div className="flex flex-wrap items-start gap-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-50 text-[13px] font-bold text-blue-600">{i + 1}</span>
                  <div className="grid min-w-[240px] flex-1 gap-3">
                    <input aria-label="Question" className={input} placeholder="Question" value={f.q} onChange={(e) => patch(i, { q: e.target.value })} />
                    <textarea aria-label="Answer" className={`${input} !h-28 py-3`} placeholder="Answer" value={f.a} onChange={(e) => patch(i, { a: e.target.value })} />
                    <Toggle checked={f.visible} onChange={(v) => patch(i, { visible: v })} label="Show on website" />
                  </div>
                  <RowTools i={i} count={list.length} label="question" onMove={(a, b) => ed.update((l) => move(l, a, b))} onRemove={() => ed.update((l) => l.filter((_, j) => j !== i))} />
                </div>
              </Card>
            ))}
          </div>
          <div className="mt-4">
            <AddButton onClick={() => ed.update((l) => [...l, { id: uid(), q: "", a: "", visible: true }])}>Add question</AddButton>
          </div>
          <SaveRow {...ed} onSave={ed.save} />
        </>
      )}
    </AdminLayout>
  );
}
