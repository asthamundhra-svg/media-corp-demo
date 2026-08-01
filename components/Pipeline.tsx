"use client";

import { useEffect, useMemo, useState } from "react";
import { Engagement, EngagementType, Organization, Task } from "@/lib/types";
import { fmtSgd, fmtDate } from "@/lib/format";
import { ENGAGEMENT_TYPE_LABELS, ENGAGEMENT_DOMAIN_BLURB, MEDIACORP_PROPERTIES, STAGES_BY_TYPE } from "@/lib/engagementMeta";
import { useRole } from "@/components/RoleSwitcher";
import { canCreateInDomain, canEditEngagement, canViewEngagement, RolePermissions } from "@/lib/rbac";

type SubTab = "board" | "tasks";

// Each of these is its OWN domain with its OWN lifecycle - not one shared
// generic pipeline. See lib/engagementMeta.ts STAGES_BY_TYPE.
const DOMAINS: EngagementType[] = [
  "AdCampaign",
  "ContentLicensing",
  "TalentBooking",
  "Sponsorship",
  "DOOHPartnership",
];

const PROPERTY_FIELDS: Record<EngagementType, { key: string; label: string; type?: "number" }[]> = {
  AdCampaign: [
    { key: "campaignType", label: "Campaign type" },
    { key: "platforms", label: "Platforms (comma separated)" },
  ],
  ContentLicensing: [
    { key: "direction", label: "Direction (Inbound / Outbound)" },
    { key: "contentTitle", label: "Content title" },
    { key: "territory", label: "Territory" },
    { key: "genre", label: "Genre" },
  ],
  TalentBooking: [
    { key: "production", label: "Production" },
    { key: "role", label: "Role" },
  ],
  Sponsorship: [
    { key: "eventName", label: "Event name" },
    { key: "tier", label: "Sponsorship tier" },
  ],
  DOOHPartnership: [
    { key: "venueName", label: "Venue name" },
    { key: "screenCount", label: "Screen count", type: "number" },
    { key: "revenueSharePct", label: "Revenue share %", type: "number" },
    { key: "locationType", label: "Location type" },
  ],
};

