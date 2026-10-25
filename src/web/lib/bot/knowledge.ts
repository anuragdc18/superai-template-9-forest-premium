/**
 * Built-in knowledge for the offline chatbot. Everything here is plain data,
 * so it is easy to read and change. Owner-written answers (Admin → Chat Bot)
 * are always checked first.
 */
import { CATEGORIES, type Category, type Service } from "../site";

export type Topic =
  | "price"
  | "timeline"
  | "documents"
  | "process"
  | "who"
  | "what"
  | "benefits"
  | "compare"
  | "recommend"
  | "contact"
  | "address"
  | "hours"
  | "human"
  | "status"
  | "greeting"
  | "thanks"
  | "bye"
  | "yes"
  | "no"
  | "identity"
  | "capability"
  | "complaint"
  | "offer"
  | "trust"
  | "language";

/** Words that signal each topic (after text normalising). */
export const TOPIC_TERMS: Record<Topic, string[]> = {
  price: ["price", "cost", "fee", "charge", "charges", "rate", "rupees", "budget", "pricing", "quote", "quotation", "expensive", "cheap", "affordable", "package", "costly", "amount", "paid", "free"],
  timeline: ["timeline", "time", "days", "duration", "fast", "quick", "quickly", "urgent", "soon", "week", "weeks", "deadline", "long", "today", "tomorrow", "ready", "turnaround"],
  documents: ["documents", "document", "papers", "paper", "proof", "kyc", "submit", "upload", "required documents", "what needed", "requirement", "requirements", "aadhaar", "pan"],
  process: ["process", "procedure", "steps", "step", "apply", "how to", "how do", "how can", "start", "started", "work", "works", "working", "method"],
  who: ["mandatory", "compulsory", "eligible", "eligibility", "necessary", "do i need", "should i", "need it", "required for", "who need", "applicable", "must"],
  what: ["what is", "meaning", "mean", "explain", "detail", "details", "information", "about", "define", "overview"],
  benefits: ["benefit", "benefits", "advantage", "advantages", "why", "use of", "useful", "purpose", "help me"],
  compare: ["vs", "versus", "difference", "different", "compare", "comparison", "better", "between"],
  recommend: ["which", "best", "suitable", "suggest", "recommend", "confused", "right for me", "choose", "should i take", "should i start", "which one", "right one", "guide me"],
  contact: ["contact", "phone", "number", "mobile", "email", "mail", "reach", "whatsapp number", "call you"],
  address: ["address", "location", "office", "located", "branch", "where are you", "visit", "map", "directions", "city"],
  hours: ["timing", "timings", "hours", "open", "close", "closed", "sunday", "saturday", "holiday", "working hours", "available now"],
  human: ["human", "talk to", "speak to", "speak with", "talk with", "expert", "consultant", "callback", "call", "representative", "manager", "real person"],
  status: ["status", "tracking", "track my", "my application", "my order", "update on my", "application status", "when will i get"],
  greeting: ["hi", "hello", "hey", "namaste", "namaskar", "namaskaram", "good morning", "good afternoon", "good evening", "hola", "greetings", "yo"],
  thanks: ["thanks", "thank", "great", "awesome", "perfect", "nice", "super", "cool", "helpful", "good"],
  bye: ["bye", "goodbye", "see you", "later", "good night", "tata", "exit", "close"],
  yes: ["yes", "yeah", "yep", "yup", "sure", "ok", "okay", "please do", "go ahead", "of course", "definitely", "fine", "done", "interested", "s", "y"],
  no: ["no", "nope", "nah", "not now", "not interested", "dont", "don't", "later", "maybe later", "n"],
  identity: ["who are you", "are you bot", "are you a bot", "are you human", "are you real", "your name", "robot", "are you ai", "chatgpt"],
  capability: ["what can you do", "help", "services", "options", "menu", "what do you do", "what you offer", "all services", "list"],
  complaint: ["bad", "worst", "not happy", "unhappy", "complaint", "problem", "issue", "delay", "delayed", "fraud", "scam", "cheat", "angry", "disappointed", "refund"],
  offer: ["offer", "offers", "discount", "coupon", "deal", "deals", "sale", "festival", "diwali", "cashback"],
  trust: ["genuine", "trusted", "trust", "reviews", "review", "rating", "experience", "clients", "real company", "safe", "legit", "legal", "reliable", "registered company"],
  language: ["hindi", "telugu", "english", "language", "tamil", "kannada"],
};

export type ServiceInfo = {
  aliases: string[];
  /** typical time if the catalog has none */
  days?: string;
  /** deep answers: if any key word matches, this answer is used */
  faqs?: { keys: string[]; a: string }[];
};

/**
 * Extra names people use for each service, plus deeper answers for the
 * services customers ask about most. Keys must match service names in site.ts.
 */
