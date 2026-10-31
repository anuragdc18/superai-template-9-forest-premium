/**
 * Server-side page head: every page is sent with its own title, description, canonical link,
 * social preview, structured data and Google Analytics — straight from the admin settings.
 * Also builds /sitemap.xml and /robots.txt. Used by the Node server (Hostinger) and Vercel.
 */
import { CATEGORIES, OLD_SERVICE_NAMES, serviceUrl, slugify } from "../web/lib/site";
import { applyServiceEdits } from "../web/lib/services-edit";
import { allPages, headTags, seoFor, type SeoCtx } from "../web/lib/seo";
import { publicContent } from "./lib/content-schema";
import { readContent } from "./routes/content";
import { readSite } from "./routes/site-settings";

const BASE = JSON.parse(JSON.stringify(CATEGORIES)) as typeof CATEGORIES;

async function context(): Promise<SeoCtx> {
  const content = publicContent(readContent());
  const img = content.images;
  const categories = applyServiceEdits(BASE, content.services).map((c) => ({ ...c, image: img[c.image] || c.image }));
  return { site: await readSite(), content, categories };
}

/** Site address: WEBSITE_URL if set, else the address the visitor used. */
export function siteOrigin(request: Request) {
  const env = (process.env.WEBSITE_URL || "").replace(/\/$/, "");
  if (env) return env;
  const u = new URL(request.url);
  const proto = request.headers.get("x-forwarded-proto") || u.protocol.replace(":", "");
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || u.host;
  return `${proto}://${host}`;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const json = (o: unknown) => JSON.stringify(o).replace(/</g, "\\u003c");

/** Old address of a renamed service → its new address (so Google links keep working). */
function renamedServiceUrl(pathname: string, ctx: SeoCtx): string | null {
  const m = pathname.match(/^\/services\/([^/]+)\/([^/]+)\/?$/);
  if (!m) return null;
  const e = ctx.content.services.find((x) => x.cat === m[1] && x.original && slugify(x.original) === m[2] && !x.hidden && x.name !== x.original);
  if (e) return serviceUrl(e.cat, e.name);
  // services renamed in the code (full catalogue update)
  const cat = ctx.categories.find((c) => c.slug === m[1]);
  const old = Object.keys(OLD_SERVICE_NAMES).find((o) => slugify(o) === m[2]);
  if (cat && old && !cat.services.some((s) => slugify(s.name) === m[2])) {
    const now = cat.services.find((s) => s.name === OLD_SERVICE_NAMES[old]);
    if (now) return serviceUrl(cat.slug, now.name);
  }
  return null;
}

/** The website page (index.html) with the right head for this path. */
export async function renderPage(template: string, pathname: string, origin: string): Promise<{ html: string; status: number; redirect?: string }> {
  const ctx = await context();
  const moved = renamedServiceUrl(pathname, ctx);
  if (moved) return { html: "", status: 301, redirect: moved };
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/") || pathname === "/login";
  const page = seoFor(origin, pathname, ctx);
  const t = headTags(origin, isAdmin ? { ...page, found: false } : page, ctx);
  const head = [
    `<title>${esc(isAdmin ? "Admin" : t.title)}</title>`,
    ...t.meta.map((m) => ("name" in m ? `<meta name="${m.name}" content="${esc(m.content)}" />` : `<meta property="${m.property}" content="${esc(m.content)}" />`)),
    `<link rel="canonical" href="${esc(t.canonical)}" />`,
    ...(isAdmin ? [] : t.jsonLd.map((o) => `<script type="application/ld+json" data-seo="ld">${json(o)}</script>`)),
  ].join("\n\t\t");

  const gaId = (ctx.content.seo.gaId || process.env.GA_ID || "").trim();
  const verify = (ctx.content.seo.searchConsole || process.env.GOOGLE_SITE_VERIFICATION || "").trim();
  const analytics = [
    verify ? `<meta name="google-site-verification" content="${esc(verify)}" />` : "",
    /^G-[A-Z0-9]+$/i.test(gaId) && !isAdmin
      ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${gaId}"></script>\n\t\t<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');</script>`
      : "",
  ]
    .filter(Boolean)
    .join("\n\t\t");

  const html = template.replace(/<!--seo:start-->[\s\S]*?<!--seo:end-->/, head).replace("<!--analytics-->", analytics);
  return { html, status: page.found || isAdmin ? 200 : 404 };
}

export async function sitemapXml(origin: string) {
  const ctx = await context();
  const today = new Date().toISOString().slice(0, 10);
  const urls = allPages(origin, ctx)
    .map((p) => `  <url><loc>${esc(origin + (p.path === "/" ? "/" : p.path))}</loc><lastmod>${p.lastmod || today}</lastmod><priority>${p.priority.toFixed(1)}</priority></url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function robotsTxt(origin: string) {
  return `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nAllow: /api/img/\n\nSitemap: ${origin}/sitemap.xml\n`;
}
