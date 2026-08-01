import { Pool } from "pg";
import fs from "fs";
import path from "path";
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
const nextId = (prefix: string) => `${prefix}_${Date.now().toString(36)}${(counter++).toString(36)}`;

function orgFromRow(r: any): Organization {
  return {
    id: r.id,
    name: r.name,
    category: r.category,
    industry: r.industry,
    hqCity: r.hq_city,
    website: r.website,
    agencyOfRecord: r.agency_of_record,
    createdAt: r.created_at?.toISOString?.() ?? r.created_at,
  };
}

function contactFromRow(r: any): Contact {
  return {
    id: r.id,
    orgId: r.org_id,
    name: r.name,
    title: r.title,
    email: r.email,
    phone: r.phone,
    isTalent: r.is_talent,
    talentType: r.talent_type,
    createdAt: r.created_at?.toISOString?.() ?? r.created_at,
  };
}

function engagementFromRow(r: any): Engagement {
  return {
    id: r.id,
    type: r.type,
    name: r.name,
    orgId: r.org_id,
    secondaryOrgId: r.secondary_org_id,
    contactId: r.contact_id,
    stage: r.stage,
    phase: r.phase,
    valueSgd: Number(r.value_sgd),
    startDate: r.start_date?.toISOString?.() ?? r.start_date,
    endDate: r.end_date?.toISOString?.() ?? r.end_date,
    properties: r.properties ?? {},
    owner: r.owner,
    createdAt: r.created_at?.toISOString?.() ?? r.created_at,
    updatedAt: r.updated_at?.toISOString?.() ?? r.updated_at,
  };
}

function ticketFromRow(r: any): Ticket {
  return {
    id: r.id,
    channel: r.channel,
    category: r.category,
    subject: r.subject,
    body: r.body,
    requesterName: r.requester_name,
    requesterContact: r.requester_contact,
    orgId: r.org_id,
    status: r.status,
    priority: r.priority,
    assignee: r.assignee,
    createdAt: r.created_at?.toISOString?.() ?? r.created_at,
    updatedAt: r.updated_at?.toISOString?.() ?? r.updated_at,
    resolvedAt: r.resolved_at?.toISOString?.() ?? r.resolved_at ?? null,
  };
}

function taskFromRow(r: any): Task {
  return {
    id: r.id,
    engagementId: r.engagement_id,
    ticketId: r.ticket_id,
    orgId: r.org_id,
    title: r.title,
    dueDate: r.due_date?.toISOString?.() ?? r.due_date,
    done: r.done,
    owner: r.owner,
    createdAt: r.created_at?.toISOString?.() ?? r.created_at,
  };
}

function noteFromRow(r: any): Note {
  return {
    id: r.id,
    engagementId: r.engagement_id,
    ticketId: r.ticket_id,
    orgId: r.org_id,
    contactId: r.contact_id,
    body: r.body,
    author: r.author,
    createdAt: r.created_at?.toISOString?.() ?? r.created_at,
  };
}

function activityFromRow(r: any): ActivityLogEntry {
  return {
    id: r.id,
    actor: r.actor,
    summary: r.summary,
    createdAt: r.created_at?.toISOString?.() ?? r.created_at,
  };
}

export class PgStore implements CrmStore {
  pool: Pool;
  private ready: Promise<void>;

  constructor(connectionString: string) {
    this.pool = new Pool({
      connectionString,
      ssl: connectionString.includes("localhost") ? undefined : { rejectUnauthorized: false },
    });
    this.ready = this.init();
  }

  private async init() {
    const schemaPath = path.join(process.cwd(), "lib", "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf-8");
    await this.pool.query(schema);

    const { rows } = await this.pool.query("SELECT COUNT(*)::int AS count FROM organizations");
    if (rows[0].count === 0) {
      await this.reset();
    }
  }

  private async whenReady() {
    await this.ready;
  }

