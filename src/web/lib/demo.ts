/**
 * Demo mode = the GitHub Pages build (VITE_DEMO=1). No server there, so:
 * settings use the defaults, forms open WhatsApp, admin is hidden.
 */
import { DEFAULT_SITE } from "../../api/lib/site-schema";

export const DEMO = import.meta.env.VITE_DEMO === "1";

/** Images replaced in Admin → Images: "/images/hero.jpg" → "/api/img/…". Filled in when content loads. */
export const imageOverrides: Record<string, string> = {};

/** Path of a file in public/, working under a sub-folder (e.g. user.github.io/repo/). Uses the replacement image if there is one. */
export const asset = (p: string) => imageOverrides[p] || import.meta.env.BASE_URL.replace(/\/$/, "") + p;

/** Original public/ path of an asset() result ("/repo/images/x.jpg" → "/images/x.jpg"). */
export const assetPath = (url: string) => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return base && url.startsWith(base + "/") ? url.slice(base.length) : url;
};

type LeadInput = { name: string; phone: string; email?: string; service: string; message?: string; source?: string };

/** Demo replacement for saving a lead: open WhatsApp with the details filled in. */
export async function demoLead(input: LeadInput) {
  const text = [
    `Hi ${DEFAULT_SITE.siteName}, I'm ${input.name} (${input.phone}).`,
    `I'm interested in: ${input.service}.`,
    input.message && !/^Chatbot: |Call-back requested/.test(input.message) ? input.message : "",
  ]
    .filter(Boolean)
    .join(" ");
  const url = `https://wa.me/${DEFAULT_SITE.whatsapp}?text=${encodeURIComponent(text)}`;
  const win = window.open(url, "_blank", "noopener");
  if (!win) window.location.href = url;
  return { ok: true, id: 0, temporary: false };
}
