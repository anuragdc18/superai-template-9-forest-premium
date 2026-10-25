import { useEffect, useState } from "react";
import { DEMO } from "../lib/demo";
import { Link, useLocation } from "wouter";
import { Clock, Mail, Menu, Minus, Phone, Plus, X, ArrowRight, LayoutDashboard } from "lucide-react";
import { CATEGORIES, serviceUrl, waLink } from "../lib/site";
import { telHref, useSite } from "../queries/site";
import { authClient } from "../lib/auth";

export function Logo({ light = false }: { light?: boolean }) {
  const site = useSite();
  return (
    <Link to="/" className="flex shrink-0 items-center" aria-label={`${site.siteName} home`}>
      {site.logo ? (
        <img src={site.logo} alt={site.siteName} style={{ height: site.logoHeight }} className="w-auto max-w-[220px] object-contain" />
      ) : (
        <span className={`serif whitespace-nowrap text-[28px] font-medium leading-none ${light ? "text-cream" : "text-navy"}`}>
          {site.siteName}
          <span className="text-brand">.</span>
        </span>
      )}
    </Link>
  );
}

function WaIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.04 21.5h-.01a9.4 9.4 0 0 1-4.8-1.32l-.34-.2-3.57.94.95-3.48-.22-.36a9.43 9.43 0 0 1-1.45-5.03c0-5.2 4.24-9.44 9.45-9.44a9.4 9.4 0 0 1 6.68 2.77 9.38 9.38 0 0 1 2.76 6.68c0 5.2-4.24 9.44-9.45 9.44m8.04-17.48A11.3 11.3 0 0 0 12.04.7C5.77.7.67 5.8.67 12.06c0 2 .52 3.96 1.52 5.68L.57 23.3l5.7-1.5a11.3 11.3 0 0 0 5.77 1.47h.01c6.26 0 11.36-5.1 11.37-11.37 0-3.03-1.18-5.89-3.34-8.04" />
    </svg>
  );
}
export { WaIcon };

