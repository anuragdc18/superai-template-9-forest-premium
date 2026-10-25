import { useState } from "react";
import { CheckCircle2, ChevronDown, Loader2, Phone, User, Briefcase } from "lucide-react";
import { CATEGORIES } from "../lib/site";
import { useCreateLead } from "../queries/leads";

type Props = {
  layout?: "row" | "stack";
  source?: string;
  defaultService?: string;
  cta?: string;
  withEmail?: boolean;
  withMessage?: boolean;
};

export function LeadForm({
  layout = "row",
  source = "home",
  defaultService = "",
  cta = "Call Me Back",
  withEmail = false,
  withMessage = false,
}: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [service, setService] = useState(defaultService);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const create = useCreateLead();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const digits = phone.replace(/\D/g, "").slice(-10);
    if (name.trim().length < 2) return setError("Please enter your name.");
    if (!/^[6-9]\d{9}$/.test(digits)) return setError("Please enter a valid 10-digit mobile number.");
    if (!service) return setError("Please select a service.");
    create.mutate(
      { name, phone: digits, email, service, message, source },
      { onError: () => setError("Something went wrong. Please call or WhatsApp us.") },
    );
  };

  if (create.isSuccess) {
    return (
      <div className="flex flex-col items-center gap-2 py-4 text-center">
        <CheckCircle2 className="h-10 w-10 text-wa" />
        <p className="text-lg font-semibold text-navy">Thank you, {name.split(" ")[0]}!</p>
        <p className="text-[15px]">Our expert will call you on +91 {phone.replace(/\D/g, "").slice(-10)} within 30 minutes.</p>
      </div>
    );
  }

  const row = layout === "row";
  return (
    <form onSubmit={submit} noValidate>
      <div className={row ? "grid gap-3 md:grid-cols-[1fr_1fr_1.1fr_auto]" : "grid gap-3"}>
        <label className="relative">
          <span className="sr-only">Your name</span>
          <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input aria-label="Your name" className="field !pl-11" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="relative">
          <span className="sr-only">Mobile number</span>
          <span className="pointer-events-none absolute left-4 top-1/2 flex -translate-y-1/2 items-center gap-1.5 text-[15px] text-navy">
            <Phone className="h-4 w-4 text-slate-400" /> +91
          </span>
          <input
            aria-label="Mobile number"
            className="field !pl-[4.6rem]"
            inputMode="numeric"
            maxLength={10}
            placeholder="Mobile Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
          />
        </label>
        {withEmail && (
          <input aria-label="Email" className="field" type="email" placeholder="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)} />
        )}
        <label className="relative">
          <span className="sr-only">Service</span>
          <Briefcase className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <select
            aria-label="Select service"
            className={`field appearance-none !pl-11 !pr-10 ${service ? "" : "!text-slate-400"}`}
            value={service}
            onChange={(e) => setService(e.target.value)}
          >
            <option value="">Select Service</option>
            {CATEGORIES.map((c) => (
              <optgroup key={c.slug} label={c.title}>
                {c.services.map((s) => (
                  <option key={s.name} value={s.name} className="text-navy">
                    {s.name}
                  </option>
                ))}
              </optgroup>
            ))}
            <option value="Not sure / Other" className="text-navy">
              Not sure / Other
            </option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </label>
        {withMessage && (
          <textarea
            aria-label="Message"
            className="field !h-28 py-3"
            placeholder="Tell us a little about your business (optional)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        )}
        <button type="submit" disabled={create.isPending} className="btn-brand h-12 whitespace-nowrap !rounded-lg">
          {create.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {create.isPending ? "Sending..." : cta}
        </button>
      </div>
      <p className={`mt-3 text-[13px] ${error ? "font-medium text-red-600" : "text-slate-500"} ${row ? "text-center" : ""}`}>
        {error ?? "Free call. No spam. We reply within 30 minutes."}
      </p>
    </form>
  );
}
