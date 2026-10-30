import { CATEGORIES, SLIDES } from "./site";
import { BASE_CATEGORIES } from "./live-categories";
import { assetPath, imageOverrides } from "./demo";

/**
 * Every replaceable website image, for Admin → Images.
 * Category and banner images are found automatically; add other images used by this design to EXTRA_IMAGES.
 */
const BASE_SLIDES = SLIDES.map((s) => ({ ...s }));

/** Images used directly by this template's pages (not in the category / banner lists). */
export const EXTRA_IMAGES: { path: string; label: string; group: string }[] = [
  { path: "/images/hero-all.jpg", label: "Hero slide 1: Everything Your Business Needs", group: "Home page hero" },
  { path: "/images/hero-registration.jpg", label: "Hero slide 2: Registration", group: "Home page hero" },
  { path: "/images/hero-branding.jpg", label: "Hero slide 3: Branding", group: "Home page hero" },
  { path: "/images/hero-website.jpg", label: "Hero slide 4: Website", group: "Home page hero" },
  { path: "/images/hero-microsoft.jpg", label: "Hero slide 5: Microsoft", group: "Home page hero" },
  { path: "/images/story-consult.jpg", label: "Story 1: A relaxed first call", group: "Home page sections" },
  { path: "/images/story-check.jpg", label: "Story 2: Every document checked", group: "Home page sections" },
  { path: "/images/story-deliver.jpg", label: "Story 3: Delivered, with updates", group: "Home page sections" },
  { path: "/images/ms-banner.jpg", label: "Microsoft certifications banner", group: "Home page sections" },
  { path: "/images/cta-background.jpg", label: "Call-to-action background (bottom of pages)", group: "Home page sections" },
];

/** This design uses its own hero photos (above), not the banner images in site.ts. */
const USE_SLIDE_IMAGES = false;

export type SiteImage = { path: string; label: string; group: string };

export function siteImages(): SiteImage[] {
  const list: SiteImage[] = [
    ...(USE_SLIDE_IMAGES ? BASE_SLIDES.map((s, i) => ({ path: assetPath(s.image), label: `Banner ${i + 1}: ${s.title}`, group: "Home page banners" })) : []),
    ...BASE_CATEGORIES.map((c) => ({ path: assetPath(c.image), label: c.title, group: "Service category images" })),
    ...EXTRA_IMAGES,
    { path: "/og-image.png", label: "Default share image (WhatsApp / Facebook preview)", group: "Other" },
  ];
  const seen = new Set<string>();
  return list.filter((x) => (seen.has(x.path) ? false : (seen.add(x.path), true)));
}

let lastKey = "";
/** Use the owner's replacement images everywhere on the website. */
export function applyLiveImages(images: Record<string, string>) {
  const key = JSON.stringify(images);
  if (key === lastKey) return;
  lastKey = key;
  for (const k of Object.keys(imageOverrides)) delete imageOverrides[k];
  Object.assign(imageOverrides, images);
  const pick = (orig: string) => images[assetPath(orig)] || orig;
  BASE_CATEGORIES.forEach((c, i) => {
    if (CATEGORIES[i]) CATEGORIES[i].image = pick(c.image);
  });
  BASE_SLIDES.forEach((s, i) => {
    if (SLIDES[i]) SLIDES[i].image = pick(s.image);
  });
}
