import { z } from "zod";

/**
 * Website content the owner edits in the admin panel:
 * SEO & business details, WhatsApp, blog, packages, reviews, FAQs, gallery and service edits.
 * Pure schema + defaults — safe to use in the browser and on the server.
 */

const txt = (max: number) => z.string().trim().max(max);
const id = z.string().trim().min(1).max(40);
const url = txt(500);

// ───────────── SEO & business details (structured data) ─────────────

export const BUSINESS_TYPES = [
  "ProfessionalService",
  "LocalBusiness",
  "AccountingService",
  "LegalService",
  "FinancialService",
  "EducationalOrganization",
  "Store",
  "Organization",
] as const;

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

export const hoursSchema = z.object({
  days: z.array(z.enum(DAYS)).max(7),
  opens: z.string().regex(/^\d{2}:\d{2}$/, "Use time like 09:00"),
  closes: z.string().regex(/^\d{2}:\d{2}$/, "Use time like 18:00"),
});

export const pageSeoSchema = z.object({
  title: txt(80),
  description: txt(200),
  image: txt(300),
});

export const seoSchema = z.object({
  businessType: z.enum(BUSINESS_TYPES),
  /** Shown to Google as the business description. Empty = automatic. */
  description: txt(400),
  street: txt(200),
  locality: txt(80),
  region: txt(80),
  postalCode: txt(12),
  country: txt(2),
  mapsUrl: url,
  latitude: txt(20),
  longitude: txt(20),
  priceRange: txt(20),
  foundingYear: txt(4),
  areaServed: txt(300),
  hours: z.array(hoursSchema).max(7),
  /** Extra profiles (Google Business Profile, JustDial, IndiaMART …). */
  sameAs: z.array(url).max(15),
  gaId: z.string().trim().regex(/^$|^G-[A-Z0-9]+$/i, "Google Analytics ID looks like G-XXXXXXXXXX"),
  searchConsole: txt(120),
  /** Advanced: extra structured data (JSON-LD) added to the home page, as written. */
  customJsonLd: z
    .string()
    .max(20_000)
    .refine((s) => {
      if (!s.trim()) return true;
      try {
        const v = JSON.parse(s);
        return typeof v === "object" && v !== null;
      } catch {
        return false;
      }
    }, "Extra structured data must be valid JSON"),
  /** Your own title / description / share image per page, keyed by path ("/", "/contact" …). */
  pages: z.record(z.string(), pageSeoSchema),
});
export type SeoSettings = z.infer<typeof seoSchema>;

// ───────────── WhatsApp ─────────────

export const whatsappSchema = z.object({
  showButton: z.boolean(),
  /** Message used on service pages. {service} is replaced with the service name. */
  serviceMessage: txt(300),
  /** Own message for a single service: { "GST Registration": "Hi, I need GST…" } */
  serviceMessages: z.record(z.string(), txt(300)),
  secondLabel: txt(40),
  secondNumber: z.string().trim().regex(/^$|^\d{10,13}$/, "Second WhatsApp: digits only with country code"),
});
export type WhatsappSettings = z.infer<typeof whatsappSchema>;

// ───────────── Blog ─────────────

export const POST_STATUSES = ["draft", "published", "scheduled"] as const;
export const postSchema = z.object({
  id,
  slug: z.string().trim().min(1, "Add a web address (slug)").max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug: small letters, numbers and dashes only"),
  title: txt(160).min(3, "Add a title"),
  excerpt: txt(400),
  body: z.string().max(400_000, "Post is too long"),
  image: txt(300),
  imageAlt: txt(200),
  category: txt(60),
  tags: z.array(txt(40)).max(20),
  author: txt(80),
  status: z.enum(POST_STATUSES),
  /** ISO date-time; for scheduled posts this is when it goes live. */
  publishAt: z.string().max(40),
  createdAt: z.string().max(40),
  updatedAt: z.string().max(40),
  seoTitle: txt(80),
  seoDescription: txt(200),
  ogImage: txt(300),
  /** Link to a service page for the "Get Free Consultation" box (optional). */
  service: txt(160),
});
export type Post = z.infer<typeof postSchema>;
export type PostSummary = Omit<Post, "body">;

// ───────────── Packages ─────────────

