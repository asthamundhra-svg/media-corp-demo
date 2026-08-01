// Two-layer architecture: what's actually running today, and what each
// piece maps to on Google Cloud for a fuller production build. Built with
// styled divs (no new dependencies) so it renders inline, in-theme, no
// export needed - meant to be read live with a Google engineer in the room.

const GCP_MAPPING: { component: string; today: string; gcp: string; why: string }[] = [
  {
    component: "Agent reasoning & tool-calling",
    today: "In-process tool loop in app/api/agent/chat/route.ts (Claude or Groq)",
    gcp: "Gemini Enterprise Agent Platform (formerly Vertex AI) with Agent Designer",
    why: "Managed multi-step tool orchestration, evaluation, and guardrails instead of a hand-rolled loop.",
  },
  {
    component: "Omnichannel ingestion (WhatsApp, Instagram, Facebook Messenger, X)",
    today: "Simulated in seed data + send_channel_reply tool",
    gcp: "Conversational Agents / Customer Experience Agent Studio (Gemini-powered)",
    why: "Native, pre-built connectors per social channel instead of custom webhook plumbing per platform.",
  },
  {
    component: "Phone / IVR + live-agent support",
    today: "Phone modeled as a contact channel only",
    gcp: "Contact Center AI Platform (CCAI) with Agent Assist",
    why: "Real-time transcription, IVR deflection, and live suggested-reply assistance for phone support.",
  },
  {
    component: "CRM data store",
    today: "In-memory store (lib/memoryStore.ts), Postgres-ready via lib/pgStore.ts",
    gcp: "AlloyDB (transactional) + BigQuery (analytics / reporting)",
    why: "Durable Postgres-compatible OLTP for live records, plus a warehouse for cross-domain reporting.",
  },
  {
    component: "Event backbone",
    today: "Direct in-process function calls between routes and the store",
    gcp: "Pub/Sub",
    why: "Decouples omnichannel ticket and engagement events from whatever processes them downstream.",
  },
  {
    component: "Contract & rights document parsing",
    today: "Manual entry into the properties bag (territory, genre, exclusivity terms)",
    gcp: "Document AI",
    why: "Structured extraction from PDF/scanned content-licensing and talent contracts.",
  },
  {
    component: "DOOH / sponsorship creative previews",
    today: "Text-only properties (screen count, tier, revenue share)",
    gcp: "Vertex AI Imagen / Lyria",
    why: "Generate creative previews for out-of-home screens and sponsorship audio spots before production.",
  },
  {
    component: "Hosting",
    today: "Vercel (Next.js 14 App Router, auto-deploy from GitHub)",
    gcp: "Cloud Run",
    why: "Same containerized Next.js app, serverless and autoscaling, no rewrite required.",
  },
  {
    component: "Executive dashboards",
    today: "pipeline_summary tool + in-app stat cards",
    gcp: "Looker",
    why: "A governed semantic layer over BigQuery so finance/exec views stay consistent across teams.",
  },
];

