import type { RouterClient } from "@orpc/server";
import { createApp } from "./__core/app";
import { ping } from "./routes/ping";
import { leads } from "./routes/leads";
import { siteSettings } from "./routes/site-settings";
import { bot } from "./routes/bot";
import { auth } from "./auth";
import { ensureAdmin } from "./admin-seed";
import { initStore } from "./store";

export const router = {
  ping,
  leads,
  siteSettings,
  bot,
};

export type AppRouter = typeof router;
/** Typed client for the router — used by the web api client. */
export type AppRouterClient = RouterClient<AppRouter>;

const app = createApp(router);

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
