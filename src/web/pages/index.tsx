import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Check,
  FileText,
  Globe2,
  Instagram,
  Landmark,
  MessageCircle,
  Minus,
  PenTool,
  Plus,
  Star,
  Store,
} from "lucide-react";
import { CATEGORIES, POPULAR, SLIDES, serviceUrl, waLink } from "../lib/site";
import { asset } from "../lib/demo";
import { useSite } from "../queries/site";
import { LeadForm } from "../components/lead-form";
import { WaIcon } from "../components/header";

const MS = CATEGORIES.find((c) => c.slug === "microsoft-certifications")!;
const TOTAL_SERVICES = CATEGORIES.reduce((n, c) => n + c.services.length, 0);
const countLabel = (n: number, slug: string) => `${n} ${slug === "microsoft-certifications" ? "exams" : "services"}`;

/* ───────────────────────── 1. Hero (5 slides, own photo each) ───────────────────────── */

type HeroSlide = { tag: string; title: string; text: string; image: string; primary: { label: string; to: string }; secondary: { label: string; to: string } };

const bySlug = (slug: string) => SLIDES.find((s) => s.link === `/services/${slug}`)!;
const fromSlide = (slug: string, image: string): HeroSlide => {
  const s = bySlug(slug);
  return {
    tag: s.tag,
    title: s.title,
    text: s.text,
    image: asset(`/images/${image}`),
    primary: { label: s.cta || s.linkText, to: s.cta ? "#enquiry" : s.link },
    secondary: { label: s.cta ? s.linkText : "Talk to an expert", to: s.cta ? s.link : "/contact" },
  };
};

const HERO: HeroSlide[] = [
  {
    tag: "Business services · 100% online",
    title: "Everything Your Business Needs",
    text: "Registration, logo & branding, websites, social media, AI tools and Microsoft certifications — all in one place, handled by experts.",
    image: asset("/images/hero-all.jpg"),
    primary: { label: "Get Free Consultation", to: "#enquiry" },
    secondary: { label: "Talk to an expert", to: "/contact" },
  },
  fromSlide("registration", "hero-registration.jpg"),
  fromSlide("branding", "hero-branding.jpg"),
  fromSlide("website", "hero-website.jpg"),
  fromSlide("microsoft-certifications", "hero-microsoft.jpg"),
];

function SmartLink({ to, className, children }: { to: string; className: string; children: React.ReactNode }) {
  return to.startsWith("#") ? (
    <a href={to} className={className}>
      {children}
    </a>
  ) : (
    <Link to={to} className={className}>
      {children}
    </Link>
  );
}

