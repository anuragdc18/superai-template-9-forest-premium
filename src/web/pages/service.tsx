import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  FileText,
  Headphones,
  Phone,
  ShieldCheck,
  Users,
} from "lucide-react";
import { findService, serviceUrl, slugify, waLink } from "../lib/site";
import { serviceFaqs } from "../lib/service-faqs";
import { LeadForm } from "../components/lead-form";
import { WaIcon } from "../components/header";
import { telHref, useSite } from "../queries/site";
import { CtaBand } from "./index";
import { PackageCards, usePackagesFor } from "../components/content-ui";
import { useContent } from "../queries/content";

const STEPS = [
  { title: "Free Call", text: "Tell us what you need. We explain everything simply." },
  { title: "Share Details", text: "Send documents or details on WhatsApp. No office visit." },
  { title: "We Do the Work", text: "Our expert handles it and updates you on every step." },
  { title: "Done", text: "You get the final certificate / files on WhatsApp and email." },
];

function Faq({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="divide-y divide-line rounded-2xl border border-line bg-paper">
      {items.map((f, i) => (
        <div key={f.q}>
          <button
            onClick={() => setOpen(open === i ? -1 : i)}
            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-navy"
          >
            {f.q}
            <ChevronDown className={`h-5 w-5 shrink-0 text-royal transition ${open === i ? "rotate-180" : ""}`} />
          </button>
          {open === i && <p className="px-5 pb-5 text-[15px] leading-relaxed">{f.a}</p>}
        </div>
      ))}
    </div>
  );
}

