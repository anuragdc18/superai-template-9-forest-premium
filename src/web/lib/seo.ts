/**
 * SEO for every page: title, description, social preview and Google structured data.
 * Used by the server (ready-made page head + sitemap.xml) and by the browser (head updates while you browse).
 * Everything comes from the admin settings (business details, Admin → SEO, blog, reviews, FAQs …),
 * with sensible automatic defaults.
 */
import { serviceUrl, slugify, type Category, type Service } from "./site";
import { serviceFaqs } from "./service-faqs";
import type { SiteSettings } from "../../api/lib/site-schema";
import type { PostSummary, PublicContent } from "../../api/lib/content-schema";

export type SeoCtx = { site: SiteSettings; content: PublicContent; categories: Category[] };

export type PageSeo = {
  path: string;
  title: string;
  description: string;
  image?: string;
  type?: "website" | "article";
  /** schema.org objects (JSON-LD) */
  jsonLd: Record<string, unknown>[];
  /** sitemap priority 0–1 */
  priority: number;
  lastmod?: string;
};

const clip = (s: string, n = 158) => {
  const t = s.replace(/\s+/g, " ").trim();
  return t.length <= n ? t : t.slice(0, t.lastIndexOf(" ", n - 1)).replace(/[,;:—–-]\s*$/, "") + "…";
};

/** Absolute URL helper. */
export const abs = (origin: string, p: string) => (/^https?:\/\//.test(p) ? p : origin.replace(/\/$/, "") + (p.startsWith("/") ? p : `/${p}`));

function names(ctx: SeoCtx) {
  const brand = ctx.site.siteName;
  const city = (ctx.content.seo.locality || ctx.site.city.split(",")[0] || "").trim() || "India";
  const fit = (t: string) => {
    if (t.length <= 65) return t;
    const noCity = t.replace(` in ${city}`, "");
    return noCity.length <= 65 ? noCity : noCity.replace(/ Fundamentals/, "");
  };
  return { brand, city, fit };
}

function business(origin: string, ctx: SeoCtx) {
  const { site, content } = ctx;
  const seo = content.seo;
  const { brand, city } = names(ctx);
  const sameAs = [...Object.values(site.socials), ...seo.sameAs, content.reviewsSection.googleUrl].filter(Boolean);
  const region = seo.region || site.city.split(",")[1]?.trim() || "";
  const reviews = content.reviews;
  const rs = content.reviewsSection;
  const avg = reviews.length ? reviews.reduce((n, r) => n + r.rating, 0) / reviews.length : 0;
  return {
    "@context": "https://schema.org",
    "@type": seo.businessType,
    "@id": abs(origin, "/#business"),
    name: brand,
    ...(site.tagline ? { slogan: site.tagline } : {}),
    description: seo.description || clip(`${brand}, ${city}: ${ctx.categories.map((c) => c.title.toLowerCase()).join(", ")}.`, 300),
    url: abs(origin, "/"),
    logo: abs(origin, site.logo ? "/api/logo" : "/og-image.png"),
    image: abs(origin, content.images["/og-image.png"] || "/og-image.png"),
    telephone: site.phone.replace(/\s+/g, ""),
    email: site.email,
    address: {
      "@type": "PostalAddress",
      ...(seo.street ? { streetAddress: seo.street } : site.addresses[0]?.line ? { streetAddress: site.addresses[0].line.replace(/\n/g, ", ") } : {}),
      addressLocality: city,
      ...(region ? { addressRegion: region } : {}),
      ...(seo.postalCode ? { postalCode: seo.postalCode } : {}),
      addressCountry: seo.country || "IN",
    },
    ...(seo.latitude && seo.longitude ? { geo: { "@type": "GeoCoordinates", latitude: Number(seo.latitude), longitude: Number(seo.longitude) } } : {}),
    ...(seo.mapsUrl || site.addresses[0]?.mapUrl ? { hasMap: seo.mapsUrl || site.addresses[0]?.mapUrl } : {}),
    ...(seo.priceRange ? { priceRange: seo.priceRange } : {}),
    ...(seo.foundingYear ? { foundingDate: seo.foundingYear } : {}),
    areaServed: (seo.areaServed || `${city}, India`).split(",").map((a) => a.trim()).filter(Boolean).map((name) => ({ "@type": "Place", name })),
    ...(seo.hours.length
      ? { openingHoursSpecification: seo.hours.filter((h) => h.days.length).map((h) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: h.days, opens: h.opens, closes: h.closes })) }
      : {}),
    ...(sameAs.length ? { sameAs } : {}),
    ...(rs.inStructuredData && (rs.rating || reviews.length)
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: rs.rating || avg.toFixed(1),
            reviewCount: Number(rs.ratingCount) || reviews.length,
            bestRating: 5,
          },
          review: reviews.slice(0, 10).map((r) => ({
            "@type": "Review",
            author: { "@type": "Person", name: r.name },
            reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
            reviewBody: r.text,
            ...(r.date ? { datePublished: r.date } : {}),
          })),
        }
      : {}),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Services",
      itemListElement: ctx.categories.map((c) => ({
        "@type": "OfferCatalog",
        name: c.title,
        itemListElement: c.services.map((x) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: x.name } })),
      })),
    },
  };
}

