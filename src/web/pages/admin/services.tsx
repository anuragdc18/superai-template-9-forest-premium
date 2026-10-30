import { useState } from "react";
import { EyeOff, Loader2, RotateCcw, Trash2 } from "lucide-react";
import { AdminLayout, Card } from "./layout";
import { AddButton, SaveRow, Toggle, input, useEditable } from "./ui";
import { client } from "../../lib/api";
import { BASE_CATEGORIES } from "../../lib/live-categories";
import { useAllContent, useContentAction } from "../../queries/content";
import type { ServiceEdit } from "../../../api/lib/content-schema";

/** Row shown in the editor: a built-in service (original set) or a new one (original ""). */
type Row = ServiceEdit & { key: string };

function rowsFrom(edits: ServiceEdit[]): Row[] {
  const rows: Row[] = [];
  for (const c of BASE_CATEGORIES) {
    for (const s of c.services) {
      const e = edits.find((x) => x.cat === c.slug && x.original === s.name);
      rows.push({ key: `${c.slug}|${s.name}`, cat: c.slug, original: s.name, name: e?.name || s.name, text: e?.text || s.text, days: e?.days ?? s.days ?? "", hidden: e?.hidden ?? false });
    }
    edits
      .filter((x) => x.cat === c.slug && !x.original)
      .forEach((x, i) => rows.push({ ...x, key: `${c.slug}|new|${i}|${x.name}` }));
  }
  return rows;
}

/** Keep only real changes, so future updates to the built-in list still come through. */
function editsFrom(rows: Row[]): ServiceEdit[] {
  const out: ServiceEdit[] = [];
  for (const r of rows) {
    const { key: _k, ...e } = r;
    if (!e.original) {
      if (e.name.trim()) out.push(e);
      continue;
    }
    const base = BASE_CATEGORIES.find((c) => c.slug === e.cat)?.services.find((s) => s.name === e.original);
    if (!base) continue;
    const changed = e.hidden || e.name !== base.name || e.text !== base.text || (e.days || "") !== (base.days || "");
    if (changed) out.push(e);
  }
  return out;
}

export default function ServicesPage() {
  const { data } = useAllContent();
  const act = useContentAction();
  const ed = useEditable<Row[]>(data ? rowsFrom(data.services) : undefined, (rows) => act(() => client.content.saveServices(editsFrom(rows))));
  const [open, setOpen] = useState(BASE_CATEGORIES[0]?.slug ?? "");
  const rows = ed.value;
  const patch = (key: string, p: Partial<Row>) => ed.update((l) => l.map((r) => (r.key === key ? { ...r, ...p } : r)));

  return (
    <AdminLayout title="Services" subtitle="Change service names and descriptions, hide services you don't offer, or add new ones.">
      {!rows ? (
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            {BASE_CATEGORIES.map((c) => (
              <button
                key={c.slug}
                type="button"
                onClick={() => setOpen(c.slug)}
                className={`rounded-full px-4 py-2 text-[13.5px] font-semibold ${open === c.slug ? "bg-blue-600 text-white" : "bg-white text-slate-600 shadow-[0_1px_8px_rgba(69,65,78,0.08)] hover:text-blue-600"}`}
              >
                {c.title} <span className="opacity-70">({rows.filter((r) => r.cat === c.slug && !r.hidden).length})</span>
              </button>
            ))}
          </div>
          {BASE_CATEGORIES.filter((c) => c.slug === open).map((c) => (
            <Card key={c.slug} title={c.title} subtitle="Changing a name also changes that service's web address." bodyClass="divide-y divide-slate-100">
              {rows
                .filter((r) => r.cat === c.slug)
                .map((r) => {
                  const base = c.services.find((s) => s.name === r.original);
                  const changed = !!base && (r.name !== base.name || r.text !== base.text || (r.days || "") !== (base.days || ""));
                  return (
                    <div key={r.key} className={`grid gap-3 p-4 lg:grid-cols-[1fr_1.6fr_160px_auto] lg:items-start ${r.hidden ? "bg-slate-50 opacity-60" : ""}`}>
                      <input aria-label="Service name" className={input} value={r.name} onChange={(e) => patch(r.key, { name: e.target.value })} />
                      <textarea aria-label="Description" className={`${input} !h-[72px] py-2.5`} value={r.text} onChange={(e) => patch(r.key, { text: e.target.value })} />
                      <input aria-label="Time taken" className={input} placeholder="Time (e.g. 3–7 days)" value={r.days} onChange={(e) => patch(r.key, { days: e.target.value })} />
                      <div className="flex items-center gap-3">
                        {r.original ? (
                          <>
                            <Toggle checked={!r.hidden} onChange={(v) => patch(r.key, { hidden: !v })} label={r.hidden ? "Hidden" : "Shown"} />
                            {changed && base && (
                              <button type="button" title="Undo my changes" aria-label="Undo changes" onClick={() => patch(r.key, { name: base.name, text: base.text, days: base.days ?? "" })} className="text-slate-400 hover:text-blue-600">
                                <RotateCcw className="h-4 w-4" />
                              </button>
                            )}
                            {r.hidden && <EyeOff className="h-4 w-4 text-slate-400" />}
                          </>
                        ) : (
                          <button type="button" aria-label="Delete new service" onClick={() => ed.update((l) => l.filter((x) => x.key !== r.key))} className="flex items-center gap-1 rounded-md px-2 py-2 text-[13px] text-red-600 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" /> Delete
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              <div className="p-4">
                <AddButton onClick={() => ed.update((l) => [...l, { key: `${c.slug}|new|${Date.now()}`, cat: c.slug, original: "", name: "", text: "", days: "", hidden: false }])}>
                  Add a new service to {c.title}
                </AddButton>
              </div>
            </Card>
          ))}
          <SaveRow {...ed} onSave={ed.save} />
        </>
      )}
    </AdminLayout>
  );
}
