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
  AdCampaign: "Ad Sales",
  ContentLicensing: "Content Licensing",
  TalentBooking: "Talent & Production",
  Sponsorship: "Sponsorship & Events",
  DOOHPartnership: "DOOH Partnerships",
};

export const ENGAGEMENT_TYPE_SHORT_LABELS: Record<EngagementType, string> = {
  AdCampaign: "Ad Sales",
  ContentLicensing: "Content Licensing",
  TalentBooking: "Talent",
  Sponsorship: "Sponsorship",
  DOOHPartnership: "DOOH",
};

// A one-line description of how each domain actually works, grounded in the
// real tooling/vocabulary of that part of the media business - shown as
// context in the Pipeline tab so each board reads as its own workflow
// rather than a reskinned generic sales funnel.
export const ENGAGEMENT_DOMAIN_BLURB: Record<EngagementType, string> = {
  AdCampaign:
    "Ad-ops/traffic vocabulary, modeled on how tools like Mediaocean (Prisma/Spectra), WideOrbit, and Boostr run avails, RFPs, insertion orders, and make-goods across TV, radio, digital, social, and DOOH as one bundle.",
  ContentLicensing:
    "Rights, territory, and window negotiation for content Mediacorp licenses IN for meWATCH and syndicates OUT to regional partners (Astro, GMA, Viu, CJ ENM).",
  TalentBooking:
    "Booking, exclusivity, and production lifecycle for on-air talent and independent production partners - now under Mediacorp's unified Chief Content & Talent Officer function.",
  Sponsorship:
    "Package, activation, and renewal lifecycle for marquee events run through Mediacorp VizPro Entertainment, Mediacorp's live-events arm - distinct from a straight ad spot.",
  DOOHPartnership:
    "Site, programmatic vs. direct terms, and creative install lifecycle for Mediacorp's out-of-home network, run in partnership with Vistar Media and Broadsign across CapitaLand, Frasers Property, SMRT, and ComfortDelGro sites.",
};

// Stage vocabulary per engagement type - each domain runs its OWN lifecycle,
// not a shared generic "lead -> demo -> proposal -> closed-won" funnel. Six
// stages per type so each domain's Kanban board still fits the existing UI.
export const STAGES_BY_TYPE: Record<EngagementType, string[]> = {
  AdCampaign: [
    "Avails Shared",
    "RFP / Proposal Sent",
    "Negotiation",
    "Insertion Order Signed",
    "Live / Airing",
    "Make-Good or Renewal Review",
  ],
  ContentLicensing: [
    "Rights Inquiry",
    "Terms & Territory Negotiation",
    "Contract Drafting",
    "Content Delivery & QC",
    "Live on Platform",
    "Renewal / Window Review",
  ],
  TalentBooking: [
    "Booking Request",
    "Terms & Exclusivity Negotiation",
    "Contract Signed",
    "In Production",
    "Aired / Delivered",
    "Post-Production Review",
  ],
  Sponsorship: [
    "Package Pitch",
    "Proposal & Pricing",
    "Contract Signed",
    "Activation / Event Live",
    "Post-Campaign Report",
    "Renewal Review",
  ],
  DOOHPartnership: [
    "Site Proposal",
    "Programmatic / Direct Terms",
    "Contract Signed",
    "Creative Installation",
    "Live / Airing",
    "Performance Review & Renewal",
  ],
};

// `phase` is a coarse, cross-domain rollup derived from each domain's own
// stage - useful for executive/aggregate views (pipeline_summary, the
// Organizations detail panel) without forcing every domain onto one board.
const STAGE_TO_PHASE: Record<string, EngagementPhase> = {
  // Prospecting - the earliest touch in any domain
  "Avails Shared": "Prospecting",
  "Rights Inquiry": "Prospecting",
  "Booking Request": "Prospecting",
  "Package Pitch": "Prospecting",
  "Site Proposal": "Prospecting",

  // Negotiation - terms/pricing/rights still being worked out
  "RFP / Proposal Sent": "Negotiation",
  "Terms & Territory Negotiation": "Negotiation",
  "Terms & Exclusivity Negotiation": "Negotiation",
  "Proposal & Pricing": "Negotiation",
  "Programmatic / Direct Terms": "Negotiation",
  Negotiation: "Negotiation",
  "Contract Drafting": "Negotiation",

  // Confirmed - contract/IO signed, in setup/prep
  "Insertion Order Signed": "Confirmed",
  "Contract Signed": "Confirmed",
  "Content Delivery & QC": "Confirmed",
  "Creative Installation": "Confirmed",

  // Live - actively running
  "In Production": "Live",
  "Activation / Event Live": "Live",
  "Live / Airing": "Live",
  "Live on Platform": "Live",
  "Aired / Delivered": "Live",

  // Completed - post-run review / renewal decision
  "Make-Good or Renewal Review": "Completed",
  "Renewal / Window Review": "Completed",
  "Post-Production Review": "Completed",
  "Post-Campaign Report": "Completed",
  "Renewal Review": "Completed",
  "Performance Review & Renewal": "Completed",
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
