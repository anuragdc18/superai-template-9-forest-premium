# SuperAI Business Portal — base template

A complete business website with lead capture, a smart chatbot and an admin panel.
**No outside APIs, no AI keys, no paid services.** Data is stored in MySQL on your hosting
(or in a local file `data/db.json` when no database is set).

---

## 1. Run it on your computer

Install [Bun](https://bun.sh) once (Windows PowerShell):

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

Then inside this folder:

```bash
bun install
bun run dev          # open http://localhost:4200
```

(npm works too: `npm install` then `npm run dev`.)

Port busy? Change `4200` in `__ports.cjs`.

## 2. Admin panel

Open **/admin** — username `admin`, password `Welcome@123!!!`.
**Change the password immediately** in Admin → Username & Password.

---

## 3. Put it online — Hostinger Web App (Node.js)

Works on Hostinger Business, Cloud and Agency plans that include Node.js web apps.
(Menu names in hPanel may differ slightly from below.)

### Step A — Push the code to GitHub

1. Create a **private** repository on GitHub.
2. Upload this whole folder **except** `node_modules`, `data`, `dist`, `build` and `.env`
   (the `.gitignore` file already skips them if you use Git / GitHub Desktop).

### Step B — Create the MySQL database

1. hPanel → **Databases → MySQL Databases**.
2. Create a database and a user with a strong password.
3. Note down: **database name**, **username**, **password** (they look like `u123456789_portal`).

### Step C — Create the Node.js web app

1. hPanel → **Websites → Add website → Node.js app** (Web App).
2. Choose **Import from GitHub** and pick your repository and branch (`main`).
3. Build settings:

   | Setting | Value |
   | --- | --- |
   | Framework / type | **Express / Other (Node.js backend)** — not "static" or "Vite front-end" |
   | Node.js version | **22.x** |
   | Install command | `npm install` |
   | Build command | `npm run build` |
   | Entry file / start | `server.js` (start command: `npm start`) |
   | Output directory (if asked) | `dist` |

4. **Environment variables** — add these:

   | Name | Value |
   | --- | --- |
   | `WEBSITE_URL` | `https://yourdomain.com` |
   | `BETTER_AUTH_SECRET` | any long random text (40+ characters) |
   | `DB_HOST` | `localhost` (use the host hPanel shows if different) |
   | `DB_PORT` | `3306` |
   | `DB_NAME` | your database name |
   | `DB_USER` | your database user |
   | `DB_PASSWORD` | your database password |

5. Click **Deploy**. When it's live, open `https://yourdomain.com/api/health` — you should see `{"status":"ok"}`.
6. Open `/admin`, log in, **change the password**, then set your logo, colours, contact details and chatbot answers.

The app creates its own table (`site_data`) on first start. Every new push to GitHub redeploys
the site automatically — **leads and settings stay safe in MySQL**.

### Backups

hPanel → Databases → phpMyAdmin → export your database (or use Hostinger's automatic backups).

### Other hosts

Any VPS or Node host works: `npm install && npm run build && npm start` (port from `PORT`, default 4200).
Keep it running with `pm2 start server.js --name website`.

---

## 4. The chatbot (rule-based, offline)

Runs inside the visitor's browser — instant, free, private.

- Asks name + mobile, saves a **lead** (source: Chatbot), then answers their question.
- Knows every service: what it is, who needs it, documents, timeline, process, price.
- Remembers context, compares options (Pvt Ltd vs LLP, GST vs MSME, AZ-900 vs AI-901…).
- Guided "help me choose" flows: registration type, do I need GST, website type, Microsoft exam.
- Understands spelling mistakes, Hinglish and Telugu ("gst kitna lagega", "website kavali").

Teach it more in **Admin → Chat Bot**: *Your Own Answers*, *Questions the Bot Couldn't Answer*,
*Service Prices* and *Test your bot*. Built-in knowledge: `src/web/lib/bot/knowledge.ts`.

## 5. Where things are

| What | Where |
| --- | --- |
| Pages and design | `src/web/pages`, `src/web/components` |
| Services list | `src/web/lib/site.ts` |
| Chatbot engine | `src/web/lib/bot/` |
| API (leads, settings, bot log) | `src/api` |
| Data storage (MySQL or file) | `src/api/store/store.ts` |
| Node.js production server | `src/node-server.ts` → built to `build/server.mjs`, started by `server.js` |

---

## GitHub Pages demo (design preview)

`.github/workflows/github-pages.yml` publishes a **demo** of this site to GitHub Pages on every push to `main`
(build: `VITE_DEMO=1`, served from `https://<user>.github.io/<repo>/`).

In the demo: all pages, design and the chatbot work; forms and chatbot leads **open WhatsApp** with the
details filled in; the admin panel is hidden. GitHub Pages has no server, so leads/admin only work on
the real hosting (Hostinger). Turn it on with `enable-github-pages.ps1`
(Settings → Pages → Source: **GitHub Actions**). Free GitHub accounts need the repository to be public.