export const PERIODS = ["one-time", "monthly", "yearly", "custom"] as const;
export const packageSchema = z.object({
  id,
  name: txt(60).min(1, "Package name is required"),
  price: txt(30),
  oldPrice: txt(30),
  period: z.enum(PERIODS),
  periodLabel: txt(30),
  description: txt(300),
  features: z.array(txt(160)).max(30),
  popular: z.boolean(),
  button: z.enum(["enquire", "whatsapp"]),
  buttonText: txt(40),
  /** Category slug this package belongs to ("" = general). */
  category: txt(60),
  /** Service name this package belongs to ("" = whole category / general). */
  service: txt(160),
  visible: z.boolean(),
});
export type Package = z.infer<typeof packageSchema>;

export const packagesSectionSchema = z.object({
  show: z.boolean(),
  title: txt(80),
  subtitle: txt(200),
  note: txt(300),
});

// ───────────── Reviews ─────────────

export const reviewSchema = z.object({
  id,
  name: txt(80).min(1, "Reviewer name is required"),
  place: txt(80),
  rating: z.number().int().min(1).max(5),
  text: txt(1200).min(1, "Review text is required"),
  date: txt(20),
  source: txt(40),
  visible: z.boolean(),
});
export type Review = z.infer<typeof reviewSchema>;

export const reviewsSectionSchema = z.object({
  show: z.boolean(),
  /** Google rating shown next to the reviews, e.g. "4.8". Empty = hide. */
  rating: z.string().trim().regex(/^$|^[1-5](\.\d)?$/, "Rating like 4.8"),
  ratingCount: z.string().trim().regex(/^$|^\d{1,6}$/, "Number of Google reviews"),
  googleUrl: url,
  /** Add review stars to Google search results (only when reviews are real). */
  inStructuredData: z.boolean(),
});

// ───────────── FAQ, gallery ─────────────

export const faqSchema = z.object({ id, q: txt(240).min(1, "Question is required"), a: txt(2000).min(1, "Answer is required"), visible: z.boolean() });
export type Faq = z.infer<typeof faqSchema>;

export const galleryItemSchema = z.object({
  id,
  title: txt(120),
  image: txt(300).min(1, "Add an image"),
  category: txt(60),
  link: url,
  description: txt(400),
  visible: z.boolean(),
});
export type GalleryItem = z.infer<typeof galleryItemSchema>;

export const gallerySectionSchema = z.object({ show: z.boolean(), title: txt(80), subtitle: txt(200) });

// ───────────── Services (edits on top of the built-in list) ─────────────

export const serviceEditSchema = z.object({
  /** Category slug */
  cat: txt(60),
  /** Original service name ("" for a new service added by the owner) */
  original: txt(160),
  name: txt(160).min(2, "Service name is required"),
  text: txt(400),
  days: txt(60),
  hidden: z.boolean(),
});
export type ServiceEdit = z.infer<typeof serviceEditSchema>;

// ───────────── Everything ─────────────