export const SERVICE_INFO: Record<string, ServiceInfo> = {
  "GST Registration": {
    aliases: ["gst", "gst number", "gstin", "gst registration", "goods and services tax", "gst certificate", "gst no"],
    faqs: [
      {
        keys: ["limit", "threshold", "turnover", "mandatory", "compulsory", "40 lakh", "20 lakh", "do i need", "need gst", "is gst needed", "necessary"],
        a: "GST is **mandatory** if:\n• Your yearly turnover is above **₹40 lakh** for goods (₹20 lakh for services; lower in a few special-category states)\n• You sell online on Amazon, Flipkart, Meesho etc.\n• You sell goods to other states\n\nBelow the limit it's optional — but many businesses still take it so they can claim tax credit and work with bigger clients.",
      },
      {
        keys: ["composition", "scheme", "small business tax", "low tax"],
        a: "The **Composition Scheme** is a simple GST option for small businesses (turnover up to ₹1.5 crore for goods, ₹50 lakh for services). You pay a small fixed % and file fewer returns — but you can't collect GST from customers or sell to other states. Our expert can tell you if it suits you.",
      },
      {
        keys: ["home", "house", "residential", "no shop", "without shop", "without office", "rented", "rent"],
        a: "Yes, you can get GST at your **home address** or a rented place. You'll need an electricity bill / property tax receipt, and a rent agreement + NOC if the place isn't in your name. We prepare the NOC format for you.",
      },
      {
        keys: ["cancel", "cancellation", "surrender", "close"],
        a: "Yes, we can **cancel/surrender** your GST number if your business has closed or you no longer need it. All pending returns must be filed first — we handle both.",
      },
      {
        keys: ["penalty", "late", "fine", "missed", "not filed", "nil return", "nil"],
        a: "Once you have GST, returns must be filed every month or quarter — **even if there were no sales (NIL return)**. Late filing attracts a daily late fee and interest. Our GST filing service makes sure you never miss a date.",
      },
      {
        keys: ["states", "state", "branch", "another state", "multiple"],
        a: "GST is **state-wise** — you need a separate GST number in each state where you have an office or warehouse. We can register all of them for you.",
      },
    ],
  },
  "Company Registration (Pvt Ltd)": {
    aliases: ["pvtltd", "private company", "company registration", "company register", "register a company", "company", "incorporation", "incorporate", "startup registration", "register company", "register my company", "opc"],
    faqs: [
      {
        keys: ["minimum", "how many directors", "directors", "shareholders", "partners needed", "members", "single", "alone", "one person", "opc"],
        a: "A **Private Limited company** needs:\n• At least **2 directors** (one must live in India)\n• At least **2 shareholders** (the directors can be the shareholders)\n• **No minimum capital** — you can start with ₹10,000 or even less\n\nStarting alone? A **One Person Company (OPC)** lets a single founder register — our expert can guide you.",
      },
      {
        keys: ["capital", "investment", "money needed", "paid up", "share capital"],
        a: "There's **no minimum capital** required for a Private Limited company. Most small startups begin with ₹10,000–₹1,00,000 as share capital. This is your company's money, not a fee.",
      },
      {
        keys: ["name approval", "company name", "name available", "name check", "name availability"],
        a: "We first check that your company name is **available** and not similar to an existing company or trademark, then apply for name approval with the MCA. Tip: give us 2–3 name options. We also recommend filing a **trademark** for your name.",
      },
      {
        keys: ["compliance", "yearly", "annual", "audit", "after registration", "roc filing"],
        a: "After registration, a Pvt Ltd company must do yearly work: **accounts audit, ROC annual returns (AOC-4, MGT-7), income tax return and director KYC**. Our Company Yearly Compliance plan handles all of it with reminders.",
      },
      {
        keys: ["convert", "conversion", "proprietorship to", "partnership to", "llp to"],
        a: "Yes, you can **convert** a proprietorship, partnership or LLP into a Private Limited company. The process and documents depend on your current set-up — our expert will explain on a free call.",
      },
      {
        keys: ["nri", "foreigner", "foreign", "abroad", "outside india"],
        a: "Yes — NRIs and foreign nationals can be directors/shareholders in an Indian Pvt Ltd company. At least **one director must be an Indian resident**. Foreign documents need notarisation/apostille. Our expert will guide you.",
      },
    ],
  },
  "LLP Registration": {
    aliases: ["llp", "limited liability", "llp registration", "partnership firm", "partnership", "partners"],
    faqs: [
      {
        keys: ["minimum", "partners", "how many", "designated"],
        a: "An **LLP** needs at least **2 partners**, and at least 2 **designated partners** (one must be an Indian resident). There's no minimum capital.",
      },
      {
        keys: ["compliance", "yearly", "annual", "audit"],
        a: "An LLP files **2 returns a year** with the MCA (Form 8 and Form 11) plus income tax. Audit is needed only if turnover crosses ₹40 lakh or contribution crosses ₹25 lakh — so compliance is lighter than a Pvt Ltd.",
      },
    ],
  },
  "Proprietorship / Firm Registration": {
    aliases: ["proprietorship", "sole proprietor", "proprietor", "firm registration", "own business", "single owner", "firm"],
    faqs: [
      {
        keys: ["register", "certificate", "proof", "registration", "process", "bank account", "current account"],
        a: "There's no single 'proprietorship certificate' in India. Your business is recognised through registrations like **GST, MSME/Udyam and Shop & Establishment**, and a **current bank account** in the firm's name. We pick the right 2–3 for you so the bank account opens smoothly.",
      },
    ],
  },
  "MSME / Udyam": {
    aliases: ["msme", "udyam registration", "msme certificate", "small business registration", "ssi"],
    faqs: [
      {
        keys: ["benefit", "benefits", "advantage", "advantages", "why", "loan", "loans", "scheme", "schemes"],
        a: "**MSME / Udyam benefits:**\n• Easier and collateral-free business loans (CGTMSE)\n• Lower interest on many bank loans\n• Protection against late payments from buyers\n• Lower government fee for trademark\n• Eligibility for many government tenders and subsidies",
      },
      {
        keys: ["validity", "expire", "renew", "renewal", "lifetime"],
        a: "Udyam registration is valid for **lifetime** — no renewal needed. You only update the details if your business information changes.",
      },
      {
        keys: ["government fee", "govt fee", "free"],
        a: "The government doesn't charge any fee for Udyam registration. Our charge covers checking your details, choosing the right business codes (NIC) and filing it correctly the first time.",
      },
    ],
  },
  Trademark: {
    aliases: ["trademark", "brand registration", "logo registration", "protect brand", "protect my brand", "protect name", "brand name protection", "copyright", "registered symbol", "copy my brand", "copy my name", "copy my logo", "copying my brand", "brand copy"],
    faqs: [
      {
        keys: ["symbol", "r symbol", "registered symbol", "use tm", "tm symbol"],
        a: "You can use **™** right after we file your trademark application. The **®** symbol can be used only after the trademark is fully registered by the government.",
      },
      {
        keys: ["validity", "valid", "years", "renew", "renewal", "expire"],
        a: "A registered trademark is valid for **10 years**, and you can renew it every 10 years — forever.",
      },
      {
        keys: ["class", "classes", "category"],
        a: "Trademarks are filed in **classes** (45 in total) based on what you sell — e.g. Class 25 for clothing, Class 43 for restaurants. We pick the right class(es) so your brand is properly protected.",
      },
      {
        keys: ["objection", "opposed", "opposition", "rejected", "reply", "hearing"],
        a: "If the examiner raises an **objection** or someone opposes your trademark, a proper written reply is needed by the deadline. We handle trademark objection replies and hearings too.",
      },
      {
        keys: ["search", "available", "availability", "already registered", "already taken", "someone else"],
        a: "Before filing, we do a **free trademark search** to check if a similar name/logo already exists — this avoids rejection later.",
      },
      {
        keys: ["full registration", "certificate", "timeline", "final", "complete", "days"],
        a: "We **file in 2–3 days**, and you can use ™ immediately. The government then examines and publishes it — full registration usually takes **12–18 months** if there are no objections.",
      },
    ],
  },
  "FSSAI (Food License)": {
    aliases: ["fssai", "food registration", "food business", "restaurant license", "cloud kitchen", "food", "home kitchen", "bakery"],
    faqs: [
      {
        keys: ["type", "types", "basic", "state", "central", "which", "turnover"],
        a: "**FSSAI has 3 types**, based on yearly turnover:\n• **Basic registration** — up to ₹12 lakh (small shops, home kitchens)\n• **State license** — ₹12 lakh to ₹20 crore\n• **Central license** — above ₹20 crore, or importers / e-commerce food sellers\n\nTell us your turnover and we'll pick the right one.",
      },
      {
        keys: ["validity", "valid", "renew", "renewal", "expire", "years"],
        a: "An FSSAI license/registration is valid for **1 to 5 years** — you choose when applying. We remind you before it expires and handle the renewal.",
      },
      {
        keys: ["home", "house", "homemade", "home based"],
        a: "Yes! Home food businesses (tiffin, home bakers, cloud kitchens) need **FSSAI basic registration**. It's simple and done fully online.",
      },
    ],
  },
  "Import Export Code (IEC)": {
    aliases: ["iec", "iec code", "import", "export", "exporter", "importer", "dgft"],
    faqs: [
      {
        keys: ["validity", "valid", "renew", "expire", "update"],
        a: "IEC is valid for **lifetime**, but it must be **updated online every year** (April–June) — even if nothing changed. We can do that for you.",
      },
      {
        keys: ["gst", "without gst", "need gst"],
        a: "IEC is issued on your **PAN** — GST isn't required to get IEC. But to actually export goods with tax refunds, GST is usually needed.",
      },
    ],
  },
  "Trade License": { aliases: ["trade license", "tradelicense", "municipal license", "ghmc", "shop license"], days: "7–15 days" },
  "Shop & Establishment": { aliases: ["shopact", "shop establishment", "labour license", "shop registration"] },
  "ISO Certification": {
    aliases: ["iso", "iso 9001", "iso certificate", "quality certificate", "iso 27001", "iso 14001"],
    faqs: [
      {
        keys: ["type", "which", "9001", "14001", "27001", "45001", "22000"],
        a: "Common ISO certificates: **ISO 9001** (quality — most popular), **ISO 14001** (environment), **ISO 45001** (safety), **ISO 27001** (information security) and **ISO 22000** (food safety). We'll suggest the one your clients or tenders ask for.",
      },
    ],
  },
  "GST & Income Tax Filing": {
    aliases: ["gstfiling", "itr", "tax filing", "income tax", "tax return", "returns", "file return", "file gst", "accounting", "bookkeeping", "ca"],
    faqs: [
      {
        keys: ["due", "date", "last date", "deadline", "when"],
        a: "Typical due dates: **GSTR-1** by the 11th and **GSTR-3B** by the 20th of next month (quarterly filers have later dates). **ITR** for individuals is usually due **31 July**. We remind you before every date.",
      },
      {
        keys: ["nil", "no sales", "zero"],
        a: "Even with no sales, GST returns must be filed as **NIL returns**, or late fees keep adding up. We file them for you every month/quarter.",
      },
    ],
  },
  "TDS, PF & ESIC Filing": { aliases: ["tds", "pf", "esic", "esi", "provident fund", "payroll", "salary compliance"] },
  "Company Yearly Compliance": { aliases: ["roc", "annual compliance", "annual return", "aoc 4", "mgt 7", "dir 3 kyc", "director kyc", "yearly compliance"] },

  "Logo Design": {
    aliases: ["logo", "logo design", "logo making", "brand logo", "new logo", "logo banana", "design logo"],
    days: "3–5 days",
    faqs: [
      {
        keys: ["option", "options", "concept", "concepts", "how many", "samples"],
        a: "You get **2–3 unique logo concepts** to choose from, then changes on the one you like until you're happy.",
      },
      {
        keys: ["revision", "revisions", "change", "changes", "edit", "not like"],
        a: "Changes are included — we keep refining until you're happy with your logo. 😊",
      },
      {
        keys: ["file", "files", "format", "png", "svg", "pdf", "ai file", "source", "vector"],
        a: "You get all final files: **PNG** (transparent), **JPG**, **PDF** and **SVG/vector** — ready for print, website, social media and signboards.",
      },
      {
        keys: ["ownership", "rights", "copyright", "who owns"],
        a: "Once delivered, **the logo is 100% yours** — full rights. We also recommend registering it as a **trademark** so nobody can copy it.",
      },
    ],
  },
  "Business Card": { aliases: ["businesscard", "visiting card", "card design"], days: "2–3 days" },
  Letterhead: { aliases: ["letterhead", "letter head", "letter pad"], days: "2–3 days" },
  "Brand Name & Tagline": { aliases: ["brand name", "business name", "name suggestion", "tagline", "slogan", "naming"], days: "3–5 days" },
  "Company Profile": { aliases: ["company profile", "business profile", "profile document"], days: "5–7 days" },
  "Full Brand Kit": { aliases: ["brand kit", "brand identity", "branding kit", "brand guidelines", "style guide"], days: "7–10 days" },
  Rebranding: { aliases: ["rebrand", "rebranding", "new look", "refresh brand"], days: "2–3 weeks" },
  "ID Cards & Stamps": { aliases: ["id card", "stamp", "rubber stamp", "seal"], days: "2–3 days" },
  "T-Shirt & Merchandise": { aliases: ["tshirt", "t shirt", "merchandise", "merch", "cap", "mug"], days: "5–7 days" },
  "Email Signature": { aliases: ["email signature", "signature"], days: "1–2 days" },

  Brochure: { aliases: ["brochure", "pamphlet", "leaflet"], days: "3–5 days" },
  "Flyer & Poster": { aliases: ["flyer", "flier", "poster", "handbill"], days: "2–3 days" },
  Packaging: { aliases: ["packaging", "box design", "label", "label design", "pouch"], days: "5–7 days" },
  "Flex & Hoarding": { aliases: ["flex", "hoarding", "banner", "billboard", "signboard", "standee"], days: "2–3 days" },
  "Menu Card": { aliases: ["menu", "menu card", "restaurant menu"], days: "2–4 days" },
  "Certificates & ID Cards": { aliases: ["certificate design", "award", "certificates"], days: "2–3 days" },
  Catalogue: { aliases: ["catalogue", "catalog", "product catalogue"], days: "5–10 days" },
  "Presentation (PPT)": { aliases: ["presentation", "pitch deck", "slides", "deck"], days: "3–5 days" },
  "Social Media Post Design": { aliases: ["post design", "creative", "creatives", "social post"], days: "1–2 days" },
  "YouTube Thumbnail": { aliases: ["thumbnail", "youtube thumbnail"], days: "1 day" },
  "Newspaper Ad": { aliases: ["newspaper", "newspaper ad", "print ad", "classified"], days: "1–2 days" },

  "Instagram & Facebook Handling": {
    aliases: ["instagram", "facebook", "social media handling", "socialmedia management", "page handling", "manage instagram", "social media manager", "smm"],
    days: "Monthly plan",
    faqs: [
      {
        keys: ["how many posts", "posts per month", "number of posts", "posts"],
        a: "Plans usually include **12–30 posts a month** plus stories/reels, depending on your package. You approve the full month's plan before anything goes live.",
      },
      {
        keys: ["followers", "growth", "results", "result", "guarantee", "leads"],
        a: "Steady posting builds trust and reach within **2–3 months**; paid ads bring enquiries faster. We don't sell fake followers — we focus on real customers and send you a simple monthly report.",
      },
    ],
  },
  "Monthly Posts": {
    aliases: ["monthly posts", "post", "posting", "content calendar", "posts per month"],
    days: "Monthly plan",
    faqs: [
      {
        keys: ["how many posts", "posts per month", "number of posts"],
        a: "Plans usually include **12–30 posts a month** plus stories/reels, depending on your package. You approve the full month's plan before anything goes live.",
      },
    ],
  },
  "Reels Planning": { aliases: ["reel", "reels", "short video", "shorts"], days: "Monthly plan" },
  "Paid Ads (Boosting)": {
    aliases: ["ads", "ad", "advertising", "boost", "boosting", "meta ads", "facebook ads", "instagram ads", "google ads", "marketing", "promotion", "leads generation", "lead generation"],
    faqs: [
      {
        keys: ["budget", "minimum", "ad spend", "how much", "spend"],
        a: "Ad budget is paid **directly to Meta/Google** and is separate from our management fee. Many local businesses start with **₹300–₹500 a day** and scale up once enquiries come in. We'll suggest a budget for your city and goal.",
      },
    ],
  },
  "Promo Videos": { aliases: ["video", "promo video", "video editing", "ad video", "status video"], days: "3–5 days" },
  "Captions & Hashtags": { aliases: ["caption", "captions", "hashtag", "hashtags"] },
  "Profile Setup": { aliases: ["profile setup", "bio", "highlights", "page setup", "create page"], days: "1–2 days" },

  "Business Website": {
    aliases: ["website", "business website", "web design", "web development", "make website", "new website", "company website", "static website", "portfolio website"],
    days: "2–3 weeks",
    faqs: [
      {
        keys: ["edit", "update myself", "change myself", "admin panel", "cms", "myself", "own changes"],
        a: "Yes — we can give you an **easy admin panel** (or WordPress) so you can change text, photos and prices yourself. We also show you how on a short call.",
      },
      {
        keys: ["ownership", "in my name", "who owns", "domainhosting"],
        a: "Your domain and hosting are registered **in your name** — the website is fully yours. We just manage it for you if you want.",
      },
      {
        keys: ["pages", "how many pages"],
        a: "A typical business website has **5–8 pages**: Home, About, Services, Gallery, Contact, plus a WhatsApp button and enquiry form. We can add more as needed.",
      },
      {
        keys: ["google", "rank", "ranking", "seo", "search"],
        a: "Every website includes **basic Google setup (SEO)** — Search Console, a Google Business link and proper page titles. For ranking higher on Google, see our **Google Ranking (SEO)** service.",
      },
      {
        keys: ["renewal", "yearly", "every year", "hosting cost", "maintenance"],
        a: "Domain and hosting renew **once a year**. We remind you in advance, and our maintenance plan covers updates, backups and small changes.",
      },
    ],
  },
  "Online Store": {
    aliases: ["onlinestore", "ecommerce website", "shopping website", "sell online", "online selling", "shopify", "woocommerce", "store website", "sell my products online", "sell products online", "sell products", "sell my products", "online orders", "take orders online"],
    days: "3–5 weeks",
    faqs: [
      {
        keys: ["payment", "payments", "upi", "card", "cod", "cash on delivery", "gateway"],
        a: "Your store can accept **UPI, cards, net banking and Cash on Delivery**. We set up the payment gateway (like Razorpay/Cashfree) in your business name so money goes straight to your bank.",
      },
      {
        keys: ["delivery", "shipping", "courier"],
        a: "We can connect shipping partners like **Shiprocket** so orders, pickup and tracking work automatically.",
      },
    ],
  },
  "Landing Page": { aliases: ["landingpage", "single page", "one page website", "campaign page"], days: "5–7 days" },
  "WordPress Website": { aliases: ["wordpress", "wp website"], days: "2–3 weeks" },
  "Website Redesign": { aliases: ["redesign", "old website", "website update", "revamp", "modernise", "modernize"], days: "2–3 weeks" },
  "Domain & Hosting": {
    aliases: ["domainhosting", "dot com", "ssl", "business email", "server", "website address"],
    days: "1–2 days",
  },
  "Payment Gateway": { aliases: ["paymentgateway", "accept payments", "upi on website"], days: "3–7 days" },
  "Google Ranking (SEO)": {
    aliases: ["seo", "google ranking", "rank on google", "search engine", "google search", "top of google", "google my business", "gmb", "google business profile"],
    days: "Results in 3–6 months",
    faqs: [
      {
        keys: ["how long", "results", "when", "guarantee", "first page", "rank 1"],
        a: "SEO is steady work — most local businesses see real movement in **3–6 months**. Nobody can honestly guarantee #1 on Google; we focus on the right keywords, your Google Business Profile and monthly progress reports.",
      },
    ],
  },
  "Website Maintenance": { aliases: ["maintenance", "website support", "website changes", "backup", "amc"], days: "Monthly" },
  "Speed Improvement": { aliases: ["slow website", "speed", "fast website", "page speed", "loading"], days: "3–7 days" },

  "WhatsApp Auto-Reply": {
    aliases: ["whatsapp", "auto reply", "autoreply", "whatsapp bot", "whatsapp business", "whatsapp automation", "whatsapp api", "bulk whatsapp"],
    days: "Ready in 1 week",
    faqs: [
      {
        keys: ["number", "same number", "existing number", "my number"],
        a: "We can set it up on your **WhatsApp Business** number. For advanced automation (bots, broadcasts), the WhatsApp Business API is used — we'll explain the options and any WhatsApp charges clearly.",
      },
    ],
  },
  "Website Chatbot": { aliases: ["chatbot", "chat bot", "website chatbot", "chatbot for website", "chatbot for my website", "website chat", "live chat"], days: "1–2 weeks" },
  "Lead Follow-up Automation": { aliases: ["follow up", "followup", "lead follow", "automation", "drip", "reminder messages"], days: "1–2 weeks" },
  "Appointment Booking Bot": { aliases: ["appointment", "booking", "booking bot", "slot booking", "clinic booking"], days: "1–2 weeks" },
  "Google Review Replies": { aliases: ["google review", "reviews reply", "review management"], days: "Monthly" },
  "Google Sheets & CRM Automation": { aliases: ["crm", "google sheets", "sheets", "excel automation", "zoho", "hubspot"], days: "1–2 weeks" },
  "Custom ChatGPT for Business": { aliases: ["chatgpt", "custom gpt", "gpt", "ai assistant", "ai bot", "llm"], days: "2–3 weeks" },
  "AI Training for Staff": { aliases: ["ai training", "ai course", "train staff", "ai workshop", "learn ai", "ai class"], days: "1–2 days workshop" },

  "AB-900: Copilot & Agent Administration Fundamentals": {
    aliases: ["ab900", "copilot", "copilot admin", "agent administration", "microsoft copilot"],
    days: "2–3 weeks training",
  },
  "AI-901: Azure AI Fundamentals": {
    aliases: ["ai901", "ai900", "azure ai", "ai fundamentals", "ai certification"],
    days: "2–3 weeks training",
    faqs: [
      {
        keys: ["ai900", "retired", "old", "replace", "replaced", "same"],
        a: "**AI-900 has been replaced by AI-901** (Azure AI Fundamentals). If you were planning AI-900, AI-901 is the exam to take now — our training covers the new syllabus.",
      },
    ],
  },
  "AZ-900: Azure Fundamentals": { aliases: ["az900", "azure", "azure fundamentals", "cloud certification", "cloud", "cloud computing"], days: "2–3 weeks training" },
  "DP-900: Azure Data Fundamentals": { aliases: ["dp900", "azure data", "data fundamentals", "database certification", "data analytics"], days: "2–3 weeks training" },
  "PL-900: Power Platform Fundamentals": { aliases: ["pl900", "powerplatform", "powerbi", "power apps", "power automate", "low code", "no code"], days: "2–3 weeks training" },
  "MS-900: Microsoft 365 Fundamentals": { aliases: ["ms900", "m365", "office", "teams", "sharepoint", "outlook"], days: "2–3 weeks training" },
  "SC-900: Security, Compliance & Identity Fundamentals": { aliases: ["sc900", "security", "cyber security", "cybersecurity", "identity", "compliance fundamentals"], days: "2–3 weeks training" },
};

