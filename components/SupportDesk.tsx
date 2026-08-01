"use client";

import { useEffect, useMemo, useState } from "react";
import { ContactChannel, Organization, Task, Ticket, TicketChannel, TicketStatus } from "@/lib/types";
import { fmtDateTime, TICKET_PRIORITY_COLORS, TICKET_STATUS_COLORS } from "@/lib/format";
import { TICKET_CHANNELS } from "@/lib/engagementMeta";
import { CONTACT_CHANNELS, CONTACT_CHANNEL_META } from "@/lib/channels";
import { useRole } from "@/components/RoleSwitcher";
import { canViewTicket } from "@/lib/rbac";

const CHANNEL_FILTERS: (TicketChannel | "All")[] = ["All", ...TICKET_CHANNELS];
const CONTACT_FILTERS: (ContactChannel | "All")[] = ["All", ...CONTACT_CHANNELS];
const STATUS_OPTIONS: TicketStatus[] = ["New", "Open", "Pending", "Resolved", "Closed"];
const ASSIGNEES = ["Unassigned", "Support Team A", "Support Team B", "Ad Ops Team", "Corp Comms", "Support Supervisor"];

function ChannelBadge({ channel, size = "sm" }: { channel: ContactChannel; size?: "sm" | "md" }) {
  const meta = CONTACT_CHANNEL_META[channel];
  const dims = size === "md" ? "h-5 w-8 text-[9.5px]" : "h-4 w-7 text-[8.5px]";
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`flex ${dims} items-center justify-center rounded font-semibold`}
        style={{ background: `${meta.color}22`, color: meta.color }}
      >
        {meta.icon}
      </span>
      <span className="text-[10.5px] text-white/50">{channel}</span>
    </span>
  );
}

