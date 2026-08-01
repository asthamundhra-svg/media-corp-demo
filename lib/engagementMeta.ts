import { EngagementPhase, EngagementType, TicketChannel } from "./types";

export const MEDIACORP_PROPERTIES = [
  "Channel 5",
  "Channel 8",
  "Channel U",
  "Suria",
  "Vasantham",
  "CNA",
  "meWATCH",
  "meLISTEN",
  "Class 95FM",
  "Gold 905FM",
  "Capital 958FM",
  "YES 933FM",
  "Love 972FM",
  "CNA938",
  "DOOH Network",
  "Branded Content Studio",
];

export const ENGAGEMENT_TYPE_LABELS: Record<EngagementType, string> = {
  AdCampaign: "Ad Campaign",
  ContentLicensing: "Content Licensing",
  TalentBooking: "Talent Booking",
  Sponsorship: "Sponsorship & Events",
  DOOHPartnership: "DOOH Partnership",
};

// Stage vocabulary per engagement type - mirrors how ad-ops (WideOrbit /
// Boostr-style avails & makegoods), content licensing, talent booking,
// sponsorship, and out-of-home partnerships are actually described.
export const STAGES_BY_TYPE: Record<EngagementType, string[]> = {
  AdCampaign: ["Prospecting", "Avails Sent", "Negotiation", "Booked", "Live", "Completed", "Cancelled"],
  ContentLicensing: ["Scouting", "Rights Negotiation", "Contract Drafting", "Signed", "Active", "Expired"],
  TalentBooking: ["Inquiry", "Fee Negotiation", "Contract Sent", "Confirmed", "Completed", "Cancelled"],
  Sponsorship: ["Prospecting", "Proposal Sent", "Negotiation", "Confirmed", "Live", "Completed"],
  DOOHPartnership: [
    "Prospecting",
    "Terms Negotiation",
    "Contract Signed",
    "Active",
    "Renewal Due",
    "Terminated",
  ],
};

const STAGE_TO_PHASE: Record<string, EngagementPhase> = {
  Prospecting: "Prospecting",
  Scouting: "Prospecting",
  Inquiry: "Prospecting",

  "Avails Sent": "Negotiation",
  "Rights Negotiation": "Negotiation",
  "Fee Negotiation": "Negotiation",
  "Proposal Sent": "Negotiation",
  "Terms Negotiation": "Negotiation",
  Negotiation: "Negotiation",
  "Contract Drafting": "Negotiation",
  "Contract Sent": "Negotiation",

  Booked: "Confirmed",
  Signed: "Confirmed",
  Confirmed: "Confirmed",
  "Contract Signed": "Confirmed",

  Live: "Live",
  Active: "Live",
  "Renewal Due": "Live",

  Completed: "Completed",
  Expired: "Completed",

  Cancelled: "Cancelled",
  Terminated: "Cancelled",
};

export function phaseForStage(stage: string): EngagementPhase {
  return STAGE_TO_PHASE[stage] ?? "Prospecting";
}

export const PHASES: EngagementPhase[] = ["Prospecting", "Negotiation", "Confirmed", "Live", "Completed", "Cancelled"];

export const PHASE_COLORS: Record<EngagementPhase, string> = {
  Prospecting: "#64748b", // slate
  Negotiation: "#3b82f6", // blue
  Confirmed: "#0ea5e9", // sky
  Live: "#10b981", // green
  Completed: "#059669", // deeper green
  Cancelled: "#475569", // muted slate (no red)
};

export const TICKET_CHANNELS: TicketChannel[] = ["meWATCH", "Broadcast", "Advertiser", "Corporate"];

export const TICKET_CATEGORIES: Record<TicketChannel, string[]> = {
  meWATCH: [
    "Playback / buffering",
    "Login & account",
    "Subscription billing",
    "Geo-restriction",
    "Subtitle sync",
    "Casting (Chromecast/AirPlay)",
  ],
  Broadcast: [
    "Signal reception",
    "Subtitle/caption error",
    "Content complaint (IMDA)",
    "Song ID request",
    "Contest entry",
    "Schedule change query",
  ],
  Advertiser: [
    "Billing discrepancy",
    "Make-good request",
    "Creative rejection",
    "Invoice dispute",
    "Rate card negotiation",
  ],
  Corporate: [
    "Media inquiry",
    "Content licensing request",
    "Copyright / DMCA takedown",
    "Talent or vendor inquiry",
  ],
};
