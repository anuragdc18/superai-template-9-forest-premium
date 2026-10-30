import type { RouterClient } from "@orpc/server";
import { createApp } from "./__core/app";
import { ping } from "./routes/ping";
import { leads } from "./routes/leads";
import { siteSettings } from "./routes/site-settings";
import { bot } from "./routes/bot";
import { content } from "./routes/content";
import { readSite } from "./routes/site-settings";
import { auth } from "./auth";
import { ensureAdmin } from "./admin-seed";
import { initStore, readImage } from "./store";

export const router = {
  ping,
  leads,
  siteSettings,
  bot,
  content,
};

export type AppRouter = typeof router;
/** Typed client for the router — used by the web api client. */
export type AppRouterClient = RouterClient<AppRouter>;

const app = createApp(router);

/** Uploaded images: /api/img/<name> (cached by browsers for a year — names never change). */
app.get("/api/img/:name", async (c) => {
  const img = await readImage(c.req.param("name"));
  if (!img) return c.notFound();
  return new Response(new Uint8Array(img.bytes), {
    headers: { "content-type": img.mime, "cache-control": "public, max-age=31536000, immutable", "x-content-type-options": "nosniff" },
  });
});

/** The logo uploaded in Admin → Logo & Colours, as a normal image (for Google). */
app.get("/api/logo", async () => {
  const site = await readSite();
  const m = site.logo.match(/^data:(image\/[a-z+.-]+);base64,(.+)$/);
  if (!m || m[1].includes("svg")) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(Buffer.from(m[2], "base64")), { headers: { "content-type": m[1], "cache-control": "public, max-age=3600" } });
});

app.on(["GET", "POST"], "/api/auth/*", async (c) => {
  await ensureAdmin();
  return auth.handler(c.req.raw);
});

/** Every request waits until saved data is loaded (instant for the file, one query for MySQL). */
export default {
  async fetch(request: Request): Promise<Response> {
    try {
      await initStore();
    } catch (err) {
      console.error("Could not load data", err);
      return new Response(JSON.stringify({ error: "Database not reachable. Check DB settings." }), {
        status: 503,
        headers: { "content-type": "application/json" },
      });
    }
    return app.fetch(request);
  },
};
