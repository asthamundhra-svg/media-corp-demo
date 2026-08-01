// Data model for the Mediacorp Relationship Hub.
//
// A real broadcaster like Mediacorp manages many distinct relationship
// types, not just an advertiser sales pipeline: ad sales & agencies,
// content licensing/syndication, talent & production partners,
// event sponsorships, DOOH location partners, and audience/advertiser
// support tickets. Rather than six rigid tables, every relationship type
// (except tickets) is modeled as an "Engagement" with a `type` discriminator
// and a small `properties` bag for type-specific fields - this keeps the
// data model coherent while still letting each domain feel authentic.

export type OrgCategory =
  | "Advertiser"
  | "Agency"
  | "Distributor"
  | "TalentAgency"
  | "ProductionHouse"
  | "Sponsor"
  | "LocationPartner";

export interface Organization {
  id: string;
  name: string;
  category: OrgCategory;
  industry: string;
  hqCity: string;
  website: string;
  agencyOfRecord?: string | null; // for advertisers: their media agency
  createdAt: string;
}

export interface Contact {
  id: string;
  orgId?: string | null;
  name: string;
  title: string;
  email: string;
  phone: string;
  isTalent: boolean;
  talentType?: "Actor" | "Host" | "DJ" | "Presenter" | null;
  createdAt: string;
}

export type EngagementType =
  | "AdCampaign"
  | "ContentLicensing"
  | "TalentBooking"
  | "Sponsorship"
  | "DOOHPartnership";

// Universal kanban bucket - derived from the type-specific `stage` label.
export type EngagementPhase =
  | "Prospecting"
  | "Negotiation"
  | "Confirmed"
  | "Live"
  | "Completed"
  | "Cancelled";

export interface Engagement {
  id: string;
  type: EngagementType;
  name: string;
  orgId: string; // primary counterparty
  secondaryOrgId?: string | null; // e.g. the agency on an ad campaign
  contactId?: string | null; // e.g. the talent on a booking
  stage: string; // type-specific label, e.g. "Avails Sent", "Rights Negotiation"
  phase: EngagementPhase; // kanban bucket derived from stage
  valueSgd: number;
  startDate: string;
  endDate: string;
  properties: Record<string, any>;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export type TicketChannel = "meWATCH" | "Broadcast" | "Advertiser" | "Corporate";
export type TicketStatus = "New" | "Open" | "Pending" | "Resolved" | "Closed";
export type TicketPriority = "Low" | "Medium" | "High" | "Urgent";

export interface Ticket {
  id: string;
  channel: TicketChannel;
  category: string;
  subject: string;
  body: string;
  requesterName: string;
  requesterContact: string; // email/phone/handle
  orgId?: string | null; // linked org, e.g. an advertiser billing dispute
  status: TicketStatus;
  priority: TicketPriority;
  assignee: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
}

export interface Task {
  id: string;
  engagementId?: string | null;
  ticketId?: string | null;
  orgId?: string | null;
  title: string;
  dueDate: string;
  done: boolean;
  owner: string;
  createdAt: string;
}

export interface Note {
  id: string;
  engagementId?: string | null;
  ticketId?: string | null;
  orgId?: string | null;
  contactId?: string | null;
  body: string;
  author: string;
  createdAt: string;
}

export interface ActivityLogEntry {
  id: string;
  actor: "agent" | "user";
  summary: string;
  createdAt: string;
}
