/**
 * Offline rule-based chatbot engine.
 *
 * respond() takes what the visitor typed plus the conversation memory, and
 * returns the bot's messages, quick-reply chips and actions (save a lead,
 * log an unanswered question). It never calls any outside service.
 */
import { fillTokens, type SiteSettings, type BotFaq } from "../../../api/lib/site-schema";
import { CATEGORIES, POPULAR, serviceUrl, type Category } from "../site";
import {
  ALL_SERVICES,
  CATEGORY_TERMS,
  COMPARISONS,
  FLOWS,
  GENERAL_FAQS,
  MS_EXAM_FAQS,
  TOPIC_TERMS,
  getService,
  serviceInfo,
  type Topic,
} from "./knowledge";
import { phrase } from "./i18n";
import { contentWords, detectLang, findEmail, findPhone, fuzzyEq, hasTerm, normalize, stem, titleCase, words, type Lang } from "./text";

// ───────────────────────── types ─────────────────────────

export type Customer = { name: string; phone: string; email?: string; need?: string };
export type ChipKind = "send" | "link" | "call" | "whatsapp";
export type Chip = { label: string; send?: string; href?: string; kind?: ChipKind };
export type BotLink = { label: string; href: string };
export type BotMessage = { text: string; saved?: boolean; links?: BotLink[] };
export type LeadDraft = { name: string; phone: string; email?: string; service: string; message: string };
export type Action =
  | { type: "saveLead"; lead: LeadDraft }
  | { type: "setCustomer"; customer: Customer }
  | { type: "miss"; question: string };

export type Step = "name" | "phone" | "email" | "need" | "chat";
export type Memory = {
  step: Step;
  draft: { name?: string; phone?: string; email?: string };
  lastService?: string;
  lastCat?: string;
  services: string[];
  saved: string[];
  flow?: { id: string; node: string };
  pending?: "callbackConfirm" | "cbName" | "cbPhone";
  pendingService?: string;
  pendingQuestion?: string;
  lang: Lang;
  misses: number;
  phoneRefusals: number;
  turns: number;
};
export type Reply = { messages: BotMessage[]; chips: Chip[]; memory: Memory; actions: Action[] };
export type Ctx = { site: SiteSettings; customer: Customer | null; memory: Memory };

// ───────────────────────── service index ─────────────────────────

/** Single words that are too common to identify a service on their own. */
const WEAK = new Set([
  "company", "food", "partnership", "partners", "partner", "import", "export", "cloud", "security", "office", "teams", "outlook",
  "video", "ad", "ads", "post", "posting", "menu", "label", "signature", "speed", "booking", "appointment", "firm", "bot", "whatsapp",
  "sheets", "banner", "deck", "slides", "award", "bio", "seal", "stamp", "cap", "mug", "merch", "identity", "server", "maintenance",
  "reel", "reels", "creative", "creatives", "caption", "captions", "shorts", "naming", "bakery", "marketing", "promotion", "pouch",
  "highlights", "certificates", "flex", "standee", "slogan", "catalog", "loading", "backup", "seo", "iso", "ssl", "amc", "ca", "roc",
  "pf", "tds", "esi", "mca", "gpt", "llm", "dgft", "smm", "gmb", "crm", "zoho", "hubspot", "office", "automation",
]);

type Alias = { term: string; phrase: boolean; weak: boolean };
type IndexEntry = { name: string; cat: Category; aliases: Alias[]; bag: Set<string> };

let INDEX: IndexEntry[] | null = null;
function index(): IndexEntry[] {
  if (INDEX) return INDEX;
  INDEX = ALL_SERVICES.map(({ service, cat }) => {
    const raw = [service.name, service.name.replace(/\(.*?\)/g, " "), ...serviceInfo(service.name).aliases];
    const seen = new Set<string>();
    const aliases: Alias[] = [];
    for (const r of raw) {
      const term = normalize(r);
      if (!term || seen.has(term)) continue;
      seen.add(term);
      const phrase = term.includes(" ");
      aliases.push({ term, phrase, weak: !phrase && WEAK.has(term) });
    }
    const bag = new Set(contentWords(normalize(`${service.name} ${service.text} ${serviceInfo(service.name).aliases.join(" ")}`)));
    return { name: service.name, cat, aliases, bag };
  });
  return INDEX;
}

function scoreServices(norm: string, ws: string[]): { name: string; score: number }[] {
  const padded = ` ${norm} `;
  const out: { name: string; score: number }[] = [];
  for (const e of index()) {
    let best = 0;
    let hits = 0;
    for (const a of e.aliases) {
      let s = 0;
      if (a.phrase) {
        if (padded.includes(` ${a.term} `)) s = 6 + 2 * a.term.split(" ").length;
      } else if (ws.includes(a.term) || ws.some((w) => stem(w) === stem(a.term))) {
        s = a.weak ? 3 : 8;
      } else if (ws.some((w) => fuzzyEq(w, a.term))) {
        s = a.weak ? 2 : 5;
      }
      if (s > 0) {
        hits++;
        best = Math.max(best, s);
      }
    }
    if (best > 0) out.push({ name: e.name, score: best + Math.min(hits - 1, 3) });
  }
  return out.sort((a, b) => b.score - a.score);
}

// ───────────────────────── analysis ─────────────────────────

type Analysis = {
  raw: string;
  norm: string;
  ws: string[];
  cw: string[];
  short: boolean;
  services: { name: string; score: number }[];
  strong: string[];
  topics: Set<Topic>;
  cat?: Category;
  lang: Lang | null;
};

const ONLY_SHORT: Topic[] = ["yes", "no", "greeting", "thanks", "bye"];

