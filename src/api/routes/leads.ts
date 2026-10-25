import { z } from "zod";
import { base } from "../__core/app";
import { authed } from "../middleware/auth";
import { data, save, type Lead } from "../store";
import { LEAD_STATUSES } from "../lib/lead-status";

export const leadInput = z.object({
  name: z.string().trim().min(2, "Please enter your name"),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  email: z.string().trim().email().optional().or(z.literal("")),
  service: z.string().trim().min(1, "Please select a service"),
  message: z.string().trim().max(1000).optional(),
  source: z.string().trim().max(60).optional(),
});

export async function insertLead(input: z.infer<typeof leadInput>) {
  const lead: Lead = {
    id: data.leads.reduce((max, l) => Math.max(max, l.id), 0) + 1,
    name: input.name,
    phone: input.phone,
    email: input.email || null,
    service: input.service,
    message: input.message || null,
    source: input.source || "home",
    status: "new",
    createdAt: new Date(),
  };
  data.leads.push(lead);
  save();
  return { id: lead.id };
}

export const leads = {
  create: base.input(leadInput).handler(async ({ input }) => {
    const lead = await insertLead(input);
    return { ok: true, id: lead.id };
  }),
  list: authed.handler(() => [...data.leads].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())),
  setStatus: authed
    .input(z.object({ id: z.number(), status: z.enum(LEAD_STATUSES) }))
    .handler(async ({ input }) => {
      const lead = data.leads.find((l) => l.id === input.id);
      if (lead) {
        lead.status = input.status;
        save();
      }
      return { ok: true };
    }),
  remove: authed.input(z.object({ id: z.number() })).handler(async ({ input }) => {
    data.leads = data.leads.filter((l) => l.id !== input.id);
    save();
    return { ok: true };
  }),
};
