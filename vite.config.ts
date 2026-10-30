import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";
import path from "path";
import honoDevPlugin from "./vite/__plugins/hono-dev-plugin";
import ports from "./__ports.cjs";

const root = __dirname;

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, root, "");
  // NODE_ENV in .env must not turn a production build into a development one
  delete env.NODE_ENV;
  Object.assign(process.env, env);

  return {
    // GitHub Pages serves from /<repo-name>/ (set by the Pages workflow)
    base: process.env.PAGES_BASE || "/",
    // site address for canonical links (same value seo-build uses)
    define: {
      __SITE_URL__: JSON.stringify(
        process.env.VITE_DEMO === "1"
          ? ""
          : (process.env.WEBSITE_URL ||
              (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "")).replace(/\/$/, ""),
      ),
    },
    // All env files live at the repo root — keep Vite's own env loading there too,
    // so packages/web/.env* files can never shadow the root .env.
    envDir: root,
    plugins: [
      honoDevPlugin(),
      react(),
      tailwind(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src/web"),
      },
    },
    server: {
      port: ports.website,
      strictPort: true,
      allowedHosts: true,
      hmr: { overlay: false },
      cors: false,
    },
  };
});
