import { z } from "zod";

/** Pure schema + defaults for site settings. No server imports — safe to use in the web bundle. */

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a hex colour like #FF7A1A");
const txt = (max: number) => z.string().trim().max(max);

export const botButtonSchema = z.object({
  label: txt(60).min(1, "Button text cannot be empty"),
  message: txt(300),
});

export const botFaqSchema = z.object({
  q: txt(200),
  keywords: txt(400),
  a: txt(1500).min(1, "Answer cannot be empty"),
});
export const botPriceSchema = z.object({ service: txt(120), price: txt(80) });

export const botSchema = z.object({
  enabled: z.boolean(),
  name: txt(60),
  status: txt(60),
  hint: txt(120),
  welcome: txt(600),
  returning: txt(300),
  collectDetails: z.boolean(),
  askName: txt(300),
  askPhone: txt(300),
  invalidPhone: txt(300),
  collectEmail: z.boolean(),
  askEmail: txt(300),
  invalidEmail: txt(300),
  askNeed: txt(300),
  savedMessage: txt(300),
  buttons: z.array(botButtonSchema).max(10),
  placeholder: txt(80),
  callLabel: txt(30),
  whatsappLabel: txt(30),
  whatsappMessage: txt(300),
  errorMessage: txt(300),
  /** Reply when the bot can't understand a question. */
  fallback: txt(500),
  /** Optional line added to price answers, e.g. a running offer. */
  offer: txt(300),
  /** Owner-written answers. Checked before the built-in knowledge. */
  faqs: z.array(botFaqSchema).max(150),
  /** Optional "starting from" prices per service. Empty = bot offers a quote on a call. */
  prices: z.array(botPriceSchema).max(200),
});
export type BotSettings = z.infer<typeof botSchema>;
export type BotButton = z.infer<typeof botButtonSchema>;
export type BotFaq = z.infer<typeof botFaqSchema>;
export type BotPrice = z.infer<typeof botPriceSchema>;

export const siteSchema = z.object({
  siteName: txt(40).min(1, "Business name is required"),
  tagline: txt(160),
  logo: z
    .string()
    .max(700_000, "Logo is too large (max ~500 KB)")
    .refine((v) => v === "" || v.startsWith("data:image/") || /^\/[\w\-./]+\.(png|jpe?g|webp|svg|gif)$/i.test(v), "Logo must be an image"),
  logoHeight: z.number().int().min(20).max(80),
  colors: z.object({ navy: hex, royal: hex, brand: hex }),
  // primary contact (used across the website)
  phone: txt(30).min(1, "Main phone number is required"),
  whatsapp: z.string().trim().regex(/^\d{10,13}$/, "WhatsApp number: digits only with country code, e.g. 919876543210"),
  email: z.string().trim().email("Enter a valid main email ID"),
  hours: txt(60),
  city: txt(80),
  // extra contact details
  phones: z.array(z.object({ label: txt(40), number: txt(30).min(1, "Phone number cannot be empty") })).max(10),
  emails: z.array(z.object({ label: txt(40), email: z.string().trim().email("Enter a valid email ID") })).max(10),
  addresses: z
    .array(z.object({ label: txt(40), line: txt(300).min(1, "Address cannot be empty"), mapUrl: txt(500) }))
    .max(10),
  socials: z.object({ facebook: txt(200), instagram: txt(200), linkedin: txt(200), youtube: txt(200) }),
  bot: botSchema,
});
export type SiteSettings = z.infer<typeof siteSchema>;