function analyse(raw: string): Analysis {
  const norm = normalize(raw);
  const ws = words(norm);
  const cw = contentWords(norm);
  const short = ws.length <= 5;
  const services = scoreServices(norm, ws);
  const top = services[0]?.score ?? 0;
  // keep services that are strong and close to the best match
  const strong = services.filter((s) => s.score >= 6 && s.score >= top - 2).map((s) => s.name);

  const topics = new Set<Topic>();
  for (const [topic, terms] of Object.entries(TOPIC_TERMS) as [Topic, string[]][]) {
    if (ONLY_SHORT.includes(topic) && !short && topic !== "greeting" && topic !== "thanks") continue;
    if (topic === "greeting" && !terms.some((t) => ws[0] === t || norm.startsWith(t + " ") || norm === t)) continue;
    if (terms.some((t) => hasTerm(norm, ws, normalize(t)))) topics.add(topic);
  }

  let cat: Category | undefined;
  let catScore = 0;
  for (const [slug, terms] of Object.entries(CATEGORY_TERMS)) {
    const hits = terms.filter((t) => hasTerm(norm, ws, normalize(t))).length;
    if (hits > catScore) {
      catScore = hits;
      cat = CATEGORIES.find((c) => c.slug === slug);
    }
  }
  return { raw, norm, ws, cw, short, services, strong, topics, cat, lang: detectLang(raw) };
}

/** Score an owner FAQ or general FAQ against the message. */
function faqScore(a: Analysis, keywords: string[], question?: string): number {
  let score = 0;
  for (const k of keywords) {
    const t = normalize(k);
    if (!t) continue;
    if (hasTerm(a.norm, a.ws, t)) score += t.includes(" ") ? 3 : 2;
  }
  if (question) {
    const q = new Set(contentWords(normalize(question)));
    if (q.size) {
      const overlap = a.cw.filter((w) => q.has(w)).length;
      const ratio = overlap / Math.max(q.size, a.cw.length || 1);
      if (ratio >= 0.6) score += 4;
      else if (overlap >= 2) score += overlap;
    }
  }
  return score;
}

function bestOwnerFaq(a: Analysis, faqs: BotFaq[]): { faq: BotFaq; score: number } | null {
  let best: { faq: BotFaq; score: number } | null = null;
  for (const faq of faqs) {
    if (!faq.a.trim()) continue;
    const keys = faq.keywords.split(/[,\n]/).map((k) => k.trim()).filter(Boolean);
    const s = faqScore(a, keys, faq.q);
    if (s > 0 && (!best || s > best.score)) best = { faq, score: s };
  }
  return best;
}

function bestGeneral(a: Analysis) {
  let best: { a: string; score: number } | null = null;
  for (const g of GENERAL_FAQS) {
    const s = faqScore(a, g.keys);
    if (s > 0 && (!best || s > best.score)) best = { a: g.a, score: s };
  }
  return best;
}

function deepFaq(name: string, a: Analysis): { a: string; score: number } | null {
  const info = serviceInfo(name);
  const list = [...(info.faqs ?? [])];
  if (getService(name)?.cat.slug === "microsoft-certifications") list.push(...MS_EXAM_FAQS);
  let best: { a: string; score: number } | null = null;
  for (const f of list) {
    const s = faqScore(a, f.keys);
    if (s > 0 && (!best || s > best.score)) best = { a: f.a, score: s };
  }
  return best;
}

// ───────────────────────── reply builder ─────────────────────────

class Out {
  messages: BotMessage[] = [];
  chips: Chip[] = [];
  actions: Action[] = [];
  say(text: string, extra?: Partial<BotMessage>) {
    if (text.trim()) this.messages.push({ text: text.trim(), ...extra });
    return this;
  }
  chip(...c: Chip[]) {
    for (const x of c) if (!this.chips.some((y) => y.label === x.label)) this.chips.push(x);
    return this;
  }
}

const shortName = (name: string) => name.replace(/\s*\(.*?\)/g, "").replace(/:.*$/, "");

function vars(ctx: Ctx) {
  const name = (ctx.customer?.name || ctx.memory.draft.name || "").split(" ")[0];
  return { name, business: ctx.site.siteName, phone: ctx.site.phone, hours: ctx.site.hours };
}
const fill = (ctx: Ctx, text: string) => {
  const v = vars(ctx);
  return fillTokens(text, { ...v, name: v.name || "there" });
};
const lang = (ctx: Ctx) => ctx.memory.lang;

function callChips(ctx: Ctx): Chip[] {
  return [
    { label: `📞 ${ctx.site.bot.callLabel || "Call us"}`, kind: "call" },
    { label: `💬 ${ctx.site.bot.whatsappLabel || "WhatsApp"}`, kind: "whatsapp" },
  ];
}

function serviceChips(names: string[]): Chip[] {
  return names.slice(0, 6).map((n) => ({ label: shortName(n), send: `Tell me about ${n}` }));
}

function popularChips(): Chip[] {
  return serviceChips(POPULAR.slice(0, 6).map((p) => p.name));
}

function flowFor(name: string | undefined, cat?: Category): string | null {
  const slug = cat?.slug ?? (name ? getService(name)?.cat.slug : undefined);
  if (name === "GST Registration") return "gst";
  if (slug === "registration") return "structure";
  if (slug === "website") return "website";
  if (slug === "microsoft-certifications") return "exam";
  return null;
}

const FLOW_CHIP: Record<string, Chip> = {
  structure: { label: "🤔 Which registration is right for me?", send: "help me choose business registration type" },
  gst: { label: "🧾 Do I need GST?", send: "check if i need gst" },
  website: { label: "🤔 Which website do I need?", send: "help me choose website type" },
  exam: { label: "🎓 Which exam should I take?", send: "help me choose microsoft exam" },
};

// ───────────────────────── answers ─────────────────────────

function priceFor(ctx: Ctx, name: string): string | null {
  const p = ctx.site.bot.prices.find((x) => x.service.trim().toLowerCase() === name.toLowerCase() && x.price.trim());
  return p ? p.price.trim() : null;
}

