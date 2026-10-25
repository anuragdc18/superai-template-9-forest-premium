import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * JSON file "database". Everything the site saves lives in one file:
 *   <repo>/data/db.json  (override with the DATA_FILE env variable)
 *
 * The file is loaded once into memory, and every change is written back
 * straight away (to a temp file first, then renamed, so a crash mid-write
 * can never leave a half-written file behind).
 */

export type Lead = {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  service: string;
  message: string | null;
  source: string;
  status: string;
  createdAt: Date;
};

/** A question the chatbot couldn't answer (shown in Admin → Chat Bot). */
export type BotMiss = {
  id: number;
  question: string;
  count: number;
  lastAsked: Date;
};

type Row = Record<string, unknown>;

export type Data = {
  version: number;
  /** Login tables used by Better Auth (admin user, password, sessions). */
  auth: { user: Row[]; session: Row[]; account: Row[]; verification: Row[]; [model: string]: Row[] };
  leads: Lead[];
  botMisses: BotMiss[];
  /** Key/value settings. The whole site config is stored under "site". */
  settings: Record<string, unknown>;
};

/** Project folder: walk up from this file until we find __ports.cjs (works from src/ and from the bundled build/). */
function findRoot(): string {
  let dir = path.dirname(fileURLToPath(import.meta.url));
  for (let i = 0; i < 8; i++) {
    if (fs.existsSync(path.join(dir, "__ports.cjs"))) return dir;
    const up = path.dirname(dir);
    if (up === dir) break;
    dir = up;
  }
  return process.cwd();
}
export const DATA_FILE = path.resolve(process.env.DATA_FILE || path.join(findRoot(), "data/db.json"));

const DATE_KEYS = new Set(["lastAsked", "createdAt", "updatedAt", "expiresAt", "accessTokenExpiresAt", "refreshTokenExpiresAt"]);

/** JSON has no Date type, so turn saved date strings back into Dates when loading. */
function reviveDates<T>(rows: T[]): T[] {
  for (const row of rows as Row[]) {
    for (const key of Object.keys(row)) {
      const v = row[key];
      if (DATE_KEYS.has(key) && (typeof v === "string" || typeof v === "number")) row[key] = new Date(v);
    }
  }
  return rows;
}

function empty(): Data {
  return { version: 1, auth: { user: [], session: [], account: [], verification: [] }, leads: [], botMisses: [], settings: {} };
}

/** Copy parsed JSON into the live data object (in place, so other modules keep their references). */
function fill(target: Data, raw: Partial<Data>) {
  for (const model of Object.keys(target.auth)) target.auth[model] = [];
  for (const [model, rows] of Object.entries(raw.auth ?? {})) {
    if (Array.isArray(rows)) target.auth[model] = reviveDates(rows);
  }
  target.leads = Array.isArray(raw.leads) ? reviveDates(raw.leads) : [];
  target.botMisses = Array.isArray(raw.botMisses) ? reviveDates(raw.botMisses) : [];
  target.settings = raw.settings && typeof raw.settings === "object" ? raw.settings : {};
}

function readFile(): Partial<Data> | null {
  if (!fs.existsSync(DATA_FILE)) return null;
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8")) as Partial<Data>;
  } catch (err) {
    // Never overwrite a file we couldn't read — keep a copy so nothing is lost.
    const backup = `${DATA_FILE}.broken-${Date.now()}`;
    fs.copyFileSync(DATA_FILE, backup);
    console.error(`Could not read ${DATA_FILE}; saved a copy to ${backup} and started fresh.`, err);
    return null;
  }
}

// ───────────── MySQL (used when database settings are in the environment) ─────────────

type MysqlConfig = { host: string; port: number; user: string; password: string; database: string };

function mysqlConfig(): MysqlConfig | null {
  const url = process.env.DATABASE_URL;
  if (url && /^mysql/i.test(url)) {
    const u = new URL(url);
    return {
      host: u.hostname,
      port: Number(u.port || 3306),
      user: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      database: decodeURIComponent(u.pathname.replace(/^\//, "")),
    };
  }
  const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = process.env;
  if (DB_USER && DB_NAME) {
    return { host: DB_HOST || "localhost", port: Number(DB_PORT || 3306), user: DB_USER, password: DB_PASSWORD ?? "", database: DB_NAME };
  }
  return null;
}

export const STORAGE: "mysql" | "file" = mysqlConfig() ? "mysql" : "file";

type Pool = { query: (sql: string, params?: unknown[]) => Promise<[unknown, unknown]> };
let pool: Pool | null = null;
const TABLE = "site_data";
const ROW_ID = "main";

async function mysqlLoad(target: Data) {
  const cfg = mysqlConfig()!;
  const mysql = await import("mysql2/promise");
  pool = mysql.createPool({ ...cfg, connectionLimit: 3, charset: "utf8mb4", enableKeepAlive: true }) as unknown as Pool;
  await pool.query(
    `CREATE TABLE IF NOT EXISTS ${TABLE} (id VARCHAR(32) PRIMARY KEY, doc LONGTEXT NOT NULL, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) CHARACTER SET utf8mb4`,
  );
  const [rows] = (await pool.query(`SELECT doc FROM ${TABLE} WHERE id = ?`, [ROW_ID])) as [{ doc: string }[], unknown];
  if (rows.length) {
    fill(target, JSON.parse(rows[0].doc) as Partial<Data>);
    console.log(`Data loaded from MySQL database "${cfg.database}".`);
    return;
  }
  // first run on this database: bring over a local data file if there is one
  const local = readFile();
  if (local) {
    fill(target, local);
    console.log(`MySQL is empty — imported ${DATA_FILE}.`);
  }
  await mysqlWrite();
}

let writing: Promise<void> = Promise.resolve();
let queued = false;

async function mysqlWrite() {
  if (!pool) return;
  await pool.query(`REPLACE INTO ${TABLE} (id, doc) VALUES (?, ?)`, [ROW_ID, JSON.stringify(data)]);
}

/** Write to MySQL in order; if several saves happen quickly, only the latest state is written. */
function mysqlSave() {
  if (queued) return;
  queued = true;
  writing = writing.then(async () => {
    queued = false;
    try {
      await mysqlWrite();
    } catch (err) {
      console.error("Could not save to MySQL — will retry on the next change.", err);
    }
  });
}

/** Wait until pending database writes are finished (used in tests / shutdown). */
export const flushed = () => writing;

// Keep one copy per process, even if the dev server reloads this module.
const g = globalThis as unknown as { __jsonDb?: Data; __storeReady?: Promise<void> };
export const data: Data = (g.__jsonDb ??= (() => {
  const d = empty();
  if (STORAGE === "file") {
    const raw = readFile();
    if (raw) fill(d, raw);
  }
  return d;
})());

/** Load data before the first request. Safe to call many times. */
export function initStore(): Promise<void> {
  g.__storeReady ??= STORAGE === "mysql" ? mysqlLoad(data) : Promise.resolve();
  g.__storeReady.catch(() => {
    g.__storeReady = undefined; // let the next request retry
  });
  return g.__storeReady;
}

/** Save the in-memory data (MySQL or file). Call after every change. */
export function save() {
  if (STORAGE === "mysql") return mysqlSave();
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  const tmp = `${DATA_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, DATA_FILE);
}