export const contentSchema = z.object({
  seo: seoSchema,
  whatsapp: whatsappSchema,
  posts: z.array(postSchema).max(500),
  blog: z.object({ show: z.boolean(), title: txt(80), subtitle: txt(200), categories: z.array(txt(60)).max(30) }),
  packages: z.array(packageSchema).max(100),
  packagesSection: packagesSectionSchema,
  reviews: z.array(reviewSchema).max(200),
  reviewsSection: reviewsSectionSchema,
  faqs: z.array(faqSchema).max(100),
  gallery: z.array(galleryItemSchema).max(300),
  gallerySection: gallerySectionSchema,
  services: z.array(serviceEditSchema).max(500),
  /** Replaced website images: original file ("/images/hero.jpg") → uploaded image ("/api/img/…"). */
  images: z.record(z.string().max(200), txt(300)),
});
export type Content = z.infer<typeof contentSchema>;

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export const DEFAULT_CONTENT: Content = {
  seo: {
    businessType: "ProfessionalService",
    description: "",
    street: "",
    locality: "",
    region: "",
    postalCode: "",
    country: "IN",
    mapsUrl: "",
    latitude: "",
    longitude: "",
    priceRange: "",
    foundingYear: "",
    areaServed: "",
    hours: [{ days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], opens: "10:00", closes: "19:00" }],
    sameAs: [],
    gaId: "",
    searchConsole: "",
    customJsonLd: "",
    pages: {},
  },
  whatsapp: {
    showButton: true,
    serviceMessage: "Hi, I need help with {service}",
    serviceMessages: {},
    secondLabel: "",
    secondNumber: "",
  },
  posts: [
    {
      id: "welcome-gst",
      slug: "do-i-need-gst-registration",
      title: "Do I Need GST Registration? A Simple Guide for Small Businesses",
      excerpt: "Not sure if GST registration is compulsory for you? Here is a simple checklist to help you decide.",
      body: `<p>Many small business owners ask us the same question: <strong>do I really need GST registration?</strong> Here is a simple guide.</p>
<h2>When GST registration is compulsory</h2>
<ul><li>Your yearly turnover is above the GST limit for your state and business type.</li><li>You sell products online on marketplaces like Amazon or Flipkart.</li><li>You sell goods to customers in other states.</li></ul>
<h2>Why many businesses take it anyway</h2>
<p>Even below the limit, a GST number helps you work with bigger clients, claim input tax credit and look more professional.</p>
<h2>What documents you need</h2>
<ul><li>PAN and Aadhaar of the owner</li><li>Photo of the owner</li><li>Business address proof</li><li>Bank statement or cancelled cheque</li></ul>
<p>Not sure what applies to you? Book a free consultation and our expert will guide you.</p>`,
      image: "",
      imageAlt: "",
      category: "Business Registration",
      tags: ["GST", "Small business"],
      author: "Team",
      status: "published",
      publishAt: "2026-10-01T09:00:00.000Z",
      createdAt: "2026-10-01T09:00:00.000Z",
      updatedAt: "2026-10-01T09:00:00.000Z",
      seoTitle: "",
      seoDescription: "",
      ogImage: "",
      service: "",
    },
    {
      id: "welcome-website",
      slug: "5-things-every-business-website-needs",
      title: "5 Things Every Small Business Website Needs",
      excerpt: "A website that brings enquiries needs more than a nice design. Check these 5 basics.",
      body: `<p>A good business website does one job: <strong>turn visitors into enquiries</strong>. Make sure yours has these five things.</p>
<h2>1. A clear headline</h2><p>Say what you do and where, in one line.</p>
<h2>2. Works perfectly on mobile</h2><p>Most of your visitors use a phone.</p>
<h2>3. One-tap call and WhatsApp buttons</h2><p>Make it easy to reach you.</p>
<h2>4. Your services with simple explanations</h2><p>Customers should know exactly what they get.</p>
<h2>5. Basic Google setup</h2><p>Titles, descriptions and a Google Business Profile help people find you.</p>`,
      image: "",
      imageAlt: "",
      category: "Website",
      tags: ["Website", "Marketing"],
      author: "Team",
      status: "published",
      publishAt: "2026-10-10T09:00:00.000Z",
      createdAt: "2026-10-10T09:00:00.000Z",
      updatedAt: "2026-10-10T09:00:00.000Z",
      seoTitle: "",
      seoDescription: "",
      ogImage: "",
      service: "",
    },
  ],
  blog: { show: true, title: "Blog", subtitle: "Simple guides and tips to help your business grow.", categories: [] },
  packages: [
    {
      id: "starter",
      name: "Starter",
      price: "₹4,999",
      oldPrice: "",
      period: "one-time",
      periodLabel: "",
      description: "For new businesses getting started.",
      features: ["Business registration guidance", "Logo design (2 options)", "Business card design", "WhatsApp support"],
      popular: false,
      button: "enquire",
      buttonText: "",
      category: "",
      service: "",
      visible: true,
    },
    {
      id: "growth",
      name: "Growth",
      price: "₹14,999",
      oldPrice: "",
      period: "one-time",
      periodLabel: "",
      description: "Everything to look professional and get found online.",
      features: ["Everything in Starter", "5-page business website", "Google Business Profile setup", "Basic SEO", "1 month support"],
      popular: true,
      button: "enquire",
      buttonText: "",
      category: "",
      service: "",
      visible: true,
    },
    {
      id: "premium",
      name: "Premium",
      price: "₹9,999",
      oldPrice: "",
      period: "monthly",
      periodLabel: "",
      description: "Done-for-you marketing every month.",
      features: ["Social media management", "12 posts + 4 reels / month", "Ads management", "WhatsApp auto-replies", "Monthly report"],
      popular: false,
      button: "whatsapp",
      buttonText: "",
      category: "",
      service: "",
      visible: true,
    },
  ],
  packagesSection: { show: true, title: "Packages & Pricing", subtitle: "Simple packages with clear pricing. Need something custom? Just ask.", note: "Prices are indicative. Government fees, if any, are extra." },
  reviews: [
    { id: "r1", name: "Ravi K.", place: "Hyderabad", rating: 5, text: "My GST and company registration were done in a week. Very smooth, and they explained everything simply.", date: "", source: "", visible: true },
    { id: "r2", name: "Priya S.", place: "Bengaluru", rating: 5, text: "They designed our logo and website together. Looks very professional and customers notice it.", date: "", source: "", visible: true },
    { id: "r3", name: "Arjun M.", place: "Pune", rating: 5, text: "Our Instagram enquiries doubled in 2 months. The team posts on time every week.", date: "", source: "", visible: true },
  ],
  reviewsSection: { show: true, rating: "4.8", ratingCount: "", googleUrl: "", inStructuredData: false },
  faqs: [
    { id: "f1", q: "Do I need to visit your office?", a: "No. Everything is done online. You can share documents on WhatsApp or email.", visible: true },
    { id: "f2", q: "How long does GST registration take?", a: "Usually 3 to 7 working days, once we have all your documents.", visible: true },
    { id: "f3", q: "Can you do registration and the website together?", a: "Yes. Many clients start with registration and logo, then add a website. We offer combo prices.", visible: true },
    { id: "f4", q: "How do I pay?", a: "You can pay by UPI, debit/credit card or bank transfer. You get a proper GST invoice.", visible: true },
    { id: "f5", q: "I'm not sure which registration I need. Can you help?", a: "Yes — that's what the free consultation is for. Our expert will suggest the right option for you.", visible: true },
  ],
  gallery: [],
  gallerySection: { show: true, title: "Our Work", subtitle: "A few examples of what we have done for our clients." },
  services: [],
  images: {},
};