export default function SupportDesk({ refreshKey }: { refreshKey: number }) {
  const { permissions } = useRole();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [channel, setChannel] = useState<TicketChannel | "All">("All");
  const [contactChannel, setContactChannel] = useState<ContactChannel | "All">("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadAll() {
    setLoading(true);
    const [t, o] = await Promise.all([
      fetch("/api/crm/tickets").then((r) => r.json()),
      fetch("/api/crm/organizations").then((r) => r.json()),
    ]);
    setTickets(t.tickets || []);
    setOrganizations(o.organizations || []);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const orgById = useMemo(() => {
    const m: Record<string, Organization> = {};
    for (const o of organizations) m[o.id] = o;
    return m;
  }, [organizations]);

  // RBAC: a Support Agent only sees tickets on their assigned contact
  // channels; domain-only managers get supportAccess "none" and see a
  // restricted state instead of the desk at all.
  const rbacVisible = tickets.filter((t) => canViewTicket(permissions, t));
  const visible = rbacVisible.filter(
    (t) =>
      (channel === "All" || t.channel === channel) &&
      (contactChannel === "All" || (t.contactChannel ?? "Web Help Centre") === contactChannel)
  );
  const selected = tickets.find((t) => t.id === selectedId) || null;

  const openCount = rbacVisible.filter((t) => t.status === "New" || t.status === "Open").length;
  const pendingCount = rbacVisible.filter((t) => t.status === "Pending").length;
  const resolvedCount = rbacVisible.filter((t) => t.status === "Resolved" || t.status === "Closed").length;

  async function patchTicket(id: string, body: any) {
    const res = await fetch(`/api/crm/tickets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.ticket) setTickets((cur) => cur.map((t) => (t.id === id ? data.ticket : t)));
  }

  if (permissions.supportAccess === "none") {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-mc-border bg-mc-panel">
        <div className="max-w-md p-8 text-center">
          <div className="text-[14px] font-medium text-white">Restricted for your role</div>
          <div className="mt-2 text-[12.5px] leading-relaxed text-white/50">
            {permissions.label} does not have access to the Support Desk. Switch to Support Supervisor, Support
            Agent, Executive, Compliance & Legal / PDPA Officer, or Admin / IT to view tickets.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="New / Open" value={String(openCount)} />
        <StatCard label="Pending" value={String(pendingCount)} />
        <StatCard label="Resolved / Closed" value={String(resolvedCount)} />
      </div>

      {permissions.supportAccess === "assigned" && (
        <div className="rounded-lg border border-mc-border bg-mc-panel px-3 py-2 text-[11px] text-white/40">
          {permissions.label} is scoped to assigned contact channels only:{" "}
          {permissions.assignedChannels.join(", ")}. Tickets on other channels are hidden.
        </div>
      )}

      <div>
        <div className="mb-1 text-[10.5px] uppercase tracking-wide text-white/30">Business queue</div>
        <div className="flex flex-wrap gap-1.5">
          {CHANNEL_FILTERS.map((c) => (
            <button
              key={c}
              onClick={() => setChannel(c)}
              className={
                "rounded-full border px-3 py-1 text-[11.5px] " +
                (channel === c
                  ? "border-mc-blue bg-mc-blue/15 text-mc-blueBright"
                  : "border-mc-border text-white/50 hover:text-white/80")
              }
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-1 text-[10.5px] uppercase tracking-wide text-white/30">Contact channel (how it arrived)</div>
        <div className="flex flex-wrap gap-1.5">
          {CONTACT_FILTERS.map((c) => (
            <button
              key={c}
              onClick={() => setContactChannel(c)}
              className={
                "rounded-full border px-3 py-1 text-[11.5px] " +
                (contactChannel === c
                  ? "border-mc-blue bg-mc-blue/15 text-mc-blueBright"
                  : "border-mc-border text-white/50 hover:text-white/80")
              }
            >
              {c === "All" ? "All" : c}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        <div className="w-[380px] shrink-0 overflow-y-auto rounded-xl border border-mc-border bg-mc-panel">
          {loading ? (
            <div className="p-6 text-center text-white/40">Loading tickets…</div>
          ) : (
            visible.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedId(t.id)}
                className={
                  "block w-full border-b border-mc-border/60 px-3.5 py-3 text-left hover:bg-white/[0.03] " +
                  (selectedId === t.id ? "bg-mc-blue/10" : "")
                }
              >
                <div className="flex items-center justify-between gap-2">
                  <ChannelBadge channel={t.contactChannel ?? "Web Help Centre"} />
                  <span
                    className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                    style={{
                      color: TICKET_STATUS_COLORS[t.status],
                      background: `${TICKET_STATUS_COLORS[t.status]}22`,
                    }}
                  >
                    {t.status}
                  </span>
                </div>
                <div className="mt-1.5 text-[12.5px] font-medium leading-snug text-white">{t.subject}</div>
                <div className="mt-1 text-[11px] text-white/45">
                  {t.requesterName} · {t.category}
                </div>
                <div className="mt-1 flex items-center gap-2 text-[10.5px]">
                  <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-white/50">{t.channel}</span>
                  <span style={{ color: TICKET_PRIORITY_COLORS[t.priority] }}>● {t.priority}</span>
                  <span className="text-white/30">{fmtDateTime(t.updatedAt)}</span>
                </div>
              </button>
            ))
          )}
          {!loading && visible.length === 0 && (
            <div className="p-6 text-center text-white/30">No tickets match this filter.</div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto rounded-xl border border-mc-border bg-mc-panel p-5">
          {selected ? (
            <TicketDetail
              ticket={selected}
              org={selected.orgId ? orgById[selected.orgId] : null}
              onPatch={(body) => patchTicket(selected.id, body)}
              onMessagesUpdated={(updated) => setTickets((cur) => cur.map((t) => (t.id === updated.id ? updated : t)))}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-white/30">
              Select a ticket to view the conversation thread and reply.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-mc-border bg-mc-panel p-4 shadow-mc">
      <div className="text-[11px] uppercase tracking-wide text-white/40">{label}</div>
      <div className="mt-1 text-xl font-semibold text-white">{value}</div>
    </div>
  );
}

function TicketDetail({
  ticket,
  org,
  onPatch,
  onMessagesUpdated,
}: {
  ticket: Ticket;
  org: Organization | null;
  onPatch: (body: any) => void;
  onMessagesUpdated: (ticket: Ticket) => void;
}) {
  const { permissions } = useRole();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  const canAct = permissions.supportAccess !== "none" && permissions.role !== "Executive" && permissions.role !== "ComplianceOfficer";
  const canReassign = canAct && permissions.canEscalateOrReassignTickets;

  async function loadTasks() {
    const res = await fetch(`/api/crm/tickets/${ticket.id}`).then((r) => r.json());
    setTasks(res.tasks || []);
  }

  useEffect(() => {
    loadTasks();
    setConfirmation(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticket.id]);

  async function sendReply() {
    if (!reply.trim() || !canAct) return;
    setSending(true);
    const res = await fetch(`/api/crm/tickets/${ticket.id}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: reply }),
    });
    const data = await res.json();
    if (data.ticket) onMessagesUpdated(data.ticket);
    if (data.confirmation) setConfirmation(data.confirmation);
    setReply("");
    setSending(false);
  }

  async function escalate() {
    await onPatch({ priority: "Urgent", assignee: "Support Supervisor" });
  }

  const contactChannel = ticket.contactChannel ?? "Web Help Centre";
  const meta = CONTACT_CHANNEL_META[contactChannel];
  const messages = ticket.messages ?? [];

  return (
    <div className="space-y-4">
      <div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-white/40">
          <ChannelBadge channel={contactChannel} size="md" />
          <span className="rounded bg-white/[0.06] px-1.5 py-0.5">{ticket.channel}</span>
          <span>{ticket.category}</span>
          {org && <span>· {org.name}</span>}
        </div>
        <div className="mt-1.5 text-[16px] font-semibold text-white">{ticket.subject}</div>
        <div className="mt-1 text-[12px] text-white/50">
          From {ticket.requesterName} ({ticket.requesterContact}) · {fmtDateTime(ticket.createdAt)}
        </div>
      </div>

      {permissions.canViewPII && (
        <div className="rounded-lg border border-mc-cyan/30 bg-mc-cyan/[0.06] p-3">
          <div className="text-[10.5px] font-medium uppercase tracking-wide text-mc-cyan">
            PDPA / personal data (compliance view)
          </div>
          <div className="mt-1.5 grid grid-cols-2 gap-2 text-[12px] text-white/70">
            <div>
              <span className="text-white/40">Requester name: </span>
              {ticket.requesterName}
            </div>
            <div>
              <span className="text-white/40">Contact on file: </span>
              {ticket.requesterContact}
            </div>
            <div>
              <span className="text-white/40">Arrived via: </span>
              {contactChannel} ({meta.description})
            </div>
            <div>
              <span className="text-white/40">Messages in thread: </span>
              {messages.length}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <div>
          <div className="mb-1 text-[11px] text-white/40">Status</div>
          <select
            value={ticket.status}
            disabled={!canAct}
            onChange={(e) => onPatch({ status: e.target.value })}
            className="w-full rounded-lg border border-mc-border bg-black/30 px-2.5 py-2 text-[12.5px] text-white disabled:opacity-40"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div className="mb-1 text-[11px] text-white/40">Priority</div>
          <select
            value={ticket.priority}
            disabled={!canAct}
            onChange={(e) => onPatch({ priority: e.target.value })}
            className="w-full rounded-lg border border-mc-border bg-black/30 px-2.5 py-2 text-[12.5px] text-white disabled:opacity-40"
          >
            {["Low", "Medium", "High", "Urgent"].map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div className="mb-1 text-[11px] text-white/40">Assignee</div>
          <select
            value={ticket.assignee}
            disabled={!canReassign}
            title={canReassign ? undefined : "Reassigning requires Support Supervisor (or Admin / IT)"}
            onChange={(e) => onPatch({ assignee: e.target.value })}
            className="w-full rounded-lg border border-mc-border bg-black/30 px-2.5 py-2 text-[12.5px] text-white disabled:opacity-40"
          >
            {ASSIGNEES.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>

      {permissions.canEscalateOrReassignTickets && (
        <button
          onClick={escalate}
          className="rounded-lg border border-mc-border px-3 py-1.5 text-[12px] text-white/60 hover:border-mc-blue/50 hover:text-white"
        >
          Escalate to Support Supervisor
        </button>
      )}

      <div>
        <div className="mb-1.5 text-[11px] uppercase tracking-wide text-white/40">Conversation thread</div>
        <div className="space-y-2">
          {messages.map((m) => (
            <div key={m.id} className={m.direction === "outbound" ? "flex justify-end" : "flex justify-start"}>
              <div
                className={
                  "max-w-[85%] rounded-xl px-3 py-2 text-[12.5px] leading-relaxed " +
                  (m.direction === "outbound" ? "bg-mc-blue/20 text-white" : "bg-white/[0.06] text-white/85")
                }
              >
                <div className="mb-1 flex items-center gap-1.5 text-[10.5px] text-white/40">
                  <span>{m.direction === "outbound" ? "→" : "←"}</span>
                  <span>{m.author}</span>
                  <span>· {m.channel}</span>
                  <span>· {fmtDateTime(m.createdAt)}</span>
                </div>
                {m.body}
              </div>
            </div>
          ))}
          {messages.length === 0 && <div className="text-[12px] text-white/30">No messages yet.</div>}
        </div>
      </div>

      {canAct ? (
        <div>
          <div className="mb-1.5 text-[11px] uppercase tracking-wide text-white/40">
            Reply via {contactChannel}
          </div>
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={3}
            placeholder={`Draft a reply to send back on ${contactChannel}…`}
            className="w-full rounded-lg border border-mc-border bg-black/30 px-3 py-2 text-[13px] text-white outline-none focus:border-mc-blue/60"
          />
          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="text-[11px] text-mc-green">{confirmation}</div>
            <button
              onClick={sendReply}
              disabled={sending || !reply.trim()}
              className="rounded-lg bg-mc-blue px-4 py-2 text-[12.5px] font-medium text-white hover:bg-mc-blueBright disabled:opacity-50"
            >
              {sending ? "Sending…" : "Send reply"}
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-mc-border bg-black/20 px-3 py-2 text-[11.5px] text-white/40">
          {permissions.label} has read-only access to the Support Desk and cannot send replies.
        </div>
      )}

      {tasks.length > 0 && (
        <div>
          <div className="mb-1.5 text-[11px] uppercase tracking-wide text-white/40">Follow-up tasks</div>
          <div className="space-y-2">
            {tasks.map((t) => (
              <div
                key={t.id}
                className="rounded-lg border border-mc-border bg-black/20 p-2.5 text-[12.5px] text-white/75"
              >
                <span className={t.done ? "text-mc-green" : "text-mc-blueBright"}>
                  {t.done ? "✓ Done" : "○ Task"}
                </span>{" "}
                {t.title}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
