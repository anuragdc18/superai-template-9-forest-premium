import { useEffect } from "react";
import { useLocation } from "wouter";
import { headTags, seoFor } from "../lib/seo";
import { DEMO } from "../lib/demo";
import { CATEGORIES } from "../lib/site";
import { useSite } from "../queries/site";
import { useContent } from "../queries/content";

declare const __SITE_URL__: string;
/** Site address used for canonical links (WEBSITE_URL at build time, else this address). */
export const SITE_ORIGIN = (typeof __SITE_URL__ === "string" && __SITE_URL__) || window.location.origin;

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

/** Loads Google Analytics if an ID is set in Admin → SEO and the page doesn't have it yet. */
function useAnalytics(gaId: string) {
  useEffect(() => {
    const w = window as unknown as { gtag?: (...a: unknown[]) => void; dataLayer?: unknown[] };
    if (DEMO || !gaId || w.gtag) return;
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
    document.head.appendChild(s);
    w.dataLayer = w.dataLayer || [];
    w.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      w.dataLayer!.push(arguments);
    };
    w.gtag("js", new Date());
    w.gtag("config", gaId);
  }, [gaId]);
}

/** Keeps title, description, canonical, social tags and structured data right for the current page. */
export function SeoHead() {
  const [loc] = useLocation();
  const site = useSite();
  const content = useContent();
  useAnalytics(content.seo.gaId);
  useEffect(() => {
    const ctx = { site, content, categories: CATEGORIES };
    const t = headTags(SITE_ORIGIN, seoFor(SITE_ORIGIN, loc, ctx), ctx);
    document.title = t.title;
    for (const m of t.meta) {
      if (DEMO && "name" in m && m.name === "robots") continue; // demo copy stays noindex
      "name" in m ? setMeta("name", m.name!, m.content) : setMeta("property", m.property!, m.content);
    }
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = t.canonical;
    document.head.querySelectorAll('script[data-seo="ld"]').forEach((s) => s.remove());
    for (const obj of t.jsonLd) {
      const s = document.createElement("script");
      s.type = "application/ld+json";
      s.dataset.seo = "ld";
      s.textContent = JSON.stringify(obj);
      document.head.appendChild(s);
    }
  }, [loc, site, content]);
  return null;
}
