export const LEAD_STATUSES = ["new", "in_progress", "contacted", "converted", "not_interested", "closed"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];
export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  new: "New",
  in_progress: "In progress",
  contacted: "Contacted",
  converted: "Converted",
  not_interested: "Not interested",
  closed: "Closed",
};
