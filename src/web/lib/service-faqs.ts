import type { Category, Service } from "./site";

/** The questions shown on every service page (also sent to Google as FAQ data for that page). */
export function serviceFaqs(cat: Category, service: Service) {
  const isCert = cat.slug === "microsoft-certifications";
  return [
    ...(isCert
      ? []
      : [
          {
            q: `How long does ${service.name} take?`,
            a: service.days
              ? `Usually ${service.days}. We tell you the exact timeline on the free call.`
              : "It depends on your needs. We give you a clear timeline on the free call.",
          },
        ]),
    { q: "How much does it cost?", a: "The price depends on your needs. Our expert shares a clear price on the free call — no hidden charges." },
    { q: "Do I need to visit your office?", a: "No. Everything is done online — on phone and WhatsApp — from anywhere in India." },
    { q: "Will you help after the work is done?", a: "Yes. You can call or WhatsApp us any time if you have questions later." },
  ];
}
