import { getStore } from "./getStore";
import { EngagementPhase, EngagementType, OrgCategory, TicketChannel, TicketPriority, TicketStatus } from "./types";

// These tool definitions are shared by two callers:
//  1. app/api/mcp/route.ts - a real MCP (Model Context Protocol) JSON-RPC
//     server, so any MCP client (Claude Desktop, Claude Code, other agents)
//     can connect to this CRM directly.
//  2. app/api/agent/chat/route.ts - the in-app agentic chat, which calls
//     these same functions in-process (no HTTP round trip) for speed.
//
// The tool set spans the full Mediacorp Relationship Hub: organizations
// (advertisers, agencies, distributors, talent agencies, production
// houses, sponsors, DOOH location partners), engagements across 5 domains
// (ad campaigns, content licensing, talent bookings, sponsorships, DOOH
// partnerships), and support tickets across 4 real Mediacorp channels
// (meWATCH, Broadcast, Advertiser, Corporate) - with full read/write
// actions on all of them.

export interface ToolDef {
  name: string;
  description: string;
  input_schema: Record<string, any>;
  execute: (input: any) => Promise<any>;
}

async function logAgentActivity(summary: string) {
  const store = getStore();
  await store.logActivity({ actor: "agent", summary });
}

const ORG_CATEGORIES: OrgCategory[] = [
  "Advertiser",
  "Agency",
  "Distributor",
  "TalentAgency",
  "ProductionHouse",
  "Sponsor",
  "LocationPartner",
];

const ENGAGEMENT_TYPES: EngagementType[] = [
  "AdCampaign",
  "ContentLicensing",
  "TalentBooking",
  "Sponsorship",
  "DOOHPartnership",
];

const ENGAGEMENT_PHASES: EngagementPhase[] = [
  "Prospecting",
  "Negotiation",
  "Confirmed",
  "Live",
  "Completed",
  "Cancelled",
];

const TICKET_CHANNELS: TicketChannel[] = ["meWATCH", "Broadcast", "Advertiser", "Corporate"];
const TICKET_STATUSES: TicketStatus[] = ["New", "Open", "Pending", "Resolved", "Closed"];
const TICKET_PRIORITIES: TicketPriority[] = ["Low", "Medium", "High", "Urgent"];

