/** Google Analytics events (only when GA_ID was set at build time; otherwise does nothing). */
type Gtag = (...args: unknown[]) => void;

export function track(event: string, params: Record<string, unknown> = {}) {
  const gtag = (window as unknown as { gtag?: Gtag }).gtag;
  if (typeof gtag === "function") gtag("event", event, params);
}

/** Count clicks on call / WhatsApp / email links anywhere on the website. */
export function trackContactClicks() {
  document.addEventListener(
    "click",
    (e) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href") ?? "";
      if (href.startsWith("tel:")) track("click_call", { link_url: href });
      else if (href.includes("wa.me/") || href.includes("api.whatsapp.com")) track("click_whatsapp", { link_url: href.split("?")[0] });
      else if (href.startsWith("mailto:")) track("click_email", { link_url: href });
    },
    { capture: true },
  );
}