/** Merge saved (possibly older-shaped) content over defaults. */
export function mergeContent(saved: Partial<Content> | null | undefined): Content {
  if (!saved || typeof saved !== "object") return DEFAULT_CONTENT;
  const d = DEFAULT_CONTENT;
  return {
    ...d,
    ...saved,
    seo: { ...d.seo, ...saved.seo, pages: saved.seo?.pages ?? {} },
    whatsapp: { ...d.whatsapp, ...saved.whatsapp, serviceMessages: saved.whatsapp?.serviceMessages ?? {} },
    blog: { ...d.blog, ...saved.blog },
    packagesSection: { ...d.packagesSection, ...saved.packagesSection },
    reviewsSection: { ...d.reviewsSection, ...saved.reviewsSection },
    gallerySection: { ...d.gallerySection, ...saved.gallerySection },
    images: saved.images ?? {},
  };
}

/** Is this post visible on the website right now? */
export function isLive(p: Pick<Post, "status" | "publishAt">, now = Date.now()) {
  if (p.status === "published") return true;
  if (p.status === "scheduled") return !!p.publishAt && Date.parse(p.publishAt) <= now;
  return false;
}

/** What visitors get: no drafts, no future posts, no post bodies (loaded one by one). */
export function publicContent(c: Content) {
  const now = Date.now();
  const posts: PostSummary[] = c.posts
    .filter((p) => isLive(p, now))
    .sort((a, b) => Date.parse(b.publishAt || b.createdAt) - Date.parse(a.publishAt || a.createdAt))
    .map(({ body: _b, ...rest }) => rest);
  return {
    ...c,
    posts,
    packages: c.packages.filter((p) => p.visible),
    reviews: c.reviews.filter((r) => r.visible),
    faqs: c.faqs.filter((f) => f.visible),
    gallery: c.gallery.filter((g) => g.visible),
    seo: { ...c.seo },
  };
}
export type PublicContent = ReturnType<typeof publicContent>;

/** "Get GST in 7 days" → "get-gst-in-7-days" */
export const toSlug = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);

/** Rough reading time in minutes for a post body (HTML). */
export const readingTime = (html: string) => Math.max(1, Math.round(html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length / 200));
