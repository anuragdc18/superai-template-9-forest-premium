/**
 * Vercel serverless function: runs the API (/api/*) and sends every website page
 * with its own SEO head (files like images/JS/CSS are served by Vercel directly).
 * Built by `npm run build:vercel` into .vercel/output (Vercel Build Output API).
 */
import { getRequestListener } from "@hono/node-server";
import api from "./api";
import fs from "node:fs";
import { flushed, refreshStore, STORAGE } from "./api/store";
import { renderPage, robotsTxt, siteOrigin, sitemapXml } from "./api/render";

const template = fs.readFileSync(new URL("./template.html", import.meta.url), "utf8");

if (STORAGE !== "mysql") {
  console.warn("No MySQL settings found — leads and admin changes will NOT be kept on Vercel. Add DB_HOST, DB_USER, DB_PASSWORD, DB_NAME in Vercel → Settings → Environment Variables.");
}

async function handle(request: Request): Promise<Response> {
  try {
    await refreshStore();
  } catch (err) {
    console.error("Could not load data", err);
    return new Response(JSON.stringify({ error: "Database not reachable. Check DB settings." }), {
      status: 503,
      headers: { "content-type": "application/json" },
    });
  }
  const url = new URL(request.url);
  // pages are routed here as /api?__page=/path (see vercel-build.mjs)
  const page = url.searchParams.get("__page") ?? (url.pathname.startsWith("/api/") ? null : url.pathname);
  if (page !== null) {
    const origin = siteOrigin(request);
    if (page === "/sitemap.xml") return new Response(await sitemapXml(origin), { headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, s-maxage=300" } });
    if (page === "/robots.txt") return new Response(robotsTxt(origin), { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, s-maxage=3600" } });
    const { html, status, redirect } = await renderPage(template, page || "/", origin);
    if (redirect) return new Response(null, { status, headers: { location: redirect, "cache-control": "public, s-maxage=300" } });
    return new Response(html, {
      status,
      headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300" },
    });
  }
  const res = await api.fetch(request);
  // a serverless function can be paused right after it answers, so finish saving first
  await flushed();
  return res;
}

export default getRequestListener(handle);