  async reset() {
    const c = this.pool;
    await c.query(
      "TRUNCATE activity_log, notes, tasks, tickets, engagements, contacts, organizations RESTART IDENTITY CASCADE"
    );
    for (const o of seedOrganizations) {
      await c.query(
        `INSERT INTO organizations (id, name, category, industry, hq_city, website, agency_of_record, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [o.id, o.name, o.category, o.industry, o.hqCity, o.website, o.agencyOfRecord ?? null, o.createdAt]
      );
    }
    for (const ct of seedContacts) {
      await c.query(
        `INSERT INTO contacts (id, org_id, name, title, email, phone, is_talent, talent_type, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          ct.id, ct.orgId ?? null, ct.name, ct.title, ct.email, ct.phone,
          ct.isTalent, ct.talentType ?? null, ct.createdAt,
        ]
      );
    }
    for (const e of seedEngagements) {
      await c.query(
        `INSERT INTO engagements (id, type, name, org_id, secondary_org_id, contact_id, stage, phase, value_sgd, start_date, end_date, properties, owner, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
        [
          e.id, e.type, e.name, e.orgId, e.secondaryOrgId ?? null, e.contactId ?? null, e.stage, e.phase,
          e.valueSgd, e.startDate, e.endDate, JSON.stringify(e.properties ?? {}), e.owner, e.createdAt, e.updatedAt,
        ]
      );
    }
    for (const t of seedTickets) {
      await c.query(
        `INSERT INTO tickets (id, channel, category, subject, body, requester_name, requester_contact, org_id, status, priority, assignee, created_at, updated_at, resolved_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
        [
          t.id, t.channel, t.category, t.subject, t.body, t.requesterName, t.requesterContact,
          t.orgId ?? null, t.status, t.priority, t.assignee, t.createdAt, t.updatedAt, t.resolvedAt ?? null,
        ]
      );
    }
    for (const t of seedTasks) {
      await c.query(
        `INSERT INTO tasks (id, engagement_id, ticket_id, org_id, title, due_date, done, owner, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          t.id, t.engagementId ?? null, t.ticketId ?? null, t.orgId ?? null, t.title, t.dueDate,
          t.done, t.owner, t.createdAt,
        ]
      );
    }
    for (const n of seedNotes) {
      await c.query(
        `INSERT INTO notes (id, engagement_id, ticket_id, org_id, contact_id, body, author, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          n.id, n.engagementId ?? null, n.ticketId ?? null, n.orgId ?? null, n.contactId ?? null,
          n.body, n.author, n.createdAt,
        ]
      );
    }
  }

  // ---------- Organizations ----------
  async listOrganizations(params?: { category?: OrgCategory; q?: string }) {
    await this.whenReady();
    let sql = "SELECT * FROM organizations WHERE 1=1";
    const args: any[] = [];
    if (params?.category) {
      args.push(params.category);
      sql += ` AND category = $${args.length}`;
    }
    if (params?.q) {
      args.push(`%${params.q.toLowerCase()}%`);
      sql += ` AND (lower(name) LIKE $${args.length} OR lower(industry) LIKE $${args.length} OR lower(coalesce(agency_of_record,'')) LIKE $${args.length})`;
    }
    sql += " ORDER BY name ASC";
    const { rows } = await this.pool.query(sql, args);
    return rows.map(orgFromRow);
  }

  async getOrganization(id: string) {
    await this.whenReady();
    const { rows } = await this.pool.query("SELECT * FROM organizations WHERE id = $1", [id]);
    return rows[0] ? orgFromRow(rows[0]) : null;
  }

  async createOrganization(data: Omit<Organization, "id" | "createdAt">) {
    await this.whenReady();
    const id = nextId("co");
    const createdAt = new Date().toISOString();
    await this.pool.query(
      `INSERT INTO organizations (id, name, category, industry, hq_city, website, agency_of_record, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [id, data.name, data.category, data.industry, data.hqCity, data.website, data.agencyOfRecord ?? null, createdAt]
    );
    return { ...data, id, createdAt } as Organization;
  }

  async updateOrganization(id: string, data: Partial<Organization>) {
    await this.whenReady();
    const existing = await this.getOrganization(id);
    if (!existing) return null;
    const merged = { ...existing, ...data };
    await this.pool.query(
      `UPDATE organizations SET name=$2, category=$3, industry=$4, hq_city=$5, website=$6, agency_of_record=$7 WHERE id=$1`,
      [id, merged.name, merged.category, merged.industry, merged.hqCity, merged.website, merged.agencyOfRecord ?? null]
    );
    return merged;
  }

  // ---------- Contacts ----------
  async listContacts(params?: { orgId?: string; q?: string; isTalent?: boolean }) {
    await this.whenReady();
    let sql = "SELECT * FROM contacts WHERE 1=1";
    const args: any[] = [];
    if (params?.orgId) {
      args.push(params.orgId);
      sql += ` AND org_id = $${args.length}`;
    }
    if (params?.isTalent !== undefined) {
      args.push(params.isTalent);
      sql += ` AND is_talent = $${args.length}`;
    }
    if (params?.q) {
      args.push(`%${params.q.toLowerCase()}%`);
      sql += ` AND (lower(name) LIKE $${args.length} OR lower(email) LIKE $${args.length})`;
    }
    const { rows } = await this.pool.query(sql, args);
    return rows.map(contactFromRow);
  }

  async createContact(data: Omit<Contact, "id" | "createdAt">) {
    await this.whenReady();
    const id = nextId("ct");
    const createdAt = new Date().toISOString();
    await this.pool.query(
      `INSERT INTO contacts (id, org_id, name, title, email, phone, is_talent, talent_type, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [id, data.orgId ?? null, data.name, data.title, data.email, data.phone, data.isTalent ?? false, data.talentType ?? null, createdAt]
    );
    return { ...data, id, createdAt } as Contact;
  }

  // ---------- Engagements ----------
  async listEngagements(params?: { type?: EngagementType; phase?: EngagementPhase; orgId?: string; q?: string }) {
    await this.whenReady();
    let sql = "SELECT * FROM engagements WHERE 1=1";
    const args: any[] = [];
    if (params?.type) {
      args.push(params.type);
      sql += ` AND type = $${args.length}`;
    }
    if (params?.phase) {
      args.push(params.phase);
      sql += ` AND phase = $${args.length}`;
    }
    if (params?.orgId) {
      args.push(params.orgId);
      sql += ` AND (org_id = $${args.length} OR secondary_org_id = $${args.length})`;
    }
    if (params?.q) {
      args.push(`%${params.q.toLowerCase()}%`);
      sql += ` AND lower(name) LIKE $${args.length}`;
    }
    sql += " ORDER BY updated_at DESC";
    const { rows } = await this.pool.query(sql, args);
    return rows.map(engagementFromRow);
  }

  async getEngagement(id: string) {
    await this.whenReady();
    const { rows } = await this.pool.query("SELECT * FROM engagements WHERE id = $1", [id]);
    return rows[0] ? engagementFromRow(rows[0]) : null;
  }

  async createEngagement(data: Omit<Engagement, "id" | "createdAt" | "updatedAt" | "phase">) {
    await this.whenReady();
    const id = nextId("eg");
    const now = new Date().toISOString();
    const phase = phaseForStage(data.stage);
    await this.pool.query(
      `INSERT INTO engagements (id, type, name, org_id, secondary_org_id, contact_id, stage, phase, value_sgd, start_date, end_date, properties, owner, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
      [
        id, data.type, data.name, data.orgId, data.secondaryOrgId ?? null, data.contactId ?? null, data.stage, phase,
        data.valueSgd, data.startDate, data.endDate, JSON.stringify(data.properties ?? {}), data.owner, now, now,
      ]
    );
    return { ...data, id, phase, createdAt: now, updatedAt: now } as Engagement;
  }

  async updateEngagement(id: string, data: Partial<Engagement>) {
    await this.whenReady();
    const existing = await this.getEngagement(id);
    if (!existing) return null;
    const merged = { ...existing, ...data, updatedAt: new Date().toISOString() };
    merged.phase = phaseForStage(merged.stage);
    await this.pool.query(
      `UPDATE engagements SET type=$2, name=$3, org_id=$4, secondary_org_id=$5, contact_id=$6, stage=$7, phase=$8, value_sgd=$9, start_date=$10, end_date=$11, properties=$12, owner=$13, updated_at=$14
       WHERE id=$1`,
      [
        id, merged.type, merged.name, merged.orgId, merged.secondaryOrgId ?? null, merged.contactId ?? null,
        merged.stage, merged.phase, merged.valueSgd, merged.startDate, merged.endDate,
        JSON.stringify(merged.properties ?? {}), merged.owner, merged.updatedAt,
      ]
    );
    return merged;
  }

  async deleteEngagement(id: string) {
    await this.whenReady();
    const res = await this.pool.query("DELETE FROM engagements WHERE id = $1", [id]);
    return (res.rowCount || 0) > 0;
  }

  // ---------- Tickets ----------
  async listTickets(params?: { channel?: TicketChannel; status?: TicketStatus; orgId?: string; q?: string }) {
    await this.whenReady();
    let sql = "SELECT * FROM tickets WHERE 1=1";
    const args: any[] = [];
    if (params?.channel) {
      args.push(params.channel);
      sql += ` AND channel = $${args.length}`;
    }
    if (params?.status) {
      args.push(params.status);
      sql += ` AND status = $${args.length}`;
    }
    if (params?.orgId) {
      args.push(params.orgId);
      sql += ` AND org_id = $${args.length}`;
    }
    if (params?.q) {
      args.push(`%${params.q.toLowerCase()}%`);
      sql += ` AND (lower(subject) LIKE $${args.length} OR lower(body) LIKE $${args.length} OR lower(requester_name) LIKE $${args.length})`;
    }
    sql += " ORDER BY updated_at DESC";
    const { rows } = await this.pool.query(sql, args);
    return rows.map(ticketFromRow);
  }

  async getTicket(id: string) {
    await this.whenReady();
    const { rows } = await this.pool.query("SELECT * FROM tickets WHERE id = $1", [id]);
    return rows[0] ? ticketFromRow(rows[0]) : null;
  }

  async createTicket(data: Omit<Ticket, "id" | "createdAt" | "updatedAt">) {
    await this.whenReady();
    const id = nextId("tkt");
    const now = new Date().toISOString();
    await this.pool.query(
      `INSERT INTO tickets (id, channel, category, subject, body, requester_name, requester_contact, org_id, status, priority, assignee, created_at, updated_at, resolved_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
      [
        id, data.channel, data.category, data.subject, data.body, data.requesterName, data.requesterContact,
        data.orgId ?? null, data.status ?? "New", data.priority ?? "Medium", data.assignee ?? "Unassigned",
        now, now, data.resolvedAt ?? null,
      ]
    );
    return { ...data, id, createdAt: now, updatedAt: now } as Ticket;
  }

  async updateTicket(id: string, data: Partial<Ticket>) {
    await this.whenReady();
    const existing = await this.getTicket(id);
    if (!existing) return null;
    const merged = { ...existing, ...data, updatedAt: new Date().toISOString() };
    if ((data.status === "Resolved" || data.status === "Closed") && !merged.resolvedAt) {
      merged.resolvedAt = merged.updatedAt;
    }
    await this.pool.query(
      `UPDATE tickets SET channel=$2, category=$3, subject=$4, body=$5, requester_name=$6, requester_contact=$7, org_id=$8, status=$9, priority=$10, assignee=$11, updated_at=$12, resolved_at=$13
       WHERE id=$1`,
      [
        id, merged.channel, merged.category, merged.subject, merged.body, merged.requesterName, merged.requesterContact,
        merged.orgId ?? null, merged.status, merged.priority, merged.assignee, merged.updatedAt, merged.resolvedAt ?? null,
      ]
    );
    return merged;
  }

  // ---------- Tasks ----------
  async listTasks(params?: { done?: boolean; engagementId?: string; ticketId?: string; orgId?: string }) {
    await this.whenReady();
    let sql = "SELECT * FROM tasks WHERE 1=1";
    const args: any[] = [];
    if (params?.done !== undefined) {
      args.push(params.done);
      sql += ` AND done = $${args.length}`;
    }
    if (params?.engagementId) {
      args.push(params.engagementId);
      sql += ` AND engagement_id = $${args.length}`;
    }
    if (params?.ticketId) {
      args.push(params.ticketId);
      sql += ` AND ticket_id = $${args.length}`;
    }
    if (params?.orgId) {
      args.push(params.orgId);
      sql += ` AND org_id = $${args.length}`;
    }
    sql += " ORDER BY due_date ASC";
    const { rows } = await this.pool.query(sql, args);
    return rows.map(taskFromRow);
  }

  async createTask(data: Omit<Task, "id" | "createdAt">) {
    await this.whenReady();
    const id = nextId("tsk");
    const createdAt = new Date().toISOString();
    await this.pool.query(
      `INSERT INTO tasks (id, engagement_id, ticket_id, org_id, title, due_date, done, owner, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [id, data.engagementId ?? null, data.ticketId ?? null, data.orgId ?? null, data.title, data.dueDate, data.done, data.owner, createdAt]
    );
    return { ...data, id, createdAt } as Task;
  }

  async updateTask(id: string, data: Partial<Task>) {
    await this.whenReady();
    const { rows } = await this.pool.query("SELECT * FROM tasks WHERE id=$1", [id]);
    if (!rows[0]) return null;
    const existing = taskFromRow(rows[0]);
    const merged = { ...existing, ...data };
    await this.pool.query(
      `UPDATE tasks SET title=$2, due_date=$3, done=$4, owner=$5 WHERE id=$1`,
      [id, merged.title, merged.dueDate, merged.done, merged.owner]
    );
    return merged;
  }

  // ---------- Notes ----------
  async listNotes(params?: { engagementId?: string; ticketId?: string; orgId?: string }) {
    await this.whenReady();
    let sql = "SELECT * FROM notes WHERE 1=1";
    const args: any[] = [];
    if (params?.engagementId) {
      args.push(params.engagementId);
      sql += ` AND engagement_id = $${args.length}`;
    }
    if (params?.ticketId) {
      args.push(params.ticketId);
      sql += ` AND ticket_id = $${args.length}`;
    }
    if (params?.orgId) {
      args.push(params.orgId);
      sql += ` AND org_id = $${args.length}`;
    }
    sql += " ORDER BY created_at DESC";
    const { rows } = await this.pool.query(sql, args);
    return rows.map(noteFromRow);
  }

  async createNote(data: Omit<Note, "id" | "createdAt">) {
    await this.whenReady();
    const id = nextId("nt");
    const createdAt = new Date().toISOString();
    await this.pool.query(
      `INSERT INTO notes (id, engagement_id, ticket_id, org_id, contact_id, body, author, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [id, data.engagementId ?? null, data.ticketId ?? null, data.orgId ?? null, data.contactId ?? null, data.body, data.author, createdAt]
    );
    return { ...data, id, createdAt } as Note;
  }

  // ---------- Activity ----------
  async listActivity(limit = 50) {
    await this.whenReady();
    const { rows } = await this.pool.query(
      "SELECT * FROM activity_log ORDER BY created_at DESC LIMIT $1",
      [limit]
    );
    return rows.map(activityFromRow);
  }

  async logActivity(entry: Omit<ActivityLogEntry, "id" | "createdAt">) {
    await this.whenReady();
    const id = nextId("act");
    const createdAt = new Date().toISOString();
    await this.pool.query(
      `INSERT INTO activity_log (id, actor, summary, created_at) VALUES ($1,$2,$3,$4)`,
      [id, entry.actor, entry.summary, createdAt]
    );
    return { ...entry, id, createdAt };
  }
}
