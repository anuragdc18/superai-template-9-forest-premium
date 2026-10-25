/**
 * Text helpers for the offline chatbot: cleaning, word lists, spelling
 * tolerance and language detection. No outside services.
 */

export type Lang = "en" | "hi" | "te";

/** Common chat spellings → one standard word, so matching is simpler. */
const WORD_FIX: Record<string, string> = {
  u: "you",
  ur: "your",
  r: "are",
  pls: "please",
  plz: "please",
  plzz: "please",
  thx: "thanks",
  thnx: "thanks",
  tnx: "thanks",
  ty: "thanks",
  hlo: "hello",
  helo: "hello",
  hii: "hi",
  hiii: "hi",
  hy: "hi",
  hey: "hi",
  wat: "what",
  wht: "what",
  abt: "about",
  reg: "registration",
  regd: "registration",
  registr: "registration",
  registeration: "registration",
  regestration: "registration",
  registation: "registration",
  rgistration: "registration",
  licence: "license",
  lisence: "license",
  licens: "license",
  docs: "documents",
  doc: "documents",
  documnets: "documents",
  documets: "documents",
  certi: "certificate",
  cert: "certification",
  pvt: "private",
  ltd: "limited",
  co: "company",
  comapny: "company",
  compnay: "company",
  websit: "website",
  webiste: "website",
  wesbite: "website",
  site: "website",
  insta: "instagram",
  ig: "instagram",
  fb: "facebook",
  yt: "youtube",
  wa: "whatsapp",
  whatsap: "whatsapp",
  whtsapp: "whatsapp",
  watsapp: "whatsapp",
  amt: "amount",
  rs: "rupees",
  inr: "rupees",
  mins: "minutes",
  hrs: "hours",
  yrs: "years",
  info: "information",
  num: "number",
  no: "no",
  nos: "number",
  mob: "mobile",
  ph: "phone",
  addr: "address",
  logo: "logo",
  ppt: "presentation",
  seo: "seo",
  gst: "gst",
};

/** Multi-word phrases rewritten before splitting into words. */
const PHRASE_FIX: [RegExp, string][] = [
  [/\bprivate limited\b|\bpvt\.?\s*ltd\.?\b|\bp\s*ltd\b/g, " pvtltd "],
  [/\bone person company\b/g, " opc "],
  [/\blimited liability partnership\b/g, " llp "],
  [/\bimport\s*export\s*code\b|\bimport\s*export\b|\bexim\b/g, " iec "],
  [/\bfood\s*licen[cs]e\b|\bfood\s*license\b|\bfssai\b|\bfsaai\b|\bfssi\b/g, " fssai "],
  [/\budyam\b|\budhyam\b|\budyog\s*aadhaar\b|\bmsme\b/g, " msme "],
  [/\btrade\s*mark\b|\btrademark\b|\btm\b|\bbrand\s*(name)?\s*protect\w*/g, " trademark "],
  [/\bincome\s*tax\b|\bitr\b/g, " itr "],
  [/\bgst\s*return\w*\b|\bgst\s*filing\b|\bgstr\w*/g, " gstfiling "],
  [/\bvisiting\s*card\w*\b|\bbusiness\s*card\w*\b/g, " businesscard "],
  [/\bonline\s*(store|shop)\b|\be-?\s*commerce\b|\becommerce\b/g, " onlinestore "],
  [/\blanding\s*page\b/g, " landingpage "],
  [/\bdomain\b|\bhosting\b/g, " domainhosting "],
  [/\bpayment\s*gateway\b|\brazorpay\b|\bpaytm\s*gateway\b/g, " paymentgateway "],
  [/\bsocial\s*media\b/g, " socialmedia "],
  [/\bcall\s*back\b|\bcallback\b|\bcall\s*me\b|\bgive\s*(me\s*)?a?\s*call\b/g, " callback "],
  [/\bcustomer\s*care\b|\bcustomer\s*support\b|\breal\s*person\b|\bhuman\b|\bagent\b|\bexecutive\b/g, " human "],
  [/\bhow\s*much\b|\bkitn[ae]\b|\bkitna\s*paisa\b|\bentha\b|\benta\b|\bentha\s*avutundi\b/g, " price "],
  [/\bhow\s*long\b|\bhow\s*many\s*days\b|\bkitne\s*din\b|\bkitna\s*time\b|\benni\s*rojulu\b|\bentha\s*time\b/g, " timeline "],
  [/\bai[\s-]*9[0o]1\b/g, " ai901 "],
  [/\bai[\s-]*9[0o]{2}\b/g, " ai900 "],
  [/\baz[\s-]*9[0o]{2}\b/g, " az900 "],
  [/\bdp[\s-]*9[0o]{2}\b/g, " dp900 "],
  [/\bpl[\s-]*9[0o]{2}\b/g, " pl900 "],
  [/\bms[\s-]*9[0o]{2}\b/g, " ms900 "],
  [/\bsc[\s-]*9[0o]{2}\b/g, " sc900 "],
  [/\bab[\s-]*9[0o]{2}\b/g, " ab900 "],
  [/\bpower\s*bi\b/g, " powerbi "],
  [/\bpower\s*(apps|automate|platform)\b/g, " powerplatform "],
  [/\bmicrosoft\s*365\b|\bm365\b|\boffice\s*365\b|\bo365\b/g, " m365 "],
  [/\bshop\s*(and|&)\s*establishment\b|\bshop\s*act\b|\bshops?\s*establishment\b/g, " shopact "],
  [/\btrade\s*licen[cs]e\b|\bghmc\b/g, " tradelicense "],
  [/\bwhats\s*app\b/g, " whatsapp "],
  [/\bthank\s*you\b|\bthanku\b|\bthank\s*u\b|\bdhanyavaad\b|\bdhanyavad\b|\bshukriya\b|\bdhanyavadalu\b/g, " thanks "],
  [/\bok(ay)?\s*thanks?\b/g, " thanks "],
];

