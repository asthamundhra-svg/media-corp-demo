import { ContactChannel, Engagement, EngagementType, OrgCategory, Ticket } from "./types";

// Working RBAC for the demo: a role-switcher (not a real login), but the
// permission matrix below is real and is actually enforced in the UI -
// domains are filtered/hidden, editing controls are disabled, and the
// agent chat is told the active role so it can verbally refuse
// out-of-scope requests. Modeled on how Mediacorp actually organizes this
// work: a single-domain business (Ad Sales, Content Licensing, Talent &
// Production, Sponsorship & Events, DOOH) each has its own manager/rep
// structure, and the Support Desk is organizationally separate from all
// five, staffed by its own supervisor/agents plus a PDPA-driven compliance
// review function that cuts across every domain.

export type Role =
  | "Executive"
  | "AdSalesDirector"
  | "AdSalesRep"
  | "ContentLicensingManager"
  | "TalentPartnerManager"
  | "SponsorshipManager"
  | "DOOHPartnerManager"
  | "SupportSupervisor"
  | "SupportAgent"
  | "ComplianceOfficer"
  | "AdminIT";

export const ROLES: Role[] = [
  "Executive",
  "AdSalesDirector",
  "AdSalesRep",
  "ContentLicensingManager",
  "TalentPartnerManager",
  "SponsorshipManager",
  "DOOHPartnerManager",
  "SupportSupervisor",
  "SupportAgent",
  "ComplianceOfficer",
  "AdminIT",
];

// none: cannot see the domain at all (shown as a restricted state, not hidden)
// read: can see everything in the domain, cannot edit anything
// own:  can see and edit only engagements they personally own
// team: full read/write across the whole domain, team-wide
export type DomainAccess = "none" | "read" | "own" | "team";

// none: cannot see any ticket in this dimension
// assigned: only tickets on this role's assigned contact channels
// all: every contact channel
export type SupportAccess = "none" | "assigned" | "all";

export interface RolePermissions {
  role: Role;
  label: string;
  description: string;
  // the demo "logged in as" identity used for `own`-scoped filtering -
  // matches the `owner` field used across seedData.ts engagements/tasks
  actingAs: string;
  domainAccess: Record<EngagementType, DomainAccess>;
  supportAccess: SupportAccess;
  assignedChannels: ContactChannel[]; // only meaningful when supportAccess === "assigned"
  canApprovePricing: boolean;
  discountApprovalThresholdPct: number; // max discount % this role can approve unescalated
  canDeleteRecords: boolean;
  canEscalateOrReassignTickets: boolean;
  canManageUsers: boolean;
  canViewFinance: boolean;
  canViewPII: boolean; // unlocks the compliance / PDPA personal-data view
}

const NO_DOMAIN_ACCESS: Record<EngagementType, DomainAccess> = {
  AdCampaign: "none",
  ContentLicensing: "none",
  TalentBooking: "none",
  Sponsorship: "none",
  DOOHPartnership: "none",
};

function domainAccess(overrides: Partial<Record<EngagementType, DomainAccess>>): Record<EngagementType, DomainAccess> {
  return { ...NO_DOMAIN_ACCESS, ...overrides };
}

