"use client";

import { useEffect, useMemo, useState } from "react";
import { Note, Organization, Task, Ticket, TicketChannel, TicketStatus } from "@/lib/types";
import { fmtDateTime, TICKET_PRIORITY_COLORS, TICKET_STATUS_COLORS } from "@/lib/format";
import { TICKET_CHANNELS } from "@/lib/engagementMeta";

const CHANNEL_FILTERS: (TicketChannel | "All")[] = ["All", ...TICKET_CHANNELS];
const STATUS_OPTIONS: TicketStatus[] = ["New", "Open", "Pending", "Resolved", "Closed"];
const ASSIGNEES = ["Unassigned", "Support Team A", "Support Team B", "Ad Ops Team", "Corp Comms"];

export default function SupportDesk({ refreshKey }: { refreshKey: number }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [channel, setChannel] = useState<TicketChannel | "All">("All");
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

  const visible = channel === "All" ? tickets : tickets.filter((t) => t.channel === channel);
  const selected = tickets.find((t) => t.id === selectedId) || null;

  const openCount = tickets.filter((t) => t.status === "New" || t.status === "Open").length;
  const pendingCount = tickets.filter((t) => t.status === "Pending").length;
  const resolvedCount = tickets.filter((t) => t.status === "Resolved" || t.status === "Closed").length;

  async function patchTicket(id: string, body: any) {
    const res = await fetch(`/api/crm/tickets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.ticket) setTickets((cur) => cur.map((t) => (t.id === id ? data.ticket : t)));
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="New / Open" value={String(openCount)} />
        <StatCard label="Pending" value={String(pendingCount)} />
        <StatCard label="Resolved / Closed" value={String(resolvedCount)} />
      </div>

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
                  <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-white/60">{t.channel}</span>
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
                  <span style={{ color: TICKET_PRIORITY_COLORS[t.priority] }}>● {t.priority}</span>
                  <span className="text-white/30">{fmtDateTime(t.updatedAt)}</span>
                </div>
              </button>
            ))
          )}
          {!loading && visible.length === 0 && (
            <div className="p-6 text-center text-white/30">No tickets in this channel.</div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto rounded-xl border border-mc-border bg-mc-panel p-5">
          {selected ? (
            <TicketDetail
              ticket={selected}
              org={selected.orgId ? orgById[selected.orgId] : null}
              onPatch={(body) => patchTicket(selected.id, body)}
              refreshKey={refreshKey}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-white/30">
              Select a ticket to view details and reply.
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
  refreshKey,
}: {
  ticket: Ticket;
  org: Organization | null;
  onPatch: (body: any) => void;
  refreshKey: number;
}) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  async function load() {
    const res = await fetch(`/api/crm/tickets/${ticket.id}`).then((r) => r.json());
    setNotes(res.notes || []);
    setTasks(res.tasks || []);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticket.id, refreshKey]);

  async function sendReply() {
    if (!reply.trim()) return;
    setSending(true);
    await fetch("/api/crm/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        body: `Reply sent: ${reply}`,
        ticketId: ticket.id,
        orgId: ticket.orgId ?? null,
        author: "Astha Mundhra",
      }),
    });
    await onPatch({ status: "Pending" });
    setReply("");
    setSending(false);
    load();
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-white/40">
          <span className="rounded bg-white/[0.06] px-1.5 py-0.5">{ticket.channel}</span>
          <span>{ticket.category}</span>
          {org && <span>· {org.name}</span>}
        </div>
        <div className="mt-1.5 text-[16px] font-semibold text-white">{ticket.subject}</div>
        <div className="mt-1 text-[12px] text-white/50">
          From {ticket.requesterName} ({ticket.requesterContact}) · {fmtDateTime(ticket.createdAt)}
        </div>
        <div className="mt-3 rounded-lg border border-mc-border bg-black/20 p-3 text-[13px] leading-relaxed text-white/80">
          {ticket.body}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <div className="mb-1 text-[11px] text-white/40">Status</div>
          <select
            value={ticket.status}
            onChange={(e) => onPatch({ status: e.target.value })}
            className="w-full rounded-lg border border-mc-border bg-black/30 px-2.5 py-2 text-[12.5px] text-white"
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
            onChange={(e) => onPatch({ priority: e.target.value })}
            className="w-full rounded-lg border border-mc-border bg-black/30 px-2.5 py-2 text-[12.5px] text-white"
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
            onChange={(e) => onPatch({ assignee: e.target.value })}
            className="w-full rounded-lg border border-mc-border bg-black/30 px-2.5 py-2 text-[12.5px] text-white"
          >
            {ASSIGNEES.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <div className="mb-1.5 text-[11px] uppercase tracking-wide text-white/40">Reply</div>
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          rows={3}
          placeholder="Draft a reply to the requester…"
          className="w-full rounded-lg border border-mc-border bg-black/30 px-3 py-2 text-[13px] text-white outline-none focus:border-mc-blue/60"
        />
        <div className="mt-2 flex justify-end">
          <button
            onClick={sendReply}
            disabled={sending || !reply.trim()}
            className="rounded-lg bg-mc-blue px-4 py-2 text-[12.5px] font-medium text-white hover:bg-mc-blueBright disabled:opacity-50"
          >
            {sending ? "Sending…" : "Send reply"}
          </button>
        </div>
      </div>

      {(notes.length > 0 || tasks.length > 0) && (
        <div>
          <div className="mb-1.5 text-[11px] uppercase tracking-wide text-white/40">Timeline</div>
          <div className="space-y-2">
            {notes.map((n) => (
              <div key={n.id} className="rounded-lg border border-mc-border bg-black/20 p-2.5 text-[12.5px] text-white/75">
                <div className="mb-1 text-[10.5px] text-white/35">
                  {n.author} · {fmtDateTime(n.createdAt)}
                </div>
                {n.body}
              </div>
            ))}
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