function crumbs(origin: string, items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: abs(origin, it.path) })),
  };
}

const isExams = (c: Category) => c.slug === "microsoft-certifications";

function categoryPage(origin: string, ctx: SeoCtx, c: Category): PageSeo {
  const { brand, city, fit } = names(ctx);
  return {
    path: `/services/${c.slug}`,
    title: fit(`${c.title} in ${city} | ${brand}`),
    description: clip(`${c.intro} ${c.services.length} ${isExams(c) ? "exams" : "services"} including ${c.services.slice(0, 4).map((s) => s.name).join(", ")}. Call ${ctx.site.phone}.`),
    image: c.image,
    priority: 0.8,
    jsonLd: [
      webPage(origin, `/services/${c.slug}`, c.title, c.intro, undefined, "CollectionPage"),
      crumbs(origin, [
        { name: "Home", path: "/" },
        { name: c.title, path: `/services/${c.slug}` },
      ]),
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: c.title,
        itemListElement: c.services.map((s, i) => ({ "@type": "ListItem", position: i + 1, name: s.name, url: abs(origin, serviceUrl(c.slug, s.name)) })),
      },
    ],
  };
}

function servicePage(origin: string, ctx: SeoCtx, c: Category, s: Service, dup: Set<string>): PageSeo {
  const { brand, city, fit } = names(ctx);
  const name = dup.has(s.name) ? `${s.name} (${c.menu})` : s.name;
  const ex = isExams(c);
  const pk = ctx.content.packages.filter((p) => p.service === s.name || (p.category === c.slug && !p.service));
  return {
    path: serviceUrl(c.slug, s.name),
    title: fit(ex ? `${s.name} Training in ${city} | ${brand}` : `${name} in ${city} | ${brand}`),
    description: clip(`${s.text} ${ex ? "Guided training with practice tests and exam booking help" : "Expert help from " + brand} in ${city}. Free consultation — call ${ctx.site.phone}.`),
    image: c.image,
    priority: 0.6,
    jsonLd: [
      crumbs(origin, [
        { name: "Home", path: "/" },
        { name: c.title, path: `/services/${c.slug}` },
        { name: s.name, path: serviceUrl(c.slug, s.name) },
      ]),
      webPage(origin, serviceUrl(c.slug, s.name), s.name, s.text, `${abs(origin, serviceUrl(c.slug, s.name))}#service`),
      {
        "@context": "https://schema.org",
        "@type": ex ? "Course" : "Service",
        "@id": `${abs(origin, serviceUrl(c.slug, s.name))}#service`,
        name: s.name,
        description: s.text,
        ...(c.image ? { image: abs(origin, c.image) } : {}),
        provider: { "@id": abs(origin, "/#business") },
        ...(ex
          ? { educationalLevel: "Beginner", inLanguage: "en", ...(s.days ? { timeRequired: s.days } : {}) }
          : {
              serviceType: s.name,
              category: c.title,
              areaServed: [{ "@type": "City", name: city }, { "@type": "Country", name: "India" }],
              audience: { "@type": "Audience", audienceType: (s.who ?? c.who).join(", ") },
              availableChannel: {
                "@type": "ServiceChannel",
                serviceUrl: abs(origin, serviceUrl(c.slug, s.name)),
                servicePhone: { "@type": "ContactPoint", telephone: ctx.site.phone.replace(/\s+/g, ""), contactType: "customer service" },
              },
              hasOfferCatalog: {
                "@type": "OfferCatalog",
                name: "What you get",
                itemListElement: (s.includes ?? c.includes).map((x) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: x } })),
              },
            }),
        ...(pk.length
          ? {
              offers: pk.map((p) => ({
                "@type": "Offer",
                name: p.name,
                ...(priceNumber(p.price) ? { price: priceNumber(p.price), priceCurrency: "INR" } : {}),
              })),
            }
          : {}),
        url: abs(origin, serviceUrl(c.slug, s.name)),
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: serviceFaqs(c, s).map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
    ],
  };
}

