import { Loader2, Plus, Trash2 } from "lucide-react";
import { AdminLayout, Card, Field } from "./layout";
import { AddButton, RowTools, SaveRow, Toggle, input, move, useEditable } from "./ui";
import { client } from "../../lib/api";
import { CATEGORIES } from "../../lib/site";
import { useAllContent, useContentAction } from "../../queries/content";
import { PERIODS, uid, type Content, type Package } from "../../../api/lib/content-schema";

type State = { packages: Package[]; section: Content["packagesSection"] };
const PERIOD_LABEL: Record<(typeof PERIODS)[number], string> = { "one-time": "One-time", monthly: "Per month", yearly: "Per year", custom: "Custom text" };

const blank = (): Package => ({
  id: uid(),
  name: "",
  price: "",
  oldPrice: "",
  period: "one-time",
  periodLabel: "",
  description: "",
  features: [""],
  popular: false,
  button: "enquire",
  buttonText: "",
  category: "",
  service: "",
  visible: true,
});

export default function PackagesPage() {
  const { data } = useAllContent();
  const act = useContentAction();
  const ed = useEditable<State>(data ? { packages: data.packages, section: data.packagesSection } : undefined, (v) =>
    act(() => client.content.savePackages({ ...v, packages: v.packages.map((p) => ({ ...p, features: p.features.filter((f) => f.trim()) })) })),
  );
  const v = ed.value;
  const patch = (i: number, p: Partial<Package>) => ed.update((s) => ({ ...s, packages: s.packages.map((x, j) => (j === i ? { ...x, ...p } : x)) }));
  const sec = (p: Partial<State["section"]>) => ed.update((s) => ({ ...s, section: { ...s.section, ...p } }));

  return (
    <AdminLayout title="Packages" subtitle="Price plans shown on the Packages page and on the matching service pages.">
      {!v ? (
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      ) : (
        <>
          <Card title="Packages page">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Heading">
                <input aria-label="Heading" className={input} value={v.section.title} onChange={(e) => sec({ title: e.target.value })} />
              </Field>
              <Field label="Short line under the heading">
                <input aria-label="Subheading" className={input} value={v.section.subtitle} onChange={(e) => sec({ subtitle: e.target.value })} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Small note under the packages" hint="e.g. Government fees are extra.">
                  <input aria-label="Note" className={input} value={v.section.note} onChange={(e) => sec({ note: e.target.value })} />
                </Field>
              </div>
            </div>
            <div className="mt-5">
              <Toggle checked={v.section.show} onChange={(x) => sec({ show: x })} label="Show the Packages page and menu link" />
            </div>
          </Card>

          <div className="mt-6 grid gap-5 xl:grid-cols-2">
            {v.packages.map((p, i) => {
              const cat = CATEGORIES.find((c) => c.slug === p.category);
              return (
                <Card key={p.id} bodyClass="p-5" className={p.popular ? "ring-2 ring-blue-500" : ""}>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <span className="text-[13px] font-bold uppercase tracking-wider text-slate-400">Package {i + 1}</span>
                    <RowTools
                      i={i}
                      count={v.packages.length}
                      label="package"
                      onMove={(a, b) => ed.update((s) => ({ ...s, packages: move(s.packages, a, b) }))}
                      onRemove={() => ed.update((s) => ({ ...s, packages: s.packages.filter((_, j) => j !== i) }))}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Package name">
                      <input aria-label="Package name" className={input} placeholder="e.g. Starter" value={p.name} onChange={(e) => patch(i, { name: e.target.value })} />
                    </Field>
                    <Field label="Price" hint="e.g. ₹4,999 or 'On request'">
                      <input aria-label="Price" className={input} value={p.price} onChange={(e) => patch(i, { price: e.target.value })} />
                    </Field>
                    <Field label="Billing">
                      <select aria-label="Billing" className={input} value={p.period} onChange={(e) => patch(i, { period: e.target.value as Package["period"] })}>
                        {PERIODS.map((x) => (
                          <option key={x} value={x}>
                            {PERIOD_LABEL[x]}
                          </option>
                        ))}
                      </select>
                    </Field>
                    {p.period === "custom" ? (
                      <Field label="Billing text" hint="e.g. per project">
                        <input aria-label="Billing text" className={input} value={p.periodLabel} onChange={(e) => patch(i, { periodLabel: e.target.value })} />
                      </Field>
                    ) : (
                      <Field label="Old price (optional)" hint="Shown crossed out">
                        <input aria-label="Old price" className={input} value={p.oldPrice} onChange={(e) => patch(i, { oldPrice: e.target.value })} />
                      </Field>
                    )}
                    <div className="sm:col-span-2">
                      <Field label="Short description">
                        <input aria-label="Description" className={input} value={p.description} onChange={(e) => patch(i, { description: e.target.value })} />
                      </Field>
                    </div>
                    <div className="grid gap-2 sm:col-span-2">
                      <span className="text-[13.5px] font-semibold text-slate-700">What's included</span>
                      {p.features.map((f, k) => (
                        <div key={k} className="flex gap-2">
                          <input
                            aria-label={`Feature ${k + 1}`}
                            className={`${input} !h-10`}
                            value={f}
                            onChange={(e) => patch(i, { features: p.features.map((x, j) => (j === k ? e.target.value : x)) })}
                          />
                          <button type="button" aria-label="Remove feature" onClick={() => patch(i, { features: p.features.filter((_, j) => j !== k) })} className="grid h-10 w-10 shrink-0 place-items-center rounded-md text-slate-400 hover:bg-red-50 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      <button type="button" onClick={() => patch(i, { features: [...p.features, ""] })} className="flex w-fit items-center gap-1 text-[13px] font-semibold text-blue-600 hover:underline">
                        <Plus className="h-4 w-4" /> Add line
                      </button>
                    </div>
                    <Field label="Button">
                      <select aria-label="Button" className={input} value={p.button} onChange={(e) => patch(i, { button: e.target.value as Package["button"] })}>
                        <option value="enquire">Enquiry form</option>
                        <option value="whatsapp">WhatsApp</option>
                      </select>
                    </Field>
                    <Field label="Button text (optional)">
                      <input aria-label="Button text" className={input} placeholder={p.button === "whatsapp" ? "Chat on WhatsApp" : "Get Started"} value={p.buttonText} onChange={(e) => patch(i, { buttonText: e.target.value })} />
                    </Field>
                    <Field label="Also show on" hint="Service pages where this package appears">
                      <select aria-label="Category" className={input} value={p.category} onChange={(e) => patch(i, { category: e.target.value, service: "" })}>
                        <option value="">Packages page only</option>
                        {CATEGORIES.map((c) => (
                          <option key={c.slug} value={c.slug}>
                            {c.title} (all its services)
                          </option>
                        ))}
                      </select>
                    </Field>
                    {cat && (
                      <Field label="Only this service (optional)">
                        <select aria-label="Service" className={input} value={p.service} onChange={(e) => patch(i, { service: e.target.value })}>
                          <option value="">All {cat.title} services</option>
                          {cat.services.map((s) => (
                            <option key={s.name} value={s.name}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      </Field>
                    )}
                    <div className="flex flex-wrap gap-6 sm:col-span-2">
                      <Toggle checked={p.popular} onChange={(x) => patch(i, { popular: x })} label="Mark as Most Popular" />
                      <Toggle checked={p.visible} onChange={(x) => patch(i, { visible: x })} label="Show on website" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
          <div className="mt-4">
            <AddButton onClick={() => ed.update((s) => ({ ...s, packages: [...s.packages, blank()] }))}>Add package</AddButton>
          </div>
          <SaveRow {...ed} onSave={ed.save} />
        </>
      )}
    </AdminLayout>
  );
}