export const ROLE_PERMISSIONS: Record<Role, RolePermissions> = {
  Executive: {
    role: "Executive",
    label: "Executive",
    description: "Read-only visibility across every domain and analytics. Cannot edit any record.",
    actingAs: "Astha Mundhra",
    domainAccess: domainAccess({
      AdCampaign: "read",
      ContentLicensing: "read",
      TalentBooking: "read",
      Sponsorship: "read",
      DOOHPartnership: "read",
    }),
    supportAccess: "all",
    assignedChannels: [],
    canApprovePricing: false,
    discountApprovalThresholdPct: 0,
    canDeleteRecords: false,
    canEscalateOrReassignTickets: false,
    canManageUsers: false,
    canViewFinance: true,
    canViewPII: false,
  },
  AdSalesDirector: {
    role: "AdSalesDirector",
    label: "Ad Sales Director",
    description: "Full Ad Sales domain, team-wide. Can approve pricing and discounts.",
    actingAs: "Astha Mundhra",
    domainAccess: domainAccess({ AdCampaign: "team" }),
    supportAccess: "none",
    assignedChannels: [],
    canApprovePricing: true,
    discountApprovalThresholdPct: 100,
    canDeleteRecords: true,
    canEscalateOrReassignTickets: false,
    canManageUsers: false,
    canViewFinance: true,
    canViewPII: false,
  },
  AdSalesRep: {
    role: "AdSalesRep",
    label: "Ad Sales Rep",
    description: "Ad Sales domain, own accounts only. Cannot see other reps' deals or approve discounts beyond 10%.",
    actingAs: "Astha Mundhra",
    domainAccess: domainAccess({ AdCampaign: "own" }),
    supportAccess: "none",
    assignedChannels: [],
    canApprovePricing: false,
    discountApprovalThresholdPct: 10,
    canDeleteRecords: false,
    canEscalateOrReassignTickets: false,
    canManageUsers: false,
    canViewFinance: false,
    canViewPII: false,
  },
  ContentLicensingManager: {
    role: "ContentLicensingManager",
    label: "Content Licensing Manager",
    description: "Full Content Licensing domain only.",
    actingAs: "Astha Mundhra",
    domainAccess: domainAccess({ ContentLicensing: "team" }),
    supportAccess: "none",
    assignedChannels: [],
    canApprovePricing: true,
    discountApprovalThresholdPct: 100,
    canDeleteRecords: true,
    canEscalateOrReassignTickets: false,
    canManageUsers: false,
    canViewFinance: true,
    canViewPII: false,
  },
  TalentPartnerManager: {
    role: "TalentPartnerManager",
    label: "Talent & Production Partner Manager",
    description: "Full Talent & Production domain only.",
    actingAs: "Astha Mundhra",
    domainAccess: domainAccess({ TalentBooking: "team" }),
    supportAccess: "none",
    assignedChannels: [],
    canApprovePricing: true,
    discountApprovalThresholdPct: 100,
    canDeleteRecords: true,
    canEscalateOrReassignTickets: false,
    canManageUsers: false,
    canViewFinance: true,
    canViewPII: false,
  },
  SponsorshipManager: {
    role: "SponsorshipManager",
    label: "Sponsorship & Events Manager",
    description: "Full Sponsorship & Events domain only.",
    actingAs: "Astha Mundhra",
    domainAccess: domainAccess({ Sponsorship: "team" }),
    supportAccess: "none",
    assignedChannels: [],
    canApprovePricing: true,
    discountApprovalThresholdPct: 100,
    canDeleteRecords: true,
    canEscalateOrReassignTickets: false,
    canManageUsers: false,
    canViewFinance: true,
    canViewPII: false,
  },
  DOOHPartnerManager: {
    role: "DOOHPartnerManager",
    label: "DOOH Partner Manager",
    description: "Full DOOH Partnerships domain only.",
    actingAs: "Astha Mundhra",
    domainAccess: domainAccess({ DOOHPartnership: "team" }),
    supportAccess: "none",
    assignedChannels: [],
    canApprovePricing: true,
    discountApprovalThresholdPct: 100,
    canDeleteRecords: true,
    canEscalateOrReassignTickets: false,
    canManageUsers: false,
    canViewFinance: true,
    canViewPII: false,
  },
  SupportSupervisor: {
    role: "SupportSupervisor",
    label: "Support Supervisor",
    description: "Full Support Desk, every contact channel. Can escalate and reassign tickets.",
    actingAs: "Astha Mundhra",
    domainAccess: NO_DOMAIN_ACCESS,
    supportAccess: "all",
    assignedChannels: [],
    canApprovePricing: false,
    discountApprovalThresholdPct: 0,
    canDeleteRecords: false,
    canEscalateOrReassignTickets: true,
    canManageUsers: false,
    canViewFinance: false,
    canViewPII: false,
  },
  SupportAgent: {
    role: "SupportAgent",
    label: "Support Agent",
    description: "Support Desk, scoped to assigned contact channels only (WhatsApp Business, Instagram DM). Cannot delete or escalate.",
    actingAs: "Astha Mundhra",
    domainAccess: NO_DOMAIN_ACCESS,
    supportAccess: "assigned",
    assignedChannels: ["WhatsApp Business", "Instagram DM"],
    canApprovePricing: false,
    discountApprovalThresholdPct: 0,
    canDeleteRecords: false,
    canEscalateOrReassignTickets: false,
    canManageUsers: false,
    canViewFinance: false,
    canViewPII: false,
  },
  ComplianceOfficer: {
    role: "ComplianceOfficer",
    label: "Compliance & Legal / PDPA Officer",
    description: "Can view ticket contents containing personal data across all domains for compliance review. Cannot edit business records.",
    actingAs: "Astha Mundhra",
    domainAccess: domainAccess({
      AdCampaign: "read",
      ContentLicensing: "read",
      TalentBooking: "read",
      Sponsorship: "read",
      DOOHPartnership: "read",
    }),
    supportAccess: "all",
    assignedChannels: [],
    canApprovePricing: false,
    discountApprovalThresholdPct: 0,
    canDeleteRecords: false,
    canEscalateOrReassignTickets: false,
    canManageUsers: false,
    canViewFinance: false,
    canViewPII: true,
  },
  AdminIT: {
    role: "AdminIT",
    label: "Admin / IT",
    description: "Full system access, including user and role management.",
    actingAs: "Astha Mundhra",
    domainAccess: domainAccess({
      AdCampaign: "team",
      ContentLicensing: "team",
      TalentBooking: "team",
      Sponsorship: "team",
      DOOHPartnership: "team",
    }),
    supportAccess: "all",
    assignedChannels: [],
    canApprovePricing: true,
    discountApprovalThresholdPct: 100,
    canDeleteRecords: true,
    canEscalateOrReassignTickets: true,
    canManageUsers: true,
    canViewFinance: true,
    canViewPII: true,
  },
};