/** Generic words that point to a whole category rather than one service. */
export const CATEGORY_TERMS: Record<string, string[]> = {
  registration: ["registration", "register", "license", "licence", "certificate", "legal", "compliance", "government", "govt", "filing", "start business", "new business", "start a business", "startup"],
  branding: ["branding", "brand", "identity", "stationery"],
  design: ["design", "designing", "graphic", "graphics", "print", "printing", "designer"],
  "social-media": ["socialmedia", "social", "digital marketing", "online marketing", "marketing"],
  website: ["website", "websites", "web", "online presence", "web developer", "developer"],
  "ai-tools": ["ai", "ai tools", "artificial intelligence", "automation", "automate", "bots"],
  "microsoft-certifications": ["microsoft", "certification", "certifications", "exam", "exams", "course", "courses", "training", "certified", "fundamentals", "learn"],
};

/** Answers about the company itself, used when no owner-written answer matches. */
export const GENERAL_FAQS: { keys: string[]; a: string; topic?: Topic }[] = [
  {
    keys: ["refund", "money back", "cancel order", "cancellation"],
    a: "If we can't deliver what we promised, we'll make it right — refunds are handled fairly as per the stage of work (government fees already paid can't be refunded by us). Our team will explain everything clearly before you pay.",
  },
  {
    keys: ["genuine", "trust", "trusted", "reviews", "rating", "experience", "safe", "legit", "fraud", "scam", "real company", "reliable"],
    a: "We're rated **4.8★ on Google** and have helped **1,000+ businesses** across India. 🙏 You get a clear invoice, regular WhatsApp updates and official government acknowledgements for every filing — so you always know what's happening.",
    topic: "trust",
  },
  {
    keys: ["india", "all over india", "other city", "other state", "pan india", "my city", "outside hyderabad", "bangalore", "chennai", "mumbai", "delhi", "pune"],
    a: "We work with clients **across India** — everything is done online, so your city doesn't matter. 🇮🇳",
  },
  {
    keys: ["invoice", "bill", "gst invoice", "receipt"],
    a: "Yes, you get a proper **GST invoice** for every payment.",
  },
  {
    keys: ["data", "privacy", "my documents safe", "secure", "confidential", "share documents"],
    a: "Your documents are used **only** for your application and are kept confidential. We never share your details with anyone else.",
  },
  {
    keys: ["emi", "installment", "instalment", "part payment", "advance", "pay later"],
    a: "For bigger projects (like websites and branding), you can pay in **parts — an advance to start, and the rest on delivery**. Our expert will share the payment plan on the call.",
  },
  {
    keys: ["job", "jobs", "career", "careers", "hiring", "vacancy", "internship", "work with you"],
    a: "Thanks for your interest in working with us! 😊 Please send your CV to our email and our team will get back to you if there's a suitable opening.",
  },
  {
    keys: ["partner", "partnership", "franchise", "reseller", "affiliate", "collaborate", "collaboration"],
    a: "We'd love to explore a partnership! 🤝 Please share your details and our team will call you to discuss.",
  },
];