export function Header() {
  const [open, setOpen] = useState(false);
  const [acc, setAcc] = useState<string | null>("registration");
  const [scrolled, setScrolled] = useState(false);
  const [loc] = useLocation();
  const site = useSite();
  // no login server in the GitHub Pages demo (DEMO never changes at runtime, so this hook order is stable)
  const { data: session } = DEMO ? { data: null } : authClient.useSession();

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on);
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => {
    setOpen(false);
  }, [loc]);

  return (
    <>
      <div className="hidden bg-navy text-[13px] text-white/85 md:block">
        <div className="container-x flex h-10 items-center justify-between">
          <div className="flex items-center gap-5">
            <a href={telHref(site.phone)} className="flex items-center gap-1.5 hover:text-white">
              <Phone className="h-3.5 w-3.5" /> {site.phone}
            </a>
            <a href={`mailto:${site.email}`} className="flex items-center gap-1.5 hover:text-white">
              <Mail className="h-3.5 w-3.5" /> {site.email}
            </a>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> {site.hours}
            </span>
          </div>
          <div className="flex items-center gap-3">
          {session && (
            <Link to="/admin/dashboard" className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 font-medium text-white hover:bg-white/20">
              <LayoutDashboard className="h-3.5 w-3.5" /> Dashboard
            </Link>
          )}
          <a
            href={waLink(site.whatsapp)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 font-medium text-white/90 hover:text-white"
          >
            <WaIcon className="h-3.5 w-3.5" /> WhatsApp Us
          </a>
          </div>
        </div>
      </div>

      <header
        className={`sticky top-0 z-50 border-b border-line bg-cream/95 backdrop-blur transition-shadow ${
          scrolled ? "shadow-[0_8px_24px_-16px_rgba(24,53,40,0.35)]" : ""
        }`}
      >
        <div className="container-x flex h-[72px] items-center gap-4">
          <Logo />

          <nav className="ml-auto hidden items-center gap-0 min-[1150px]:flex xl:gap-1">
            <Link
              to="/"
              className={`relative px-2.5 py-2 text-[14px] font-medium xl:px-3 ${loc === "/" ? "text-brand" : "text-navy hover:text-brand"}`}
            >
              Home
            </Link>
            {CATEGORIES.map((c, i) => (
              <div key={c.slug} className="group relative">
                <Link
                  to={`/services/${c.slug}`}
                  className={`flex items-center whitespace-nowrap px-2.5 py-2 text-[14px] font-medium transition xl:px-3 ${
                    loc === `/services/${c.slug}` ? "text-brand" : "text-navy group-hover:text-brand"
                  }`}
                >
                  {c.menu}
                </Link>
                <div className={`invisible absolute top-full ${i === CATEGORIES.length - 1 ? "right-0 w-[400px]" : "left-0 w-[300px]"} translate-y-2 pt-3 opacity-0 transition duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100`}>
                  <div className="rounded-xl border border-line bg-paper p-2 shadow-[0_24px_50px_-24px_rgba(24,53,40,0.4)]">
                    {c.menuItems.map((m) => (
                      <Link
                        key={m}
                        to={serviceUrl(c.slug, m)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[14px] text-navy hover:bg-sand hover:text-brand"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-moss" />
                        {m}
                      </Link>
                    ))}
                    <div className="mx-3 my-1 border-t border-line" />
                    <Link
                      to={`/services/${c.slug}`}
                      className="flex items-center gap-1.5 px-3 py-2.5 text-[14px] font-semibold text-brand hover:gap-2.5"
                    >
                      {c.slug === "microsoft-certifications" ? "See all certifications" : `See all ${c.menu.toLowerCase()} services`} <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </nav>
          <div className="hidden min-[1150px]:block">
            <Link to="/contact" className="btn-brand !px-5 !py-2.5 !text-[14px]">
              Get Started
            </Link>
          </div>

          <div className="ml-auto flex items-center gap-2 min-[1150px]:hidden">
            <button
              onClick={() => setOpen(true)}
              className="grid h-11 w-11 place-items-center rounded-full border border-line bg-paper text-navy"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div className={`fixed inset-0 z-[60] min-[1150px]:hidden ${open ? "" : "pointer-events-none"}`}>
        <button
          type="button"
          aria-label="Close menu overlay"
          tabIndex={-1}
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-navy/50 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        />
        <div
          className={`absolute right-0 top-0 flex h-full w-[88%] max-w-sm flex-col bg-cream shadow-2xl transition-transform duration-300 ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex h-[72px] items-center justify-between border-b border-line px-5">
            <Logo />
            <button onClick={() => setOpen(false)} aria-label="Close menu" className="p-2 text-navy">
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-3">
            <Link to="/" className="block border-b border-line py-3.5 font-semibold text-navy">
              Home
            </Link>
            {CATEGORIES.map((c) => {
              const isOpen = acc === c.slug;
              return (
                <div key={c.slug} className="border-b border-line">
                  <button
                    onClick={() => setAcc(isOpen ? null : c.slug)}
                    className="flex w-full items-center justify-between py-3.5 font-semibold text-navy"
                  >
                    {c.menu}
                    {isOpen ? <Minus className="h-4 w-4 text-brand" /> : <Plus className="h-4 w-4" />}
                  </button>
                  {isOpen && (
                    <div className="pb-3 pl-3">
                      {c.menuItems.map((m) => (
                        <Link
                          key={m}
                          to={serviceUrl(c.slug, m)}
                          onClick={() => setOpen(false)}
                          className="block py-2 text-[15px] text-body"
                        >
                          {m}
                        </Link>
                      ))}
                      <Link to={`/services/${c.slug}`} className="block py-2 text-[15px] font-semibold text-brand">
                        See all →
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
            <Link to="/contact" className="btn-brand mt-5 w-full">
              Get Started
            </Link>
            {session && (
              <Link to="/admin/dashboard" className="block py-3.5 font-semibold text-royal">
                Owner Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