export default function Architecture() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 overflow-y-auto py-2 text-[13.5px] leading-relaxed text-white/80">
      <section>
        <h2 className="text-[16px] font-semibold text-white">Why this is built this way</h2>
        <p className="mt-2">
          Mediacorp runs five genuinely different relationship businesses - Ad Sales, Content Licensing, Talent &amp;
          Production, Sponsorship &amp; Events, and DOOH Partnerships - plus a Support Desk that spans 7 real contact
          channels. This demo models each domain with its own real-world lifecycle (not one generic sales funnel) and
          gives every relationship type and every support ticket to an agent that can actually read and write the
          live CRM, not just answer questions about it. What follows is an honest map of what's running today versus
          what a fuller Google Cloud build would look like.
        </p>
      </section>

      <section>
        <h2 className="text-[16px] font-semibold text-white">Layer 1 — Today: working demo</h2>
        <p className="mt-1.5 text-white/50">Everything below is live and clickable in this app right now.</p>
        <div className="mt-4 rounded-xl border border-mc-border bg-mc-panel p-5">
          <div className="flex flex-wrap items-stretch justify-center gap-2">
            <FlowNode title="Browser" subtitle="Agent Chat UI + Pipeline / Support / Organizations tabs" />
            <Arrow />
            <FlowNode title="Next.js 14 App Router" subtitle="Deployed on Vercel, auto-deploy from GitHub" />
            <Arrow />
            <FlowNode title="MCP JSON-RPC tool layer" subtitle="lib/mcpTools.ts — shared by /api/mcp and /api/agent/chat" accent />
          </div>
          <div className="my-2 flex justify-center">
            <DownArrow />
          </div>
          <div className="flex flex-wrap items-stretch justify-center gap-2">
            <FlowNode
              title="In-memory CRM store"
              subtitle="Organizations · Engagements · Tickets · Tasks · Notes · Activity"
            />
            <DoubleArrow />
            <FlowNode title="Agent tool-calling loop" subtitle="8-turn tool loop, full trace shown in the UI" accent />
            <Arrow />
            <FlowNode title="Groq / Anthropic LLM" subtitle="Llama 3.3 70B or Claude Sonnet, provider auto-selected" />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-[16px] font-semibold text-white">Layer 2 — Target: Google Cloud-ready</h2>
        <p className="mt-1.5 text-white/50">
          Every component above maps cleanly onto an existing Google Cloud product - this is a stepping stone, not a
          rewrite.
        </p>
        <div className="mt-4 overflow-hidden rounded-xl border border-mc-border">
          <table className="w-full text-left text-[12.5px]">
            <thead className="bg-mc-panel text-white/40">
              <tr>
                <th className="px-3 py-2 font-medium">Today</th>
                <th className="px-3 py-2 font-medium">Maps to on Google Cloud</th>
                <th className="px-3 py-2 font-medium">Why</th>
              </tr>
            </thead>
            <tbody>
              {GCP_MAPPING.map((row) => (
                <tr key={row.component} className="border-t border-mc-border/60 align-top">
                  <td className="px-3 py-3">
                    <div className="font-medium text-white">{row.component}</div>
                    <div className="mt-0.5 text-[11.5px] text-white/40">{row.today}</div>
                  </td>
                  <td className="px-3 py-3">
                    <span className="rounded bg-mc-green/10 px-2 py-1 text-[12px] font-medium text-mc-green">
                      {row.gcp}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-white/55">{row.why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-[16px] font-semibold text-white">What this demo proves today</h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5">
          <li>Five real relationship domains, each with its own lifecycle and Kanban board - not a reskinned generic funnel.</li>
          <li>Working, enforced role-based access - domain scoping, ownership scoping, and channel scoping, gated live in the UI and honored by the agent's own responses.</li>
          <li>A real omnichannel support model - 7 contact channels, live message threads, and channel-aware replies with simulated delivery confirmations.</li>
          <li>A real, connectable MCP server (POST /api/mcp) - any MCP-compatible client can call these same tools directly.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-[16px] font-semibold text-white">Path to production</h2>
        <p className="mt-2">
          This build is intentionally honest about where it sits: a fully working agentic CRM on an in-memory (or
          optionally Postgres) store, ready to be lifted onto the Google Cloud stack above with no architectural
          rewrite - the tool-calling contract, the domain data model, and the RBAC layer all carry over unchanged.
        </p>
      </section>
    </div>
  );
}

function FlowNode({ title, subtitle, accent }: { title: string; subtitle: string; accent?: boolean }) {
  return (
    <div
      className={
        "flex w-48 flex-col justify-center rounded-lg border px-3 py-3 text-center " +
        (accent ? "border-mc-blue/50 bg-mc-blue/10" : "border-mc-border bg-mc-panel2")
      }
    >
      <div className={"text-[12.5px] font-semibold " + (accent ? "text-mc-blueBright" : "text-white")}>{title}</div>
      <div className="mt-1 text-[10.5px] leading-snug text-white/45">{subtitle}</div>
    </div>
  );
}

function Arrow() {
  return (
    <div className="flex items-center px-1 text-mc-green">
      <span className="text-[18px]">→</span>
    </div>
  );
}

function DownArrow() {
  return <span className="text-[18px] text-mc-green">↓</span>;
}

function DoubleArrow() {
  return (
    <div className="flex items-center px-1 text-mc-cyan">
      <span className="text-[18px]">⇄</span>
    </div>
  );
}