function Block({ icon: Icon, title, children }: { icon: typeof Users; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-paper p-6 sm:p-7">
      <h2 className="flex items-center gap-3 text-[22px] font-medium">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-royal/10 text-royal">
          <Icon className="h-5 w-5" />
        </span>
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Ticks({ items, cols = false }: { items: string[]; cols?: boolean }) {
  return (
    <ul className={`grid gap-3 ${cols ? "sm:grid-cols-2" : ""}`}>
      {items.map((t) => (
        <li key={t} className="flex items-start gap-2.5 text-[15.5px] text-navy">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-wa" />
          {t}
        </li>
      ))}
    </ul>
  );
}

export default function ServicePage() {
  const { cat: catSlug, service: serviceSlug } = useParams<{ cat: string; service: string }>();
  const { cat, service } = findService(catSlug, serviceSlug);
  const site = useSite();
  const waMsg = useContent().whatsapp;
  const pkgs = usePackagesFor(catSlug, service?.name);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [catSlug, serviceSlug]);

  const edits = useContent().services;
  const [, navigate] = useLocation();
  const moved = !service ? edits.find((e) => e.cat === catSlug && e.original && slugify(e.original) === serviceSlug && !e.hidden && e.name !== e.original) : undefined;
  useEffect(() => {
    if (moved) navigate(serviceUrl(moved.cat, moved.name), { replace: true });
  }, [moved, navigate]);

  if (!cat || !service) {
    return (
      <div className="container-x py-32 text-center">
        <h1 className="text-3xl font-medium">Service not found</h1>
        <Link to={cat ? `/services/${cat.slug}` : "/"} className="btn-brand mt-6">
          {cat ? `See all ${cat.title}` : "Go Home"}
        </Link>
      </div>
    );
  }

  const who = service.who ?? cat.who;
  const includes = service.includes ?? cat.includes;
  const docs = service.docs ?? cat.docs;
  const related = cat.services.filter((s) => s.name !== service.name).slice(0, 4);
  const faqs = serviceFaqs(cat, service);

  return (
    <>
      <section className="border-b border-line bg-cream">
        <div className="container-x grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <nav className="flex flex-wrap items-center gap-1.5 text-[13px] text-body">
              <Link to="/" className="hover:text-brand">Home</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link to={`/services/${cat.slug}`} className="hover:text-brand">{cat.title}</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-navy">{service.name}</span>
            </nav>
            <h1 className="rise mt-4 max-w-2xl text-[38px] leading-[1.08] sm:text-[52px]">{service.name}</h1>
            <p className="rise mt-4 max-w-xl text-[18px] leading-relaxed" style={{ animationDelay: "100ms" }}>
              {service.text}
            </p>
            <div className="rise mt-6 flex flex-wrap gap-2.5 text-[13.5px] text-navy" style={{ animationDelay: "160ms" }}>
              {service.days && (
                <span className="flex items-center gap-1.5 rounded-full border border-line bg-paper px-3.5 py-1.5">
                  <Clock className="h-4 w-4 text-brand" /> {service.days}
                </span>
              )}
              <span className="flex items-center gap-1.5 rounded-full border border-line bg-paper px-3.5 py-1.5">
                <ShieldCheck className="h-4 w-4 text-brand" /> 100% online
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-line bg-paper px-3.5 py-1.5">
                <Headphones className="h-4 w-4 text-brand" /> Free expert call
              </span>
            </div>
            <div className="rise mt-8 flex flex-wrap gap-3 lg:hidden" style={{ animationDelay: "220ms" }}>
              <a href="#get-started" className="btn-brand">Get Free Consultation <ArrowRight className="h-4 w-4" /></a>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <div aria-hidden className="absolute -right-3 -top-3 h-full w-full rounded-[24px] border border-royal/25" />
            <img src={cat.image} alt="" className="relative aspect-[4/3] w-full rounded-[24px] object-cover shadow-[0_36px_60px_-40px_rgba(24,53,40,0.6)]" />
          </div>
        </div>
      </section>

      <section className="bg-surface py-12 sm:py-16">
        <div className="container-x grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
          <div className="space-y-6">
            <Block icon={Users} title="Who Is This For?">
              <Ticks items={who} />
            </Block>

            <Block icon={BadgeCheck} title="What You Get">
              <Ticks items={includes} cols />
            </Block>

            {docs && docs.length > 0 && (
              <Block icon={FileText} title="Documents Needed">
                <ul className="grid gap-2.5 sm:grid-cols-2">
                  {docs.map((d) => (
                    <li key={d} className="flex items-start gap-2.5 rounded-xl bg-surface px-4 py-3 text-[15px] text-navy">
                      <FileText className="mt-0.5 h-4 w-4 shrink-0 text-royal" /> {d}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-[14px]">Not sure about a document? Don't worry — we'll guide you on the call.</p>
              </Block>
            )}

            <Block icon={Clock} title="How It Works">
              <ol className="grid gap-4 sm:grid-cols-2">
                {STEPS.map((st, i) => (
                  <li key={st.title} className="flex gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand text-[15px] font-bold text-white">{i + 1}</span>
                    <span>
                      <span className="block font-semibold text-navy">{st.title}</span>
                      <span className="block text-[14.5px] leading-relaxed">{st.text}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </Block>

            {pkgs.length > 0 && (
              <div>
                <h2 className="mb-4 text-[22px] font-medium">Packages & Pricing</h2>
                <PackageCards packages={pkgs} compact />
              </div>
            )}

            <div>
              <h2 className="mb-4 text-[22px] font-medium">Common Questions</h2>
              <Faq items={faqs} />
            </div>

            {related.length > 0 && (
              <div>
                <h2 className="mb-4 text-[22px] font-medium">Related Services</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {related.map((r) => (
                    <Link
                      key={r.name}
                      to={serviceUrl(cat.slug, r.name)}
                      className="group flex items-center justify-between gap-3 rounded-xl border border-line bg-paper px-4 py-3.5 hover:border-royal/40"
                    >
                      <span>
                        <span className="block font-semibold text-navy">{r.name}</span>
                        {r.days && <span className="block text-[13px] text-slate-500">{r.days}</span>}
                      </span>
                      <ArrowRight className="h-4 w-4 text-brand transition group-hover:translate-x-1" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside id="get-started" className="scroll-mt-28 space-y-4 lg:sticky lg:top-28">
            <div className="overflow-hidden rounded-2xl border border-line bg-paper shadow-[0_30px_60px_-34px_rgba(24,53,40,0.45)]">
              <div className="bg-navy px-6 py-5">
                <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-brand">Get Started</p>
                <h3 className="mt-1 text-xl font-bold !text-white">Talk to an Expert — Free</h3>
                <p className="mt-1 text-[14px] text-white/75">We'll call you back within 30 minutes.</p>
              </div>
              <div className="p-6">
                <LeadForm key={service.name} layout="stack" source={`service:${serviceSlug}`} defaultService={service.name} cta="Get Free Call" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <a href={telHref(site.phone)} className="flex items-center justify-center gap-2 rounded-xl bg-paper py-3 font-semibold text-navy ring-1 ring-line hover:ring-royal/40">
                <Phone className="h-4 w-4 text-royal" /> Call Us
              </a>
              <a
                href={waLink(site.whatsapp, waMsg.serviceMessages[service.name] || waMsg.serviceMessage.replace("{service}", service.name))}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-wa py-3 font-semibold text-white hover:brightness-95"
              >
                <WaIcon /> WhatsApp
              </a>
            </div>
          </aside>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
