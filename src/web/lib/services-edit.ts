import type { Category, Service } from "./site";
import type { ServiceEdit } from "../../api/lib/content-schema";

/**
 * Apply the owner's service edits (Admin → Services) to the built-in list.
 * Returns a new list — the built-in one is never changed.
 */
export function applyServiceEdits(base: Category[], edits: ServiceEdit[]): Category[] {
  return base.map((c) => {
    const mine = edits.filter((e) => e.cat === c.slug);
    if (!mine.length) return c;
    const byOriginal = new Map(mine.filter((e) => e.original).map((e) => [e.original, e]));
    const services: Service[] = [];
    for (const s of c.services) {
      const e = byOriginal.get(s.name);
      if (!e) {
        services.push(s);
        continue;
      }
      if (e.hidden) continue;
      services.push({ ...s, name: e.name || s.name, text: e.text || s.text, days: e.days || s.days });
    }
    for (const e of mine) {
      if (e.original || e.hidden) continue;
      services.push({ name: e.name, text: e.text, ...(e.days ? { days: e.days } : {}) });
    }
    const names = new Set(services.map((s) => s.name));
    const renamed = new Map(mine.filter((e) => e.original && !e.hidden).map((e) => [e.original, e.name]));
    const menuItems = c.menuItems.map((m) => renamed.get(m) ?? m).filter((m) => names.has(m));
    return { ...c, services, menuItems };
  });
}
