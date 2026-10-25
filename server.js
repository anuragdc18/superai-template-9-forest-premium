// Start file for Node.js hosting (Hostinger "entry file": server.js).
// Locally:  npm run build  then  npm start
import fs from "node:fs";
import { fileURLToPath } from "node:url";

// Read .env if it exists (on Hostinger, settings come from the dashboard instead).
const envFile = fileURLToPath(new URL(".env", import.meta.url));
if (fs.existsSync(envFile) && typeof process.loadEnvFile === "function") process.loadEnvFile(envFile);

await import("./build/server.mjs");
