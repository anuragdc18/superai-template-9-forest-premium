import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Bot,
  ChevronDown,
  ExternalLink,
  Inbox,
  LayoutDashboard,
  Loader2,
  LogOut,
  Mail,
  Menu,
  Contact,
  Palette,
  Search,
  UserCog,
  X,
} from "lucide-react";
import { authClient, signOut } from "../../lib/auth";
import { useSite } from "../../queries/site";
import { useLeads } from "../../queries/leads";

type NavItem = { to: string; label: string; icon: typeof Inbox; badge?: "new" | "total" };

const NAV: NavItem[] = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/leads", label: "Leads", icon: Inbox, badge: "new" },
  { to: "/admin/contact", label: "Contact Info", icon: Contact },
  { to: "/admin/bot", label: "Chat Bot", icon: Bot },
  { to: "/admin/branding", label: "Logo & Colours", icon: Palette },
  { to: "/admin/account", label: "Username & Password", icon: UserCog },
];

function useLeadCounts() {
  const { data } = useLeads();
  const leads = data ?? [];
  return { total: leads.length, fresh: leads.filter((l) => (l.status ?? "new") === "new").length };
}

function useLogout() {
  const qc = useQueryClient();
  const [, navigate] = useLocation();
  return async () => {
    await signOut();
    qc.clear();
    navigate("/admin");
  };
}

function Avatar({ initial, size = "h-9 w-9 text-[14px]" }: { initial: string; size?: string }) {
  return (
    <span className={`grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 font-semibold text-white ${size}`}>
      {initial}
    </span>
  );
}