/** Hindi / Telugu words (romanised and script) mapped to English meaning words. */
const LOCAL_WORDS: Record<string, string> = {
  // Hindi (romanised)
  kya: "what",
  kaise: "how",
  kaisa: "how",
  kab: "when",
  kahan: "where",
  kaha: "where",
  kitna: "price",
  kitne: "price",
  chahiye: "need",
  chaiye: "need",
  chahie: "need",
  karna: "do",
  karwana: "do",
  banwana: "make",
  banana: "make",
  banao: "make",
  mujhe: "i",
  mera: "my",
  meri: "my",
  hamara: "our",
  kagaz: "documents",
  kagzat: "documents",
  dastavez: "documents",
  paisa: "price",
  paise: "price",
  kharcha: "price",
  fees: "fee",
  samay: "timeline",
  din: "days",
  haan: "yes",
  han: "yes",
  ha: "yes",
  nahi: "no",
  nahin: "no",
  naam: "name",
  dukaan: "shop",
  dukan: "shop",
  // Telugu (romanised)
  enti: "what",
  emiti: "what",
  ela: "how",
  eppudu: "when",
  ekkada: "where",
  kavali: "need",
  kaavali: "need",
  cheyali: "do",
  cheyyali: "do",
  cheyandi: "do",
  peru: "name",
  avunu: "yes",
  sare: "ok",
  ledu: "no",
  vaddu: "no",
  rojulu: "days",
  dabbulu: "price",
  patralu: "documents",
  // Hindi (Devanagari)
  "क्या": "what",
  "कैसे": "how",
  "कितना": "price",
  "कितने": "price",
  "कीमत": "price",
  "फीस": "fee",
  "चाहिए": "need",
  "दस्तावेज": "documents",
  "दस्तावेज़": "documents",
  "दिन": "days",
  "समय": "timeline",
  "हाँ": "yes",
  "हां": "yes",
  "नहीं": "no",
  "धन्यवाद": "thanks",
  "नमस्ते": "hello",
  "नाम": "name",
  "वेबसाइट": "website",
  "लोगो": "logo",
  "जीएसटी": "gst",
  "ट्रेडमार्क": "trademark",
  "कंपनी": "company",
  "रजिस्ट्रेशन": "registration",
  "पंजीकरण": "registration",
  // Telugu (script)
  "ఏమిటి": "what",
  "ఎలా": "how",
  "ఎంత": "price",
  "ధర": "price",
  "ఫీజు": "fee",
  "కావాలి": "need",
  "పత్రాలు": "documents",
  "రోజులు": "days",
  "అవును": "yes",
  "లేదు": "no",
  "ధన్యవాదాలు": "thanks",
  "నమస్తే": "hello",
  "నమస్కారం": "hello",
  "పేరు": "name",
  "వెబ్‌సైట్": "website",
  "వెబ్సైట్": "website",
  "లోగో": "logo",
  "జీఎస్టీ": "gst",
  "ట్రేడ్‌మార్క్": "trademark",
  "కంపెనీ": "company",
  "రిజిస్ట్రేషన్": "registration",
};

const HI_HINTS = new Set([
  "kya", "hai", "hain", "kaise", "kitna", "kitne", "chahiye", "chaiye", "mujhe", "karna", "karwana", "mera", "meri",
  "aap", "aapka", "hum", "nahi", "haan", "kab", "kahan", "batao", "bataiye", "bhai", "ji", "kar", "sakte", "hoga", "lagega",
]);
const TE_HINTS = new Set([
  "enti", "emiti", "ela", "kavali", "kaavali", "cheyali", "cheyyali", "undi", "unda", "meeru", "nenu", "naaku", "naku",
  "entha", "ekkada", "eppudu", "chala", "baga", "garu", "andi", "sare", "ledu", "avunu", "chepandi", "cheppandi", "namaskaram",
  "namaskaramu", "kosam", "emi", "unnayi",
]);