/** The page itself, linked to the business and the website. */
function webPage(origin: string, path: string, name: string, description: string, mainEntity?: string, type = "WebPage") {
  return {
    "@context": "https://schema.org",
    "@type": type,
    "@id": `${abs(origin, path)}#webpage`,
    url: abs(origin, path),
    name,
    description,
    inLanguage: "en-IN",
    isPartOf: { "@id": abs(origin, "/#website") },
    about: { "@id": abs(origin, "/#business") },
    ...(mainEntity ? { mainEntity: { "@id": mainEntity } } : {}),
  };
}

/** "₹4,999" → "4999" ("" when there's no clear number). */
const priceNumber = (p: string) => {
  const m = p.replace(/,/g, "").match(/\d+(\.\d+)?/);
  return m ? m[0] : "";
};

function postPage(origin: string, ctx: SeoCtx, p: PostSummary): PageSeo {
  const { brand, fit } = names(ctx);
  const img = p.ogImage || p.image;
  return {
    path: `/blog/${p.slug}`,
    title: p.seoTitle || fit(`${p.title} | ${brand}`),
    description: p.seoDescription || clip(p.excerpt || p.title),
    image: img || undefined,
    type: "article",
    priority: 0.6,
    lastmod: (p.updatedAt || p.publishAt || "").slice(0, 10),
    jsonLd: [
      crumbs(origin, [
        { name: "Home", path: "/" },
        { name: ctx.content.blog.title || "Blog", path: "/blog" },
        { name: p.title, path: `/blog/${p.slug}` },
      ]),
      {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: p.title,
        description: p.seoDescription || p.excerpt,
        ...(img ? { image: abs(origin, img) } : {}),
        datePublished: p.publishAt,
        dateModified: p.updatedAt || p.publishAt,
        author: { "@type": p.author ? "Person" : "Organization", name: p.author || brand },
        publisher: { "@id": abs(origin, "/#business") },
        mainEntityOfPage: abs(origin, `/blog/${p.slug}`),
        ...(p.tags.length ? { keywords: p.tags.join(", ") } : {}),
        ...(p.category ? { articleSection: p.category } : {}),
      },
      ...customLd(p.schema ?? ""),
    ],
  };
}

/** Owner's extra JSON-LD (Admin → SEO → Advanced). Ignored if it isn't valid JSON. */
function customLd(raw: string): Record<string, unknown>[] {
  if (!raw?.trim()) return [];
  try {
    const v = JSON.parse(raw);
    const list = Array.isArray(v) ? v : [v];
    return list.filter((x) => x && typeof x === "object").map((x) => ({ "@context": "https://schema.org", ...x }));
  } catch {
    return [];
  }
}

