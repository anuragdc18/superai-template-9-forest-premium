import { useEffect } from "react";
import { useSite } from "../queries/site";

/** Applies saved brand colours + site name to the whole page. */
export function SiteTheme() {
  const site = useSite();
  useEffect(() => {
    const root = document.documentElement.style;
    root.setProperty("--color-navy", site.colors.navy);
    root.setProperty("--color-royal", site.colors.royal);
    root.setProperty("--color-brand", site.colors.brand);
  }, [site.colors.navy, site.colors.royal, site.colors.brand]);
  return null;
}