export function detectLang(raw: string): Lang | null {
  if (/[ఀ-౿]/.test(raw)) return "te";
  if (/[ऀ-ॿ]/.test(raw)) return "hi";
  const words = raw.toLowerCase().split(/[^a-z]+/).filter(Boolean);
  let hi = 0;
  let te = 0;
  for (const w of words) {
    if (HI_HINTS.has(w)) hi++;
    if (TE_HINTS.has(w)) te++;
  }
  if (te >= 1 && te >= hi) return "te";
  if (hi >= 2 || (hi >= 1 && words.length <= 4)) return "hi";
  return null;
}

/** Lower-case, rewrite phrases and local words, strip punctuation. */
export function normalize(raw: string): string {
  let s = ` ${raw.toLowerCase().normalize("NFC")} `;
  s = s.replace(/[’']/g, "").replace(/[“”"]/g, " ");
  s = s.replace(/₹\s*/g, " rupees ");
  for (const [re, to] of PHRASE_FIX) s = s.replace(re, to);
  // keep letters (any script), numbers and spaces
  s = s.replace(/[^\p{L}\p{M}\p{N}\s]/gu, " ");
  const words = s.split(/\s+/).filter(Boolean).map((w) => LOCAL_WORDS[w] ?? WORD_FIX[w] ?? w);
  // run phrase fixes once more, since local words can create new phrases
  let out = ` ${words.join(" ")} `;
  for (const [re, to] of PHRASE_FIX) out = out.replace(re, to);
  return out.replace(/\s+/g, " ").trim();
}

const STOP = new Set([
  "a", "an", "the", "is", "are", "am", "was", "were", "be", "to", "of", "for", "in", "on", "at", "by", "and", "or", "it", "this",
  "that", "i", "me", "my", "we", "our", "you", "your", "do", "does", "did", "can", "could", "would", "should", "will", "please",
  "want", "need", "know", "tell", "about", "with", "get", "have", "has", "had", "any", "some", "so", "just", "also", "hi",
  "hello", "sir", "madam", "mam", "maam", "ji", "bhai", "hai", "hain", "ka", "ki", "ke", "ko", "se", "aur", "andi", "garu",
  "what", "how", "which", "there", "from", "if", "then", "into", "us", "them", "they", "he", "she", "its",
]);

export function words(norm: string): string[] {
  return norm.split(" ").filter(Boolean);
}

/** Meaningful words only (no stop words), with a light plural/-ing trim. */
export function contentWords(norm: string): string[] {
  return words(norm)
    .filter((w) => !STOP.has(w) && w.length > 1)
    .map(stem);
}

export function stem(w: string): string {
  if (w.length > 5 && w.endsWith("ing")) return w.slice(0, -3);
  if (w.length > 4 && w.endsWith("ies")) return w.slice(0, -3) + "y";
  if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss")) return w.slice(0, -1);
  return w;
}

/** Edit distance with swaps (Damerau–Levenshtein, limited). */
export function editDistance(a: string, b: string, max = 3): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    let rowMin = Infinity;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      rowMin = Math.min(rowMin, d[i][j]);
    }
    if (rowMin > max) return max + 1;
  }
  return d[a.length][b.length];
}

/** True when `w` is the keyword, or a close misspelling of it. */
export function fuzzyEq(w: string, key: string): boolean {
  if (w === key) return true;
  if (key.length < 5 || w.length < 4) return false;
  if (/\d/.test(key)) return false; // exam codes etc. must be exact
  const allowed = key.length >= 10 ? 2 : 1;
  return editDistance(w, key, allowed) <= allowed;
}

/** Does the normalised text contain this keyword/phrase (with typo tolerance for single words)? */
export function hasTerm(norm: string, ws: string[], term: string): boolean {
  const t = term.toLowerCase().trim();
  if (!t) return false;
  if (t.includes(" ")) return ` ${norm} `.includes(` ${t} `);
  const st = stem(t);
  return ws.some((w) => w === t || stem(w) === st || fuzzyEq(w, t));
}

export const titleCase = (s: string) =>
  s
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

/** Pull a 10-digit Indian mobile number out of any text. */
export function findPhone(raw: string): string | null {
  const m = raw.replace(/[\s-]/g, "").match(/(?:\+?91|0)?([6-9]\d{9})(?!\d)/);
  return m ? m[1] : null;
}

export function findEmail(raw: string): string | null {
  const m = raw.match(/[^\s@]+@[^\s@]+\.[a-z]{2,}/i);
  return m ? m[0] : null;
}
