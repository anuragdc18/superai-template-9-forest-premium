import { Building2, Clock, Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Plus, Trash2, Youtube } from "lucide-react";
import { AdminLayout, Card, Field, SaveBar } from "./layout";
import { useSiteForm } from "./use-site-form";
import { WaIcon } from "../../components/header";
import type { SiteSettings } from "../../queries/site";

const input = "field";

function AddButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-10 items-center gap-1.5 rounded-md border border-dashed border-blue-300 px-4 text-[13.5px] font-semibold text-blue-600 hover:bg-blue-50"
    >
      <Plus className="h-4 w-4" /> {children}
    </button>
  );
}

function RemoveButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}

function IconLabel({ icon: Icon, children }: { icon: typeof Phone; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-2">
      <span className="grid h-7 w-7 place-items-center rounded-md bg-blue-50 text-blue-600">
        <Icon className="h-4 w-4" />
      </span>
      {children}
    </span>
  );
}

export default function ContactInfoPage() {
  const { form, set, submit, saved, error, dirty, pending } = useSiteForm();

  const update = <K extends "phones" | "emails" | "addresses">(k: K, i: number, patch: Partial<SiteSettings[K][number]>) =>
    set(k, form[k].map((row, j) => (j === i ? { ...row, ...patch } : row)) as SiteSettings[K]);
  const removeAt = <K extends "phones" | "emails" | "addresses">(k: K, i: number) =>
    set(k, form[k].filter((_, j) => j !== i) as SiteSettings[K]);

  // drop completely empty extra rows before saving
  const clean = (f: SiteSettings): SiteSettings => ({
    ...f,
    phones: f.phones.filter((p) => p.number.trim()),
    emails: f.emails.filter((e) => e.email.trim()),
    addresses: f.addresses.filter((a) => a.line.trim()),
  });

  return (
    <AdminLayout title="Contact Info" subtitle="Your business details. These show in the website top bar, footer, contact page, WhatsApp buttons and chatbot.">
      <form onSubmit={(e) => submit(e, clean)} className="space-y-6">
        <Card title="Business Details" subtitle="Name and short description of your business.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Business name" hint="Shown in the header (when no logo), footer and chatbot.">
              <input aria-label="Business name" className={input} value={form.siteName} onChange={(e) => set("siteName", e.target.value)} />
            </Field>
            <Field label="Working hours">
              <input aria-label="Working hours" className={input} value={form.hours} onChange={(e) => set("hours", e.target.value)} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Tagline / short description" hint="Shown in the footer under your logo.">
                <input aria-label="Tagline" className={input} value={form.tagline} onChange={(e) => set("tagline", e.target.value)} />
              </Field>
            </div>
          </div>
        </Card>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card title="Phone Numbers" subtitle="The main number is used on all Call buttons.">
            <div className="space-y-4">
              <Field label="Main phone number">
                <input aria-label="Main phone number" className={input} value={form.phone} onChange={(e) => set("phone", e.target.value)} />
              </Field>
              <Field label="WhatsApp number" hint="Digits only with country code, e.g. 919876543210">
                <input
                  aria-label="WhatsApp number"
                  className={input}
                  inputMode="numeric"
                  value={form.whatsapp}
                  onChange={(e) => set("whatsapp", e.target.value.replace(/\D/g, ""))}
                />
              </Field>
              {form.phones.length > 0 && <p className="pt-1 text-[13.5px] font-semibold text-slate-700">Other numbers</p>}
              {form.phones.map((p, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    aria-label="Phone label"
                    className={`${input} !w-36 shrink-0`}
                    placeholder="Label e.g. Sales"
                    value={p.label}
                    onChange={(e) => update("phones", i, { label: e.target.value })}
                  />
                  <input
                    aria-label="Phone number"
                    className={input}
                    placeholder="+91 ..."
                    value={p.number}
                    onChange={(e) => update("phones", i, { number: e.target.value })}
                  />
                  <RemoveButton label="Remove phone" onClick={() => removeAt("phones", i)} />
                </div>
              ))}
              <AddButton onClick={() => set("phones", [...form.phones, { label: "", number: "" }])}>Add phone number</AddButton>
            </div>
          </Card>

          <Card title="Email IDs" subtitle="The main email is shown in the top bar and footer.">
            <div className="space-y-4">
              <Field label="Main email ID">
                <input aria-label="Main email" type="email" className={input} value={form.email} onChange={(e) => set("email", e.target.value)} />
              </Field>
              {form.emails.length > 0 && <p className="pt-1 text-[13.5px] font-semibold text-slate-700">Other emails</p>}
              {form.emails.map((m, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    aria-label="Email label"
                    className={`${input} !w-36 shrink-0`}
                    placeholder="Label e.g. Support"
                    value={m.label}
                    onChange={(e) => update("emails", i, { label: e.target.value })}
                  />
                  <input
                    aria-label="Email ID"
                    type="email"
                    className={input}
                    placeholder="name@company.com"
                    value={m.email}
                    onChange={(e) => update("emails", i, { email: e.target.value })}
                  />
                  <RemoveButton label="Remove email" onClick={() => removeAt("emails", i)} />
                </div>
              ))}
              <AddButton onClick={() => set("emails", [...form.emails, { label: "", email: "" }])}>Add email ID</AddButton>
            </div>
          </Card>
        </div>

        <Card title="Addresses" subtitle="Add one or more office addresses. The city line is shown in the footer.">
          <div className="space-y-4">
            <Field label="City / short location" hint="e.g. Hyderabad, Telangana">
              <input aria-label="City" className={input} value={form.city} onChange={(e) => set("city", e.target.value)} />
            </Field>
            {form.addresses.map((a, i) => (
              <div key={i} className="rounded-lg border border-slate-200 bg-slate-50/60 p-4">
                <div className="flex items-start gap-2">
                  <div className="grid flex-1 gap-3 sm:grid-cols-[180px_1fr]">
                    <input
                      aria-label="Address label"
                      className={input}
                      placeholder="Label e.g. Head Office"
                      value={a.label}
                      onChange={(e) => update("addresses", i, { label: e.target.value })}
                    />
                    <textarea
                      aria-label="Full address"
                      className={`${input} !h-auto min-h-[84px] py-3`}
                      placeholder="Full address with pincode"
                      value={a.line}
                      onChange={(e) => update("addresses", i, { line: e.target.value })}
                    />
                    <span className="hidden sm:block" />
                    <input
                      aria-label="Google Maps link"
                      className={input}
                      placeholder="Google Maps link (optional)"
                      value={a.mapUrl}
                      onChange={(e) => update("addresses", i, { mapUrl: e.target.value })}
                    />
                  </div>
                  <RemoveButton label="Remove address" onClick={() => removeAt("addresses", i)} />
                </div>
              </div>
            ))}
            <AddButton onClick={() => set("addresses", [...form.addresses, { label: "", line: "", mapUrl: "" }])}>Add address</AddButton>
          </div>
        </Card>

        <Card title="Social Media" subtitle="Paste full links. Leave empty to hide.">
          <div className="grid gap-5 sm:grid-cols-2">
            {(
              [
                ["facebook", "Facebook", Facebook],
                ["instagram", "Instagram", Instagram],
                ["linkedin", "LinkedIn", Linkedin],
                ["youtube", "YouTube", Youtube],
              ] as const
            ).map(([k, label, Icon]) => (
              <Field key={k} label={label}>
                <div className="relative">
                  <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    aria-label={label}
                    className={`${input} !pl-11`}
                    placeholder={`https://${k}.com/...`}
                    value={form.socials[k]}
                    onChange={(e) => set("socials", { ...form.socials, [k]: e.target.value })}
                  />
                </div>
              </Field>
            ))}
          </div>
        </Card>

        <Card title="Preview" subtitle="How your details look on the website contact page.">
          <div className="grid gap-3 text-[14px] text-slate-700 sm:grid-cols-2 xl:grid-cols-3">
            <IconLabel icon={Building2}>{form.siteName}</IconLabel>
            <IconLabel icon={Phone}>{form.phone}</IconLabel>
            <IconLabel icon={WaIcon as unknown as typeof Phone}>+{form.whatsapp}</IconLabel>
            <IconLabel icon={Mail}>{form.email}</IconLabel>
            <IconLabel icon={Clock}>{form.hours}</IconLabel>
            <IconLabel icon={MapPin}>{form.city}</IconLabel>
            {form.phones.filter((p) => p.number).map((p, i) => (
              <IconLabel key={`p${i}`} icon={Phone}>
                {p.label ? `${p.label}: ` : ""}
                {p.number}
              </IconLabel>
            ))}
            {form.emails.filter((m) => m.email).map((m, i) => (
              <IconLabel key={`e${i}`} icon={Mail}>
                {m.label ? `${m.label}: ` : ""}
                {m.email}
              </IconLabel>
            ))}
            {form.addresses.filter((a) => a.line).map((a, i) => (
              <IconLabel key={`a${i}`} icon={MapPin}>
                {a.label ? `${a.label}: ` : ""}
                {a.line}
              </IconLabel>
            ))}
          </div>
        </Card>

        <SaveBar pending={pending} saved={saved} error={error} dirty={dirty} />
      </form>
    </AdminLayout>
  );
}
