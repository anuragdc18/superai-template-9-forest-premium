import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";

/** Questions the chatbot couldn't answer (admin only). */
export function useBotMisses() {
  return useQuery(orpc.bot.misses.queryOptions());
}

export function useRemoveBotMiss() {
  const qc = useQueryClient();
  return useMutation(orpc.bot.removeMiss.mutationOptions({ onSuccess: () => qc.invalidateQueries({ queryKey: orpc.bot.misses.key() }) }));
}

export function useClearBotMisses() {
  const qc = useQueryClient();
  return useMutation(orpc.bot.clearMisses.mutationOptions({ onSuccess: () => qc.invalidateQueries({ queryKey: orpc.bot.misses.key() }) }));
}
