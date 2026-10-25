import type { LeadStatus as Status } from "../../../api/lib/lead-status";

export const STATUS_STYLE: Record<Status, { pill: string; dot: string; solid: string }> = {
  new: { pill: "bg-orange-50 text-orange-700 ring-orange-200", dot: "bg-orange-500", solid: "bg-[#fdaf4b]" },
  in_progress: { pill: "bg-sky-50 text-sky-700 ring-sky-200", dot: "bg-sky-500", solid: "bg-[#48abf7]" },
  contacted: { pill: "bg-blue-50 text-blue-700 ring-blue-200", dot: "bg-blue-600", solid: "bg-[#1572e8]" },
  converted: { pill: "bg-green-50 text-green-700 ring-green-200", dot: "bg-green-500", solid: "bg-[#59d05d]" },
  not_interested: { pill: "bg-red-50 text-red-700 ring-red-200", dot: "bg-red-500", solid: "bg-[#f3545d]" },
  closed: { pill: "bg-slate-100 text-slate-600 ring-slate-200", dot: "bg-slate-400", solid: "bg-slate-500" },
};
