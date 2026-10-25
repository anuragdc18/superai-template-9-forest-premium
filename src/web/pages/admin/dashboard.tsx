import { useMemo } from "react";
import { Link } from "wouter";
import { ArrowRight, Bot, CalendarDays, CheckCircle2, Contact, Globe, Palette, UserPlus, Users } from "lucide-react";
import { AdminLayout, Card } from "./layout";
import { useLeads } from "../../queries/leads";
import { LEAD_STATUSES, LEAD_STATUS_LABEL, type LeadStatus } from "../../../api/lib/lead-status";
import { STATUS_STYLE } from "./lead-styles";

const DAY = 86_400_000;

function Donut({ pct, color = "#1572e8" }: { pct: number; color?: string }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 130 130" className="h-40 w-40" aria-hidden="true">
      <circle cx="65" cy="65" r={r} fill="none" stroke="#eef1f6" strokeWidth="11" />
      {pct > 0 && <circle
        cx="65"
        cy="65"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="11"
        strokeLinecap="round"
        strokeDasharray={`${(pct / 100) * c} ${c}`}
        transform="rotate(-90 65 65)"
        style={{ transition: "stroke-dasharray 0.8s ease" }}
      />}
      <text x="65" y="73" textAnchor="middle" className="fill-slate-700" style={{ fontSize: 26, fontWeight: 400 }}>
        {pct}%
      </text>
    </svg>
  );
}

