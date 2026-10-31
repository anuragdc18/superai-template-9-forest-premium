import { Link } from "wouter";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Youtube } from "lucide-react";
import { CATEGORIES, serviceUrl } from "../lib/site";
import { telHref, useSite } from "../queries/site";
import { Logo } from "./header";
import { useExtraLinks } from "./content-ui";

export function Footer() {
  const extra = useExtraLinks();
  const site = useSite();
  const reg = CATEGORIES[0];
  const brandDesign = [CATEGORIES[1], CATEGORIES[2]];
  const digital = [CATEGORIES[3], CATEGORIES[4], CATEGORIES[5], CATEGORIES[6]];
  return (
    <footer className="bg-navy text-[#c9d3cb]">
      <div className="container-x grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo light />
          <p className="mt-5 max-w-xs text-[15px] leading-relaxed">
            {site.tagline}
          </p>
          <div className="mt-5 space-y-2.5 text-[15px]">
            <a href={telHref(site.phone)} className="flex items-center gap-2 hover:text-cream"><Phone className="h-4 w-4 text-brand" /> {site.phone}</a>
            <a href={`mailto:${site.email}`} className="flex items-center gap-2 hover:text-cream"><Mail className="h-4 w-4 text-brand" /> {site.email}</a>
            {site.addresses.length ? (
              site.addresses.map((a, i) => (
                <p key={i} className="flex items-start gap-2"><MapPin className="mt-1 h-4 w-4 shrink-0 text-brand" /> <span className="whitespace-pre-line">{a.line}</span></p>
              ))
            ) : (
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-brand" /> {site.city}</p>
            )}
          </div>
          <div className="mt-5 flex gap-2">
            {(
              [
                ["facebook", Facebook],
                ["instagram", Instagram],
                ["linkedin", Linkedin],
                ["youtube", Youtube],
              ] as const
            )
              .filter(([k]) => site.socials[k])
              .map(([k, Icon]) => (
                <a key={k} href={site.socials[k]} target="_blank" rel="noreferrer" aria-label={k} className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-brand hover:text-cream">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
          </div>
        </div>
        <div>
          <h4 className="mb-4 serif text-[19px] !font-medium !text-cream">Registration</h4>
          <ul className="space-y-2.5 text-[15px]">
            {reg.menuItems.slice(0, 7).map((m) => (
              <li key={m}><Link to={serviceUrl("registration", m)} className="hover:text-cream">{m}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-4 serif text-[19px] !font-medium !text-cream">Branding & Design</h4>
          <ul className="space-y-2.5 text-[15px]">
            {brandDesign.flatMap((c) => c.menuItems.slice(0, 4).map((m) => (
              <li key={c.slug + m}><Link to={serviceUrl(c.slug, m)} className="hover:text-cream">{m}</Link></li>
            )))}
          </ul>
        </div>
        <div>
          <h4 className="mb-4 serif text-[19px] !font-medium !text-cream">Digital</h4>
          <ul className="space-y-2.5 text-[15px]">
            {digital.map((c) => (
              <li key={c.slug}><Link to={`/services/${c.slug}`} className="hover:text-cream">{c.title}</Link></li>
            ))}
            {extra.map((x) => (
              <li key={x.to}><Link to={x.to} className="hover:text-cream">{x.label}</Link></li>
            ))}
            <li><Link to="/contact" className="hover:text-cream">Contact Us</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-5 text-[13px] sm:flex-row">
          <p>© {new Date().getFullYear()} {site.siteName}. All rights reserved.</p>
          <p>Serving businesses across India</p>
          <p>
            Designed by{" "}
            <a href="https://digitalconnect.in" target="_blank" rel="noopener" className="font-semibold underline-offset-2 hover:underline">
              digitalconnect.in
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