export type Comparison = { a: string[]; b: string[]; text: string; recommend?: string[] };

/** Ready answers for "X vs Y" questions. a/b are alias words. */
export const COMPARISONS: Comparison[] = [
  {
    a: ["pvtltd", "private company", "company"],
    b: ["llp"],
    text: "**Pvt Ltd vs LLP — in simple words:**\n\n• **Pvt Ltd** — best if you plan to **raise investment** or grow big. More trusted by banks and investors. More yearly compliance (audit is compulsory).\n• **LLP** — best for **professionals and small partnerships** who don't need investors. Fewer yearly filings, audit only above a limit.\n\n👉 Planning to raise funds → Pvt Ltd. Want low compliance → LLP.",
    recommend: ["Company Registration (Pvt Ltd)", "LLP Registration"],
  },
  {
    a: ["pvtltd", "private company", "company", "llp"],
    b: ["proprietorship", "proprietor", "sole proprietor", "firm"],
    text: "**Company/LLP vs Proprietorship:**\n\n• **Proprietorship** — quickest and cheapest; you and the business are the same, so your personal assets carry the risk. Good for small shops and solo freelancers.\n• **Pvt Ltd / LLP** — a separate legal entity with **limited liability**, more trust from clients and banks, and easier to add partners or investors.\n\n👉 Just starting small alone → Proprietorship. Want to protect personal assets and grow → Pvt Ltd or LLP.",
    recommend: ["Proprietorship / Firm Registration", "Company Registration (Pvt Ltd)", "LLP Registration"],
  },
  {
    a: ["opc"],
    b: ["pvtltd", "private company"],
    text: "**OPC vs Pvt Ltd:**\n\n• **OPC (One Person Company)** — for a **single founder** who wants limited liability. One director + one nominee.\n• **Pvt Ltd** — needs at least 2 directors, but is better for **adding co-founders and investors** later.\n\n👉 Solo founder now → OPC (can convert later). Have a co-founder → Pvt Ltd.",
    recommend: ["Company Registration (Pvt Ltd)"],
  },
  {
    a: ["gst"],
    b: ["msme"],
    text: "**GST vs MSME — they are different things:**\n\n• **GST** — a **tax registration**. Needed to bill GST, sell online or sell across states (or above the turnover limit).\n• **MSME / Udyam** — a **free government recognition** that gives loan, subsidy and payment-protection benefits.\n\n👉 Most businesses benefit from having **both**.",
    recommend: ["GST Registration", "MSME / Udyam"],
  },
  {
    a: ["trademark"],
    b: ["company", "pvtltd", "company name", "gst"],
    text: "**Company registration does NOT protect your brand name.** 🙅\n\nRegistering a company/GST only gives you a legal business. Someone else can still use a similar brand name — only a **Trademark** gives you exclusive rights to your name and logo.\n\n👉 Register the business **and** file a trademark.",
    recommend: ["Trademark", "Company Registration (Pvt Ltd)"],
  },
  {
    a: ["az900", "azure fundamentals"],
    b: ["ai901", "ai900", "azure ai"],
    text: "**AZ-900 vs AI-901:**\n\n• **AZ-900 (Azure Fundamentals)** — the basics of cloud and Azure. Best first step for **anyone new to cloud**.\n• **AI-901 (Azure AI Fundamentals)** — the basics of **AI**, and building simple AI apps and agents on Azure.\n\n👉 Want a cloud career → start with AZ-900. Excited about AI → go for AI-901. Many students do both.",
    recommend: ["AZ-900: Azure Fundamentals", "AI-901: Azure AI Fundamentals"],
  },
  {
    a: ["business website", "website"],
    b: ["onlinestore", "ecommerce website", "sell online"],
    text: "**Business Website vs Online Store:**\n\n• **Business Website** — shows your business, services and contact details; customers call/WhatsApp you. Ready in 2–3 weeks.\n• **Online Store** — customers **add to cart and pay online** (UPI/cards/COD), with order tracking. Ready in 3–5 weeks.\n\n👉 Selling products directly → Online Store. Getting enquiries → Business Website.",
    recommend: ["Business Website", "Online Store"],
  },
  {
    a: ["wordpress"],
    b: ["custom", "coded", "react"],
    text: "**WordPress vs Custom website:**\n\n• **WordPress** — easy for you to edit yourself, lots of plugins, quick to build.\n• **Custom** — fastest loading and fully tailored, best for special features.\n\n👉 Most small businesses do great with WordPress. Our expert will suggest the right one.",
    recommend: ["WordPress Website", "Business Website"],
  },
];

