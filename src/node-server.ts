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
  const file = url.pathname !== "/" ? staticFile(url.pathname) : null;
  if (file) return file;
  if (!fs.existsSync(indexHtml)) return new Response("Website not built yet. Run `npm run build` first.", { status: 500 });
  // single-page app: every other path gets index.html
  return new Response(fs.readFileSync(indexHtml), { headers: { "content-type": TYPES[".html"], "cache-control": "no-cache" } });
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
createServer(getRequestListener(handle)).listen(port, () => {
  console.log(`Website running on port ${port} · data: ${STORAGE === "mysql" ? "MySQL database" : DATA_FILE}`);
});
