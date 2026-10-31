// Start file for Node.js hosting (Hostinger "entry file": server.js).
// Locally:  npm run build  then  npm start
// No top-level await here: Hostinger's Node runner loads this file with require().
// If the hosting skipped part of `npm run build`, the missing parts are built here on first start.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));

// Read .env if it exists (on Hostinger, settings come from the dashboard instead).
const envFile = path.join(root, ".env");
if (fs.existsSync(envFile) && typeof process.loadEnvFile === "function") process.loadEnvFile(envFile);

const run = (label, args) => {
  console.log(`${label} not found — building it now…`);
  const r = spawnSync(process.execPath, args, { cwd: root, stdio: "inherit", env: process.env });
  if (r.status !== 0) throw new Error(`${label} build failed (exit ${r.status})`);
};

async function start() {
  if (!fs.existsSync(path.join(root, "dist", "index.html"))) run("Website files (dist)", [path.join(root, "node_modules", "vite", "bin", "vite.js"), "build"]);
  if (!fs.existsSync(path.join(root, "build", "server.mjs"))) run("Server file (build/server.mjs)", [path.join(root, "build-server.mjs")]);
  await import("./build/server.mjs");
}

start().catch((err) => {
  console.error("Server failed to start:", err);
  process.exit(1);
});