export type FlowOption = { label: string; next?: string; result?: { text: string; services: string[] } };
export type FlowNode = { text: string; options: FlowOption[] };
export type Flow = { id: string; start: string; nodes: Record<string, FlowNode> };

/** Guided "help me choose" conversations. */
export const FLOWS: Record<string, Flow> = {
  structure: {
    id: "structure",
    start: "who",
    nodes: {
      who: {
        text: "Happy to help you choose! 😊 Quick question — are you starting **alone** or **with partners**?",
        options: [
          { label: "Alone", next: "aloneGrow" },
          { label: "With partners", next: "partnersFunds" },
        ],
      },
      aloneGrow: {
        text: "Do you plan to **raise investment** or grow into a big company?",
        options: [
          {
            label: "Yes, I want to grow big",
            result: {
              text: "👉 A **Private Limited company** (or **OPC** if you'll stay the only owner for now) is the best fit. It gives limited liability and investors trust it.",
              services: ["Company Registration (Pvt Ltd)"],
            },
          },
          {
            label: "No, keep it simple",
            result: {
              text: "👉 A **Proprietorship** is the simplest and cheapest way to start. We'll set it up with **GST / MSME** registration so you can open a current account and bill customers.",
              services: ["Proprietorship / Firm Registration", "MSME / Udyam", "GST Registration"],
            },
          },
        ],
      },
      partnersFunds: {
        text: "Will you raise money from **investors** in the future?",
        options: [
          {
            label: "Yes, maybe investors",
            result: {
              text: "👉 Go with a **Private Limited company** — it's what investors and banks prefer, and it's easy to add shareholders.",
              services: ["Company Registration (Pvt Ltd)"],
            },
          },
          {
            label: "No, just us partners",
            result: {
              text: "👉 An **LLP** suits you best — limited liability for all partners and much lighter yearly compliance than a company.",
              services: ["LLP Registration"],
            },
          },
        ],
      },
    },
  },
  gst: {
    id: "gst",
    start: "online",
    nodes: {
      online: {
        text: "Let's check if you need GST. 🧾 Do you **sell online** (Amazon, Flipkart, Meesho) or **to other states**?",
        options: [
          {
            label: "Yes",
            result: {
              text: "✅ Then **GST is mandatory** for you, whatever your turnover. We can get your GST number in 3–7 days.",
              services: ["GST Registration"],
            },
          },
          { label: "No, only locally", next: "turnover" },
        ],
      },
      turnover: {
        text: "Is your yearly turnover above **₹40 lakh** (goods) or **₹20 lakh** (services)?",
        options: [
          {
            label: "Yes, above",
            result: { text: "✅ Then **GST is mandatory** for you. Let's get it done in 3–7 days.", services: ["GST Registration"] },
          },
          {
            label: "No, below",
            result: {
              text: "👍 GST is **optional** for you right now. Many businesses still take it to claim tax credit and work with bigger B2B clients. Meanwhile, the free **MSME / Udyam** registration gives you useful benefits.",
              services: ["MSME / Udyam", "GST Registration"],
            },
          },
          {
            label: "Not sure",
            result: {
              text: "No worries! Our expert can check your situation in a 5-minute free call and tell you exactly what you need. 🙂",
              services: ["GST Registration"],
            },
          },
        ],
      },
    },
  },
  website: {
    id: "website",
    start: "goal",
    nodes: {
      goal: {
        text: "Nice! 💻 What's the main goal for your website?",
        options: [
          { label: "Show my business & get enquiries", result: { text: "👉 A **Business Website** is perfect — mobile-friendly, with WhatsApp button and enquiry form. Ready in 2–3 weeks.", services: ["Business Website"] } },
          { label: "Sell products online", result: { text: "👉 You need an **Online Store** — cart, UPI/card payments, COD and order tracking.", services: ["Online Store", "Payment Gateway"] } },
          { label: "One page for ads/offer", result: { text: "👉 A **Landing Page** is ideal for ads — one clear offer, fast loading, built to get leads.", services: ["Landing Page"] } },
          { label: "Fix my old website", result: { text: "👉 Our **Website Redesign** makes your old site modern, fast and mobile-friendly.", services: ["Website Redesign", "Speed Improvement"] } },
        ],
      },
    },
  },
  exam: {
    id: "exam",
    start: "bg",
    nodes: {
      bg: {
        text: "Great choice to get certified! 🎓 Which describes you best?",
        options: [
          { label: "New to cloud / IT", result: { text: "👉 Start with **AZ-900: Azure Fundamentals** — the most popular first Microsoft exam. No coding needed.", services: ["AZ-900: Azure Fundamentals"] } },
          { label: "Interested in AI", result: { text: "👉 **AI-901: Azure AI Fundamentals** is for you — AI basics plus building simple AI apps and agents.", services: ["AI-901: Azure AI Fundamentals"] } },
          { label: "Data / analytics", result: { text: "👉 **DP-900: Azure Data Fundamentals** — databases and data analysis basics. Pairs well with PL-900 for Power BI.", services: ["DP-900: Azure Data Fundamentals", "PL-900: Power Platform Fundamentals"] } },
          { label: "Business user, no coding", result: { text: "👉 **PL-900: Power Platform Fundamentals** — build apps, automations and Power BI reports without coding.", services: ["PL-900: Power Platform Fundamentals"] } },
          { label: "Microsoft 365 / Copilot admin", result: { text: "👉 Start with **MS-900: Microsoft 365 Fundamentals**, then **AB-900** for Copilot & AI agents.", services: ["MS-900: Microsoft 365 Fundamentals", "AB-900: Copilot & Agent Administration Fundamentals"] } },
          { label: "Cyber security", result: { text: "👉 **SC-900: Security, Compliance & Identity Fundamentals** is your best first step into security.", services: ["SC-900: Security, Compliance & Identity Fundamentals"] } },
        ],
      },
    },
  },
};

