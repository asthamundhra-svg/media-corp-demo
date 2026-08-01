import {
  Organization,
  OrgCategory,
  Contact,
  Engagement,
  EngagementType,
  EngagementPhase,
  Ticket,
  TicketChannel,
  TicketStatus,
  Task,
  Note,
  ActivityLogEntry,
} from "./types";

export interface CrmStore {
  // Organizations
  listOrganizations(params?: { category?: OrgCategory; q?: string }): Promise<Organization[]>;
  getOrganization(id: string): Promise<Organization | null>;
  createOrganization(data: Omit<Organization, "id" | "createdAt">): Promise<Organization>;
  updateOrganization(id: string, data: Partial<Organization>): Promise<Organization | null>;

  // Contacts
  listContacts(params?: { orgId?: string; q?: string; isTalent?: boolean }): Promise<Contact[]>;
  createContact(data: Omit<Contact, "id" | "createdAt">): Promise<Contact>;

  // Engagements (Ad Campaigns, Content Licensing, Talent Bookings, Sponsorships, DOOH Partnerships)
  listEngagements(params?: {
    type?: EngagementType;
    phase?: EngagementPhase;
    orgId?: string;
    q?: string;
  }): Promise<Engagement[]>;
  getEngagement(id: string): Promise<Engagement | null>;
  createEngagement(
    data: Omit<Engagement, "id" | "createdAt" | "updatedAt" | "phase">
  ): Promise<Engagement>;
  updateEngagement(id: string, data: Partial<Engagement>): Promise<Engagement | null>;
  deleteEngagement(id: string): Promise<boolean>;

  // Support tickets (meWATCH, Broadcast, Advertiser, Corporate)
  listTickets(params?: {
    channel?: TicketChannel;
    status?: TicketStatus;
    orgId?: string;
    q?: string;
  }): Promise<Ticket[]>;
  getTicket(id: string): Promise<Ticket | null>;
  createTicket(data: Omit<Ticket, "id" | "createdAt" | "updatedAt">): Promise<Ticket>;
  updateTicket(id: string, data: Partial<Ticket>): Promise<Ticket | null>;

  // Tasks
  listTasks(params?: {
    done?: boolean;
    engagementId?: string;
    ticketId?: string;
    orgId?: string;
  }): Promise<Task[]>;
  createTask(data: Omit<Task, "id" | "createdAt">): Promise<Task>;
  updateTask(id: string, data: Partial<Task>): Promise<Task | null>;

  // Notes
  listNotes(params?: { engagementId?: string; ticketId?: string; orgId?: string }): Promise<Note[]>;
  createNote(data: Omit<Note, "id" | "createdAt">): Promise<Note>;

  // Activity log (for the "what has the agent done" live trace)
  listActivity(limit?: number): Promise<ActivityLogEntry[]>;
  logActivity(entry: Omit<ActivityLogEntry, "id" | "createdAt">): Promise<ActivityLogEntry>;

  // Reset to seed data
  reset(): Promise<void>;
}