/** Every public page of the website. */
export function allPages(origin: string, ctx: SeoCtx): PageSeo[] {
  const { site, content, categories } = ctx;
  const { brand, city, fit } = names(ctx);
  const dup = (() => {
    const seen = new Map<string, number>();
    for (const c of categories) for (const s of c.services) seen.set(s.name, (seen.get(s.name) ?? 0) + 1);
    return new Set([...seen].filter(([, n]) => n > 1).map(([k]) => k));
  })();

  const home: PageSeo = {
    path: "/",
    title: fit(`${brand} | ${categories.slice(0, 3).map((c) => c.menu).join(", ")} & More in ${city}`),
    description: clip(`${brand}, ${city}: ${categories.map((c) => c.title.toLowerCase()).join(", ")}. Free consultation — call ${site.phone}.`),
    priority: 1,
    jsonLd: [
      webPage(origin, "/", brand, site.tagline || brand),
      business(origin, ctx),
      { "@context": "https://schema.org", "@type": "WebSite", "@id": abs(origin, "/#website"), name: brand, url: abs(origin, "/"), inLanguage: "en-IN" },
      ...(content.faqs.length
        ? [
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: content.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
            },
          ]
        : []),
      ...customLd(content.seo.customJsonLd),
    ],
  };
  const pages: PageSeo[] = [
    home,
    {
      path: "/contact",
      title: fit(`Contact Us | ${brand}, ${city}`),
      description: clip(`Call or WhatsApp ${site.phone}, email ${site.email}. ${brand}, ${site.city}.${site.hours ? ` Open ${site.hours}.` : ""} Free consultation.`),
      priority: 0.7,
      jsonLd: [
        crumbs(origin, [
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ]),
        { "@context": "https://schema.org", "@type": "ContactPage", name: "Contact Us", url: abs(origin, "/contact"), about: { "@id": abs(origin, "/#business") } },
      ],
    },
  ];
  if (content.blog.show) {
    pages.push({
      path: "/blog",
      title: fit(`${content.blog.title || "Blog"} | ${brand}`),
      description: clip(content.blog.subtitle || `Guides and tips from ${brand}.`),
      priority: 0.7,
      lastmod: content.posts[0]?.publishAt?.slice(0, 10),
      jsonLd: [
        crumbs(origin, [
          { name: "Home", path: "/" },
          { name: content.blog.title || "Blog", path: "/blog" },
        ]),
        { "@context": "https://schema.org", "@type": "Blog", name: `${brand} ${content.blog.title || "Blog"}`, url: abs(origin, "/blog"), publisher: { "@id": abs(origin, "/#business") } },
      ],
    });
    pages.push(...content.posts.map((p) => postPage(origin, ctx, p)));
  }
  if (content.packagesSection.show && content.packages.length) {
    pages.push({
      path: "/packages",
      title: fit(`${content.packagesSection.title || "Packages & Pricing"} | ${brand}`),
      description: clip(content.packagesSection.subtitle || `Packages and pricing from ${brand}.`),
      priority: 0.8,
      jsonLd: [
        crumbs(origin, [
          { name: "Home", path: "/" },
          { name: content.packagesSection.title || "Packages", path: "/packages" },
        ]),
        {
          "@context": "https://schema.org",
          "@type": "OfferCatalog",
          name: content.packagesSection.title || "Packages",
          itemListElement: content.packages.map((p) => ({
            "@type": "Offer",
            name: p.name,
            description: p.description || p.features.join(", "),
            ...(priceNumber(p.price) ? { price: priceNumber(p.price), priceCurrency: "INR" } : {}),
            seller: { "@id": abs(origin, "/#business") },
          })),
        },
      ],
    });
  }
  if (content.gallerySection.show && content.gallery.length) {
    pages.push({
      path: "/gallery",
      title: fit(`${content.gallerySection.title || "Our Work"} | ${brand}`),
      description: clip(content.gallerySection.subtitle || `Work samples from ${brand}.`),
      image: content.gallery[0]?.image,
      priority: 0.6,
      jsonLd: [
        crumbs(origin, [
          { name: "Home", path: "/" },
          { name: content.gallerySection.title || "Our Work", path: "/gallery" },
        ]),
        {
          "@context": "https://schema.org",
          "@type": "ImageGallery",
          name: content.gallerySection.title || "Our Work",
          image: content.gallery.map((g) => ({ "@type": "ImageObject", contentUrl: abs(origin, g.image), name: g.title })),
        },
      ],
    });
  }
  pages.push(...categories.map((c) => categoryPage(origin, ctx, c)));
  pages.push(...categories.flatMap((c) => c.services.map((s) => servicePage(origin, ctx, c, s, dup))));

  // the owner's own titles / descriptions (Admin → SEO) win
  const own = content.seo.pages;
  return pages.map((p) => {
    const o = own[p.path];
    if (!o) return p;
    return { ...p, title: o.title || p.title, description: o.description || p.description, image: o.image || p.image, jsonLd: [...p.jsonLd, ...customLd(o.schema ?? "")] };
  });
}

/** SEO for one path (unknown paths get the home page, marked noindex by the caller). */
export function seoFor(origin: string, path: string, ctx: SeoCtx): PageSeo & { found: boolean } {
  const clean = path.replace(/\/+$/, "") || "/";
  const pages = allPages(origin, ctx);
  const hit = pages.find((p) => p.path === clean);
  return hit ? { ...hit, found: true } : { ...pages[0], found: false };
}

/** Shared list of head tags (used by server + browser). */
export function headTags(origin: string, page: PageSeo & { found?: boolean }, ctx: SeoCtx) {
  const url = abs(origin, page.path);
  const image = abs(origin, page.image ?? (ctx.content.images["/og-image.png"] || "/og-image.png"));
  const { brand } = names(ctx);
  return {
    title: page.title,
    meta: [
      { name: "description", content: page.description },
      { name: "robots", content: page.found === false ? "noindex, follow" : "index, follow, max-image-preview:large" },
      { property: "og:type", content: page.type ?? (page.path === "/" ? "website" : "article") },
      { property: "og:site_name", content: brand },
      { property: "og:locale", content: "en_IN" },
      { property: "og:title", content: page.title },
      { property: "og:description", content: page.description },
      { property: "og:url", content: url },
      { property: "og:image", content: image },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: page.title },
      { name: "twitter:description", content: page.description },
      { name: "twitter:image", content: image },
    ],
    canonical: url,
    jsonLd: page.jsonLd,
  };
}

export { slugify };
