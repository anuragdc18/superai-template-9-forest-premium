import { useEffect, useMemo, useState } from "react";
import { useSearch } from "wouter";
import { Bot, Download, Inbox, Loader2, Phone, Search, Trash2 } from "lucide-react";
import { AdminLayout, Card } from "./layout";
import { useLeads, useRemoveLead, useSetLeadStatus } from "../../queries/leads";
import { WaIcon } from "../../components/header";
import { LEAD_STATUSES as STATUSES, LEAD_STATUS_LABEL, type LeadStatus as Status } from "../../../api/lib/lead-status";
import { STATUS_STYLE } from "./lead-styles";


const fmtDate = (d: Date | string) =>
  new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

const sourceLabel = (s: string | null) => {
  if (!s) return "Website";
  if (s === "chatbot") return "Chatbot";
  if (s === "home") return "Home page";
  if (s === "contact") return "Contact page";
  const [kind, rest] = s.split(":");
  return `${kind === "service" ? "Service" : "Category"} · ${rest?.replace(/-/g, " ")}`;
};

export default function LeadsPage() {
  const { data, isPending, error } = useLeads();
  const setStatus = useSetLeadStatus();
  const remove = useRemoveLead();
  const search = useSearch();
  const [q, setQ] = useState(() => new URLSearchParams(search).get("q") ?? "");
  useEffect(() => {
    const v = new URLSearchParams(search).get("q");
    if (v !== null) setQ(v);
  }, [search]);
  const [filter, setFilter] = useState<"all" | Status>("all");

  const leads = useMemo(() => data ?? [], [data]);
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: leads.length };
    for (const s of STATUSES) c[s] = leads.filter((l) => (l.status ?? "new") === s).length;
    return c;
  }, [leads]);

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    return leads.filter(
      (l) =>
        (filter === "all" || ((STATUSES as readonly string[]).includes(l.status ?? "new") ? (l.status ?? "new") : "new") === filter) &&
        (!t || [l.name, l.phone, l.service, l.email ?? "", l.message ?? ""].some((v) => v.toLowerCase().includes(t))),
    );
  }, [leads, q, filter]);

  const exportCsv = () => {
    const head = ["Date", "Name", "Phone", "Email", "Service", "Message", "Source", "Status"];
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = rows.map((l) =>
      [new Date(l.createdAt).toISOString(), l.name, l.phone, l.email, l.service, l.message, sourceLabel(l.source), LEAD_STATUS_LABEL[(l.status ?? "new") as Status] ?? l.status]
        .map(esc)
        .join(","),
    );
    const blob = new Blob([[head.join(","), ...lines].join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <AdminLayout title="Leads" subtitle="Everyone who filled a form or chatted with the assistant on your website.">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">
        {(["all", ...STATUSES] as const).map((s) => {
          const active = filter === s;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-md p-4 text-left transition ${
                active
                  ? `${s === "all" ? "bg-slate-800" : STATUS_STYLE[s].solid} text-white shadow-lg`
                  : "bg-white text-slate-700 shadow-[0_1px_15px_rgba(69,65,78,0.08)] hover:-translate-y-0.5"
              }`}
            >
              <span className="flex items-center gap-2 text-[13px] font-medium">
                {s !== "all" && <span className={`h-2 w-2 rounded-full ${active ? "bg-white" : STATUS_STYLE[s].dot}`} />}
                {s === "all" ? "All leads" : LEAD_STATUS_LABEL[s]}
              </span>
              <span className="mt-1 block text-2xl font-bold">{counts[s] ?? 0}</span>
            </button>
          );
        })}
      </div>

      <Card className="mt-6 overflow-hidden" bodyClass="">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
          <label className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              aria-label="Search leads"
              className="field !h-11 !pl-11"
              placeholder="Search name, phone or service"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </label>
          <button
            onClick={exportCsv}
            disabled={!rows.length}
            className="flex h-11 items-center gap-2 rounded-md bg-blue-600 px-4 text-[14px] font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>

        {isPending ? (
          <div className="grid h-60 place-items-center">
            <Loader2 className="h-6 w-6 animate-spin text-royal" />
          </div>
        ) : error ? (
          <p className="p-8 text-center text-red-600">Could not load leads. Please log in again.</p>
        ) : rows.length === 0 ? (
          <div className="flex h-60 flex-col items-center justify-center gap-2 text-center">
            <Inbox className="h-9 w-9 text-slate-300" />
            <p className="font-semibold text-navy">{leads.length ? "No leads match your search" : "No leads yet"}</p>
            <p className="text-[14px]">Enquiries from the website forms and chatbot will show up here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-[14px]">
              <thead className="bg-slate-50 text-[12.5px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Service</th>
                  <th className="px-4 py-3 font-semibold">Source</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((l) => {
                  const raw = (l.status ?? "new") as Status;
                  const status: Status = STATUSES.includes(raw) ? raw : "new";
                  return (
                    <tr key={l.id} className="align-top hover:bg-surface/60">
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-navy">{l.name}</p>
                        <div className="mt-1 flex items-center gap-3 text-[13px]">
                          <a href={`tel:+91${l.phone}`} className="flex items-center gap-1 text-royal hover:underline">
                            <Phone className="h-3.5 w-3.5" /> {l.phone}
                          </a>
                          <a
                            href={`https://wa.me/91${l.phone}?text=${encodeURIComponent(`Hi ${l.name}, this is regarding your enquiry for ${l.service}.`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-green-700 hover:underline"
                          >
                            <WaIcon className="h-3.5 w-3.5" /> WhatsApp
                          </a>
                        </div>
                        {l.email && <p className="mt-0.5 text-[13px] text-slate-500">{l.email}</p>}
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-navy">{l.service}</p>
                        {l.message && <p className="mt-0.5 max-w-xs text-[13px] text-slate-500">{l.message}</p>}
                      </td>
                      <td className="px-4 py-3.5 capitalize">
                        {l.source === "chatbot" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[12.5px] font-medium text-violet-700">
                            <Bot className="h-3.5 w-3.5" /> Chatbot
                          </span>
                        ) : (
                          sourceLabel(l.source)
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">{fmtDate(l.createdAt)}</td>
                      <td className="px-4 py-3.5">
                        <label className={`relative inline-flex items-center rounded-full ring-1 ${STATUS_STYLE[status].pill}`}>
                          <span className={`pointer-events-none absolute left-3 h-2 w-2 rounded-full ${STATUS_STYLE[status].dot}`} />
                          <select
                            aria-label="Lead status"
                            value={status}
                            onChange={(e) => setStatus.mutate({ id: l.id, status: e.target.value as Status })}
                            className="cursor-pointer appearance-none rounded-full bg-transparent py-1.5 pl-7 pr-7 text-[13px] font-semibold outline-none"
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s} className="bg-white text-slate-800">
                                {LEAD_STATUS_LABEL[s]}
                              </option>
                            ))}
                          </select>
                          <span className="pointer-events-none absolute right-3 text-[10px]">▼</span>
                        </label>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => confirm(`Delete lead from ${l.name}?`) && remove.mutate({ id: l.id })}
                          aria-label="Delete lead"
                          className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </AdminLayout>
  );
}
