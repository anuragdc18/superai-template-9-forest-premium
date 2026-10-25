import { z } from "zod";
import { base } from "../__core/app";
import { authed } from "../middleware/auth";
import { data, save } from "../store";

const MAX_MISSES = 300;
const key = (q: string) => q.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();

/** Chatbot helpers. The bot itself runs in the browser — no outside AI service. */
export const bot = {
  /** Called by the chat window when the bot couldn't answer a question. */
  logMiss: base.input(z.object({ question: z.string().trim().min(2).max(300) })).handler(async ({ input }) => {
    const k = key(input.question);
    if (!k) return { ok: true };
    const found = data.botMisses.find((m) => key(m.question) === k);
    if (found) {
      found.count = Math.min(found.count + 1, 1_000_000);
      found.lastAsked = new Date();
    } else {
      data.botMisses.push({
        id: data.botMisses.reduce((max, m) => Math.max(max, m.id), 0) + 1,
        question: input.question,
        count: 1,
        lastAsked: new Date(),
      });
      // keep the list small: drop the oldest, least-asked questions
      if (data.botMisses.length > MAX_MISSES) {
        data.botMisses.sort((a, b) => b.count - a.count || b.lastAsked.getTime() - a.lastAsked.getTime());
        data.botMisses.length = MAX_MISSES;
      }
    }
    save();
    return { ok: true };
  }),
  misses: authed.handler(() =>
    [...data.botMisses].sort((a, b) => b.lastAsked.getTime() - a.lastAsked.getTime()),
  ),
  removeMiss: authed.input(z.object({ id: z.number() })).handler(async ({ input }) => {
    data.botMisses = data.botMisses.filter((m) => m.id !== input.id);
    save();
    return { ok: true };
  }),
  clearMisses: authed.handler(async () => {
    data.botMisses = [];
    save();
    return { ok: true };
  }),
};
