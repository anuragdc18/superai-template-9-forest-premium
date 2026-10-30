import { useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { AdminLayout, Card, Field } from "./layout";
import { SaveRow, Toggle, input, useEditable } from "./ui";
import { client } from "../../lib/api";
import { CATEGORIES, waLink } from "../../lib/site";
import { useAllContent, useContentAction } from "../../queries/content";
import { useSaveSite, useSite } from "../../queries/site";
import { WaIcon } from "../../components/header";
import type { WhatsappSettings } from "../../../api/lib/content-schema";

type State = { number: string; message: string; label: string; wa: WhatsappSettings };

export default function WhatsappPage() {
  const site = useSite();
  const saveSite = useSaveSite();
  const { data } = useAllContent();
  const act = useContentAction();
  const [openCat, setOpenCat] = useState<string | null>(null);
  const ed = useEditable<State>(
    data ? { number: site.whatsapp, message: site.bot.whatsappMessage, label: site.bot.whatsappLabel, wa: data.whatsapp } : undefined,
    async (v) => {
      const messages = Object.fromEntries(Object.entries(v.wa.serviceMessages).filter(([, m]) => m.trim()));
      await act(() => client.content.saveWhatsapp({ ...v.wa, serviceMessages: messages }));
      await saveSite.mutateAsync({ ...site, whatsapp: v.number.replace(/\D/g, ""), bot: { ...site.bot, whatsappMessage: v.message, whatsappLabel: v.label } });
    },
  );
  const v = ed.value;
  const set = (p: Partial<State>) => ed.update((s) => ({ ...s, ...p }));
  const wa = (p: Partial<WhatsappSettings>) => ed.update((s) => ({ ...s, wa: { ...s.wa, ...p } }));

  return (
    <AdminLayout title="WhatsApp" subtitle="Your WhatsApp number and the ready messages customers send you from the website.">
      {!v ? (
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      ) : (
        <>
          <div className="grid gap-6 xl:grid-cols-2">
            <Card title="Main WhatsApp" subtitle="Used by the floating button, contact page, chatbot and service pages.">
              <div className="grid gap-5">
                <Field label="WhatsApp number" hint="Digits only with country code, e.g. 919876543210">
                  <input aria-label="WhatsApp number" className={input} inputMode="numeric" value={v.number} onChange={(e) => set({ number: e.target.value })} />
                </Field>
                <Field label="Default message" hint="Filled in when a customer taps a WhatsApp button. {business} = your business name.">
                  <textarea aria-label="Default message" className={`${input} !h-20 py-2.5`} value={v.message} onChange={(e) => set({ message: e.target.value })} />
                </Field>
                <Field label="Button text">
                  <input aria-label="Button text" className={input} value={v.label} onChange={(e) => set({ label: e.target.value })} />
                </Field>
                <Toggle checked={v.wa.showButton} onChange={(x) => wa({ showButton: x })} label="Show the floating WhatsApp button" hint="The round green button at the bottom of every page." />
                <a href={waLink(v.number.replace(/\D/g, ""), v.message)} target="_blank" rel="noreferrer" className="flex w-fit items-center gap-2 rounded-md bg-[#25d366] px-4 py-2.5 text-[14px] font-semibold text-white hover:brightness-95">
                  <WaIcon /> Test this link
                </a>
              </div>
            </Card>

            <div className="space-y-6">
              <Card title="Service pages" subtitle="Message used by the WhatsApp button on each service page.">
                <Field label="Message for service pages" hint="{service} is replaced with the service name.">
                  <input aria-label="Service message" className={input} value={v.wa.serviceMessage} onChange={(e) => wa({ serviceMessage: e.target.value })} />
                </Field>
              </Card>
              <Card title="Second number (optional)" subtitle="e.g. a separate Sales or Support number, shown on the Contact page.">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Label">
                    <input aria-label="Second number label" className={input} placeholder="Support" value={v.wa.secondLabel} onChange={(e) => wa({ secondLabel: e.target.value })} />
                  </Field>
                  <Field label="Number" hint="With country code">
                    <input aria-label="Second WhatsApp number" className={input} inputMode="numeric" value={v.wa.secondNumber} onChange={(e) => wa({ secondNumber: e.target.value.replace(/\D/g, "") })} />
                  </Field>
                </div>
              </Card>
            </div>
          </div>

          <Card className="mt-6" title="Own message for a service (optional)" subtitle="Leave empty to use the service-page message above." bodyClass="divide-y divide-slate-100">
            {CATEGORIES.map((c) => {
              const count = c.services.filter((s) => v.wa.serviceMessages[s.name]?.trim()).length;
              return (
                <div key={c.slug}>
                  <button type="button" onClick={() => setOpenCat(openCat === c.slug ? null : c.slug)} className="flex w-full items-center justify-between px-5 py-3.5 text-left text-[14.5px] font-semibold text-slate-700 hover:bg-slate-50">
                    <span>
                      {c.title} {count > 0 && <span className="ml-2 rounded-full bg-green-50 px-2 py-0.5 text-[12px] text-green-700">{count} custom</span>}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition ${openCat === c.slug ? "rotate-180" : ""}`} />
                  </button>
                  {openCat === c.slug && (
                    <div className="grid gap-3 px-5 pb-5">
                      {c.services.map((s) => (
                        <label key={s.name} className="grid gap-1.5 sm:grid-cols-[240px_1fr] sm:items-center">
                          <span className="text-[13.5px] font-medium text-slate-600">{s.name}</span>
                          <input
                            className={`${input} !h-10`}
                            placeholder={v.wa.serviceMessage.replace("{service}", s.name)}
                            value={v.wa.serviceMessages[s.name] ?? ""}
                            onChange={(e) => wa({ serviceMessages: { ...v.wa.serviceMessages, [s.name]: e.target.value } })}
                          />
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </Card>
          <SaveRow {...ed} onSave={ed.save} />
        </>
      )}
    </AdminLayout>
  );
}
