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
import { CrmStore } from "./storeTypes";
import { phaseForStage } from "./engagementMeta";
import {
  seedOrganizations,
  seedContacts,
  seedEngagements,
  seedTickets,
  seedTasks,
  seedNotes,
} from "./seedData";

let counter = 1000;
const nextId = (prefix: string) => `${prefix}_${counter++}`;

export class MemoryStore implements CrmStore {
  organizations: Organization[] = [];
  contacts: Contact[] = [];
  engagements: Engagement[] = [];
  tickets: Ticket[] = [];
  tasks: Task[] = [];
  notes: Note[] = [];
  activity: ActivityLogEntry[] = [];

  constructor() {
    this.reset();
  }

  async reset() {
    this.organizations = seedOrganizations.map((c) => ({ ...c }));
    this.contacts = seedContacts.map((c) => ({ ...c }));
    this.engagements = seedEngagements.map((e) => ({ ...e }));
    this.tickets = seedTickets.map((t) => ({ ...t }));
    this.tasks = seedTasks.map((t) => ({ ...t }));
    this.notes = seedNotes.map((n) => ({ ...n }));
    this.activity = [];
  }

  // ---------- Organizations ----------
  async listOrganizations(params?: { category?: OrgCategory; q?: string }) {
    let rows = this.organizations;
    if (params?.category) rows = rows.filter((o) => o.category === params.category);
    if (params?.q) {
      const q = params.q.toLowerCase();
      rows = rows.filter(
        (o) =>
          o.name.toLowerCase().includes(q) ||
          o.industry.toLowerCase().includes(q) ||
          (o.agencyOfRecord || "").toLowerCase().includes(q)
      );
    }
    return rows.slice().sort((a, b) => a.name.localeCompare(b.name));
  }

  async getOrganization(id: string) {
    return this.organizations.find((o) => o.id === id) || null;
  }

  async createOrganization(data: Omit<Organization, "id" | "createdAt">) {
    const row: Organization = { ...data, id: nextId("co"), createdAt: new Date().toISOString() };
    this.organizations.push(row);
    return row;
  }

  async updateOrganization(id: string, data: Partial<Organization>) {
    const idx = this.organizations.findIndex((o) => o.id === id);
    if (idx === -1) return null;
    this.organizations[idx] = { ...this.organizations[idx], ...data };
    return this.organizations[idx];
  }

  // ---------- Contacts ----------
  async listContacts(params?: { orgId?: string; q?: string; isTalent?: boolean }) {
    let rows = this.contacts;
    if (params?.orgId) rows = rows.filter((c) => c.orgId === params.orgId);
    if (params?.isTalent !== undefined) rows = rows.filter((c) => c.isTalent === params.isTalent);
    if (params?.q) {
      const q = params.q.toLowerCase();
      rows = rows.filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
    }
    return rows;
  }

  async createContact(data: Omit<Contact, "id" | "createdAt">) {
    const row: Contact = { ...data, id: nextId("ct"), createdAt: new Date().toISOString() };
    this.contacts.push(row);
    return row;
  }

  // ---------- Engagements ----------
  async listEngagements(params?: {
    type?: EngagementType;
    phase?: EngagementPhase;
    orgId?: string;
    q?: string;
  }) {
    let rows = this.engagements;
    if (params?.type) rows = rows.filter((e) => e.type === params.type);
    if (params?.phase) rows = rows.filter((e) => e.phase === params.phase);
    if (params?.orgId)
      rows = rows.filter((e) => e.orgId === params.orgId || e.secondaryOrgId === params.orgId);
    if (params?.q) {
      const q = params.q.toLowerCase();
      rows = rows.filter(
        (e) => e.name.toLowerCase().includes(q) || JSON.stringify(e.properties).toLowerCase().includes(q)
      );
    }
    return rows.slice().sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  }

  async getEngagement(id: string) {
    return this.engagements.find((e) => e.id === id) || null;
  }

  async createEngagement(data: Omit<Engagement, "id" | "createdAt" | "updatedAt" | "phase">) {
    const now = new Date().toISOString();
    const row: Engagement = {
      ...data,
      phase: phaseForStage(data.stage),
      id: nextId("eg"),
      createdAt: now,
      updatedAt: now,
    };
    this.engagements.push(row);
    return row;
  }

