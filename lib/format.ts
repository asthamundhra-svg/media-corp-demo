export function fmtSgd(n: number) {
  return new Intl.NumberFormat("en-SG", { style: "currency", currency: "SGD", maximumFractionDigits: 0 }).format(n);
}

export function fmtDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-SG", { day: "2-digit", month: "short", year: "numeric" }).format(
      new Date(iso)
    );
  } catch {
    return iso;
  }
}

export function fmtDateTime(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-SG", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

// Ticket status/priority palettes - strictly blue/black/green, no red/amber.
// Urgency is signalled with the brightest blue + bold weight, not an alarm color.
export const TICKET_STATUS_COLORS: Record<string, string> = {
  New: "#64748b",
  Open: "#3b82f6",
  Pending: "#0ea5e9",
  Resolved: "#10b981",
  Closed: "#059669",
};

export const TICKET_PRIORITY_COLORS: Record<string, string> = {
  Low: "#64748b",
  Medium: "#3b82f6",
  High: "#22d3ee",
  Urgent: "#60a5fa",
};

export const ORG_CATEGORY_LABELS: Record<string, string> = {
  Advertiser: "Advertiser",
  Agency: "Media Agency",
  Distributor: "Content Distributor",
  TalentAgency: "Talent Agency",
  ProductionHouse: "Production House",
  Sponsor: "Event Sponsor",
  LocationPartner: "DOOH Location Partner",
};