export default function Pipeline({ refreshKey }: { refreshKey: number }) {
  const { permissions } = useRole();
  const [sub, setSub] = useState<SubTab>("board");
  const [domain, setDomain] = useState<EngagementType>("AdCampaign");
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);

  async function loadAll() {
    setLoading(true);
    const [e, o, t] = await Promise.all([
      fetch("/api/crm/engagements").then((r) => r.json()),
      fetch("/api/crm/organizations").then((r) => r.json()),
      fetch("/api/crm/tasks").then((r) => r.json()),
    ]);
    setEngagements(e.engagements || []);
    setOrganizations(o.organizations || []);
    setTasks(t.tasks || []);
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

  const engById = useMemo(() => {
    const m: Record<string, Engagement> = {};
    for (const e of engagements) m[e.id] = e;
    return m;
  }, [engagements]);

  async function moveEngagement(id: string, stage: string) {
    setEngagements((cur) => cur.map((e) => (e.id === id ? { ...e, stage } : e)));
    const res = await fetch(`/api/crm/engagements/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage }),
    });
    const data = await res.json();
    if (data.engagement) setEngagements((cur) => cur.map((e) => (e.id === id ? data.engagement : e)));
  }

  async function approvePricing(e: Engagement) {
    await fetch("/api/crm/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        body: `Pricing/discount approved for "${e.name}" by ${permissions.label}.`,
        engagementId: e.id,
        orgId: e.orgId,
        author: permissions.label,
      }),
    });
  }

  async function toggleTask(taskId: string, done: boolean) {
    setTasks((cur) => cur.map((t) => (t.id === taskId ? { ...t, done } : t)));
    await fetch(`/api/crm/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done }),
    });
  }

  const access = permissions.domainAccess[domain];
  const domainEngagements = engagements.filter((e) => e.type === domain);
  const visible = access === "none" ? [] : domainEngagements.filter((e) => canViewEngagement(permissions, e));
  const hiddenCount = domainEngagements.length - visible.length;
  const canCreate = canCreateInDomain(permissions, domain);

  const totalActive = visible.filter((e) => e.phase !== "Cancelled").reduce((s, e) => s + e.valueSgd, 0);
  const liveOrConfirmed = visible.filter((e) => e.phase === "Live" || e.phase === "Confirmed").length;

  const visibleTasks = tasks.filter((t) => {
    if (!t.engagementId) return true;
    const eng = engById[t.engagementId];
    if (!eng) return true;
    return canViewEngagement(permissions, eng);
  });

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-wrap gap-1.5">
        {DOMAINS.map((d) => {
          const dAccess = permissions.domainAccess[d];
          const activeTab = domain === d;
          return (
            <button
              key={d}
              onClick={() => setDomain(d)}
              className={
                "rounded-full border px-3 py-1 text-[11.5px] " +
                (activeTab
                  ? "border-mc-blue bg-mc-blue/15 text-mc-blueBright"
                  : dAccess === "none"
                  ? "border-mc-border text-white/25 hover:text-white/50"
                  : "border-mc-border text-white/50 hover:text-white/80")
              }
            >
              {ENGAGEMENT_TYPE_LABELS[d]}
              {dAccess === "none" && <span className="ml-1.5 text-[9px] uppercase tracking-wide">restricted</span>}
              {dAccess === "read" && <span className="ml-1.5 text-[9px] uppercase tracking-wide text-white/30">read-only</span>}
              {dAccess === "own" && <span className="ml-1.5 text-[9px] uppercase tracking-wide text-white/30">my accounts</span>}
            </button>
          );
        })}
      </div>

      <div className="text-[12px] leading-relaxed text-white/40">{ENGAGEMENT_DOMAIN_BLURB[domain]}</div>

      {access === "none" ? (
        <div className="flex flex-1 items-center justify-center rounded-xl border border-mc-border bg-mc-panel">
          <div className="max-w-md p-8 text-center">
            <div className="text-[14px] font-medium text-white">Restricted for your role</div>
            <div className="mt-2 text-[12.5px] leading-relaxed text-white/50">
              {permissions.label} does not have access to {ENGAGEMENT_TYPE_LABELS[domain]}. Switch to a role with
              access to this domain (e.g. the relevant domain manager, Executive, or Admin / IT) to view it.
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Active relationship value" value={fmtSgd(totalActive)} />
            <StatCard label="Confirmed or live" value={String(liveOrConfirmed)} />
            <StatCard label="Total engagements" value={String(visible.length)} />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-1 rounded-lg border border-mc-border bg-mc-panel p-1">
              {(["board", "tasks"] as SubTab[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSub(s)}
                  className={
                    "rounded-md px-3 py-1.5 text-[12.5px] capitalize " +
                    (sub === s ? "bg-mc-blue text-white" : "text-white/60 hover:text-white")
                  }
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              {access === "read" && (
                <span className="text-[11px] text-white/30">Read-only for your role</span>
              )}
              {sub === "board" && canCreate && (
                <button
                  onClick={() => setShowNew(true)}
                  className="rounded-lg bg-mc-blue px-3 py-1.5 text-[12.5px] font-medium text-white hover:bg-mc-blueBright"
                >
                  + New {ENGAGEMENT_TYPE_LABELS[domain]} Engagement
                </button>
              )}
            </div>
          </div>

          {access === "own" && hiddenCount > 0 && (
            <div className="text-[11px] text-white/30">
              {hiddenCount} other {ENGAGEMENT_TYPE_LABELS[domain]} engagement{hiddenCount === 1 ? "" : "s"} belong
              to other reps and are hidden for your role.
            </div>
          )}

          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="p-8 text-center text-white/40">Loading relationship hub data…</div>
            ) : sub === "board" ? (
              <Board
                engagements={visible}
                orgById={orgById}
                onMove={moveEngagement}
                domain={domain}
                permissions={permissions}
                onApprovePricing={approvePricing}
              />
            ) : (
              <TasksList tasks={visibleTasks} engById={engById} orgById={orgById} onToggle={toggleTask} />
            )}
          </div>
        </>
      )}

      {showNew && canCreate && (
        <NewEngagementModal
          domain={domain}
          permissions={permissions}
          organizations={organizations}
          onClose={() => setShowNew(false)}
          onCreated={() => {
            setShowNew(false);
            loadAll();
          }}
        />
      )}
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