export const tools: ToolDef[] = [
  // ---------- Organizations ----------
  {
    name: "search_organizations",
    description:
      "Search organizations across every relationship type Mediacorp manages: Advertiser, Agency, Distributor (content licensing partners), TalentAgency, ProductionHouse, Sponsor, or LocationPartner (DOOH venues). Returns id, name, category, industry, hq city, and agency of record.",
    input_schema: {
      type: "object",
      properties: {
        q: { type: "string", description: "Free text search term, e.g. an org name or industry" },
        category: { type: "string", enum: ORG_CATEGORIES },
      },
    },
    execute: async (input) => {
      const store = getStore();
      return store.listOrganizations({ q: input.q, category: input.category });
    },
  },
  {
    name: "get_organization",
    description:
      "Get full detail for a single organization by id, including its contacts, engagements (across all 5 types), tickets, and notes.",
    input_schema: {
      type: "object",
      properties: { orgId: { type: "string" } },
      required: ["orgId"],
    },
    execute: async (input) => {
      const store = getStore();
      const org = await store.getOrganization(input.orgId);
      if (!org) return { error: "Organization not found" };
      const [contacts, engagements, tickets, notes] = await Promise.all([
        store.listContacts({ orgId: input.orgId }),
        store.listEngagements({ orgId: input.orgId }),
        store.listTickets({ orgId: input.orgId }),
        store.listNotes({ orgId: input.orgId }),
      ]);
      return { organization: org, contacts, engagements, tickets, notes };
    },
  },
  {
    name: "list_contacts",
    description:
      "List contacts, optionally scoped to an organization, filtered to talent only, or searched by name/email. Talent contacts (actors, hosts, DJs, presenters) have isTalent=true.",
    input_schema: {
      type: "object",
      properties: {
        orgId: { type: "string" },
        q: { type: "string" },
        isTalent: { type: "boolean" },
      },
    },
    execute: async (input) => {
      const store = getStore();
      return store.listContacts({ orgId: input.orgId, q: input.q, isTalent: input.isTalent });
    },
  },

  // ---------- Engagements (Ad Campaigns / Content Licensing / Talent Bookings / Sponsorships / DOOH) ----------
  {
    name: "list_engagements",
    description:
      "List engagements - the unified pipeline covering all 5 relationship domains: AdCampaign (advertiser/agency ad sales), ContentLicensing (inbound/outbound drama & format deals), TalentBooking (actors, hosts, DJs, production partners), Sponsorship (Star Awards, National Day Parade, festivals), and DOOHPartnership (mall/transit screen deals). Filter by type, phase (Prospecting, Negotiation, Confirmed, Live, Completed, Cancelled), or organization.",
    input_schema: {
      type: "object",
      properties: {
        type: { type: "string", enum: ENGAGEMENT_TYPES },
        phase: { type: "string", enum: ENGAGEMENT_PHASES },
        orgId: { type: "string" },
        q: { type: "string" },
      },
    },
    execute: async (input) => {
      const store = getStore();
      return store.listEngagements({ type: input.type, phase: input.phase, orgId: input.orgId, q: input.q });
    },
  },
  {
    name: "get_engagement",
    description: "Get full detail on a single engagement, including its tasks and notes.",
    input_schema: {
      type: "object",
      properties: { engagementId: { type: "string" } },
      required: ["engagementId"],
    },
    execute: async (input) => {
      const store = getStore();
      const engagement = await store.getEngagement(input.engagementId);
      if (!engagement) return { error: "Engagement not found" };
      const [tasks, notes] = await Promise.all([
        store.listTasks({ engagementId: input.engagementId }),
        store.listNotes({ engagementId: input.engagementId }),
      ]);
      return { engagement, tasks, notes };
    },
  },
  {
    name: "create_engagement",
    description:
      "Create a new engagement of any type. Use type-appropriate stage vocabulary: AdCampaign (Prospecting, Avails Sent, Negotiation, Booked, Live, Completed, Cancelled), ContentLicensing (Scouting, Rights Negotiation, Contract Drafting, Signed, Active, Expired), TalentBooking (Inquiry, Fee Negotiation, Contract Sent, Confirmed, Completed, Cancelled), Sponsorship (Prospecting, Proposal Sent, Negotiation, Confirmed, Live, Completed), DOOHPartnership (Prospecting, Terms Negotiation, Contract Signed, Active, Renewal Due, Terminated). Use the properties bag for type-specific fields, e.g. {campaignType, platforms} for AdCampaign, {direction, contentTitle, territory, genre} for ContentLicensing, {production, role} for TalentBooking, {eventName, tier} for Sponsorship, {venueName, screenCount, revenueSharePct, locationType} for DOOHPartnership.",
    input_schema: {
      type: "object",
      properties: {
        type: { type: "string", enum: ENGAGEMENT_TYPES },
        name: { type: "string" },
        orgId: { type: "string", description: "Primary counterparty organization id" },
        secondaryOrgId: { type: "string", description: "e.g. the media agency on an ad campaign" },
        contactId: { type: "string", description: "e.g. the talent contact on a booking" },
        stage: { type: "string" },
        valueSgd: { type: "number" },
        startDate: { type: "string", description: "ISO date" },
        endDate: { type: "string", description: "ISO date" },
        properties: { type: "object", description: "Type-specific fields, see tool description" },
      },
      required: ["type", "name", "orgId"],
    },
    execute: async (input) => {
      const store = getStore();
      const row = await store.createEngagement({
        type: input.type,
        name: input.name,
        orgId: input.orgId,
        secondaryOrgId: input.secondaryOrgId ?? null,
        contactId: input.contactId ?? null,
        stage: input.stage ?? "Prospecting",
        valueSgd: input.valueSgd ?? 0,
        startDate: input.startDate ?? new Date().toISOString(),
        endDate: input.endDate ?? new Date().toISOString(),
        properties: input.properties ?? {},
        owner: "Astha Mundhra",
      });
      await logAgentActivity(`Created ${row.type} engagement "${row.name}" (${row.stage}, SGD ${row.valueSgd.toLocaleString()})`);
      return row;
    },
  },
  {
    name: "update_engagement_stage",
    description:
      "Move an engagement to a new stage (its universal kanban phase is derived automatically). Use this after a call, contract signature, or negotiation update.",
    input_schema: {
      type: "object",
      properties: {
        engagementId: { type: "string" },
        stage: { type: "string" },
      },
      required: ["engagementId", "stage"],
    },
    execute: async (input) => {
      const store = getStore();
      const row = await store.updateEngagement(input.engagementId, { stage: input.stage });
      if (!row) return { error: "Engagement not found" };
      await logAgentActivity(`Moved engagement "${row.name}" to ${row.stage}`);
      return row;
    },
  },
  {
    name: "update_engagement",
    description: "Update arbitrary fields on an existing engagement (value, dates, properties, owner, etc).",
    input_schema: {
      type: "object",
      properties: {
        engagementId: { type: "string" },
        name: { type: "string" },
        valueSgd: { type: "number" },
        startDate: { type: "string" },
        endDate: { type: "string" },
        properties: { type: "object" },
      },
      required: ["engagementId"],
    },
    execute: async (input) => {
      const store = getStore();
      const { engagementId, ...rest } = input;
      const row = await store.updateEngagement(engagementId, rest);
      if (!row) return { error: "Engagement not found" };
      await logAgentActivity(`Updated engagement "${row.name}"`);
      return row;
    },
  },
  {
    name: "pipeline_summary",
    description:
      "Get an aggregate summary of the full relationship pipeline: count and total SGD value grouped by engagement type and by phase. Useful for 'how's the pipeline looking' style questions.",
    input_schema: { type: "object", properties: {} },
    execute: async () => {
      const store = getStore();
      const engagements = await store.listEngagements();
      const byType: Record<string, { count: number; totalSgd: number }> = {};
      const byPhase: Record<string, { count: number; totalSgd: number }> = {};
      for (const e of engagements) {
        byType[e.type] = byType[e.type] || { count: 0, totalSgd: 0 };
        byType[e.type].count += 1;
        byType[e.type].totalSgd += e.valueSgd;
        byPhase[e.phase] = byPhase[e.phase] || { count: 0, totalSgd: 0 };
        byPhase[e.phase].count += 1;
        byPhase[e.phase].totalSgd += e.valueSgd;
      }
      const totalActiveSgd = engagements
        .filter((e) => e.phase !== "Cancelled")
        .reduce((sum, e) => sum + e.valueSgd, 0);
      return { byType, byPhase, totalActiveSgd, engagementCount: engagements.length };
    },
  },

  // ---------- Support Tickets ----------
  {
    name: "list_tickets",
    description:
      "List support tickets across Mediacorp's 4 real support channels: meWATCH (streaming app - playback, billing, login), Broadcast (TV + Radio - signal, subtitles, IMDA content complaints, song ID, contests), Advertiser (make-goods, invoice disputes, creative rejections), Corporate (press inquiries, content licensing requests, DMCA takedowns). Filter by channel, status, priority, or organization.",
    input_schema: {
      type: "object",
      properties: {
        channel: { type: "string", enum: TICKET_CHANNELS },
        status: { type: "string", enum: TICKET_STATUSES },
        orgId: { type: "string" },
        q: { type: "string" },
      },
    },
    execute: async (input) => {
      const store = getStore();
      return store.listTickets({ channel: input.channel, status: input.status, orgId: input.orgId, q: input.q });
    },
  },
  {
    name: "get_ticket",
    description: "Get full detail on a single support ticket, including its tasks and notes/reply history.",
    input_schema: {
      type: "object",
      properties: { ticketId: { type: "string" } },
      required: ["ticketId"],
    },
    execute: async (input) => {
      const store = getStore();
      const ticket = await store.getTicket(input.ticketId);
      if (!ticket) return { error: "Ticket not found" };
      const [tasks, notes] = await Promise.all([
        store.listTasks({ ticketId: input.ticketId }),
        store.listNotes({ ticketId: input.ticketId }),
      ]);
      return { ticket, tasks, notes };
    },
  },
  {
    name: "create_ticket",
    description: "Log a new support ticket coming in from a viewer, listener, advertiser, or press contact.",
    input_schema: {
      type: "object",
      properties: {
        channel: { type: "string", enum: TICKET_CHANNELS },
        category: { type: "string" },
        subject: { type: "string" },
        body: { type: "string" },
        requesterName: { type: "string" },
        requesterContact: { type: "string" },
        orgId: { type: "string", description: "Link to an org, e.g. for advertiser billing disputes" },
        priority: { type: "string", enum: TICKET_PRIORITIES },
      },
      required: ["channel", "subject"],
    },
    execute: async (input) => {
      const store = getStore();
      const row = await store.createTicket({
        channel: input.channel,
        category: input.category ?? "",
        subject: input.subject,
        body: input.body ?? "",
        requesterName: input.requesterName ?? "Unknown",
        requesterContact: input.requesterContact ?? "",
        orgId: input.orgId ?? null,
        status: "New",
        priority: input.priority ?? "Medium",
        assignee: "Unassigned",
        resolvedAt: null,
      });
      await logAgentActivity(`Logged a new ${row.channel} ticket "${row.subject}"`);
      return row;
    },
  },
  {
    name: "assign_ticket",
    description: "Assign a support ticket to a team or person.",
    input_schema: {
      type: "object",
      properties: {
        ticketId: { type: "string" },
        assignee: { type: "string" },
      },
      required: ["ticketId", "assignee"],
    },
    execute: async (input) => {
      const store = getStore();
      const row = await store.updateTicket(input.ticketId, { assignee: input.assignee });
      if (!row) return { error: "Ticket not found" };
      await logAgentActivity(`Assigned ticket "${row.subject}" to ${row.assignee}`);
      return row;
    },
  },
  {
    name: "update_ticket_status",
    description: "Change a support ticket's status (New, Open, Pending, Resolved, Closed) and/or priority.",
    input_schema: {
      type: "object",
      properties: {
        ticketId: { type: "string" },
        status: { type: "string", enum: TICKET_STATUSES },
        priority: { type: "string", enum: TICKET_PRIORITIES },
      },
      required: ["ticketId", "status"],
    },
    execute: async (input) => {
      const store = getStore();
      const row = await store.updateTicket(input.ticketId, {
        status: input.status,
        ...(input.priority ? { priority: input.priority } : {}),
      });
      if (!row) return { error: "Ticket not found" };
      await logAgentActivity(`Updated ticket "${row.subject}" to status ${row.status}`);
      return row;
    },
  },
  {
    name: "reply_to_ticket",
    description:
      "Draft and log a reply to a support ticket. This records the reply as a note on the ticket's timeline and, unless told otherwise, moves the ticket to Pending (awaiting requester) status.",
    input_schema: {
      type: "object",
      properties: {
        ticketId: { type: "string" },
        replyBody: { type: "string" },
        newStatus: { type: "string", enum: TICKET_STATUSES },
      },
      required: ["ticketId", "replyBody"],
    },
    execute: async (input) => {
      const store = getStore();
      const ticket = await store.getTicket(input.ticketId);
      if (!ticket) return { error: "Ticket not found" };
      const note = await store.createNote({
        body: `Reply sent: ${input.replyBody}`,
        ticketId: input.ticketId,
        engagementId: null,
        orgId: ticket.orgId ?? null,
        contactId: null,
        author: "Astha Mundhra (via agent)",
      });
      const updated = await store.updateTicket(input.ticketId, { status: input.newStatus ?? "Pending" });
      await logAgentActivity(`Drafted reply on ticket "${ticket.subject}"`);
      return { note, ticket: updated };
    },
  },

  // ---------- Tasks ----------
  {
    name: "list_tasks",
    description: "List follow-up tasks, optionally filtered by completion state, engagement, ticket, or organization.",
    input_schema: {
      type: "object",
      properties: {
        done: { type: "boolean" },
        engagementId: { type: "string" },
        ticketId: { type: "string" },
        orgId: { type: "string" },
      },
    },
    execute: async (input) => {
      const store = getStore();
      return store.listTasks({ done: input.done, engagementId: input.engagementId, ticketId: input.ticketId, orgId: input.orgId });
    },
  },
  {
    name: "create_task",
    description: "Create a follow-up task/reminder, optionally linked to an engagement, a ticket, and/or an organization.",
    input_schema: {
      type: "object",
      properties: {
        title: { type: "string" },
        engagementId: { type: "string" },
        ticketId: { type: "string" },
        orgId: { type: "string" },
        dueDate: { type: "string", description: "ISO date" },
      },
      required: ["title"],
    },
    execute: async (input) => {
      const store = getStore();
      const row = await store.createTask({
        title: input.title,
        engagementId: input.engagementId ?? null,
        ticketId: input.ticketId ?? null,
        orgId: input.orgId ?? null,
        dueDate: input.dueDate ?? new Date().toISOString(),
        done: false,
        owner: "Astha Mundhra",
      });
      await logAgentActivity(`Created task "${row.title}"`);
      return row;
    },
  },
  {
    name: "complete_task",
    description: "Mark a task as done.",
    input_schema: {
      type: "object",
      properties: { taskId: { type: "string" } },
      required: ["taskId"],
    },
    execute: async (input) => {
      const store = getStore();
      const row = await store.updateTask(input.taskId, { done: true });
      if (!row) return { error: "Task not found" };
      await logAgentActivity(`Completed task "${row.title}"`);
      return row;
    },
  },

  // ---------- Notes ----------
  {
    name: "log_note",
    description:
      "Log a note (e.g. a call summary, meeting recap, or internal comment) against an engagement, a ticket, and/or an organization so it shows up in the CRM timeline.",
    input_schema: {
      type: "object",
      properties: {
        body: { type: "string" },
        engagementId: { type: "string" },
        ticketId: { type: "string" },
        orgId: { type: "string" },
        contactId: { type: "string" },
      },
      required: ["body"],
    },
    execute: async (input) => {
      const store = getStore();
      const row = await store.createNote({
        body: input.body,
        engagementId: input.engagementId ?? null,
        ticketId: input.ticketId ?? null,
        orgId: input.orgId ?? null,
        contactId: input.contactId ?? null,
        author: "Astha Mundhra",
      });
      await logAgentActivity(`Logged a note${input.orgId ? " on org " + input.orgId : ""}`);
      return row;
    },
  },
];

export function getToolByName(name: string) {
  return tools.find((t) => t.name === name);
}

export function toolsAsAnthropicFormat() {
  return tools.map((t) => ({
    name: t.name,
    description: t.description,
    input_schema: t.input_schema,
  }));
}

export function toolsAsMcpFormat() {
  return tools.map((t) => ({
    name: t.name,
    description: t.description,
    inputSchema: t.input_schema,
  }));
}

// OpenAI-compatible "function calling" shape, used for Groq (and any other
// OpenAI-compatible provider) since Groq's chat completions API mirrors
// OpenAI's tool-calling contract rather than Anthropic's.
export function toolsAsOpenAIFormat() {
  return tools.map((t) => ({
    type: "function" as const,
    function: {
      name: t.name,
      description: t.description,
      parameters: t.input_schema,
    },
  }));
}