function answerOverview(ctx: Ctx, out: Out, name: string) {
  const s = getService(name);
  if (!s) return;
  const { service, cat } = s;
  const days = service.days ?? serviceInfo(name).days;
  const who = (service.who ?? cat.who).slice(0, 3);
  const price = priceFor(ctx, name);
  let text = `**${name}**\n${service.text}`;
  const facts = [days ? `⏱️ ${days}` : "", price ? `💰 From ${price}` : "", "✅ 100% online"].filter(Boolean).join("  ·  ");
  text += `\n\n${facts}`;
  if (who.length) text += `\n\n**Good for:**\n${who.map((w) => `• ${w}`).join("\n")}`;
  out.say(text, { links: [{ label: `View ${shortName(name)} details →`, href: serviceUrl(cat.slug, name) }] });
  const hasDocs = !!(service.docs ?? cat.docs);
  out.chip(
    ...(hasDocs ? [{ label: "📄 Documents", send: `Documents needed for ${name}` }] : [{ label: "📋 What you need from me", send: `Documents needed for ${name}` }]),
    { label: "💰 Price", send: `Price of ${name}` },
    { label: "🧭 Process", send: `Process for ${name}` },
    { label: "📞 Free expert call", send: `Please call me about ${name}` },
  );
  const flow = flowFor(name);
  if (flow) out.chip(FLOW_CHIP[flow]);
}

const NEEDS_FROM_YOU: Record<string, string[]> = {
  branding: ["Your business name (and tagline, if any)", "What you sell and who your customers are", "Colours or styles you like", "2–3 logos/brands you admire (optional)"],
  design: ["The text/content to include", "Your logo and brand colours", "Photos (if any)", "Print size or where it will be used"],
  "social-media": ["Your logo and business details", "Photos/videos of your products or shop", "Access to your Instagram/Facebook page", "Any offers you want to promote"],
  website: ["Your business details and services", "Logo and photos (we can arrange stock photos too)", "Domain name idea (we help you pick one)", "Text content — or we write it for you"],
  "ai-tools": ["Your common customer questions and answers", "Your WhatsApp Business number / website access", "Business hours, prices and services list"],
};

function answerDocs(_ctx: Ctx, out: Out, name: string) {
  const s = getService(name);
  if (!s) return;
  const docs = s.service.docs ?? s.cat.docs;
  if (docs) {
    out.say(`📄 **Documents for ${shortName(name)}:**\n${docs.map((d) => `• ${d}`).join("\n")}\n\nJust send clear photos on WhatsApp — our team checks everything before filing. 👍`);
  } else {
    const need = NEEDS_FROM_YOU[s.cat.slug] ?? ["Basic details about your business"];
    out.say(`No paperwork needed for ${shortName(name)}! 🙌 We just need:\n${need.map((d) => `• ${d}`).join("\n")}`);
  }
  out.chip({ label: "💰 Price", send: `Price of ${name}` }, { label: "⏱️ Time", send: `How many days for ${name}` });
}

function answerProcess(_ctx: Ctx, out: Out, name: string) {
  const s = getService(name);
  if (!s) return;
  const days = s.service.days ?? serviceInfo(name).days;
  out.say(
    `🧭 **How ${shortName(name)} works:**\n${s.cat.includes.map((x, i) => `${i + 1}. ${x}`).join("\n")}${days ? `\n\n⏱️ Typical time: **${days}**` : ""}`,
  );
  out.chip({ label: "📄 Documents", send: `Documents needed for ${name}` }, { label: "📞 Start now", send: `Please call me about ${name}` });
}

function answerTimeline(_ctx: Ctx, out: Out, name: string) {
  const s = getService(name);
  if (!s) return;
  const days = s.service.days ?? serviceInfo(name).days;
  if (days) {
    const after = s.cat.slug === "registration" ? "once your documents are ready" : s.cat.slug === "microsoft-certifications" ? "including practice tests" : "after you share the details";
    out.say(`⏱️ **${shortName(name)}** usually takes **${days}**, ${after}. Urgent? Tell our expert — we'll do our best to speed it up. ⚡`);
  } else {
    out.say(`⏱️ It depends on the work involved — usually just a few days. Our expert will confirm the exact timeline on the call.`);
  }
}

function answerPrice(ctx: Ctx, out: Out, name: string | undefined) {
  const price = name ? priceFor(ctx, name) : null;
  const offer = ctx.site.bot.offer.trim() ? `\n\n🎁 ${fill(ctx, ctx.site.bot.offer)}` : "";
  if (name && price) {
    out.say(`💰 **${shortName(name)}** starts from **${price}**. Government fees (if any) are extra and shown upfront — no hidden charges.${offer}`);
  } else {
    out.say(`💰 ${phrase("priceNone", lang(ctx), vars(ctx))}${offer}`);
  }
  askCallback(ctx, out, name);
}

function answerWho(_ctx: Ctx, out: Out, name: string) {
  const s = getService(name);
  if (!s) return;
  const who = s.service.who ?? s.cat.who;
  out.say(`👥 **Who needs ${shortName(name)}?**\n${who.map((w) => `• ${w}`).join("\n")}`);
}

function answerBenefits(_ctx: Ctx, out: Out, name: string) {
  const s = getService(name);
  if (!s) return;
  out.say(`✨ **Why ${shortName(name)}?**\n${s.service.text}\n\n**With us you get:**\n${s.cat.includes.map((x) => `• ${x}`).join("\n")}`);
}

/** Ask "shall our expert call you?" and wait for yes/no. */
function askCallback(ctx: Ctx, out: Out, name?: string) {
  const m = ctx.memory;
  if (name && m.saved.includes(name)) {
    out.chip({ label: "📄 Documents", send: `Documents needed for ${name}` }, { label: "⏱️ Time", send: `How many days for ${name}` }, ...callChips(ctx));
    return;
  }
  m.pending = "callbackConfirm";
  m.pendingService = name ?? m.lastService;
  out.say(phrase("callbackAsk", lang(ctx), vars(ctx)));
  out.chip({ label: "✅ Yes, call me", send: "yes" }, { label: "Not now", send: "no" });
}

function serviceSummary(names: string[]) {
  return names
    .map((n) => {
      const s = getService(n);
      const days = s?.service.days ?? serviceInfo(n).days;
      return `• **${shortName(n)}** — ${s?.service.text ?? ""}${days ? ` (⏱️ ${days})` : ""}`;
    })
    .join("\n");
}