export function getPermissions(role: Role): RolePermissions {
  return ROLE_PERMISSIONS[role] ?? ROLE_PERMISSIONS.Executive;
}

// Which org categories belong to which engagement domain - used to scope
// the Organizations tab per role without inventing a separate ownership
// model for organizations themselves.
export const ORG_CATEGORY_TO_DOMAIN: Record<OrgCategory, EngagementType> = {
  Advertiser: "AdCampaign",
  Agency: "AdCampaign",
  Distributor: "ContentLicensing",
  TalentAgency: "TalentBooking",
  ProductionHouse: "TalentBooking",
  Sponsor: "Sponsorship",
  LocationPartner: "DOOHPartnership",
};

export function canViewOrgCategory(perm: RolePermissions, category: OrgCategory): boolean {
  const domain = ORG_CATEGORY_TO_DOMAIN[category];
  return perm.domainAccess[domain] !== "none";
}

export function canViewEngagement(perm: RolePermissions, engagement: Engagement): boolean {
  const access = perm.domainAccess[engagement.type];
  if (access === "none") return false;
  if (access === "own") return engagement.owner === perm.actingAs;
  return true; // "read" or "team"
}

export function canEditEngagement(perm: RolePermissions, engagement: Engagement): boolean {
  const access = perm.domainAccess[engagement.type];
  if (access === "team") return true;
  if (access === "own") return engagement.owner === perm.actingAs;
  return false; // "read" or "none"
}

export function canCreateInDomain(perm: RolePermissions, type: EngagementType): boolean {
  const access = perm.domainAccess[type];
  return access === "team" || access === "own";
}

export function canViewTicket(perm: RolePermissions, ticket: Ticket): boolean {
  if (perm.supportAccess === "all") return true;
  if (perm.supportAccess === "assigned") {
    return perm.assignedChannels.includes(ticket.contactChannel ?? "Web Help Centre");
  }
  return false;
}

export function roleSystemPromptBlock(perm: RolePermissions): string {
  const domainLines = (Object.keys(perm.domainAccess) as EngagementType[])
    .map((t) => `${t}: ${perm.domainAccess[t]}`)
    .join(", ");
  return [
    `The current user is acting under the role "${perm.label}" (${perm.description}).`,
    `Their exact permissions - domain access per engagement type (none/read/own/team): ${domainLines}.`,
    `Support desk access: ${perm.supportAccess}${
      perm.supportAccess === "assigned" ? ` (assigned channels: ${perm.assignedChannels.join(", ")})` : ""
    }.`,
    `Can approve pricing/discounts: ${perm.canApprovePricing ? `yes, up to ${perm.discountApprovalThresholdPct}% without further escalation` : "no"}.`,
    `Can delete records: ${perm.canDeleteRecords ? "yes" : "no"}. Can manage users: ${perm.canManageUsers ? "yes" : "no"}. Can view finance figures: ${perm.canViewFinance ? "yes" : "no"}. Can view personal data (PII) for compliance: ${perm.canViewPII ? "yes" : "no"}.`,
    `IMPORTANT: Respect these permissions in every reply. If asked to view or act on a domain marked "none" for this role, or to edit anything in a domain marked "read", or to approve a discount beyond the threshold, or to delete a record without permission, politely refuse and name the specific role that would be needed - for example: "As an Ad Sales Rep, I can't modify Content Licensing engagements - that needs the Content Licensing Manager role." You can still discuss and call tools for anything within this role's actual access.`,
  ].join("\n");
}
