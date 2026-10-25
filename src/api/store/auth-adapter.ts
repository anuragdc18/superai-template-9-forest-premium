import type { BetterAuthOptions } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import { data, save } from "./store";

/**
 * Better Auth adapter backed by the JSON file: Better Auth's in-memory adapter
 * works on `data.auth`, and every write is saved to disk right after.
 */
export function jsonAuthAdapter() {
  const factory = memoryAdapter(data.auth);
  return (options: BetterAuthOptions) => {
    const adapter = factory(options);
    const persist =
      <A extends unknown[], R>(fn: (...args: A) => Promise<R>) =>
      async (...args: A) => {
        const result = await fn(...args);
        save();
        return result;
      };
    return {
      ...adapter,
      create: persist(adapter.create),
      update: persist(adapter.update),
      updateMany: persist(adapter.updateMany),
      delete: persist(adapter.delete),
      deleteMany: persist(adapter.deleteMany),
      transaction: persist(adapter.transaction),
    } as typeof adapter;
  };
}