/** Save a call-back lead (or ask for the missing name/number first). */
function doCallback(ctx: Ctx, out: Out, service?: string, phoneOverride?: string) {
  const m = ctx.memory;
  const c = ctx.customer;
  const svc = service ?? m.pendingService ?? m.lastService;
  m.pending = undefined;
  const name = c?.name || m.draft.name;
  const phone = phoneOverride || c?.phone || m.draft.phone;
  if (!name) {
    m.pending = "cbName";
    m.pendingService = svc;
    out.say("Sure! 😊 May I know your name?");
    return;
  }
  if (!phone) {
    m.pending = "cbPhone";
    m.pendingService = svc;
    out.say(`Thanks ${name.split(" ")[0]}! Please share your 10-digit mobile number so our expert can call you.`);
    return;
  }
  const label = svc ?? "General enquiry";
  if (!m.saved.includes(label) || phoneOverride) {
    m.saved.push(label);
    const topics = m.services.length ? `Interested in: ${m.services.slice(-5).join(", ")}` : "General enquiry";
    out.actions.push({
      type: "saveLead",
      lead: { name, phone, email: c?.email, service: label.slice(0, 80), message: `Call-back requested in chatbot. ${topics}`.slice(0, 1000) },
    });
    if (!c || c.phone !== phone) out.actions.push({ type: "setCustomer", customer: { name, phone, email: c?.email, need: label } });
  }
  out.say(phrase("callbackDone", lang(ctx), { ...vars(ctx), name: name.split(" ")[0], phone: formatPhone(phone) }), { saved: true });
  out.chip(...callChips(ctx));
}

const formatPhone = (p: string) => (p.length === 10 ? `${p.slice(0, 5)} ${p.slice(5)}` : p);

function answerFlowNode(ctx: Ctx, out: Out, flowId: string, nodeId: string) {
  const node = FLOWS[flowId].nodes[nodeId];
  ctx.memory.flow = { id: flowId, node: nodeId };
  out.say(node.text);
  out.chip(...node.options.map((o) => ({ label: o.label, send: o.label })));
}

function matchFlowOption(a: Analysis, flowId: string, nodeId: string) {
  const node = FLOWS[flowId]?.nodes[nodeId];
  if (!node) return null;
  const n = a.norm;
  const num = Number(n);
  if (Number.isInteger(num) && num >= 1 && num <= node.options.length) return node.options[num - 1];
  const exact = node.options.find((o) => normalize(o.label) === n);
  if (exact) return exact;
  if (a.topics.has("yes") && a.short) {
    const y = node.options.find((o) => /^yes/i.test(o.label));
    if (y) return y;
  }
  if (a.topics.has("no") && a.short) {
    const y = node.options.find((o) => /^no/i.test(o.label));
    if (y) return y;
  }
  let best: { o: (typeof node.options)[number]; s: number } | null = null;
  for (const o of node.options) {
    const ow = contentWords(normalize(o.label));
    const s = a.cw.filter((w) => ow.some((x) => x === w || fuzzyEq(w, x))).length;
    if (s > 0 && (!best || s > best.s)) best = { o, s };
  }
  return best?.o ?? null;
}

function finishFlow(ctx: Ctx, out: Out, result: { text: string; services: string[] }) {
  const m = ctx.memory;
  m.flow = undefined;
  out.say(result.text, {
    links: result.services.slice(0, 2).map((n) => {
      const s = getService(n);
      return { label: `View ${shortName(n)} →`, href: s ? serviceUrl(s.cat.slug, n) : "/" };
    }),
  });
  remember(m, result.services[0]);
  out.chip(...serviceChips(result.services.slice(0, 2)).map((c) => ({ ...c, label: `More on ${c.label}` })));
  askCallback(ctx, out, result.services[0]);
}

function remember(m: Memory, name?: string) {
  if (!name) return;
  m.lastService = name;
  m.lastCat = getService(name)?.cat.slug;
  if (!m.services.includes(name)) m.services.push(name);
}

function answerContact(ctx: Ctx, out: Out) {
  const s = ctx.site;
  const phones = [s.phone, ...s.phones.map((p) => `${p.number}${p.label ? ` (${p.label})` : ""}`)];
  const emails = [s.email, ...s.emails.map((e) => `${e.email}${e.label ? ` (${e.label})` : ""}`)];
  out.say(
    `📞 **Phone:** ${phones.join(", ")}\n💬 **WhatsApp:** +${s.whatsapp}\n✉️ **Email:** ${emails.join(", ")}\n🕘 **Hours:** ${s.hours}`,
    { links: [{ label: "Contact page →", href: "/contact" }] },
  );
  out.chip(...callChips(ctx));
}

function answerAddress(ctx: Ctx, out: Out) {
  const s = ctx.site;
  if (s.addresses.length) {
    out.say(`📍 **Our office${s.addresses.length > 1 ? "s" : ""}:**\n${s.addresses.map((a) => `• ${a.label ? `**${a.label}:** ` : ""}${a.line}`).join("\n")}\n\nBut you don't need to visit — everything is done online! 🙌`, {
      links: s.addresses.filter((a) => a.mapUrl).slice(0, 2).map((a) => ({ label: `Open ${a.label || "map"} in Maps →`, href: a.mapUrl })),
    });
  } else {
    out.say(`📍 We're based in **${s.city}**, and we serve clients **across India** — everything is done online, so no need to visit. 🙌`);
  }
}

function answerHours(ctx: Ctx, out: Out) {
  out.say(`🕘 We're available **${ctx.site.hours}**. This chat works 24×7 — leave your question or number anytime and our expert will get back to you in working hours.`);
}

function answerCategory(ctx: Ctx, out: Out, cat: Category, recommend: boolean) {
  const flow = flowFor(undefined, cat);
  if (recommend && flow) return answerFlowNode(ctx, out, flow, FLOWS[flow].start);
  ctx.memory.lastCat = cat.slug;
  out.say(`**${cat.title}**\n${cat.intro}\n\nPopular options 👇`, { links: [{ label: `See all ${cat.title} services →`, href: `/services/${cat.slug}` }] });
  out.chip(...serviceChips(cat.menuItems));
  if (flow) out.chip(FLOW_CHIP[flow]);
}