/** Extra answers that apply to every Microsoft exam. */
export const MS_EXAM_FAQS: { keys: string[]; a: string }[] = [
  {
    keys: ["passing", "pass mark", "passing score", "score", "marks"],
    a: "Microsoft exams are scored out of **1000** — you need **700** to pass. Our practice tests are made to feel like the real exam.",
  },
  {
    keys: ["online", "home", "center", "centre", "where", "how to give", "how to take", "pearson"],
    a: "You can take the exam **online from home** (with webcam) or at a **Pearson VUE test centre**. We help you book the slot.",
  },
  {
    keys: ["validity", "expire", "valid", "renew", "lifetime"],
    a: "**Fundamentals certifications don't expire** — once you pass, it's yours for life. 🎉",
  },
  {
    keys: ["exam fee", "voucher", "exam cost", "exam price", "discount", "student"],
    a: "The **exam fee is set by Microsoft** and is separate from our training fee. Students often get discounts — our expert will share the current fee and any free/discounted voucher options.",
  },
  {
    keys: ["duration", "how long", "classes", "class", "hours", "batch", "schedule", "weekend"],
    a: "Training usually runs **2–3 weeks** with live online classes (weekday or weekend batches), plus practice tests and WhatsApp doubt support.",
  },
  {
    keys: ["job", "jobs", "salary", "placement", "career"],
    a: "A Microsoft certificate adds strong value to your CV and LinkedIn, especially for **cloud, AI and IT support roles**. It's a great first step — pair it with a small project for best results.",
  },
];

export function serviceInfo(name: string): ServiceInfo {
  return SERVICE_INFO[name] ?? { aliases: [] };
}

export function findCategoryOf(name: string): Category | undefined {
  return CATEGORIES.find((c) => c.services.some((s) => s.name === name));
}

export function getService(name: string): { service: Service; cat: Category } | null {
  for (const cat of CATEGORIES) {
    const service = cat.services.find((s) => s.name === name);
    if (service) return { service, cat };
  }
  return null;
}

export const ALL_SERVICES = CATEGORIES.flatMap((cat) => cat.services.map((service) => ({ service, cat })));
