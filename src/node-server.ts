/**
 * Production server for Node.js (Hostinger Web Apps, any VPS, Render…).
 * Serves the API under /api and the built website from dist/.
 * Built by `npm run build` into build/server.mjs and started by server.js.
 */
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { getRequestListener } from "@hono/node-server";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import api from "./api";
import { initStore, STORAGE, DATA_FILE } from "./api/store";
import { renderPage, robotsTxt, siteOrigin, sitemapXml } from "./api/render";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = [here, path.resolve(here, ".."), process.cwd()].find((d) => fs.existsSync(path.join(d, "dist", "index.html"))) ?? process.cwd();
const dist = path.join(root, "dist");
const indexHtml = path.join(dist, "index.html");

const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
};

function staticFile(pathname: string): Response | null {
  let rel: string;
  try {
    rel = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  const file = path.normalize(path.join(dist, rel));
  if (!file.startsWith(dist)) return null; // block ../ tricks
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return null;
  const ext = path.extname(file).toLowerCase();
  const cache = rel.startsWith("/assets/") ? "public, max-age=31536000, immutable" : "public, max-age=3600";
  return new Response(fs.readFileSync(file), {
    headers: { "content-type": TYPES[ext] ?? "application/octet-stream", "cache-control": cache },
  });
}

async function handle(request: Request): Promise<Response> {
  const url = new URL(request.url);
  if (url.pathname.startsWith("/api")) return api.fetch(request);
  if (request.method !== "GET" && request.method !== "HEAD") return new Response("Method not allowed", { status: 405 });
  const file = url.pathname !== "/" && url.pathname !== "/index.html" ? staticFile(url.pathname) : null;
  if (file) return file;
  if (!fs.existsSync(indexHtml)) return new Response("Website not built yet. Run `npm run build` first.", { status: 500 });
  try {
    await initStore();
    const origin = siteOrigin(request);
    if (url.pathname === "/sitemap.xml") return new Response(await sitemapXml(origin), { headers: { "content-type": "application/xml; charset=utf-8" } });
    if (url.pathname === "/robots.txt") return new Response(robotsTxt(origin), { headers: { "content-type": "text/plain; charset=utf-8" } });
    // single-page app: every page gets index.html, with its own SEO head filled in
    const { html, status, redirect } = await renderPage(fs.readFileSync(indexHtml, "utf8"), url.pathname, origin);
    if (redirect) return new Response(null, { status, headers: { location: redirect } });
    return new Response(html, { status, headers: { "content-type": TYPES[".html"], "cache-control": "no-cache" } });
  } catch (err) {
    console.error("Page head could not be rendered — sending the plain page.", err);
    return new Response(fs.readFileSync(indexHtml), { headers: { "content-type": TYPES[".html"], "cache-control": "no-cache" } });
  }
}

/** Port: PORT from the hosting (Hostinger sets it), else the one in __ports.cjs. */
function defaultPort(): number {
  try {
    return Number(createRequire(import.meta.url)(path.join(root, "__ports.cjs")).website) || 4200;
  } catch {
    return 4200;
  }
}
const port = Number(process.env.PORT || defaultPort());
await initStore().catch((err) => console.error("Data could not be loaded yet — will retry on first request.", err));
/**
 * Idle shut-down (Hostinger / LiteSpeed only). LiteSpeed starts a separate copy of the site for every
 * address it is reached at (domain, www, temporary domain) and for bursts of visitors, and keeps them
 * running. Each copy exits after IDLE_EXIT_MINUTES with no requests; LiteSpeed starts it again on the
 * next visit (~1–2 s). Set IDLE_EXIT_MINUTES=0 to turn this off. Never active for `npm start` / a VPS.
 */
const underLiteSpeed = /lsnode/i.test(process.title) || process.argv.some((a) => /lsnode/i.test(a));
const idleMinutes = Number(process.env.IDLE_EXIT_MINUTES ?? (underLiteSpeed ? 15 : 0)) || 0;
let inFlight = 0;
let lastActivity = Date.now();
const listener = getRequestListener(async (request: Request) => {
  inFlight++;
  lastActivity = Date.now();
  try {
    return await handle(request);
  } finally {
    inFlight--;
    lastActivity = Date.now();
  }
});
const server = createServer(listener);
if (idleMinutes > 0) {
  setInterval(() => {
    if (inFlight === 0 && Date.now() - lastActivity > idleMinutes * 60_000) {
      console.log(`No visitors for ${idleMinutes} min — stopping this copy to save resources (it restarts on the next visit).`);
      server.close();
      process.exit(0);
    }
  }, 30_000).unref();
}
server.listen(port, () => {
  console.log(`Website running on port ${port} · data: ${STORAGE === "mysql" ? "MySQL database" : DATA_FILE}`);
});
