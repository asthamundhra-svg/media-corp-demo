"use client";

import { useEffect, useMemo, useState } from "react";
import { Contact, Engagement, Note, OrgCategory, Organization, Ticket } from "@/lib/types";
import { fmtDate, fmtSgd, ORG_CATEGORY_LABELS, TICKET_STATUS_COLORS } from "@/lib/format";
import { ENGAGEMENT_TYPE_LABELS, PHASE_COLORS } from "@/lib/engagementMeta";
import { useRole } from "@/components/RoleSwitcher";
import { canViewEngagement, canViewOrgCategory, canViewTicket } from "@/lib/rbac";

const ALL_CATEGORIES: OrgCategory[] = [
  "Advertiser",
  "Agency",
  "Distributor",
  "TalentAgency",
  "ProductionHouse",
  "Sponsor",
  "LocationPartner",
];

export default function Organizations({ refreshKey }: { refreshKey: number }) {
  const { permissions } = useRole();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [category, setCategory] = useState<OrgCategory | "All">("All");
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadAll() {
    setLoading(true);
    const o = await fetch("/api/crm/organizations").then((r) => r.json());
    setOrganizations(o.organizations || []);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  // Only categories this role's domain access permits show up at all - real
  // filtering, not just hidden buttons (e.g. a Content Licensing Manager
  // never sees Advertiser/Agency/TalentAgency/Sponsor/LocationPartner rows).
  const permittedCategories = useMemo(
    () => ALL_CATEGORIES.filter((c) => canViewOrgCategory(permissions, c)),
    [permissions]
  );
  const categoryFilters: (OrgCategory | "All")[] = ["All", ...permittedCategories];

  const visible = useMemo(() => {
    let rows = organizations.filter((o) => canViewOrgCategory(permissions, o.category));
    if (category !== "All") rows = rows.filter((o) => o.category === category);
    if (q.trim()) {
      const needle = q.toLowerCase();
      rows = rows.filter((o) => o.name.toLowerCase().includes(needle) || o.industry.toLowerCase().includes(needle));
    }
    return rows;
  }, [organizations, category, q, permissions]);

  const hiddenCategoryCount = ALL_CATEGORIES.length - permittedCategories.length;

  return (
    <div className="flex h-full flex-col gap-4">
      {hiddenCategoryCount > 0 && (
        <div className="rounded-lg border border-mc-border bg-mc-panel px-3 py-2 text-[11px] text-white/40">
          {permissions.label} sees only organization categories relevant to their domain access. {hiddenCategoryCount}{" "}
          categor{hiddenCategoryCount === 1 ? "y is" : "ies are"} hidden for this role.
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {categoryFilters.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={
                "rounded-full border px-3 py-1 text-[11.5px] " +
                (category === c
                  ? "border-mc-blue bg-mc-blue/15 text-mc-blueBright"
                  : "border-mc-border text-white/50 hover:text-white/80")
              }
            >
              {c === "All" ? "All" : ORG_CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search organizations…"
          className="w-56 rounded-lg border border-mc-border bg-black/30 px-3 py-1.5 text-[12.5px] text-white outline-none focus:border-mc-blue/60"
        />
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        <div className="flex-1 overflow-auto rounded-xl border border-mc-border">
          <table className="w-full text-left text-[12.5px]">
            <thead className="bg-mc-panel text-white/40">
              <tr>
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Category</th>
                <th className="px-3 py-2 font-medium">Industry</th>
                <th className="px-3 py-2 font-medium">HQ</th>
                <th className="px-3 py-2 font-medium">Agency of record</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-white/40">
                    Loading organizations…
                  </td>
                </tr>
              ) : (
                visible.map((o) => (
                  <tr
                    key={o.id}
                    onClick={() => setSelectedId(o.id)}
                    className={
                      "cursor-pointer border-t border-mc-border/60 hover:bg-white/[0.03] " +
                      (selectedId === o.id ? "bg-mc-blue/10" : "")
                    }
                  >
                    <td className="px-3 py-2 font-medium text-white">{o.name}</td>
                    <td className="px-3 py-2">
                      <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10.5px] text-mc-cyan">
                        {ORG_CATEGORY_LABELS[o.category]}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-white/60">{o.industry}</td>
                    <td className="px-3 py-2 text-white/50">{o.hqCity}</td>
                    <td className="px-3 py-2 text-white/50">{o.agencyOfRecord || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {selectedId && (
          <div className="w-[380px] shrink-0 overflow-y-auto rounded-xl border border-mc-border bg-mc-panel p-4">
            <OrgDetail orgId={selectedId} onClose={() => setSelectedId(null)} refreshKey={refreshKey} />
          </div>
        )}
      </div>
    </div>
  );
}

function OrgDetail({ orgId, onClose, refreshKey }: { orgId: string; onClose: () => void; refreshKey: number }) {
  const { permissions } = useRole();
  const [data, setData] = useState<{
    organization: Organization;
    contacts: Contact[];
    engagements: Engagement[];
    tickets: Ticket[];
    notes: Note[];
  } | null>(null);

  useEffect(() => {
    fetch(`/api/crm/organizations/${orgId}`)
      .then((r) => r.json())
      .then(setData);
  }, [orgId, refreshKey]);

  if (!data) return <div className="text-white/40">Loading…</div>;
  const { organization, contacts, notes } = data;
  // Real RBAC filtering, not just a cosmetic label - an Ad Sales Rep only
  // sees their own engagements even inside an org's detail panel, and a
  // role with no Support Desk access sees no tickets here either.
  const engagements = data.engagements.filter((e) => canViewEngagement(permissions, e));
  const tickets = data.tickets.filter((t) => canViewTicket(permissions, t));

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[15px] font-semibold text-white">{organization.name}</div>
          <div className="mt-0.5 text-[11.5px] text-white/40">
            {ORG_CATEGORY_LABELS[organization.category]} · {organization.industry} · {organization.hqCity}
          </div>
          {organization.agencyOfRecord && (
            <div className="mt-0.5 text-[11.5px] text-white/40">Agency of record: {organization.agencyOfRecord}</div>
          )}
        </div>
        <button onClick={onClose} className="text-white/40 hover:text-white">
          ✕
        </button>
      </div>

      <div>
        <div className="mb-1.5 text-[11px] uppercase tracking-wide text-white/40">
          Contacts ({contacts.length})
        </div>
        <div className="space-y-1.5">
          {contacts.map((c) => (
            <div key={c.id} className="rounded-lg border border-mc-border bg-black/20 px-2.5 py-2 text-[12px]">
              <div className="font-medium text-white">
                {c.name} {c.isTalent && <span className="text-mc-cyan">· {c.talentType}</span>}
              </div>
              <div className="text-white/40">
                {c.title} · {c.email}
              </div>
            </div>
          ))}
          {contacts.length === 0 && <div className="text-white/30">No contacts yet.</div>}
        </div>
      </div>

      <div>
        <div className="mb-1.5 text-[11px] uppercase tracking-wide text-white/40">
          Engagements ({engagements.length})
        </div>
        <div className="space-y-1.5">
          {engagements.map((e) => (
            <div key={e.id} className="rounded-lg border border-mc-border bg-black/20 px-2.5 py-2 text-[12px]">
              <div className="flex items-center justify-between">
                <span className="font-medium text-white">{e.name}</span>
                <span style={{ color: PHASE_COLORS[e.phase] }}>{e.phase}</span>
              </div>
              <div className="text-white/40">
                {ENGAGEMENT_TYPE_LABELS[e.type]} · {fmtSgd(e.valueSgd)} · {e.stage}
              </div>
            </div>
          ))}
          {engagements.length === 0 && <div className="text-white/30">No engagements yet.</div>}
        </div>
      </div>

      <div>
        <div className="mb-1.5 text-[11px] uppercase tracking-wide text-white/40">Tickets ({tickets.length})</div>
        <div className="space-y-1.5">
          {tickets.map((t) => (
            <div key={t.id} className="rounded-lg border border-mc-border bg-black/20 px-2.5 py-2 text-[12px]">
              <div className="flex items-center justify-between">
                <span className="font-medium text-white">{t.subject}</span>
                <span style={{ color: TICKET_STATUS_COLORS[t.status] }}>{t.status}</span>
              </div>
              <div className="text-white/40">
                {t.channel} · {fmtDate(t.createdAt)}
              </div>
            </div>
          ))}
          {tickets.length === 0 && <div className="text-white/30">No tickets yet.</div>}
        </div>
      </div>

      {notes.length > 0 && (
        <div>
          <div className="mb-1.5 text-[11px] uppercase tracking-wide text-white/40">Notes</div>
          <div className="space-y-1.5">
            {notes.map((n) => (
              <div key={n.id} className="rounded-lg border border-mc-border bg-black/20 px-2.5 py-2 text-[12px] text-white/70">
                {n.body}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
