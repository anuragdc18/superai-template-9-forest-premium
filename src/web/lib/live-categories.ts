import { CATEGORIES, ALL_SERVICE_NAMES } from "./site";
import { applyServiceEdits } from "./services-edit";
import type { ServiceEdit } from "../../api/lib/content-schema";

/** The built-in services list, before the owner's edits. */
export const BASE_CATEGORIES = JSON.parse(JSON.stringify(CATEGORIES)) as typeof CATEGORIES;
let lastKey = "";

/**
 * Apply Admin → Services edits to the live list used across the website
 * (menus, pages, chatbot). Category objects keep their identity, only their services change.
 */
export function applyLiveServiceEdits(edits: ServiceEdit[]) {
  const key = JSON.stringify(edits);
  if (key === lastKey) return;
  lastKey = key;
  const next = applyServiceEdits(BASE_CATEGORIES, edits);
  next.forEach((c, i) => {
    CATEGORIES[i].services = c.services;
    CATEGORIES[i].menuItems = c.menuItems;
  });
  ALL_SERVICE_NAMES.splice(0, ALL_SERVICE_NAMES.length, ...CATEGORIES.flatMap((c) => c.services.map((s) => s.name)));
}