function answerCapability(_ctx: Ctx, out: Out) {
  out.say(
    `I can help you with 👇\n${CATEGORIES.map((c) => `• **${c.title}** — ${c.short}`).join("\n")}\n\nAsk me about any service — documents, time, price or process — or tap a topic below.`,
  );
  out.chip(...CATEGORIES.map((c) => ({ label: c.menu, send: `Show ${c.title} services` })));
}

function answerServiceTopics(ctx: Ctx, out: Out, name: string, a: Analysis, multi: boolean) {
  const t = a.topics;
  const deep = deepFaq(name, a);
  const asked = (["what", "who", "benefits", "process", "documents", "timeline", "price"] as Topic[]).filter((x) => t.has(x));
  if (asked.length > 1 && asked.includes("what")) asked.splice(asked.indexOf("what"), 1);
  const explicit = asked.filter((x) => x === "documents" || x === "price" || x === "process");
  if (deep && (explicit.length === 0 || deep.score >= 4)) {
    out.say(deep.a);
    if (explicit.includes("price")) answerPrice(ctx, out, name);
    else out.chip({ label: `More on ${shortName(name)}`, send: `Tell me about ${name}` }, { label: "📞 Free expert call", send: `Please call me about ${name}` });
    return;
  }
  if (asked.length === 0 || (asked.length === 1 && asked[0] === "what")) {
    if (multi) return;
    return answerOverview(ctx, out, name);
  }
  for (const x of asked) {
    if (x === "what") answerOverview(ctx, out, name);
    if (x === "who") answerWho(ctx, out, name);
    if (x === "benefits") answerBenefits(ctx, out, name);
    if (x === "process") answerProcess(ctx, out, name);
    if (x === "documents") answerDocs(ctx, out, name);
    if (x === "timeline") answerTimeline(ctx, out, name);
    if (x === "price") answerPrice(ctx, out, name);
  }
}

function findComparison(a: Analysis) {
  const ws = a.ws;
  for (const c of COMPARISONS) {
    const hitA = c.a.some((t) => hasTerm(a.norm, ws, normalize(t)));
    const hitB = c.b.some((t) => hasTerm(a.norm, ws, normalize(t)));
    if (hitA && hitB) return c;
  }
  return null;
}

/** Fallback: find services whose words overlap the question. */
function suggest(a: Analysis): string[] {
  if (!a.cw.length) return [];
  const scored = index()
    .map((e) => ({ name: e.name, s: a.cw.filter((w) => w.length >= 4 && [...e.bag].some((b) => b === w || fuzzyEq(w, b))).length }))
    .filter((x) => x.s > 0)
    .sort((x, y) => y.s - x.s);
  return scored.slice(0, 3).map((x) => x.name);
}

// ───────────────────────── intake (name → phone → need) ─────────────────────────

const NOT_NAME = new Set([
  "hi", "hello", "hey", "ok", "okay", "yes", "no", "namaste", "thanks", "thank", "what", "why", "how", "help", "price", "sir",
  "madam", "test", "skip", "later", "none", "na", "nothing", "good", "fine", "hmm", "who", "where", "when", "please", "bro",
]);