export default function DashboardPage() {
  const { data, isPending } = useLeads();
  const leads = useMemo(() => data ?? [], [data]);

  const stats = useMemo(() => {
    const now = Date.now();
    const today = new Date().setHours(0, 0, 0, 0);
    const byStatus = Object.fromEntries(LEAD_STATUSES.map((s) => [s, 0])) as Record<LeadStatus, number>;
    for (const l of leads) {
      const s = (l.status ?? "new") as LeadStatus;
      byStatus[s in byStatus ? s : "new"]++;
    }
    return {
      total: leads.length,
      today: leads.filter((l) => new Date(l.createdAt).getTime() >= today).length,
      week: leads.filter((l) => now - new Date(l.createdAt).getTime() < 7 * DAY).length,
      chatbot: leads.filter((l) => l.source === "chatbot").length,
      byStatus,
    };
  }, [leads]);

  const convPct = stats.total ? Math.round((stats.byStatus.converted / stats.total) * 100) : 0;

  const topServices = useMemo(() => {
    const m = new Map<string, number>();
    for (const l of leads) m.set(l.service, (m.get(l.service) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [leads]);

  const cards = [
    { label: "New Leads", value: stats.byStatus.new, icon: UserPlus, bg: "bg-[#fdaf4b]" },
    { label: "Converted", value: stats.byStatus.converted, icon: CheckCircle2, bg: "bg-[#59d05d]" },
    { label: "Today", value: stats.today, icon: CalendarDays, bg: "bg-[#f3545d]" },
    { label: "Total Leads", value: stats.total, icon: Users, bg: "bg-[#1572e8]" },
  ];
  const v = (n: number) => (isPending ? "–" : n.toLocaleString("en-IN"));

  return (
    <AdminLayout title="Dashboard">
      <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className={`flex items-center gap-3 rounded-md px-4 py-4 text-white sm:gap-5 sm:px-6 sm:py-5 shadow-[0_6px_18px_-10px_rgba(0,0,0,0.35)] ${c.bg}`}>
            <c.icon className="h-8 w-8 shrink-0 opacity-90 sm:h-10 sm:w-10" strokeWidth={1.6} />
            <div className="leading-tight">
              <p className="text-[14px] font-medium opacity-90">{c.label}</p>
              <p className="mt-1 text-[24px] font-bold">{v(c.value)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)]">
        <Card title="Conversion" subtitle="Leads turned into customers" bodyClass="">
          <div className="grid place-items-center px-5 py-6">
            <Donut pct={convPct} />
          </div>
          <div className="flex items-center gap-2 border-t border-slate-100 px-5 py-3 text-[13.5px] text-slate-600">
            <span className="h-2.5 w-2.5 rounded-full border-2 border-blue-600" />
            {stats.byStatus.converted} of {stats.total} converted
          </div>
        </Card>

        <Card title="Lead Status" subtitle="Where every enquiry stands right now">
          <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {LEAD_STATUSES.map((s) => {
              const n = stats.byStatus[s];
              const pct = stats.total ? (n / stats.total) * 100 : 0;
              return (
                <Link key={s} to="/admin/leads" className="group block">
                  <div className="flex justify-between text-[13.5px]">
                    <span className="font-medium text-slate-600 group-hover:text-blue-600">{LEAD_STATUS_LABEL[s]}</span>
                    <span className="font-semibold text-slate-800">{n}</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${STATUS_STYLE[s].solid}`} style={{ width: `${Math.max(pct, n ? 4 : 0)}%` }} />
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="mt-6 grid grid-cols-3 divide-x divide-slate-100 rounded-md bg-slate-50 py-4 text-center">
            <div>
              <p className="text-[12.5px] text-slate-500">Last 7 days</p>
              <p className="mt-1 text-xl font-bold text-slate-800">{v(stats.week)}</p>
            </div>
            <div>
              <p className="flex items-center justify-center gap-1 text-[12.5px] text-slate-500">
                <Bot className="h-3.5 w-3.5" /> From chatbot
              </p>
              <p className="mt-1 text-xl font-bold text-slate-800">{v(stats.chatbot)}</p>
            </div>
            <div>
              <p className="flex items-center justify-center gap-1 text-[12.5px] text-slate-500">
                <Globe className="h-3.5 w-3.5" /> From forms
              </p>
              <p className="mt-1 text-xl font-bold text-slate-800">{v(stats.total - stats.chatbot)}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card
          title="Latest Leads"
          subtitle="Newest enquiries from your website"
          bodyClass=""
          right={
            <Link to="/admin/leads" className="flex items-center gap-1 text-[13.5px] font-semibold text-blue-600 hover:gap-2">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          }
        >
          {leads.length === 0 ? (
            <p className="px-5 py-12 text-center text-[14px] text-slate-500">
              {isPending ? "Loading..." : "No leads yet. Enquiries from the website will show here."}
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {leads.slice(0, 6).map((l) => {
                const s = ((l.status ?? "new") as LeadStatus) in STATUS_STYLE ? ((l.status ?? "new") as LeadStatus) : "new";
                return (
                  <li key={l.id} className="flex items-center gap-3 px-5 py-3.5">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-50 text-[14px] font-semibold text-blue-700">
                      {l.name.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-semibold text-slate-800">{l.name}</p>
                      <p className="truncate text-[13px] text-slate-500">
                        {l.service} · {l.phone}
                      </p>
                    </div>
                    <span className={`hidden rounded-full px-2.5 py-0.5 text-[12px] font-semibold ring-1 sm:inline ${STATUS_STYLE[s].pill}`}>
                      {LEAD_STATUS_LABEL[s]}
                    </span>
                    <span className="whitespace-nowrap text-[12.5px] text-slate-400">
                      {new Date(l.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <div className="space-y-6">
          <Card title="Most Asked Services" subtitle="Top 5 by number of enquiries">
            {topServices.length === 0 ? (
              <p className="text-[14px] text-slate-500">No data yet.</p>
            ) : (
              <ul className="space-y-3.5">
                {topServices.map(([name, n], i) => (
                  <li key={name}>
                    <div className="flex justify-between text-[13.5px]">
                      <span className="truncate font-medium text-slate-600">{name}</span>
                      <span className="font-semibold text-slate-800">{n}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${["bg-[#1572e8]", "bg-[#59d05d]", "bg-[#fdaf4b]", "bg-[#48abf7]", "bg-[#f3545d]"][i]}`}
                        style={{ width: `${(n / topServices[0][1]) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Quick Actions">
            <div className="grid grid-cols-3 gap-3">
              {[
                { to: "/admin/contact", label: "Contact Info", icon: Contact, tone: "bg-orange-50 text-orange-600" },
                { to: "/admin/bot", label: "Chat Bot", icon: Bot, tone: "bg-green-50 text-green-600" },
                { to: "/admin/branding", label: "Logo & Colours", icon: Palette, tone: "bg-blue-50 text-blue-600" },
              ].map((q) => (
                <Link
                  key={q.to}
                  to={q.to}
                  className="flex flex-col items-center gap-2 rounded-md border border-slate-100 px-2 py-4 text-center text-[13px] font-medium text-slate-600 transition hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-700"
                >
                  <span className={`grid h-10 w-10 place-items-center rounded-full ${q.tone}`}>
                    <q.icon className="h-5 w-5" />
                  </span>
                  {q.label}
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
