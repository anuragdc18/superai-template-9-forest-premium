import { useEffect } from "react";
import { Link, useParams } from "wouter";
import { ArrowRight, CheckCircle2, Clock, ChevronRight } from "lucide-react";
import { CATEGORIES, serviceUrl, slugify } from "../lib/site";
import { LeadForm } from "../components/lead-form";
import { CtaBand } from "./index";

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const cat = CATEGORIES.find((c) => c.slug === slug);

  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id) {
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "center" }), 60);
        el.classList.add("ring-2", "ring-brand");
        setTimeout(() => el.classList.remove("ring-2", "ring-brand"), 2200);
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [slug]);

  if (!cat) {
    return (
      <div className="container-x py-32 text-center">
        <h1 className="text-3xl font-medium">Page not found</h1>
        <Link to="/" className="btn-brand mt-6">Go Home</Link>
      </div>
    );
  }

  return (
    <>
      <section className="border-b border-line bg-cream">
        <div className="container-x grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <nav className="flex items-center gap-1.5 text-[13px] text-body">
              <Link to="/" className="hover:text-brand">Home</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-navy">{cat.title}</span>
            </nav>
            <h1 className="rise mt-4 max-w-2xl text-[40px] leading-[1.08] sm:text-[54px]">{cat.title}</h1>
            <p className="rise mt-4 max-w-xl text-[17.5px] leading-relaxed" style={{ animationDelay: "100ms" }}>{cat.intro}</p>
            <a href="#enquire" className="btn-brand rise mt-7" style={{ animationDelay: "180ms" }}>
              Get Free Consultation <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          <div className="relative">
            <div aria-hidden className="absolute -right-3 -top-3 h-full w-full rounded-[24px] border border-royal/25" />
            <img src={cat.image} alt="" className="relative aspect-[3/2] w-full rounded-[24px] object-cover shadow-[0_36px_60px_-40px_rgba(24,53,40,0.6)]" />
          </div>
        </div>
      </section>

      <div className="border-b border-line bg-paper">
        <div className="container-x flex gap-2 overflow-x-auto py-3">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              to={`/services/${c.slug}`}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-[14px] font-medium transition ${
                c.slug === cat.slug ? "bg-navy text-white" : "bg-surface text-navy hover:bg-royal/10"
              }`}
            >
              {c.title}
            </Link>
          ))}
        </div>
      </div>

      <section className="py-14">
        <div className="container-x grid gap-10 lg:grid-cols-[1.6fr_1fr] lg:items-start">
          <div>
            <h2 className="text-2xl font-medium sm:text-3xl">{cat.slug === "microsoft-certifications" ? "All Microsoft Certifications" : `All ${cat.title} Services`}</h2>
            <p className="mt-2">{cat.slug === "microsoft-certifications" ? 'Tap "Learn More" to see who it is for and what you get.' : 'Tap "Learn More" to see details, documents and time taken.'}</p>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {cat.services.map((s) => (
                <div
                  key={s.name}
                  id={slugify(s.name)}
                  className="scroll-mt-32 flex flex-col rounded-2xl border border-line bg-paper p-5 transition hover:border-royal/30 hover:shadow-[0_18px_36px_-24px_rgba(24,53,40,0.5)]"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-royal" />
                    <div>
                      <h3 className="font-semibold leading-snug">{s.name}</h3>
                      <p className="mt-1.5 text-[14.5px] leading-relaxed">{s.text}</p>
                    </div>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-4 pl-8">
                    <Link
                      to={serviceUrl(cat.slug, s.name)}
                      className="inline-flex items-center gap-1 text-[14px] font-semibold text-brand hover:gap-2"
                    >
                      Learn More <ArrowRight className="h-4 w-4" />
                    </Link>
                    {s.days ? (
                      <span className="flex items-center gap-1.5 text-[13px] text-slate-500"><Clock className="h-3.5 w-3.5" /> {s.days}</span>
                    ) : <span />}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <aside id="enquire" className="scroll-mt-28 rounded-2xl border border-line bg-paper p-6 shadow-[0_30px_60px_-34px_rgba(24,53,40,0.45)] lg:sticky lg:top-28">
            <h3 className="text-xl font-bold">Get a Free Call</h3>
            <p className="mt-1 text-[14px]">Our expert will call you and explain everything.</p>
            <div className="mt-5">
              <LeadForm layout="stack" source={`category:${cat.slug}`} defaultService={cat.services[0].name} />
            </div>
          </aside>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
