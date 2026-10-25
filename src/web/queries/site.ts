import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";
import { DEMO } from "../lib/demo";
import { DEFAULT_SITE, type SiteSettings } from "../../api/lib/site-schema";

export type { SiteSettings, BotSettings, BotButton } from "../../api/lib/site-schema";
export { DEFAULT_BOT, fillTokens } from "../../api/lib/site-schema";

export const FALLBACK_SITE: SiteSettings = DEFAULT_SITE;

/** Site settings (logo, colours, contact, bot). Always returns a usable value. */
export function useSite(): SiteSettings {
  const { data } = useQuery({ ...orpc.siteSettings.get.queryOptions(), staleTime: 60_000, enabled: !DEMO });
  return data ?? FALLBACK_SITE;
}

export function useSaveSite() {
  const qc = useQueryClient();
  return useMutation(
    orpc.siteSettings.save.mutationOptions({
      onSuccess: (data) => qc.setQueryData(orpc.siteSettings.get.queryKey(), data),
    }),
  );
}

export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;
