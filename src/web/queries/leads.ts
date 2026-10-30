import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { client, orpc } from "../lib/api";
import { DEMO, demoLead } from "../lib/demo";
import { track } from "../lib/track";

type LeadInput = Parameters<typeof client.leads.create>[0];

/** Save on the server; if the server has no database yet (temporary Vercel setup), also send it on WhatsApp. */
async function createLead(input: LeadInput) {
  const res = await client.leads.create(input);
  track("generate_lead", { form: input.source ?? "website", service: input.service });
  if (res.temporary) await demoLead({ ...input, email: input.email || undefined });
  return res;
}

export function useCreateLead() {
  return useMutation({ ...orpc.leads.create.mutationOptions(), mutationFn: DEMO ? demoLead : createLead });
}

export function useLeads() {
  return useQuery(orpc.leads.list.queryOptions());
}

export function useSetLeadStatus() {
  const qc = useQueryClient();
  return useMutation(
    orpc.leads.setStatus.mutationOptions({ onSuccess: () => qc.invalidateQueries({ queryKey: orpc.leads.list.key() }) }),
  );
}

export function useRemoveLead() {
  const qc = useQueryClient();
  return useMutation(
    orpc.leads.remove.mutationOptions({ onSuccess: () => qc.invalidateQueries({ queryKey: orpc.leads.list.key() }) }),
  );
}

export function useUpdateLead() {
  const qc = useQueryClient();
  return useMutation(
    orpc.leads.update.mutationOptions({ onSuccess: () => qc.invalidateQueries({ queryKey: orpc.leads.list.key() }) }),
  );
}
