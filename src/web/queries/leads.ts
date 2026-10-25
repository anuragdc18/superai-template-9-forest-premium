import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";
import { DEMO, demoLead } from "../lib/demo";

export function useCreateLead() {
  return useMutation({ ...orpc.leads.create.mutationOptions(), ...(DEMO ? { mutationFn: demoLead } : {}) });
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
