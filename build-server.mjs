// Bundles the Node.js server (Hostinger / VPS) into build/server.mjs. Called by `npm run build`.
import { build } from "esbuild";

await build({
  entryPoints: ["src/node-server.ts"],
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  packages: "external",
  define: { "import.meta.env.BASE_URL": '"/"', "import.meta.env.VITE_DEMO": '""' },
  outfile: "build/server.mjs",
  logLevel: "warning",
});
console.log("Server ready in build/server.mjs");
