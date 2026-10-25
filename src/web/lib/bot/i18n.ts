import type { Lang } from "./text";

/** Short bot phrases in English, Hinglish and Telugu (Roman letters, as most people type). */
const P = {
  greet: {
    en: "Hello {name}! 👋 How can I help you today?",
    hi: "Namaste {name}! 🙏 Bataiye, main aapki kya madad kar sakta hoon?",
    te: "Namaskaram {name} garu! 🙏 Meeku ela help cheyagalanu?",
  },
  thanks: {
    en: "You're welcome, {name}! 😊 Anything else I can help with?",
    hi: "Aapka swagat hai, {name} ji! 😊 Aur kuch madad chahiye?",
    te: "Welcome {name} garu! 😊 Inka emaina help kavala?",
  },
  bye: {
    en: "Thank you for visiting, {name}! 🙏 Have a great day. We're just a call or WhatsApp away.",
    hi: "Dhanyavaad {name} ji! 🙏 Aapka din shubh ho. Kabhi bhi call ya WhatsApp kariye.",
    te: "Dhanyavadalu {name} garu! 🙏 Manchi roju avvali. Eppudaina call leda WhatsApp cheyandi.",
  },
  callbackDone: {
    en: "Done, {name}! ✅ Our expert will call you on **{phone}** within 30 minutes during working hours ({hours}).",
    hi: "Ho gaya {name} ji! ✅ Hamare expert aapko **{phone}** par working hours ({hours}) mein 30 minute ke andar call karenge.",
    te: "Ayyindi {name} garu! ✅ Maa expert meeku **{phone}** ki working hours ({hours}) lo 30 nimishallo call chestaru.",
  },
  callbackAsk: {
    en: "Would you like our expert to call you for a **free consultation**?",
    hi: "Kya aap chahenge ki hamare expert aapko **free consultation** ke liye call karein?",
    te: "Maa expert meeku **free consultation** kosam call cheyyala?",
  },
  priceNone: {
    en: "The exact price depends on your requirement, and our expert shares a **clear quote on a free call** — no hidden charges.",
    hi: "Exact price aapki requirement par depend karta hai. Hamare expert **free call par clear quote** denge — koi hidden charges nahi.",
    te: "Exact price mee requirement meeda depend avutundi. Maa expert **free call lo clear quote** istaru — hidden charges levu.",
  },
  langNote: {
    en: "",
    hi: "(Details English mein hain — call par hamare expert Hindi mein samjha denge 🙂)",
    te: "(Details English lo unnayi — call lo maa expert Telugu lo explain chestaru 🙂)",
  },
  noProblem: {
    en: "No problem, {name}! 😊 Ask me anything whenever you're ready.",
    hi: "Koi baat nahi, {name} ji! 😊 Jab chahein kuch bhi poochiye.",
    te: "Parledu {name} garu! 😊 Emaina adagandi.",
  },
} as const;

export type PhraseKey = keyof typeof P;

export function phrase(key: PhraseKey, lang: Lang, vars: Record<string, string>): string {
  let text: string = P[key][lang] || P[key].en;
  if (!vars.name) text = text.replace(/,?\s*\{name\}(\s+(ji|garu))?/g, "");
  return text.replace(/\{(\w+)\}/g, (m, k: string) => vars[k] ?? m).replace(/\s+([!,.])/g, "$1");
}