export const DEFAULT_BOT: BotSettings = {
  enabled: true,
  name: "{business} Assistant",
  status: "Online · replies instantly",
  hint: "Hi! Have a question? Ask me 👋",
  welcome: "Namaste! 🙏 Welcome to {business}. I can help you with registration, logo, website, social media and Microsoft certifications.",
  returning: "Welcome back, {name}! 😊 How can I help you today?",
  collectDetails: true,
  askName: "Before we start, may I know your name?",
  askPhone: "Nice to meet you, {name}! Please share your 10-digit mobile number so our expert can call you if needed.",
  invalidPhone: "Sorry {name}, that doesn't look like a valid 10-digit mobile number. Please try again.",
  collectEmail: false,
  askEmail: "Thanks! What is your email ID? (Type “skip” if you don't want to share)",
  invalidEmail: "That email doesn't look right. Please check it, or type “skip”.",
  askNeed: "Thank you, {name}! What are you looking for today? Pick an option or type your question.",
  savedMessage: "Got it, {name}. Your details are saved — our expert will call you within 30 minutes during working hours.",
  buttons: [
    { label: "Company Registration", message: "I want to register my company. Which type is best for me?" },
    { label: "GST Registration", message: "Do I need GST registration?" },
    { label: "Trademark", message: "I want to register a trademark for my brand." },
    { label: "Logo & Branding", message: "I need a logo and branding for my business." },
    { label: "Website", message: "I need a website for my business." },
    { label: "Microsoft Certification", message: "I want to get Microsoft certified. Which exam should I start with?" },
  ],
  placeholder: "Type your message...",
  callLabel: "Call us",
  whatsappLabel: "WhatsApp",
  whatsappMessage: "Hi, I need help with your services",
  errorMessage: "Sorry, something went wrong. Please call {phone} or WhatsApp us.",
  fallback:
    "Sorry {name}, I didn't fully get that. 🙏 I can help with registration, GST, trademark, logo, website, social media, AI tools and Microsoft certifications — or our expert can call you and answer anything.",
  offer: "",
  faqs: [
    {
      q: "Do I need to visit your office?",
      keywords: "visit office, come to office, offline, in person, physically, online process",
      a: "No need to visit! 🙌 Everything is done 100% online. You share documents on WhatsApp or email, and we keep you updated at every step until you get your certificate.",
    },
    {
      q: "How do I pay?",
      keywords: "payment, pay, upi, gpay, phonepe, card, net banking, cash, bank transfer, emi",
      a: "You can pay by UPI (GPay, PhonePe, Paytm), debit/credit card or bank transfer. We share a clear invoice before you pay — no hidden charges.",
    },
  ],
  prices: [],
};

export const DEFAULT_SITE: SiteSettings = {
  siteName: "TriMinds",
  tagline: "Registration, branding, websites and marketing for Indian businesses.",
  logo: "",
  logoHeight: 40,
  colors: { navy: "#183528", royal: "#1F4A35", brand: "#C25B32" },
  phone: "+91 98765 43210",
  whatsapp: "919876543210",
  email: "hello@triminds.in",
  hours: "Mon–Sat, 10 AM – 7 PM",
  city: "Hyderabad, Telangana",
  phones: [],
  emails: [],
  addresses: [],
  socials: { facebook: "", instagram: "", linkedin: "", youtube: "" },
  bot: DEFAULT_BOT,
};

/** Merge saved (possibly older-shaped) JSON over defaults. */
export function mergeSite(parsed: Partial<SiteSettings> | null | undefined): SiteSettings {
  if (!parsed || typeof parsed !== "object") return DEFAULT_SITE;
  return {
    ...DEFAULT_SITE,
    ...parsed,
    colors: { ...DEFAULT_SITE.colors, ...parsed.colors },
    socials: { ...DEFAULT_SITE.socials, ...parsed.socials },
    bot: { ...DEFAULT_BOT, ...parsed.bot, faqs: parsed.bot?.faqs ?? DEFAULT_BOT.faqs, prices: parsed.bot?.prices ?? [] },
  };
}

/** Replace {name}, {business}, {phone} tokens in bot text. */
export function fillTokens(text: string, vars: Record<string, string>) {
  return text.replace(/\{(\w+)\}/g, (m, k: string) => vars[k] ?? m);
}
