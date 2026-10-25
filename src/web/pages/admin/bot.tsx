import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, HelpCircle, MessageCircle, MessageSquarePlus, Phone, Plus, RotateCcw, Search, Send, Trash2, X } from "lucide-react";
import { AdminLayout, Card, Field, SaveBar } from "./layout";
import { useSiteForm } from "./use-site-form";
import { WaIcon } from "../../components/header";
import { DEFAULT_BOT, fillTokens, type BotSettings, type SiteSettings } from "../../queries/site";
import { useBotMisses, useClearBotMisses, useRemoveBotMiss } from "../../queries/bot";
import { CATEGORIES } from "../../lib/site";
import { respond, startChat, type Chip, type Memory } from "../../lib/bot/engine";

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-blue-600" : "bg-slate-300"}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

function ToggleRow({ title, text, checked, onChange }: { title: string; text: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50/60 p-4">
      <div>
        <p className="text-[14px] font-semibold text-slate-800">{title}</p>
        <p className="mt-0.5 text-[13px] text-slate-500">{text}</p>
      </div>
      <Toggle label={title} checked={checked} onChange={onChange} />
    </div>
  );
}

const TOKENS_HINT = "You can use {name} (customer's first name), {business} and {phone}.";

export default function BotPage() {
  const { form, set, submit, saved, error, dirty, pending } = useSiteForm();
  const bot = form.bot;
  const setBot = <K extends keyof BotSettings>(k: K, v: BotSettings[K]) => set("bot", { ...bot, [k]: v });

  const text = (k: keyof BotSettings, label: string, hint?: string, rows = 0) => (
    <Field label={label} hint={hint}>
      {rows ? (
        <textarea
          aria-label={label}
          rows={rows}
          className="field !h-auto py-3 leading-relaxed"
          value={bot[k] as string}
          onChange={(e) => setBot(k, e.target.value as never)}
        />
      ) : (
        <input aria-label={label} className="field" value={bot[k] as string} onChange={(e) => setBot(k, e.target.value as never)} />
      )}
    </Field>
  );

  const vars = { name: "Ravi", business: form.siteName, phone: form.phone };
  const f = (s: string) => fillTokens(s, vars);

  const moveBtn = (i: number, d: -1 | 1) => {
    const b = [...bot.buttons];
    const j = i + d;
    if (j < 0 || j >= b.length) return;
    [b[i], b[j]] = [b[j], b[i]];
    setBot("buttons", b);
  };

  return (
    <AdminLayout
      title="Chat Bot"
      subtitle="Change what the website chat assistant says — welcome message, questions, buttons and replies."
      actions={
        <button
          type="button"
          onClick={() => confirm("Reset all bot messages to default?") && set("bot", DEFAULT_BOT)}
          className="flex h-10 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-4 text-[13.5px] font-semibold text-slate-600 hover:border-blue-300 hover:text-blue-600"
        >
          <RotateCcw className="h-4 w-4" /> Reset to default
        </button>
      }
    >
      <form onSubmit={submit}>
        <div className="grid gap-6 xl:grid-cols-[1fr_380px] xl:items-start">
          <div className="space-y-6">
            <Card title="General" subtitle={TOKENS_HINT}>
              <div className="space-y-5">
                <ToggleRow
                  title="Show chat bot on website"
                  text="Turn off to hide the orange chat button."
                  checked={bot.enabled}
                  onChange={(v) => setBot("enabled", v)}
                />
                <div className="grid gap-5 sm:grid-cols-2">
                  {text("name", "Bot name", "Shown at the top of the chat window.")}
                  {text("status", "Status line", "Small text under the bot name.")}
                </div>
                {text("hint", "Pop-up bubble", "Small bubble that appears next to the chat button after 4 seconds. Leave empty to hide.")}
                {text("welcome", "Welcome message", "The first message a visitor sees.", 3)}
                {text("returning", "Welcome back message", "Shown to visitors who already shared their details earlier.", 2)}
              </div>
            </Card>

            <Card title="Capture Customer Details" subtitle="The bot asks these questions one by one, saves the lead, then answers using the customer's name.">
              <div className="space-y-5">
                <ToggleRow
                  title="Ask for name & mobile number first"
                  text="Each visitor is saved in Leads (source: Chatbot) before the chat starts."
                  checked={bot.collectDetails}
                  onChange={(v) => setBot("collectDetails", v)}
                />
                {bot.collectDetails && (
                  <div className="space-y-5">
                    <Step n={1} title="Name">
                      {text("askName", "Question", undefined, 2)}
                    </Step>
                    <Step n={2} title="Mobile number">
                      {text("askPhone", "Question", undefined, 2)}
                      {text("invalidPhone", "If number is wrong", undefined, 2)}
                    </Step>
                    <Step n={3} title="Email ID" optional={<Toggle label="Ask email" checked={bot.collectEmail} onChange={(v) => setBot("collectEmail", v)} />}>
                      {bot.collectEmail ? (
                        <>
                          {text("askEmail", "Question", undefined, 2)}
                          {text("invalidEmail", "If email is wrong", undefined, 2)}
                        </>
                      ) : (
                        <p className="text-[13px] text-slate-500">Off — the bot will not ask for email.</p>
                      )}
                    </Step>
                    <Step n={bot.collectEmail ? 4 : 3} title="What are you looking for?">
                      {text("askNeed", "Question", "The quick-reply buttons below are shown with this question.", 2)}
                    </Step>
                    <Step n={bot.collectEmail ? 5 : 4} title="Details saved">
                      {text("savedMessage", "Confirmation message", "Shown after the lead is saved. Then the bot answers their question.", 2)}
                    </Step>
                  </div>
                )}
              </div>
            </Card>

            <Card
              title="Quick Reply Buttons"
              subtitle="Buttons the visitor can tap. 'Message' is what gets sent to the bot when tapped."
              right={<span className="rounded-full bg-slate-100 px-2.5 py-1 text-[12px] font-semibold text-slate-500">{bot.buttons.length}/10</span>}
            >
              <div className="space-y-3">
                {bot.buttons.map((b, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50/60 p-3">
                    <span className="mt-3 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-blue-600 text-[12px] font-bold text-white">{i + 1}</span>
                    <div className="grid flex-1 gap-2 sm:grid-cols-[200px_1fr]">
                      <input
                        aria-label="Button text"
                        className="field"
                        placeholder="Button text"
                        value={b.label}
                        onChange={(e) => setBot("buttons", bot.buttons.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
                      />
                      <input
                        aria-label="Message sent"
                        className="field"
                        placeholder="Message sent when tapped"
                        value={b.message}
                        onChange={(e) => setBot("buttons", bot.buttons.map((x, j) => (j === i ? { ...x, message: e.target.value } : x)))}
                      />
                    </div>
                    <div className="flex shrink-0 flex-col gap-1 sm:flex-row">
                      <IconBtn label="Move up" onClick={() => moveBtn(i, -1)} disabled={i === 0}>
                        <ArrowUp className="h-4 w-4" />
                      </IconBtn>
                      <IconBtn label="Move down" onClick={() => moveBtn(i, 1)} disabled={i === bot.buttons.length - 1}>
                        <ArrowDown className="h-4 w-4" />
                      </IconBtn>
                      <IconBtn label="Remove button" danger onClick={() => setBot("buttons", bot.buttons.filter((_, j) => j !== i))}>
                        <Trash2 className="h-4 w-4" />
                      </IconBtn>
                    </div>
                  </div>
                ))}
                {bot.buttons.length < 10 && (
                  <button
                    type="button"
                    onClick={() => setBot("buttons", [...bot.buttons, { label: "", message: "" }])}
                    className="flex h-10 items-center gap-1.5 rounded-md border border-dashed border-blue-300 px-4 text-[13.5px] font-semibold text-blue-600 hover:bg-blue-50"
                  >
                    <Plus className="h-4 w-4" /> Add button
                  </button>
                )}
              </div>
            </Card>

            <Card title="Other Buttons & Messages" subtitle={TOKENS_HINT}>
              <div className="grid gap-5 sm:grid-cols-2">
                {text("callLabel", "Call button text")}
                {text("whatsappLabel", "WhatsApp button text")}
                <div className="sm:col-span-2">{text("whatsappMessage", "WhatsApp pre-filled message", "Typed for the visitor when they tap any WhatsApp button.")}</div>
                {text("placeholder", "Chat input placeholder")}
                {text("errorMessage", "Error message", "Shown if the bot can't reply.")}
              </div>
            </Card>

            <UnansweredCard onAdd={(q) => setBot("faqs", [{ q, keywords: suggestKeywords(q), a: "" }, ...bot.faqs])} />

            <FaqCard faqs={bot.faqs} onChange={(faqs) => setBot("faqs", faqs)} />

            <Card title="When the Bot Doesn't Understand" subtitle={TOKENS_HINT}>
              <div className="space-y-5">
                {text("fallback", "Reply for unclear questions", "Shown when the bot can't match a question. The question is also saved under “Questions the bot couldn't answer”.", 3)}
                {text("offer", "Current offer (optional)", "Added to every price answer, e.g. “🪔 Diwali offer: 10% off on all registrations till 15 Nov”. Leave empty if none.", 2)}
              </div>
            </Card>

            <PriceCard prices={bot.prices} onChange={(prices) => setBot("prices", prices)} />
          </div>

          <aside className="space-y-6 xl:sticky xl:top-24">
            <Tester site={form} />
            <Preview bot={bot} f={f} businessName={form.siteName} colors={form.colors} />
          </aside>
        </div>
        <SaveBar pending={pending} saved={saved} error={error} dirty={dirty} />
      </form>
    </AdminLayout>
  );
}

function Step({ n, title, optional, children }: { n: number; title: string; optional?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="relative border-l-2 border-blue-100 pl-6">
      <span className="absolute -left-[13px] top-0 grid h-6 w-6 place-items-center rounded-full bg-blue-600 text-[12px] font-bold text-white">{n}</span>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[14.5px] font-semibold text-slate-800">{title}</p>
        {optional}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function IconBtn({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`grid h-9 w-9 place-items-center rounded-md border border-slate-200 bg-white text-slate-500 disabled:opacity-30 ${
        danger ? "hover:border-red-200 hover:bg-red-50 hover:text-red-600" : "hover:border-blue-300 hover:text-blue-600"
      }`}
    >
      {children}
    </button>
  );
}

function Preview({
  bot,
  f,
  businessName,
  colors,
}: {
  bot: BotSettings;
  f: (s: string) => string;
  businessName: string;
  colors: { navy: string; brand: string };
}) {
  const B = ({ me, children }: { me?: boolean; children: React.ReactNode }) => (
    <div
      className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-[13px] leading-relaxed ${
        me ? "self-end rounded-tr-sm bg-blue-600 text-white" : "self-start rounded-tl-sm bg-white text-slate-800 ring-1 ring-slate-200"
      }`}
    >
      {children}
    </div>
  );
  return (
    <div className="overflow-hidden rounded-md bg-white shadow-[0_1px_15px_rgba(69,65,78,0.08)]">
      <p className="border-b border-slate-100 px-5 py-3 text-[13px] font-semibold uppercase tracking-[0.1em] text-slate-500">Live preview</p>
      <div className="p-4">
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <div className="flex items-center gap-3 px-4 py-3 text-white" style={{ background: colors.navy }}>
            <span className="grid h-9 w-9 place-items-center rounded-full" style={{ background: colors.brand }}>
              <MessageCircle className="h-4 w-4" />
            </span>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-[14px] font-semibold">{f(bot.name) || `${businessName} Assistant`}</p>
              <p className="truncate text-[11.5px] text-white/70">{f(bot.status)}</p>
            </div>
          </div>
          <div className="flex max-h-[460px] flex-col gap-2 overflow-y-auto bg-slate-50 p-3">
            <B>{f(bot.welcome)}</B>
            {bot.collectDetails ? (
              <>
                <B>{fillTokens(bot.askName, { name: "there", business: businessName })}</B>
                <B me>Ravi Kumar</B>
                <B>{f(bot.askPhone)}</B>
                <B me>9876543210</B>
                {bot.collectEmail && (
                  <>
                    <B>{f(bot.askEmail)}</B>
                    <B me>ravi@gmail.com</B>
                  </>
                )}
                <B>{f(bot.askNeed)}</B>
              </>
            ) : null}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {bot.buttons.map((b, i) => (
                <span key={i} className="rounded-full border border-blue-200 bg-white px-2.5 py-1 text-[12px] font-medium text-blue-600">
                  {b.label || "…"}
                </span>
              ))}
            </div>
            {bot.collectDetails && (
              <div className="self-start rounded-xl bg-green-50 px-3 py-2 text-[12.5px] font-medium text-green-700">{f(bot.savedMessage)}</div>
            )}
          </div>
          <div className="flex gap-2 border-t border-slate-200 bg-white px-3 py-2 text-[11.5px]">
            <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-700">
              <Phone className="h-3 w-3" /> {bot.callLabel}
            </span>
            <span className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 font-medium text-green-700">
              <WaIcon className="h-3 w-3" /> {bot.whatsappLabel}
            </span>
          </div>
          <div className="flex items-center gap-2 border-t border-slate-200 bg-white p-2.5">
            <span className="flex h-9 flex-1 items-center rounded-lg border border-slate-200 px-3 text-[12.5px] text-slate-400">{f(bot.placeholder)}</span>
            <span className="grid h-9 w-9 place-items-center rounded-lg text-white" style={{ background: colors.brand }}>
              <Send className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
        {bot.hint && (
          <div className="mt-4 flex items-end justify-end gap-2">
            <span className="max-w-[220px] rounded-2xl rounded-br-sm bg-white px-3 py-2 text-[12.5px] font-medium text-slate-800 shadow ring-1 ring-slate-200">
              {f(bot.hint)}
            </span>
            <span className="grid h-10 w-10 place-items-center rounded-full text-white" style={{ background: colors.brand }}>
              <MessageCircle className="h-4 w-4" />
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ───────────────────────── chatbot knowledge editors ─────────────────────────

const STOPWORDS = new Set("a an the is are am do does can i you your we our to of for in on at and or it my me what how which when where why who please tell about have has will be".split(" "));
function suggestKeywords(q: string) {
  return [...new Set(q.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter((w) => w.length > 2 && !STOPWORDS.has(w)))].slice(0, 6).join(", ");
}

function UnansweredCard({ onAdd }: { onAdd: (q: string) => void }) {
  const { data, isLoading } = useBotMisses();
  const remove = useRemoveBotMiss();
  const clear = useClearBotMisses();
  const misses = data ?? [];
  return (
    <Card
      title="Questions the Bot Couldn't Answer"
      subtitle="Real questions visitors typed that the bot didn't understand. Click “Add answer” to teach the bot — then press Save."
      right={
        misses.length > 0 ? (
          <button
            type="button"
            onClick={() => confirm("Remove all unanswered questions from this list?") && clear.mutate({})}
            className="whitespace-nowrap text-[12.5px] font-semibold text-slate-400 hover:text-red-600"
          >
            Clear all
          </button>
        ) : undefined
      }
    >
      {isLoading ? (
        <p className="text-[13px] text-slate-400">Loading…</p>
      ) : misses.length === 0 ? (
        <div className="flex items-center gap-3 rounded-lg border border-dashed border-slate-200 p-4 text-[13.5px] text-slate-500">
          <HelpCircle className="h-5 w-5 text-slate-300" /> Nothing here yet. When a visitor asks something the bot can't answer, it shows up here.
        </div>
      ) : (
        <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
          {misses.map((m) => (
            <div key={m.id} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium text-slate-800">“{m.question}”</p>
                <p className="text-[12px] text-slate-400">
                  Asked {m.count} {m.count === 1 ? "time" : "times"} · last {new Date(m.lastAsked).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onAdd(m.question);
                  remove.mutate({ id: m.id });
                }}
                className="flex h-9 shrink-0 items-center gap-1.5 rounded-md bg-blue-600 px-3 text-[12.5px] font-semibold text-white hover:bg-blue-700"
              >
                <MessageSquarePlus className="h-4 w-4" /> Add answer
              </button>
              <IconBtn label="Dismiss" danger onClick={() => remove.mutate({ id: m.id })}>
                <X className="h-4 w-4" />
              </IconBtn>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function FaqCard({ faqs, onChange }: { faqs: BotSettings["faqs"]; onChange: (f: BotSettings["faqs"]) => void }) {
  const [q, setQ] = useState("");
  const shown = faqs.map((f, i) => ({ f, i })).filter(({ f }) => !q || `${f.q} ${f.keywords} ${f.a}`.toLowerCase().includes(q.toLowerCase()));
  const upd = (i: number, k: keyof BotSettings["faqs"][number], v: string) => onChange(faqs.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  return (
    <Card
      title="Your Own Answers"
      subtitle="Teach the bot anything — offers, fees, policies, FAQs. These are checked before the built-in answers. Keywords are words people might type (any language), separated by commas."
      right={<span className="rounded-full bg-slate-100 px-2.5 py-1 text-[12px] font-semibold text-slate-500">{faqs.length}/150</span>}
    >
      <div className="space-y-3">
        {faqs.length > 4 && (
          <label className="flex items-center gap-2 rounded-md border border-slate-200 px-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input aria-label="Search answers" className="h-10 flex-1 bg-transparent text-[14px] outline-none" placeholder="Search your answers…" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
        )}
        {shown.map(({ f, i }) => (
          <div key={i} className="space-y-2 rounded-lg border border-slate-200 bg-slate-50/60 p-3">
            <div className="flex items-start gap-2">
              <input aria-label="Question" className="field flex-1" placeholder="Question, e.g. Do you offer EMI?" value={f.q} onChange={(e) => upd(i, "q", e.target.value)} />
              <IconBtn label="Remove answer" danger onClick={() => onChange(faqs.filter((_, j) => j !== i))}>
                <Trash2 className="h-4 w-4" />
              </IconBtn>
            </div>
            <input aria-label="Keywords" className="field" placeholder="Keywords: emi, installment, part payment, kist" value={f.keywords} onChange={(e) => upd(i, "keywords", e.target.value)} />
            <textarea
              aria-label="Answer"
              rows={3}
              className={`field !h-auto py-3 leading-relaxed ${f.a.trim() ? "" : "!border-amber-300"}`}
              placeholder="The bot's answer. Use **bold** and start lines with • for bullets."
              value={f.a}
              onChange={(e) => upd(i, "a", e.target.value)}
            />
          </div>
        ))}
        {faqs.length < 150 && (
          <button
            type="button"
            onClick={() => onChange([...faqs, { q: "", keywords: "", a: "" }])}
            className="flex h-10 items-center gap-1.5 rounded-md border border-dashed border-blue-300 px-4 text-[13.5px] font-semibold text-blue-600 hover:bg-blue-50"
          >
            <Plus className="h-4 w-4" /> Add answer
          </button>
        )}
      </div>
    </Card>
  );
}

function PriceCard({ prices, onChange }: { prices: BotSettings["prices"]; onChange: (p: BotSettings["prices"]) => void }) {
  const map = useMemo(() => new Map(prices.map((p) => [p.service, p.price])), [prices]);
  const set = (service: string, price: string) => {
    const rest = prices.filter((p) => p.service !== service);
    onChange(price.trim() ? [...rest, { service, price }] : rest);
  };
  return (
    <Card
      title="Service Prices (optional)"
      subtitle="If you add a starting price, the bot tells visitors “starts from …”. Leave empty and the bot offers a free call for an exact quote instead."
      right={<span className="rounded-full bg-slate-100 px-2.5 py-1 text-[12px] font-semibold text-slate-500">{prices.length} set</span>}
    >
      <div className="space-y-2">
        {CATEGORIES.map((c) => {
          const count = c.services.filter((s) => map.get(s.name)).length;
          return (
            <details key={c.slug} className="group rounded-lg border border-slate-200 bg-slate-50/60">
              <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-[14px] font-semibold text-slate-700">
                {c.title}
                <span className="text-[12px] font-medium text-slate-400">{count ? `${count} price${count > 1 ? "s" : ""} set` : "No prices"} ▾</span>
              </summary>
              <div className="grid gap-2 border-t border-slate-200 p-3 sm:grid-cols-2">
                {c.services.map((s) => (
                  <label key={s.name} className="flex items-center gap-2 rounded-md bg-white px-3 py-2 ring-1 ring-slate-200">
                    <span className="min-w-0 flex-1 truncate text-[13px] text-slate-600" title={s.name}>
                      {s.name}
                    </span>
                    <input
                      aria-label={`Price for ${s.name}`}
                      className="h-8 w-28 rounded border border-slate-200 px-2 text-[13px] outline-none focus:border-blue-400"
                      placeholder="e.g. ₹1,499"
                      maxLength={80}
                      value={map.get(s.name) ?? ""}
                      onChange={(e) => set(s.name, e.target.value)}
                    />
                  </label>
                ))}
              </div>
            </details>
          );
        })}
      </div>
    </Card>
  );
}

/** Try the bot with the settings on this page (even before saving). No leads are saved. */
function Tester({ site }: { site: SiteSettings }) {
  const demo = { name: "Ravi Kumar", phone: "9876543210" };
  const [lines, setLines] = useState<{ me: boolean; text: string }[]>([]);
  const [chips, setChips] = useState<Chip[]>([]);
  const [mem, setMem] = useState<Memory>(() => startChat(site, demo).memory);
  const [input, setInput] = useState("");
  const ask = (text: string, shown?: string) => {
    if (!text.trim()) return;
    const r = respond(text, site, demo, mem);
    setMem(r.memory);
    setLines((l) => [...l, { me: true, text: shown ?? text }, ...r.messages.map((m) => ({ me: false, text: m.text }))].slice(-30));
    setChips(r.chips.filter((c) => !c.kind || c.kind === "send"));
    setInput("");
  };
  return (
    <div className="overflow-hidden rounded-md bg-white shadow-[0_1px_15px_rgba(69,65,78,0.08)]">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
        <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-slate-500">Test your bot</p>
        {lines.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setLines([]);
              setChips([]);
              setMem(startChat(site, demo).memory);
            }}
            className="text-[12px] font-semibold text-slate-400 hover:text-blue-600"
          >
            Clear
          </button>
        )}
      </div>
      <div className="flex max-h-[380px] min-h-[120px] flex-col gap-2 overflow-y-auto bg-slate-50 p-3">
        {lines.length === 0 && <p className="m-auto max-w-[240px] text-center text-[12.5px] text-slate-400">Type a question a customer might ask — e.g. “gst kitna lagega?”. Uses your unsaved changes. No leads are saved.</p>}
        {lines.map((l, i) => (
          <div
            key={i}
            className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-[12.5px] leading-relaxed ${
              l.me ? "self-end rounded-tr-sm bg-blue-600 text-white" : "self-start rounded-tl-sm bg-white text-slate-800 ring-1 ring-slate-200"
            }`}
          >
            {l.text.replace(/\*\*(.*?)\*\*/g, "$1")}
          </div>
        ))}
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {chips.map((c) => (
              <button
                type="button"
                key={c.label}
                onClick={() => ask(c.send ?? c.label, c.label)}
                className="rounded-full border border-blue-200 bg-white px-2.5 py-1 text-[11.5px] font-medium text-blue-600 hover:bg-blue-600 hover:text-white"
              >
                {c.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 border-t border-slate-200 p-2.5">
        <input
          aria-label="Test question"
          className="h-9 flex-1 rounded-lg border border-slate-200 px-3 text-[13px] outline-none focus:border-blue-400"
          placeholder="Ask a test question…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              ask(input);
            }
          }}
        />
        <button type="button" onClick={() => ask(input)} aria-label="Send test question" className="grid h-9 w-9 place-items-center rounded-lg bg-blue-600 text-white">
          <Send className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