function Board({
  engagements,
  orgById,
  onMove,
  domain,
  permissions,
  onApprovePricing,
}: {
  engagements: Engagement[];
  orgById: Record<string, Organization>;
  onMove: (id: string, stage: string) => void;
  domain: EngagementType;
  permissions: RolePermissions;
  onApprovePricing: (e: Engagement) => void;
}) {
  const stages = STAGES_BY_TYPE[domain];
  return (
    <div className="grid h-full grid-cols-6 gap-3">
      {stages.map((stage) => {
        const stageEngagements = engagements.filter((e) => e.stage === stage);
        const stageTotal = stageEngagements.reduce((s, e) => s + e.valueSgd, 0);
        return (
          <div key={stage} className="flex flex-col rounded-xl border border-mc-border bg-mc-panel">
            <div className="border-b border-mc-border p-3">
              <div className="text-[11.5px] font-medium leading-snug text-white">{stage}</div>
              <div className="mt-1 text-[10.5px] text-white/40">
                {stageEngagements.length} · {fmtSgd(stageTotal)}
              </div>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto p-2">
              {stageEngagements.map((e) => {
                const editable = canEditEngagement(permissions, e);
                return (
                  <div key={e.id} className="rounded-lg border border-mc-border bg-mc-panel2 p-2.5">
                    <div className="text-[12.5px] font-medium leading-snug text-white">{e.name}</div>
                    <div className="mt-1 text-[11px] text-white/50">
                      {orgById[e.orgId]?.name}
                      {e.secondaryOrgId && orgById[e.secondaryOrgId] ? ` · ${orgById[e.secondaryOrgId]?.name}` : ""}
                    </div>
                    <div className="mt-0.5 text-[10px] text-white/30">Owner: {e.owner}</div>
                    <div className="mt-1.5 text-[12px] font-semibold text-mc-green">{fmtSgd(e.valueSgd)}</div>
                    {editable ? (
                      <select
                        value={e.stage}
                        onChange={(ev) => onMove(e.id, ev.target.value)}
                        className="mt-2 w-full rounded border border-mc-border bg-black/30 px-1.5 py-1 text-[11px] text-white/70"
                      >
                        {stages.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="mt-2 rounded border border-mc-border/60 bg-black/20 px-1.5 py-1 text-[11px] text-white/35">
                        Read-only
                      </div>
                    )}
                    {domain === "AdCampaign" && (
                      <button
                        onClick={() => onApprovePricing(e)}
                        disabled={!permissions.canApprovePricing}
                        title={
                          permissions.canApprovePricing
                            ? `Approve pricing/discount (up to ${permissions.discountApprovalThresholdPct}% without escalation)`
                            : "Requires Ad Sales Director (or Admin / IT) role"
                        }
                        className="mt-1.5 w-full rounded border border-mc-border px-1.5 py-1 text-[10.5px] text-white/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        Approve pricing
                      </button>
                    )}
                  </div>
                );
              })}
              {stageEngagements.length === 0 && (
                <div className="p-3 text-center text-[11px] text-white/25">—</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TasksList({
  tasks,
  engById,
  orgById,
  onToggle,
}: {
  tasks: Task[];
  engById: Record<string, Engagement>;
  orgById: Record<string, Organization>;
  onToggle: (id: string, done: boolean) => void;
}) {
  return (
    <div className="space-y-1.5">
      {tasks.map((t) => {
        const eng = t.engagementId ? engById[t.engagementId] : null;
        const org = t.orgId ? orgById[t.orgId] : eng ? orgById[eng.orgId] : null;
        return (
          <label
            key={t.id}
            className="flex items-center gap-3 rounded-lg border border-mc-border bg-mc-panel px-3 py-2.5"
          >
            <input
              type="checkbox"
              checked={t.done}
              onChange={(e) => onToggle(t.id, e.target.checked)}
              className="accent-mc-green"
            />
            <div className="flex-1">
              <div className={"text-[13px] " + (t.done ? "text-white/30 line-through" : "text-white/90")}>
                {t.title}
              </div>
              <div className="text-[11px] text-white/40">
                {eng?.name || org?.name || (t.ticketId ? "Ticket follow-up" : "")} · due {fmtDate(t.dueDate)}
              </div>
            </div>
          </label>
        );
      })}
      {tasks.length === 0 && <div className="p-6 text-center text-white/30">No tasks yet.</div>}
    </div>
  );
}

function NewEngagementModal({
  domain,
  permissions,
  organizations,
  onClose,
  onCreated,
}: {
  domain: EngagementType;
  permissions: RolePermissions;
  organizations: Organization[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const allowedTypes = DOMAINS.filter((d) => canCreateInDomain(permissions, d));
  const [type, setType] = useState<EngagementType>(domain);
  const [name, setName] = useState("");
  const [orgId, setOrgId] = useState(organizations[0]?.id || "");
  const [secondaryOrgId, setSecondaryOrgId] = useState("");
  const [stage, setStage] = useState(STAGES_BY_TYPE[domain][0]);
  const [valueSgd, setValueSgd] = useState(100000);
  const [props, setProps] = useState<Record<string, string>>({});
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  function changeType(t: EngagementType) {
    setType(t);
    setStage(STAGES_BY_TYPE[t][0]);
    setProps({});
    setPlatforms([]);
  }

  async function submit() {
    if (!name || !orgId) return;
    setSaving(true);
    const properties: Record<string, any> = { ...props };
    if (type === "AdCampaign") properties.platforms = platforms;
    await fetch("/api/crm/engagements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        name,
        orgId,
        secondaryOrgId: secondaryOrgId || null,
        stage,
        valueSgd,
        properties,
        owner: permissions.actingAs,
      }),
    });
    setSaving(false);
    onCreated();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md max-h-[85vh] overflow-y-auto rounded-xl border border-mc-border bg-mc-panel p-5">
        <div className="mb-3 text-[15px] font-semibold text-white">New engagement</div>
        <div className="space-y-3">
          <div>
            <div className="mb-1 text-[11px] text-white/40">Type</div>
            <select
              value={type}
              onChange={(e) => changeType(e.target.value as EngagementType)}
              className="w-full rounded-lg border border-mc-border bg-black/30 px-3 py-2 text-[13px] text-white"
            >
              {allowedTypes.map((t) => (
                <option key={t} value={t}>
                  {ENGAGEMENT_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className="mb-1 text-[11px] text-white/40">Name</div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-mc-border bg-black/30 px-3 py-2 text-[13px] text-white"
              placeholder="e.g. Nike CNA938 Sponsorship"
            />
          </div>
          <div>
            <div className="mb-1 text-[11px] text-white/40">Primary organization</div>
            <select
              value={orgId}
              onChange={(e) => setOrgId(e.target.value)}
              className="w-full rounded-lg border border-mc-border bg-black/30 px-3 py-2 text-[13px] text-white"
            >
              {organizations.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} ({o.category})
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className="mb-1 text-[11px] text-white/40">Secondary organization (optional, e.g. agency)</div>
            <select
              value={secondaryOrgId}
              onChange={(e) => setSecondaryOrgId(e.target.value)}
              className="w-full rounded-lg border border-mc-border bg-black/30 px-3 py-2 text-[13px] text-white"
            >
              <option value="">None</option>
              {organizations.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="mb-1 text-[11px] text-white/40">Stage</div>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full rounded-lg border border-mc-border bg-black/30 px-3 py-2 text-[13px] text-white"
              >
                {STAGES_BY_TYPE[type].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="mb-1 text-[11px] text-white/40">Value (SGD)</div>
              <input
                type="number"
                value={valueSgd}
                onChange={(e) => setValueSgd(Number(e.target.value))}
                className="w-full rounded-lg border border-mc-border bg-black/30 px-3 py-2 text-[13px] text-white"
              />
            </div>
          </div>

          {type === "AdCampaign" && (
            <div>
              <div className="mb-1 text-[11px] text-white/40">Mediacorp platforms</div>
              <div className="flex flex-wrap gap-1.5">
                {MEDIACORP_PROPERTIES.map((p) => {
                  const active = platforms.includes(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPlatforms((cur) => (active ? cur.filter((x) => x !== p) : [...cur, p]))}
                      className={
                        "rounded px-2 py-1 text-[11px] " +
                        (active ? "bg-mc-blue text-white" : "bg-white/[0.06] text-white/60")
                      }
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {PROPERTY_FIELDS[type]
            .filter((f) => !(type === "AdCampaign" && f.key === "platforms"))
            .map((f) => (
              <div key={f.key}>
                <div className="mb-1 text-[11px] text-white/40">{f.label}</div>
                <input
                  type={f.type === "number" ? "number" : "text"}
                  value={props[f.key] || ""}
                  onChange={(e) => setProps((cur) => ({ ...cur, [f.key]: e.target.value }))}
                  className="w-full rounded-lg border border-mc-border bg-black/30 px-3 py-2 text-[13px] text-white"
                />
              </div>
            ))}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-3 py-2 text-[13px] text-white/60">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving || !name}
            className="rounded-lg bg-mc-blue px-4 py-2 text-[13px] font-medium text-white hover:bg-mc-blueBright disabled:opacity-50"
          >
            {saving ? "Creating…" : "Create engagement"}
          </button>
        </div>
      </div>
    </div>
  );
}