  async updateEngagement(id: string, data: Partial<Engagement>) {
    const idx = this.engagements.findIndex((e) => e.id === id);
    if (idx === -1) return null;
    const merged = { ...this.engagements[idx], ...data, updatedAt: new Date().toISOString() };
    merged.phase = phaseForStage(merged.stage);
    this.engagements[idx] = merged;
    return merged;
  }

  async deleteEngagement(id: string) {
    const before = this.engagements.length;
    this.engagements = this.engagements.filter((e) => e.id !== id);
    return this.engagements.length < before;
  }

  // ---------- Tickets ----------
  async listTickets(params?: { channel?: TicketChannel; status?: TicketStatus; orgId?: string; q?: string }) {
    let rows = this.tickets;
    if (params?.channel) rows = rows.filter((t) => t.channel === params.channel);
    if (params?.status) rows = rows.filter((t) => t.status === params.status);
    if (params?.orgId) rows = rows.filter((t) => t.orgId === params.orgId);
    if (params?.q) {
      const q = params.q.toLowerCase();
      rows = rows.filter(
        (t) =>
          t.subject.toLowerCase().includes(q) ||
          t.body.toLowerCase().includes(q) ||
          t.requesterName.toLowerCase().includes(q)
      );
    }
    return rows.slice().sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  }

  async getTicket(id: string) {
    return this.tickets.find((t) => t.id === id) || null;
  }

  async createTicket(data: Omit<Ticket, "id" | "createdAt" | "updatedAt">) {
    const now = new Date().toISOString();
    const row: Ticket = { ...data, id: nextId("tkt"), createdAt: now, updatedAt: now };
    this.tickets.push(row);
    return row;
  }

  async updateTicket(id: string, data: Partial<Ticket>) {
    const idx = this.tickets.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    const merged = { ...this.tickets[idx], ...data, updatedAt: new Date().toISOString() };
    if (data.status === "Resolved" || data.status === "Closed") {
      merged.resolvedAt = merged.resolvedAt || new Date().toISOString();
    }
    this.tickets[idx] = merged;
    return merged;
  }

  // ---------- Tasks ----------
  async listTasks(params?: { done?: boolean; engagementId?: string; ticketId?: string; orgId?: string }) {
    let rows = this.tasks;
    if (params?.done !== undefined) rows = rows.filter((t) => t.done === params.done);
    if (params?.engagementId) rows = rows.filter((t) => t.engagementId === params.engagementId);
    if (params?.ticketId) rows = rows.filter((t) => t.ticketId === params.ticketId);
    if (params?.orgId) rows = rows.filter((t) => t.orgId === params.orgId);
    return rows.slice().sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1));
  }

  async createTask(data: Omit<Task, "id" | "createdAt">) {
    const row: Task = { ...data, id: nextId("tsk"), createdAt: new Date().toISOString() };
    this.tasks.push(row);
    return row;
  }

  async updateTask(id: string, data: Partial<Task>) {
    const idx = this.tasks.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    this.tasks[idx] = { ...this.tasks[idx], ...data };
    return this.tasks[idx];
  }

  // ---------- Notes ----------
  async listNotes(params?: { engagementId?: string; ticketId?: string; orgId?: string }) {
    let rows = this.notes;
    if (params?.engagementId) rows = rows.filter((n) => n.engagementId === params.engagementId);
    if (params?.ticketId) rows = rows.filter((n) => n.ticketId === params.ticketId);
    if (params?.orgId) rows = rows.filter((n) => n.orgId === params.orgId);
    return rows.slice().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  async createNote(data: Omit<Note, "id" | "createdAt">) {
    const row: Note = { ...data, id: nextId("nt"), createdAt: new Date().toISOString() };
    this.notes.push(row);
    return row;
  }

  // ---------- Activity ----------
  async listActivity(limit = 50) {
    return this.activity.slice(-limit).reverse();
  }

  async logActivity(entry: Omit<ActivityLogEntry, "id" | "createdAt">) {
    const row: ActivityLogEntry = { ...entry, id: nextId("act"), createdAt: new Date().toISOString() };
    this.activity.push(row);
    return row;
  }
}
