// Builds the site for Vercel (Build Output API): static files + one function (API + page heads).
// Used by `npm run build:vercel` (set as the Build Command in vercel.json).
import { build } from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { nodeFileTrace } from "@vercel/nft";

const out = ".vercel/output";
fs.rmSync(out, { recursive: true, force: true });

execSync("npx vite build", { stdio: "inherit" });
fs.cpSync("dist", path.join(out, "static"), { recursive: true });
// pages are sent by the function (with their SEO head), so no plain index.html in the static files
fs.rmSync(path.join(out, "static/index.html"));

const fn = path.join(out, "functions/api.func");
await build({
  entryPoints: ["src/vercel-function.ts"],
  bundle: true,
  platform: "node",
  target: "node22",
  format: "esm",
  packages: "external",
  define: { "import.meta.env.BASE_URL": '"/"', "import.meta.env.VITE_DEMO": '""' },
  outfile: path.join(fn, "index.mjs"),
  logLevel: "warning",
});

// copy only the node_modules files the function really uses
const { fileList } = await nodeFileTrace([path.join(fn, "index.mjs")], { base: process.cwd() });
let copied = 0;
for (const file of fileList) {
  if (!file.startsWith("node_modules/")) continue;
  const dest = path.join(fn, file);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(file, dest, { dereference: true, recursive: true });
  copied++;
}
console.log(`API function: ${copied} dependency files`);
fs.writeFileSync(
  path.join(fn, ".vc-config.json"),
  JSON.stringify({ runtime: "nodejs22.x", handler: "index.mjs", launcherType: "Nodejs", shouldAddHelpers: false, maxDuration: 30 }, null, 2),
);
fs.writeFileSync(path.join(fn, "package.json"), JSON.stringify({ type: "module" }));
fs.copyFileSync("dist/index.html", path.join(fn, "template.html"));

fs.writeFileSync(
  path.join(out, "config.json"),
  JSON.stringify(
    {
      version: 3,
      routes: [
        { src: "/assets/(.*)", headers: { "cache-control": "public, max-age=31536000, immutable" }, continue: true },
        { src: "/api(/.*)?", dest: "/api" },
        { handle: "filesystem" },
        // every other address is a page: the function sends it with its own SEO head
        { src: "^/(.*)$", dest: "/api?__page=/$1" },
      ],
    },
    null,
    2,
  ),
);
console.log("Vercel build ready in .vercel/output");
