import { base } from "../__core/app";
import { authed } from "../middleware/auth";
import { data, save } from "../store";
import { DEFAULT_SITE, mergeSite, siteSchema, type SiteSettings } from "../lib/site-schema";

export { DEFAULT_SITE, siteSchema };
export type { SiteSettings };

export async function readSite(): Promise<SiteSettings> {
  const saved = data.settings.site;
  if (!saved || typeof saved !== "object") return DEFAULT_SITE;
  try {
    return mergeSite(saved as Partial<SiteSettings>);
  } catch {
    return DEFAULT_SITE;
  }
}

export const siteSettings = {
  get: base.handler(() => readSite()),
  save: authed.input(siteSchema).handler(async ({ input }) => {
    data.settings.site = input;
    save();
    return input;
  }),
};