function Sidebar({ userName, onNavigate }: { userName: string; onNavigate?: () => void }) {
  const [loc] = useLocation();
  const site = useSite();
  const logout = useLogout();
  const counts = useLeadCounts();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-full flex-col border-r border-slate-200 bg-white text-slate-600 shadow-[4px_0_24px_-18px_rgba(15,23,42,0.25)]">
      <div className="flex h-16 items-center gap-2.5 border-b border-slate-100 px-6">
        {site.logo ? (
          <img src={site.logo} alt={site.siteName} className="h-8 max-w-[150px] object-contain" />
        ) : (
          <span className="truncate text-[18px] font-semibold text-slate-800">{site.siteName}</span>
        )}
        <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-blue-600">Admin</span>
      </div>

      <div className="border-b border-slate-100 px-6 py-5">
        <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-3 text-left">
          <Avatar initial={userName.charAt(0).toUpperCase()} size="h-11 w-11 text-[16px]" />
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-[14.5px] font-semibold text-slate-800">{userName}</span>
            <span className="block text-[12.5px] text-slate-500">Administrator</span>
          </span>
          <ChevronDown className={`h-4 w-4 text-slate-400 transition ${open ? "rotate-180" : ""}`} />
        </button>
        {open && (
          <div className="mt-3 space-y-0.5 pl-14 text-[13.5px]">
            <Link to="/admin/account" onClick={onNavigate} className="block py-1 hover:text-blue-600">
              Change password
            </Link>
            <button onClick={logout} className="block py-1 hover:text-red-600">
              Logout
            </button>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        {NAV.map((n) => {
          const active = loc === n.to;
          const count = n.badge === "new" ? counts.fresh : n.badge === "total" ? counts.total : 0;
          return (
            <Link
              key={n.to}
              to={n.to}
              onClick={onNavigate}
              className={`group relative flex items-center gap-3.5 px-6 py-3 text-[14px] font-medium transition ${
                active ? "bg-blue-50/60 text-blue-700" : "hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span className={`absolute inset-y-0 left-0 w-[3px] rounded-r ${active ? "bg-blue-600" : "bg-transparent"}`} />
              <n.icon className={`h-[18px] w-[18px] ${active ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}`} />
              <span className="flex-1">{n.label}</span>
              {n.badge && (
                <span
                  className={`min-w-[26px] rounded-full px-2 py-0.5 text-center text-[11.5px] font-bold ${
                    count > 0 ? "bg-orange-500 text-white" : "border border-slate-200 text-slate-500"
                  }`}
                >
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-2 px-6 pb-6">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex h-11 items-center justify-center gap-2 rounded-md bg-blue-600 text-[14px] font-semibold text-white shadow-[0_8px_20px_-8px_rgba(37,99,235,0.7)] hover:bg-blue-700"
        >
          <ExternalLink className="h-4 w-4" /> View Website
        </a>
        <button
          onClick={logout}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-md text-[13.5px] font-medium text-slate-500 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </div>
  );
}

function TopBar({ userName, onMenu }: { userName: string; onMenu: () => void }) {
  const [, navigate] = useLocation();
  const counts = useLeadCounts();
  const logout = useLogout();
  const [q, setQ] = useState("");
  const [menu, setMenu] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menu]);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200/70 bg-white px-4 sm:px-6">
      <button
        onClick={onMenu}
        aria-label="Open menu"
        className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-slate-700 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          navigate(`/admin/leads?q=${encodeURIComponent(q.trim())}`);
        }}
        className="relative hidden w-full max-w-[300px] sm:block"
      >
        <input
          aria-label="Search leads"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search leads ..."
          className="h-10 w-full rounded-full border-0 bg-slate-100 pl-4 pr-10 text-[14px] text-slate-800 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/30"
        />
        <button type="submit" aria-label="Search" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600">
          <Search className="h-4 w-4" />
        </button>
      </form>

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <Link to="/admin/contact" aria-label="Contact info" className="grid h-10 w-10 place-items-center rounded-full text-slate-500 hover:bg-slate-100">
          <Mail className="h-[19px] w-[19px]" />
        </Link>
        <Link to="/admin/leads" aria-label="New leads" className="relative grid h-10 w-10 place-items-center rounded-full text-slate-500 hover:bg-slate-100">
          <Bell className="h-[19px] w-[19px]" />
          {counts.fresh > 0 && (
            <span className="absolute right-1 top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-red-500 px-1 text-[10.5px] font-bold text-white ring-2 ring-white">
              {counts.fresh}
            </span>
          )}
        </Link>
        <div ref={ref} className="relative ml-1">
          <button onClick={() => setMenu((v) => !v)} className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-slate-100">
            <Avatar initial={userName.charAt(0).toUpperCase()} />
            <span className="hidden text-[14px] font-medium text-slate-700 sm:block">{userName}</span>
            <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
          </button>
          {menu && (
            <div className="absolute right-0 top-12 w-52 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 text-[14px] shadow-xl">
              <Link to="/admin/account" onClick={() => setMenu(false)} className="flex items-center gap-2 px-4 py-2.5 text-slate-700 hover:bg-slate-50">
                <UserCog className="h-4 w-4 text-slate-400" /> Username & Password
              </Link>
              <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2.5 text-slate-700 hover:bg-slate-50">
                <ExternalLink className="h-4 w-4 text-slate-400" /> View Website
              </a>
              <button onClick={logout} className="flex w-full items-center gap-2 border-t border-slate-100 px-4 py-2.5 text-red-600 hover:bg-red-50">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export function AdminLayout({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [loc, navigate] = useLocation();
  const [drawer, setDrawer] = useState(false);
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session) navigate("/admin", { replace: true });
  }, [isPending, session, navigate]);
  useEffect(() => {
    setDrawer(false);
  }, [loc]);
  useEffect(() => {
    document.title = `${title} · Admin`;
  }, [title]);

  if (isPending || !session) {
    return (
      <div className="admin-theme grid min-h-screen place-items-center bg-[#f5f7fb]">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  const user = session.user as { name: string; username?: string };
  const userName = user.username ?? user.name;

  return (
    <div className="admin-theme min-h-screen bg-[#f5f7fb]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">
        <Sidebar userName={userName} />
      </aside>

      <div className={`fixed inset-0 z-50 lg:hidden ${drawer ? "" : "pointer-events-none"}`}>
        <button
          type="button"
          aria-label="Close menu overlay"
          tabIndex={-1}
          onClick={() => setDrawer(false)}
          className={`absolute inset-0 bg-slate-900/50 transition-opacity ${drawer ? "opacity-100" : "opacity-0"}`}
        />
        <div className={`absolute inset-y-0 left-0 w-72 transition-transform duration-300 ${drawer ? "translate-x-0" : "-translate-x-full"}`}>
          <Sidebar userName={userName} onNavigate={() => setDrawer(false)} />
          <button
            onClick={() => setDrawer(false)}
            aria-label="Close menu"
            className="absolute right-3 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="lg:pl-64">
        <TopBar userName={userName} onMenu={() => setDrawer(true)} />
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-[24px] font-semibold text-slate-800">{title}</h1>
              {subtitle && <p className="mt-1 text-[14px] text-slate-500">{subtitle}</p>}
            </div>
            {actions}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

/** White content card with title + subtitle header, like the reference dashboard. */
export function Card({
  title,
  subtitle,
  right,
  children,
  className = "",
  bodyClass = "p-5",
}: {
  title?: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClass?: string;
}) {
  return (
    <section className={`rounded-md bg-white shadow-[0_1px_15px_rgba(69,65,78,0.08)] ${className}`}>
      {title && (
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-[16.5px] font-semibold text-slate-800">{title}</h2>
            {subtitle && <p className="mt-0.5 text-[13px] text-slate-500">{subtitle}</p>}
          </div>
          {right}
        </div>
      )}
      <div className={bodyClass}>{children}</div>
    </section>
  );
}

/** Labelled form field. */
export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="grid gap-1.5">
      <span className="text-[13.5px] font-semibold text-slate-700">{label}</span>
      {children}
      {hint && <span className="text-[12.5px] text-slate-500">{hint}</span>}
    </div>
  );
}

/** Sticky save bar used on settings pages. */
export function SaveBar({ pending, saved, error, dirty }: { pending: boolean; saved: boolean; error: string | null; dirty?: boolean }) {
  return (
    <div className="sticky bottom-0 z-20 -mx-4 mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      {error && <p className="mr-auto text-[14px] font-medium text-red-600">{error}</p>}
      {!error && saved && <p className="mr-auto text-[14px] font-medium text-green-600">Saved. Your website is updated.</p>}
      {!error && !saved && dirty && <p className="mr-auto text-[14px] text-slate-500">You have unsaved changes.</p>}
      <button
        type="submit"
        disabled={pending}
        className="flex h-11 items-center gap-2 rounded-md bg-blue-600 px-6 text-[14px] font-semibold text-white shadow-[0_8px_20px_-8px_rgba(37,99,235,0.7)] hover:bg-blue-700 disabled:opacity-60"
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" />} Save Changes
      </button>
    </div>
  );
}