function extractName(raw: string): string | null {
  let t = raw.trim().replace(/[.!?]+$/, "");
  const m = t.match(/(?:my name is|my name's|name is|name:|i am|i'm|im|this is|it's|its|myself|mera naam|mera name|naa peru|na peru|nenu)\s+(.+)/i);
  if (m) t = m[1];
  t = t.replace(/\s+(hai|hoon|hu|here|ji|garu|andi|sir|madam)$/i, "").trim();
  if (!/^[\p{L}\p{M}.' ]{2,40}$/u.test(t)) return null;
  const parts = t.split(/\s+/);
  if (parts.length > 4) return null;
  if (parts.some((p) => NOT_NAME.has(p.toLowerCase()))) return null;
  if (scoreServices(normalize(t), words(normalize(t))).some((s) => s.score >= 8)) return null;
  return titleCase(t);
}

const REFUSE = /\b(no|not|dont|don't|wont|won't|skip|later|why|privacy|later|nahi|vaddu|ledu)\b/i;

function looksLikeQuestion(a: Analysis) {
  if (a.raw.includes("?")) return true;
  if (a.strong.length) return true;
  return ["price", "timeline", "documents", "process", "what", "who", "compare", "recommend", "contact", "address"].some((t) =>
    a.topics.has(t as Topic),
  ) && a.ws.length >= 3;
}

function intake(ctx: Ctx, out: Out, a: Analysis, buttonMessage?: string): boolean {
  const m = ctx.memory;
  const bot = ctx.site.bot;
  const t = (s: string) => fill(ctx, s);

  if (m.step === "name") {
    const phone = findPhone(a.raw);
    if (phone && !m.draft.phone) m.draft.phone = phone;
    const name = extractName(a.raw);
    if (name) {
      m.draft.name = name;
      if (m.draft.phone) return advanceAfterPhone(ctx, out);
      m.step = "phone";
      out.say(t(bot.askPhone));
      return true;
    }
    if (/^\s*(skip|no|later|nahi|vaddu)\s*$/i.test(a.raw)) {
      m.step = "chat";
      out.say(phrase("noProblem", lang(ctx), vars(ctx)));
      out.chip(...bot.buttons.map((b) => ({ label: b.label, send: b.message || b.label })));
      return true;
    }
    if (looksLikeQuestion(a)) {
      m.pendingQuestion = a.raw;
      out.say(`Sure, I'll answer that right away! 😊 ${t(bot.askName)}`);
      return true;
    }
    if (a.topics.has("greeting")) {
      out.say(`Hello! 👋 ${t(bot.askName)}`);
      return true;
    }
    out.say(`Sorry, I didn't catch your name. 🙂 ${t(bot.askName)}`);
    return true;
  }

  if (m.step === "phone") {
    const phone = findPhone(a.raw);
    if (phone) {
      m.draft.phone = phone;
      return advanceAfterPhone(ctx, out);
    }
    if (/^\s*skip\s*$/i.test(a.raw) || (m.phoneRefusals >= 1 && REFUSE.test(a.raw))) {
      m.step = bot.collectEmail ? "email" : "need";
      if (m.pendingQuestion) return finishIntake(ctx, out, m.pendingQuestion);
      out.say(phrase("noProblem", lang(ctx), vars(ctx)));
      out.say(t(bot.askNeed));
      m.step = "need";
      out.chip(...bot.buttons.map((b) => ({ label: b.label, send: b.message || b.label })));
      return true;
    }
    if (REFUSE.test(a.raw)) {
      m.phoneRefusals++;
      out.say(`We only use your number so our expert can call you back with answers — **no spam, promise.** 🙏 You can also type **skip** to continue chatting.`);
      return true;
    }
    if (looksLikeQuestion(a) && !/\d{4,}/.test(a.raw)) {
      m.pendingQuestion = a.raw;
      out.say(`I'll answer that in a second! 😊 ${t(bot.askPhone)}`);
      return true;
    }
    out.say(t(bot.invalidPhone));
    return true;
  }

  if (m.step === "email") {
    const email = findEmail(a.raw);
    const skip = /^(skip|no|na|n\/a|-|nahi|ledu)$/i.test(a.raw.trim());
    if (!email && !skip) {
      out.say(t(bot.invalidEmail));
      return true;
    }
    m.draft.email = email ?? undefined;
    if (m.pendingQuestion) return finishIntake(ctx, out, m.pendingQuestion);
    m.step = "need";
    out.say(t(bot.askNeed));
    out.chip(...bot.buttons.map((b) => ({ label: b.label, send: b.message || b.label })));
    return true;
  }

  if (m.step === "need") return finishIntake(ctx, out, buttonMessage || a.raw);
  return false;
}

function advanceAfterPhone(ctx: Ctx, out: Out): boolean {
  const m = ctx.memory;
  const bot = ctx.site.bot;
  if (bot.collectEmail) {
    m.step = "email";
    out.say(fill(ctx, bot.askEmail));
    return true;
  }
  if (m.pendingQuestion) return finishIntake(ctx, out, m.pendingQuestion);
  m.step = "need";
  out.say(fill(ctx, bot.askNeed));
  out.chip(...bot.buttons.map((b) => ({ label: b.label, send: b.message || b.label })));
  return true;
}

/** Intake done: save the lead, then answer what they asked. */
function finishIntake(ctx: Ctx, out: Out, needText: string): boolean {
  const m = ctx.memory;
  m.step = "chat";
  m.pendingQuestion = undefined;
  const a = analyse(needText);
  const service = a.strong[0] ?? (a.cat ? a.cat.title : "") ?? "";
  const label = service || ctx.site.bot.buttons.find((b) => b.message === needText || b.label === needText)?.label || "General enquiry";
  const name = m.draft.name ?? "";
  const phone = m.draft.phone ?? "";
  const customer: Customer = { name, phone, email: m.draft.email, need: label };
  out.actions.push({ type: "setCustomer", customer });
  ctx.customer = customer;
  if (phone) {
    m.saved.push(label);
    out.actions.push({
      type: "saveLead",
      lead: { name, phone, email: m.draft.email, service: label.slice(0, 80), message: `Chatbot: ${needText}`.slice(0, 1000) },
    });
    out.say(fill(ctx, ctx.site.bot.savedMessage), { saved: true });
  }
  chat(ctx, out, a);
  return true;
}

// ───────────────────────── main chat ─────────────────────────

function chat(ctx: Ctx, out: Out, a: Analysis) {
  const m = ctx.memory;
  const site = ctx.site;
  const t = a.topics;
  const strong = a.strong;

  // 1) a phone number typed in the chat → call-back
  const phone = findPhone(a.raw);
  if (phone && (!ctx.customer?.phone || ctx.customer.phone !== phone)) {
    if (m.pending === "cbName" || (!ctx.customer?.name && !m.draft.name)) {
      m.draft.phone = phone;
      m.pending = "cbName";
      m.pendingService = strong[0] ?? m.pendingService ?? m.lastService;
      out.say("Thanks! 😊 And may I know your name?");
      return;
    }
    return doCallback(ctx, out, strong[0] ?? m.pendingService ?? m.lastService, phone);
  }

  // 2) answers to our own questions
  if (m.pending === "cbName") {
    const name = extractName(a.raw);
    if (name) {
      m.draft.name = name;
      return doCallback(ctx, out, m.pendingService);
    }
    m.pending = undefined;
  } else if (m.pending === "cbPhone") {
    if (REFUSE.test(a.raw)) {
      m.pending = undefined;
      out.say(phrase("noProblem", lang(ctx), vars(ctx)));
      out.chip(...callChips(ctx));
      return;
    }
    if (!looksLikeQuestion(a)) {
      out.say(fill(ctx, site.bot.invalidPhone));
      return;
    }
    m.pending = undefined;
  } else if (m.pending === "callbackConfirm") {
    if (a.short && t.has("yes") && !t.has("no")) return doCallback(ctx, out, m.pendingService);
    if (a.short && t.has("no")) {
      m.pending = undefined;
      out.say(phrase("noProblem", lang(ctx), vars(ctx)));
      out.chip(...(m.lastService ? serviceChips([m.lastService]).map((c) => ({ ...c, label: `More on ${c.label}` })) : []), ...popularChips().slice(0, 3));
      return;
    }
    m.pending = undefined;
  }

  // 3) guided "help me choose" flows
  if (m.flow) {
    const opt = matchFlowOption(a, m.flow.id, m.flow.node);
    if (opt) {
      if (opt.next) return answerFlowNode(ctx, out, m.flow.id, opt.next);
      if (opt.result) return finishFlow(ctx, out, opt.result);
    }
    m.flow = undefined;
  }

  // 4) owner-written answers come first
  const owner = bestOwnerFaq(a, site.bot.faqs);
  if (owner && (owner.score >= 4 || (owner.score >= 2 && strong.length === 0))) {
    out.say(fill(ctx, owner.faq.a));
    out.chip(...(m.lastService ? [{ label: `More on ${shortName(m.lastService)}`, send: `Tell me about ${m.lastService}` }] : []), {
      label: "📞 Talk to an expert",
      send: "Please call me",
    });
    return;
  }

  // 5) small talk
  if (t.has("identity") && (strong.length === 0 || / you /.test(` ${a.norm} `))) {
    out.say(`I'm **${fill(ctx, site.bot.name)}** 🤖 — a virtual assistant for ${site.siteName}. I answer questions about our services instantly, and I can connect you to a real expert anytime.`);
    out.chip({ label: "📞 Talk to a human", send: "Please call me" }, ...popularChips().slice(0, 3));
    return;
  }
  const infoTopics: Topic[] = ["price", "timeline", "documents", "process", "who", "what", "benefits", "compare", "recommend", "contact", "address", "hours", "status", "offer", "trust", "complaint", "capability", "human"];
  const hasInfo = infoTopics.some((x) => t.has(x)) || strong.length > 0 || !!a.cat;
  if (!hasInfo) {
    if (t.has("bye")) {
      out.say(phrase("bye", lang(ctx), vars(ctx)));
      return;
    }
    if (t.has("thanks")) {
      out.say(phrase("thanks", lang(ctx), vars(ctx)));
      out.chip(...popularChips().slice(0, 4));
      return;
    }
    if (t.has("greeting")) {
      out.say(phrase("greet", lang(ctx), vars(ctx)));
      out.chip(...site.bot.buttons.map((b) => ({ label: b.label, send: b.message || b.label })));
      return;
    }
    if (t.has("yes") && a.short) {
      out.say(`Great! 😊 What would you like to know? You can ask about any service, documents, time or price.`);
      out.chip(...(m.lastService ? [{ label: `More on ${shortName(m.lastService)}`, send: `Tell me about ${m.lastService}` }] : []), ...popularChips().slice(0, 4));
      return;
    }
    if (t.has("no") && a.short) {
      out.say(phrase("noProblem", lang(ctx), vars(ctx)));
      return;
    }
  }

  // 6) wants a human / call-back
  if (t.has("human") && !t.has("contact") && !(["price", "documents", "timeline", "process"] as Topic[]).some((x) => t.has(x))) {
    return doCallback(ctx, out, strong[0] ?? m.lastService);
  }

  // 7) complaint
  if (t.has("complaint") && !strong.length && !hasTerm(a.norm, a.ws, "refund")) {
    out.say(`I'm really sorry to hear that${vars(ctx).name ? `, ${vars(ctx).name}` : ""}. 🙏 Please share the details with us on WhatsApp or call — a senior team member will personally look into it right away.`);
    out.chip(...callChips(ctx), { label: "📞 Request a call", send: "Please call me" });
    return;
  }

  // 8) comparisons
  const cmp = t.has("compare") || t.has("recommend") || / or /.test(` ${a.norm} `) ? findComparison(a) : null;
  if (cmp) {
    out.say(cmp.text);
    cmp.recommend?.forEach((n) => remember(m, n));
    out.chip(...serviceChips(cmp.recommend ?? []).map((c) => ({ ...c, label: `More on ${c.label}` })));
    const flow = flowFor(cmp.recommend?.[0]);
    if (flow) out.chip(FLOW_CHIP[flow]);
    out.chip({ label: "📞 Ask an expert", send: "Please call me" });
    return;
  }

  // 9) guided flows
  if (/check if i need gst/.test(a.norm) || (strong[0] === "GST Registration" && t.has("recommend"))) return answerFlowNode(ctx, out, "gst", FLOWS.gst.start);
  if (/help me choose/.test(a.norm) || t.has("recommend")) {
    const flow =
      /business registration|company type|registration type/.test(a.norm)
        ? "structure"
        : /website type/.test(a.norm)
          ? "website"
          : /microsoft exam/.test(a.norm)
            ? "exam"
            : flowFor(strong.length > 1 ? undefined : strong[0], strong.length ? undefined : (a.cat ?? CATEGORIES.find((c) => c.slug === m.lastCat)));
    if (flow && (strong.length !== 1 || /help me choose/.test(a.norm) || ["Company Registration (Pvt Ltd)", "LLP Registration", "Proprietorship / Firm Registration"].includes(strong[0]) || !!a.cat)) {
      return answerFlowNode(ctx, out, flow, FLOWS[flow].start);
    }
  }

  // 10) company info
  if (t.has("contact") && !strong.length) return answerContact(ctx, out);
  if (t.has("hours") && !strong.length) return answerHours(ctx, out);
  if (t.has("address") && !strong.length && !t.has("documents")) return answerAddress(ctx, out);
  if (t.has("status") && !t.has("price") && !strong.length) {
    out.say(`To check the status of your application, please WhatsApp us your **name and service** — our team will reply with the latest update. 📲`);
    out.chip(...callChips(ctx));
    return;
  }
  if (t.has("offer") && !strong.length) {
    out.say(site.bot.offer.trim() ? `🎁 ${fill(ctx, site.bot.offer)}` : `🎁 Our expert will share any current offers and the best package for you on the free call.`);
    askCallback(ctx, out, m.lastService);
    return;
  }
  if (t.has("language") && !strong.length) {
    out.say(`I understand **English, Hindi and Telugu** 🙂 — type in whichever you like. Our experts can also explain everything on a call in your language.`);
    return;
  }

  // 11) specific services (a weak word counts when it fits the category being asked about, e.g. "company register")
  if (!strong.length && a.cat) {
    const fit = a.services.find((s) => s.score >= 2 && getService(s.name)?.cat.slug === a.cat!.slug);
    if (fit) strong.push(fit.name);
  }
  if (strong.length) {
    const names = strong.slice(0, 3);
    names.forEach((n) => remember(m, n));
    if (names.length > 1) {
      const anyTopic = (["price", "documents", "timeline", "process", "who", "benefits"] as Topic[]).some((x) => t.has(x));
      if (!anyTopic) {
        out.say(`Here's a quick look 👇\n${serviceSummary(names)}`);
        out.chip(...serviceChips(names).map((c) => ({ ...c, label: `More on ${c.label}` })));
        out.chip({ label: "📞 Free expert call", send: "Please call me" });
      } else {
        names.forEach((n) => answerServiceTopics(ctx, out, n, a, true));
      }
      m.lastService = names[0];
    } else {
      answerServiceTopics(ctx, out, names[0], a, false);
    }
    langNote(ctx, out);
    return;
  }

  // 12) topic about the service we were just discussing
  const topicNow = (["price", "timeline", "documents", "process", "who", "benefits"] as Topic[]).some((x) => t.has(x));
  const last = m.lastService;
  if (last) {
    const deep = deepFaq(last, a);
    if (deep && (deep.score >= 2 || topicNow)) {
      out.say(deep.a);
      out.chip({ label: `More on ${shortName(last)}`, send: `Tell me about ${last}` }, { label: "📞 Free expert call", send: `Please call me about ${last}` });
      return;
    }
    if (topicNow && !a.cat) {
      answerServiceTopics(ctx, out, last, a, false);
      return;
    }
  }

  // 13) built-in company answers
  const general = bestGeneral(a);
  if (general && general.score >= 2) {
    out.say(general.a);
    out.chip({ label: "📞 Talk to an expert", send: "Please call me" }, ...popularChips().slice(0, 3));
    return;
  }

  // 14) whole category
  if (a.cat) return answerCategory(ctx, out, a.cat, t.has("recommend"));

  // 15) weak service words (e.g. "whatsapp", "reels") as a last guess
  const weak = a.services.filter((s) => s.score >= 3).map((s) => s.name);
  if (weak.length && !t.has("contact")) {
    if (weak.length === 1) {
      remember(m, weak[0]);
      answerServiceTopics(ctx, out, weak[0], a, false);
    } else {
      out.say(`Did you mean one of these? 👇`);
      out.chip(...serviceChips(weak.slice(0, 4)));
    }
    return;
  }

  // 16) topic but no service known yet
  if (t.has("price")) {
    answerPrice(ctx, out, undefined);
    out.chip(...popularChips().slice(0, 4));
    return;
  }
  if (topicNow) {
    out.say(`Sure! Which service are you asking about? 👇`);
    const pick = t.has("documents") ? "Documents needed for" : t.has("timeline") ? "How many days for" : "Process for";
    out.chip(...POPULAR.slice(0, 6).map((p) => ({ label: shortName(p.name), send: `${pick} ${p.name}` })));
    return;
  }
  if (t.has("capability") || t.has("what")) return answerCapability(ctx, out);
  if (t.has("trust")) {
    out.say(GENERAL_FAQS.find((g) => g.topic === "trust")!.a);
    return;
  }
  if (t.has("contact")) return answerContact(ctx, out);

  // 17) nothing matched
  fallback(ctx, out, a);
}

function langNote(ctx: Ctx, out: Out) {
  const l = lang(ctx);
  if (l !== "en" && !ctx.memory.turns) return;
  if (l !== "en" && ctx.memory.turns % 4 === 1) out.say(phrase("langNote", l, vars(ctx)));
}

function fallback(ctx: Ctx, out: Out, a: Analysis) {
  const m = ctx.memory;
  m.misses++;
  out.actions.push({ type: "miss", question: a.raw.slice(0, 300) });
  const sug = suggest(a);
  if (sug.length && m.misses < 3) {
    out.say(`Hmm, I'm not 100% sure what you mean. 🤔 Were you asking about one of these?`);
    out.chip(...serviceChips(sug));
    out.chip({ label: "📞 Ask an expert", send: "Please call me" });
    return;
  }
  out.say(fill(ctx, ctx.site.bot.fallback || ctx.site.bot.errorMessage));
  if (m.misses >= 2) askCallback(ctx, out, m.lastService);
  else out.chip(...CATEGORIES.slice(0, 5).map((c) => ({ label: c.menu, send: `Show ${c.title} services` })), { label: "📞 Talk to an expert", send: "Please call me" });
}

// ───────────────────────── public API ─────────────────────────

export function newMemory(site: SiteSettings, customer: Customer | null): Memory {
  return {
    step: !site.bot.collectDetails || customer ? "chat" : "name",
    draft: {},
    services: [],
    saved: customer?.need ? [customer.need] : [],
    lang: "en",
    misses: 0,
    phoneRefusals: 0,
    turns: 0,
  };
}

/** The opening messages when the chat window opens. */
export function startChat(site: SiteSettings, customer: Customer | null): Reply {
  const memory = newMemory(site, customer);
  const ctx: Ctx = { site, customer, memory };
  const out = new Out();
  const buttons = site.bot.buttons.map((b) => ({ label: b.label, send: b.message || b.label }));
  if (customer) {
    out.say(fill(ctx, site.bot.returning));
    out.chip(...buttons);
  } else {
    out.say(fill(ctx, site.bot.welcome));
    if (memory.step === "name") out.say(fill(ctx, site.bot.askName));
    else out.chip(...buttons);
  }
  return { messages: out.messages, chips: out.chips, actions: out.actions, memory };
}

/** Main entry: the visitor sent `text` (or tapped a chip that sends `text`). */
export function respond(text: string, site: SiteSettings, customer: Customer | null, memory: Memory): Reply {
  const m: Memory = structuredClone(memory);
  const ctx: Ctx = { site, customer, memory: m };
  const out = new Out();
  const a = analyse(text);
  if (a.lang) m.lang = a.lang;
  else if (a.ws.length >= 3 && /^[\x00-\x7F]*$/.test(text) && m.lang !== "en" && !/[ऀ-ॿఀ-౿]/.test(text)) {
    // switched back to plain English
    if (!a.ws.some((w) => ["ji", "garu", "andi"].includes(w))) m.lang = "en";
  }

  try {
    if (m.step !== "chat") {
      const btn = site.bot.buttons.find((b) => b.message === text || b.label === text);
      intake(ctx, out, a, btn?.message || undefined);
    } else {
      chat(ctx, out, a);
    }
  } catch (err) {
    console.error("bot error", err);
    out.say(fill(ctx, site.bot.errorMessage));
    out.chip(...callChips(ctx));
  }
  if (!out.messages.length) fallback(ctx, out, a);
  m.turns++;
  // never leave the visitor without a way to reach a human
  if (!out.chips.some((c) => c.kind === "call") && m.misses >= 2) out.chip(...callChips(ctx));
  return { messages: out.messages, chips: out.chips.slice(0, 8), actions: out.actions, memory: m };
}
