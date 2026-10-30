import { useMemo, useState } from "react";
import { Link } from "wouter";
import { CalendarClock, ExternalLink, FileText, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { AdminLayout, Card, Field } from "./layout";
import { SaveRow, Toggle, input, useEditable } from "./ui";
import { client } from "../../lib/api";
import { useAllContent, useContentAction } from "../../queries/content";
import { isLive, type Content, type Post } from "../../../api/lib/content-schema";

const fmt = (iso: string) => (iso ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "");

function StatusPill({ p }: { p: Post }) {
  const live = isLive(p);
  if (p.status === "draft") return <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[12px] font-semibold text-slate-600">Draft</span>;
  if (!live)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[12px] font-semibold text-amber-700">
        <CalendarClock className="h-3.5 w-3.5" /> Scheduled · {fmt(p.publishAt)}
      </span>
    );
  return <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-[12px] font-semibold text-green-700">Published</span>;
}

export default function BlogListPage() {
  const { data, isPending } = useAllContent();
  const act = useContentAction();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft" | "scheduled">("all");
  const settings = useEditable<Content["blog"]>(data?.blog, (v) => act(() => client.content.saveBlog(v)));

  const posts = useMemo(() => {
    const list = [...(data?.posts ?? [])].sort((a, b) => Date.parse(b.publishAt || b.createdAt) - Date.parse(a.publishAt || a.createdAt));
    return list.filter((p) => {
      const st = p.status === "draft" ? "draft" : isLive(p) ? "published" : "scheduled";
      return (filter === "all" || st === filter) && (!q || `${p.title} ${p.category} ${p.tags.join(" ")}`.toLowerCase().includes(q.toLowerCase()));
    });
  }, [data, q, filter]);

  const remove = (p: Post) => confirm(`Delete "${p.title}"? This cannot be undone.`) && act(() => client.content.removePost({ id: p.id }));

  return (
    <AdminLayout
      title="Blog"
      subtitle="Write articles that help customers and bring visitors from Google."
      actions={
        <Link to="/admin/blog/new" className="flex h-11 items-center gap-2 rounded-md bg-blue-600 px-5 text-[14px] font-semibold text-white shadow-[0_8px_20px_-8px_rgba(37,99,235,0.7)] hover:bg-blue-700">
          <Plus className="h-4 w-4" /> New post
        </Link>
      }
    >
      <Card bodyClass="">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
          <label className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input aria-label="Search posts" className={`${input} !h-11 !pl-11`} placeholder="Search posts" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
          <div className="flex gap-1 rounded-md bg-slate-100 p-1">
            {(["all", "published", "scheduled", "draft"] as const).map((f) => (
              <button key={f} type="button" onClick={() => setFilter(f)} className={`rounded px-3 py-1.5 text-[13px] font-semibold capitalize ${filter === f ? "bg-white text-blue-700 shadow" : "text-slate-500"}`}>
                {f}
              </button>
            ))}
          </div>
        </div>
        {isPending ? (
          <div className="grid h-48 place-items-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex h-56 flex-col items-center justify-center gap-2 text-center">
            <FileText className="h-9 w-9 text-slate-300" />
            <p className="font-semibold text-slate-700">No posts here yet</p>
            <Link to="/admin/blog/new" className="text-[14px] font-semibold text-blue-600 hover:underline">
              Write your first post →
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {posts.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-4 p-4">
                <div className="h-16 w-24 shrink-0 overflow-hidden rounded-md bg-slate-100">
                  {p.image ? <img src={p.image} alt="" className="h-full w-full object-cover" /> : <FileText className="m-auto mt-5 h-6 w-6 text-slate-300" />}
                </div>
                <div className="min-w-[220px] flex-1">
                  <Link to={`/admin/blog/${p.id}`} className="text-[15px] font-semibold text-slate-800 hover:text-blue-600">
                    {p.title}
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[12.5px] text-slate-500">
                    <StatusPill p={p} />
                    {p.category && <span>{p.category}</span>}
                    <span>· {fmt(p.publishAt || p.createdAt)}</span>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  {isLive(p) && (
                    <a href={`/blog/${p.slug}`} target="_blank" rel="noreferrer" title="View on website" className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 text-slate-400 hover:text-blue-600">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  <Link to={`/admin/blog/${p.id}`} title="Edit" className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 text-slate-400 hover:text-blue-600">
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <button type="button" onClick={() => remove(p)} title="Delete" aria-label={`Delete ${p.title}`} className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {settings.value && (
        <Card className="mt-6" title="Blog page settings">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Page heading">
              <input aria-label="Blog heading" className={input} value={settings.value.title} onChange={(e) => settings.update((s) => ({ ...s, title: e.target.value }))} />
            </Field>
            <Field label="Short line under the heading">
              <input aria-label="Blog subheading" className={input} value={settings.value.subtitle} onChange={(e) => settings.update((s) => ({ ...s, subtitle: e.target.value }))} />
            </Field>
          </div>
          <div className="mt-5">
            <Toggle checked={settings.value.show} onChange={(x) => settings.update((s) => ({ ...s, show: x }))} label="Show the Blog page and menu link" />
          </div>
          <SaveRow {...settings} onSave={settings.save} label="Save blog settings" />
        </Card>
      )}
    </AdminLayout>
  );
}