function Hero() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setI((v) => (v + 1) % HERO.length), 5000);
    return () => clearTimeout(t);
  }, [i, paused]);
  const h = HERO[i];
  const words = h.title.split(" ");
  const last = words.pop();

  return (
    <section className="relative overflow-hidden bg-cream" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="container-x grid items-center gap-10 pb-16 pt-10 sm:pt-14 lg:grid-cols-[1.02fr_1fr] lg:gap-14 lg:pb-24 lg:pt-16">
        <div className="min-w-0">
          <p key={`t${i}`} className="eyebrow rise">{h.tag}</p>
          <h1 key={`h${i}`} className="rise mt-4 text-[42px] leading-[1.06] sm:text-[56px] lg:text-[62px]" style={{ animationDelay: "60ms" }}>
            {words.join(" ")} <em className="font-normal italic text-brand">{last}</em>
          </h1>
          <p key={`p${i}`} className="rise mt-6 max-w-[500px] text-[17.5px] leading-relaxed" style={{ animationDelay: "120ms" }}>
            {h.text}
          </p>
          <div className="rise mt-9 flex flex-wrap gap-3" style={{ animationDelay: "180ms" }}>
            <SmartLink to={h.primary.to} className="btn-brand">
              {h.primary.label} <ArrowRight className="h-4 w-4" />
            </SmartLink>
            <SmartLink to={h.secondary.to} className="btn-outline">
              {h.secondary.label}
            </SmartLink>
          </div>

          {/* slide counter + progress + topic list */}
          <div className="mt-12 max-w-[520px]">
            <div className="flex items-center gap-4">
              <span className="serif text-[15px] text-navy">
                {String(i + 1).padStart(2, "0")} <span className="text-body/60">/ {String(HERO.length).padStart(2, "0")}</span>
              </span>
              <span className="relative h-px flex-1 bg-line">
                <span key={i} className={`hero-progress absolute inset-y-0 left-0 bg-brand ${paused ? "is-paused" : ""}`} style={{ height: 2, top: -0.5 }} />
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2" role="tablist" aria-label="Choose a topic">
              {HERO.map((s, idx) => (
                <button
                  key={s.tag}
                  role="tab"
                  aria-selected={idx === i}
                  onClick={() => setI(idx)}
                  className={`text-[13px] transition ${idx === i ? "font-semibold text-navy" : "text-body/70 hover:text-navy"}`}
                >
                  {idx === 0 ? "All services" : s.tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[560px] lg:mr-0">
          <div aria-hidden className="absolute -right-3 -top-3 h-full w-full rounded-[26px] border border-royal/25 sm:-right-4 sm:-top-4" />
          <div className="relative aspect-[5/4] overflow-hidden rounded-[26px] bg-sand shadow-[0_40px_70px_-40px_rgba(24,53,40,0.55)]">
            {HERO.map((s, idx) => (
              <img
                key={s.image + idx}
                src={s.image}
                alt=""
                aria-hidden={idx !== i}
                loading={idx === 0 ? "eager" : "lazy"}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${idx === i ? "opacity-100" : "opacity-0"}`}
              />
            ))}
          </div>
          <div className="absolute -bottom-6 left-4 flex items-center gap-3 rounded-2xl border border-line bg-paper/95 px-4 py-3 shadow-[0_20px_40px_-24px_rgba(24,53,40,0.5)] backdrop-blur sm:-left-6">
            <span className="serif text-[28px] leading-none text-navy">4.8</span>
            <span className="leading-tight">
              <span className="flex text-brand">{[0, 1, 2, 3, 4].map((k) => <Star key={k} className="h-3.5 w-3.5 fill-current" />)}</span>
              <span className="text-[12.5px]">1,000+ happy clients</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── 2. Enquiry + 3. stats ───────────────────────── */

function Enquiry() {
  return (
    <section id="enquiry" className="relative z-10 scroll-mt-28 bg-cream pb-10">
      <div className="container-x">
        <div className="rounded-2xl border border-line bg-paper p-5 shadow-[0_24px_50px_-36px_rgba(24,53,40,0.45)] sm:p-6">
          <p className="mb-4 text-[15px] text-navy">
            <span className="serif text-[19px]">Get a free call from our expert</span> <span className="text-body">— we reply within 30 minutes</span>
          </p>
          <LeadForm cta="Get Free Call" />
        </div>
      </div>
    </section>
  );
}

const STATS = [
  { big: "4.8", small: "Google Rating" },
  { big: "1,000+", small: "Happy Clients" },
  { big: "Pan-India", small: "Service Coverage" },
  { big: "100%", small: "Online Process" },
];

function Stats() {
  return (
    <section className="border-y border-line bg-sand">
      <div className="container-x grid grid-cols-2 md:grid-cols-4">
        {STATS.map((s, idx) => (
          <div key={s.small} className={`py-8 text-center ${idx % 2 ? "border-l border-line" : ""} ${idx > 1 ? "border-t border-line md:border-t-0" : ""} ${idx === 2 ? "md:border-l" : ""}`}>
            <p className="serif text-[34px] leading-none text-navy sm:text-[40px]">{s.big}</p>
            <p className="mt-2 text-[14px]">{s.small}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────── 4. Editorial index of services ───────────────────────── */

function ServiceIndex() {
  const [active, setActive] = useState<number | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const box = useRef<HTMLDivElement>(null);

  return (
    <section className="bg-cream py-20 sm:py-24">
      <div className="container-x">
        <div className="mb-12 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="eyebrow">Our services</p>
            <h2 className="mt-3 text-[36px] leading-tight sm:text-[46px]">What do you need help with?</h2>
            <p className="mt-3 max-w-xl text-[16.5px]">Pick a category to see every service inside. One expert team for all of it.</p>
          </div>
          <p className="serif text-[18px] text-navy">
            {CATEGORIES.length} areas · <span className="text-brand">{TOTAL_SERVICES}+ services</span>
          </p>
        </div>

        <div
          ref={box}
          className="relative border-b border-line"
          onMouseMove={(e) => {
            const r = box.current?.getBoundingClientRect();
            if (r) setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
          }}
          onMouseLeave={() => setActive(null)}
        >
          {CATEGORIES.map((c, idx) => (
            <Link
              key={c.slug}
              to={`/services/${c.slug}`}
              onMouseEnter={() => setActive(idx)}
              className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 border-t border-line py-6 sm:gap-8 sm:py-7"
            >
              <span className="serif w-9 text-[17px] italic text-brand sm:w-12 sm:text-[20px]">{String(idx + 1).padStart(2, "0")}</span>
              <span className="flex min-w-0 items-center gap-4">
                <img src={c.image} alt="" loading="lazy" className="h-14 w-20 shrink-0 rounded-lg object-cover lg:hidden" />
                <span className="min-w-0">
                  <span className="serif block text-[23px] leading-tight text-navy transition duration-300 group-hover:translate-x-2 group-hover:text-brand sm:text-[34px] lg:text-[40px]">
                    {c.title}
                  </span>
                  <span className="mt-1 block truncate text-[14px] sm:text-[15px]">{c.short}</span>
                </span>
              </span>
              <span className="flex items-center gap-4">
                <span className="hidden text-[14px] text-body sm:inline">{countLabel(c.services.length, c.slug)}</span>
                <span className="grid h-11 w-11 place-items-center rounded-full border border-line text-navy transition group-hover:border-brand group-hover:bg-brand group-hover:text-white">
                  <ArrowUpRight className="h-5 w-5" />
                </span>
              </span>
            </Link>
          ))}

          {/* floating preview that follows the cursor (desktop) */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 z-10 hidden h-[200px] w-[300px] overflow-hidden rounded-xl shadow-[0_30px_60px_-30px_rgba(24,53,40,0.6)] transition-opacity duration-300 lg:block"
            style={{ transform: `translate(${pos.x + 30}px, ${pos.y - 100}px)`, opacity: active === null ? 0 : 1 }}
          >
            {CATEGORIES.map((c, idx) => (
              <img key={c.slug} src={c.image} alt="" className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${idx === active ? "opacity-100" : "opacity-0"}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── 5. Microsoft banner ───────────────────────── */

function MicrosoftBanner() {
  const codes = MS.services.map((s) => s.name.split(":")[0]);
  return (
    <section className="bg-cream pb-20 sm:pb-24">
      <div className="container-x">
        <div className="grid overflow-hidden rounded-[26px] bg-navy lg:grid-cols-[1.1fr_1fr]">
          <div className="p-8 sm:p-12">
            <p className="text-[12.5px] font-semibold uppercase tracking-[0.18em] text-moss">Learn · Practise · Get certified</p>
            <h2 className="mt-3 text-[34px] leading-tight !text-cream sm:text-[44px]">{MS.title}</h2>
            <p className="mt-4 max-w-md text-[16.5px] leading-relaxed text-[#c9d3cb]">{MS.intro}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {codes.map((code, idx) => (
                <Link
                  key={code}
                  to={serviceUrl(MS.slug, MS.services[idx].name)}
                  className="rounded-full border border-white/20 px-3 py-1 text-[13px] font-medium text-cream transition hover:border-brand hover:bg-brand"
                >
                  {code}
                </Link>
              ))}
            </div>
            <Link to={`/services/${MS.slug}`} className="btn-ghost mt-8">
              Browse All Exams <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="relative min-h-[260px]">
            <img src={asset("/images/ms-banner.jpg")} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover object-[70%_center]" />
            <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/30 to-transparent max-lg:bg-gradient-to-b" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── 6. Popular ───────────────────────── */

const POP_ICONS = [FileText, Landmark, BadgeCheck, Store, PenTool, Globe2, Instagram, MessageCircle];

function Popular() {
  return (
    <section className="border-t border-line bg-paper py-20 sm:py-24">
      <div className="container-x">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="eyebrow">Most asked</p>
          <h2 className="mt-3 text-[36px] leading-tight sm:text-[44px]">Most popular services</h2>
          <p className="mt-3 text-[16.5px]">This is where most of our clients begin.</p>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {POPULAR.map((p, idx) => {
            const Icon = POP_ICONS[idx];
            return (
              <Link
                key={p.name}
                to={serviceUrl(p.cat, p.name)}
                className="group flex flex-col items-center rounded-2xl border border-line bg-cream px-4 py-7 text-center transition hover:-translate-y-1 hover:border-royal/30 hover:shadow-[0_24px_44px_-30px_rgba(24,53,40,0.5)]"
              >
                <span className="grid h-14 w-14 place-items-center rounded-full border border-royal/25 bg-paper text-royal transition group-hover:bg-royal group-hover:text-cream">
                  <Icon className="h-6 w-6" strokeWidth={1.6} />
                </span>
                <h3 className="mt-4 text-[15.5px] font-semibold leading-snug sm:text-[16.5px]">{p.name}</h3>
                <p className="mt-1 text-[13.5px]">{p.days}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-[14px] font-semibold text-brand transition-all group-hover:gap-2">
                  Know more <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── 7. Process band ───────────────────────── */

const STEPS = [
  { title: "Tell us what you need", text: "Fill the form or call us. It takes one minute." },
  { title: "Share your documents", text: "Send them on WhatsApp or email. No office visit." },
  { title: "We get it done", text: "You get updates at every step until it's complete." },
];

function Process() {
  return (
    <section className="bg-royal py-20 sm:py-24">
      <div className="container-x">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-[12.5px] font-semibold uppercase tracking-[0.18em] text-moss">How it works</p>
          <h2 className="mt-3 text-[36px] leading-tight !text-cream sm:text-[44px]">A simple 3-step process</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-center">
          {STEPS.map((s, idx) => (
            <div key={s.title} className="contents">
              <div className="rounded-2xl bg-cream p-7 text-center">
                <span className="serif mx-auto grid h-14 w-14 place-items-center rounded-full bg-royal text-[20px] text-cream">{String(idx + 1).padStart(2, "0")}</span>
                <h3 className="serif mt-5 text-[22px] font-medium">{s.title}</h3>
                <p className="mt-2 text-[15px]">{s.text}</p>
              </div>
              {idx < STEPS.length - 1 && (
                <span className="mx-auto grid h-10 w-10 rotate-90 place-items-center rounded-full border border-white/25 text-cream md:rotate-0">
                  <ArrowRight className="h-5 w-5" />
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── 8. Photo story ───────────────────────── */

const STORY = [
  { image: "story-consult.jpg", step: "01", title: "A relaxed first call", text: "We listen, understand your business and suggest the right services. No obligation." },
  { image: "story-check.jpg", step: "02", title: "Every document checked", text: "Our experts check your papers before anything is filed, so there are no surprises later." },
  { image: "story-deliver.jpg", step: "03", title: "Delivered, with updates", text: "You get updates on WhatsApp at every step until the work is complete." },
];

function Story() {
  return (
    <section className="bg-cream py-20 sm:py-24">
      <div className="container-x">
        <div className="mb-12 grid gap-4 lg:grid-cols-[1fr_1fr] lg:items-end">
          <div>
            <p className="eyebrow">How we work with you</p>
            <h2 className="mt-3 text-[36px] leading-tight sm:text-[44px]">
              Personal attention, <em className="font-normal italic text-brand">start to finish</em>
            </h2>
          </div>
          <p className="max-w-md text-[16.5px] lg:justify-self-end">The same expert stays with you from the first call to the final certificate — no call centres, no running around.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {STORY.map((s) => (
            <figure key={s.step} className="group">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[22px] bg-sand">
                <img src={asset(`/images/${s.image}`)} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                <span className="serif absolute left-5 top-5 rounded-full bg-paper/90 px-3 py-1 text-[14px] italic text-brand backdrop-blur">Step {s.step}</span>
              </div>
              <figcaption className="mt-5">
                <h3 className="serif text-[24px] font-medium">{s.title}</h3>
                <p className="mt-2 text-[15.5px]">{s.text}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── 9. Trust + reviews ───────────────────────── */

const WHY = [
  { title: "One place for everything", text: "Registration, branding, website and marketing — no running around." },
  { title: "Clear pricing", text: "You know the full cost before we start. No hidden charges." },
  { title: "Fully online", text: "Do everything from your phone, from anywhere in India." },
  { title: "Real experts", text: "CA, CS and design experts guide you at every step." },
];

const REVIEWS = [
  { name: "Ravi K.", city: "Hyderabad", text: "My GST and company registration were done in a week. Very smooth, and they explained everything simply." },
  { name: "Priya S.", city: "Bengaluru", text: "They designed our logo and website together. Looks very professional and customers notice it." },
  { name: "Arjun M.", city: "Pune", text: "Our Instagram enquiries doubled in 2 months. The team posts on time every week." },
];

function TrustReviews() {
  const site = useSite();
  return (
    <section className="border-t border-line bg-paper py-20 sm:py-24">
      <div className="container-x grid gap-14 lg:grid-cols-[0.9fr_1.3fr]">
        <div>
          <p className="eyebrow">Why {site.siteName}</p>
          <h2 className="mt-3 text-[34px] leading-tight sm:text-[40px]">Why businesses trust us</h2>
          <ul className="mt-8 space-y-6">
            {WHY.map((w) => (
              <li key={w.title} className="flex gap-4">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-royal text-cream">
                  <Check className="h-4 w-4" />
                </span>
                <span>
                  <span className="block font-semibold text-navy">{w.title}</span>
                  <span className="text-[15px]">{w.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:border-l lg:border-line lg:pl-14">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h3 className="serif text-[28px] font-medium">What our clients say</h3>
            <p className="flex items-center gap-2">
              <span className="serif text-[32px] leading-none text-navy">4.8</span>
              <span className="flex text-brand">{[0, 1, 2, 3, 4].map((k) => <Star key={k} className="h-4 w-4 fill-current" />)}</span>
              <span className="text-[13px]">on Google</span>
            </p>
          </div>
          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            {REVIEWS.map((r, idx) => (
              <figure key={r.name} className={`flex flex-col rounded-2xl border border-line bg-cream p-6 ${idx === 0 ? "sm:col-span-2" : ""}`}>
                <span className="serif text-[42px] leading-[0.6] text-brand">“</span>
                <blockquote className={`mt-3 leading-relaxed text-navy ${idx === 0 ? "serif text-[19px]" : "text-[15px]"}`}>{r.text}</blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <span className="serif grid h-10 w-10 place-items-center rounded-full bg-sand text-[16px] text-navy">{r.name[0]}</span>
                  <span className="leading-tight">
                    <span className="block font-semibold text-navy">{r.name}</span>
                    <span className="text-[13px]">{r.city}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── 10. FAQ ───────────────────────── */

const FAQS = [
  { q: "Do I need to visit your office?", a: "No. Everything is done online. You can share documents on WhatsApp or email." },
  { q: "How long does GST registration take?", a: "Usually 3 to 7 working days, once we have all your documents." },
  { q: "Can you do registration and the website together?", a: "Yes. Many clients start with registration and logo, then add a website. We offer combo prices." },
  { q: "How do I pay?", a: "You can pay by UPI, debit/credit card or bank transfer. You get a proper GST invoice." },
  { q: "I'm not sure which registration I need. Can you help?", a: "Yes — that's what the free consultation is for. Our expert will suggest the right option for you." },
];

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="bg-cream py-20 sm:py-24">
      <div className="container-x max-w-3xl">
        <div className="mb-10 flex items-center justify-center gap-3">
          <h2 className="text-[34px] leading-tight sm:text-[40px]">Common questions</h2>
          <span className="rounded-full bg-brand px-3 py-1 text-[12px] font-semibold uppercase tracking-wider text-white">FAQ</span>
        </div>
        <div className="overflow-hidden rounded-2xl border border-line bg-paper">
          {FAQS.map((f, idx) => {
            const isOpen = open === idx;
            return (
              <div key={f.q} className={idx ? "border-t border-line" : ""}>
                <button
                  onClick={() => setOpen(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left text-[15.5px] font-medium text-navy hover:bg-cream/60"
                >
                  {f.q}
                  {isOpen ? <Minus className="h-4 w-4 shrink-0 text-brand" /> : <Plus className="h-4 w-4 shrink-0 text-navy" />}
                </button>
                <div className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 text-[15px]">{f.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── 11. CTA (also used on inner pages) ───────────────────────── */

export function CtaBand() {
  const site = useSite();
  return (
    <section className="bg-cream py-16">
      <div className="container-x">
        <div className="relative isolate overflow-hidden rounded-[26px] px-6 py-14 text-center sm:px-12">
          <img src={asset("/images/cta-background.jpg")} alt="" loading="lazy" className="absolute inset-0 -z-20 h-full w-full object-cover" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy/90 via-navy/75 to-navy/90" />
          <h2 className="text-[34px] leading-tight !text-cream sm:text-[44px]">
            Ready to grow your <em className="font-normal italic text-[#e9a27f]">business?</em>
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-[17px] text-[#d5ddd6]">Talk to our expert today. The first consultation is free.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/contact" className="btn-brand">
              Get Free Consultation <ArrowRight className="h-4 w-4" />
            </Link>
            <a href={waLink(site.whatsapp)} target="_blank" rel="noreferrer" className="btn-ghost">
              <WaIcon /> WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Index() {
  return (
    <>
      <Hero />
      <Enquiry />
      <Stats />
      <ServiceIndex />
      <MicrosoftBanner />
      <Popular />
      <Process />
      <Story />
      <TrustReviews />
      <Faq />
      <CtaBand />
    </>
  );
}
