export default function Architecture() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 overflow-y-auto py-2 text-[13.5px] leading-relaxed text-white/80">
      <section>
        <h2 className="text-[16px] font-semibold text-white">Why this data model</h2>
        <p className="mt-2">
          A generic advertiser-sales CRM undersells what a broadcaster like Mediacorp actually runs. Mediacorp
          is Singapore&apos;s national media network - TV (Channel 5, 8, U, Suria, Vasantham, CNA), radio
          (Class 95FM, Gold 905FM, Capital 958FM, YES 933FM, Love 972FM, CNA938), digital (meWATCH, meLISTEN)
          and a DOOH out-of-home network - reaching about 99% of the population weekly across four languages.
          Managing that reach means managing six distinct relationship types, each with its own vocabulary,
          and a support desk that receives real, high-volume traffic across very different channels. This
          demo models all of it, not just the ad-sales slice.
        </p>
      </section>

      <section>
        <h2 className="text-[16px] font-semibold text-white">Six relationship domains, one data model</h2>
        <div className="mt-3 grid gap-3">
          <LayerCard
            title="1. Ad Sales & Agencies"
            body="Advertisers (Unilever, DBS, Singtel, Shopee...) and their media agencies of record (GroupM, Dentsu, IPG Mediabrands, Zenith, Wavemaker, OMD). Stage vocabulary mirrors real broadcast ad-ops tools like WideOrbit, Boostr, and Mediaocean: avails sent, negotiation, booked, live - not a generic 'deal' pipeline."
          />
          <LayerCard
            title="2. Content Licensing & Syndication"
            body="Content Mediacorp licenses IN for meWATCH from international distributors (Korean dramas via CJ ENM, Turkish dramas via Global Agency, factual formats via Beyond Distribution), and Mediacorp originals syndicated OUT to regional broadcasters (Astro Malaysia, GMA Network, Viu Asia) - a real, distinct revenue and rights-management workflow."
          />
          <LayerCard
            title="3. Talent & Production Partners"
            body="Actors, radio DJs, hosts and presenters booked through talent/artiste management agencies, plus independent production houses that co-produce factual and drama content - fee negotiation, contracts, and production credits."
          />
          <LayerCard
            title="4. Sponsorship & Events"
            body="Star Awards, the National Day Parade Telecast, festivals and roadshows are sold and sponsored differently from a straight ad spot - title/presenting sponsor tiers, not campaign flights."
          />
          <LayerCard
            title="5. DOOH Location Partners"
            body="Mall operators (CapitaLand, Frasers Property), transit media operators (SMRT Media, ComfortDelGro) - inventory, screen counts, and revenue-share terms, echoing how real DOOH platforms like Broadsign and Vistar Media structure location partnerships."
          />
          <LayerCard
            title="6. Support Desk"
            body="Real Mediacorp support channels: meWATCH streaming issues (playback, billing, login - the kind of volume a Conviva-style QoE/support stack would surface), Broadcast TV/radio (signal, subtitles, IMDA content complaints, song ID, contests), Advertiser (make-goods, invoice disputes), and Corporate (press, licensing requests, DMCA) - styled after Zendesk/Freshdesk-class ticketing, referencing real intake points like tellmediacorp@mediacorp.com.sg, tellmediacorpdigital@mediacorp.com.sg, and mewatch.sg/help."
          />
        </div>
      </section>

      <section>
        <h2 className="text-[16px] font-semibold text-white">The three technical layers</h2>
        <div className="mt-3 grid gap-3">
          <LayerCard
            title="1. Open-source-style CRM backend"
            body="Organizations, contacts, engagements (unified across all 5 relationship types via a type discriminator + a small properties bag), tickets, tasks, and notes - exposed as a clean REST API on Postgres. No per-seat licensing, full data ownership, easy to self-host or extend."
          />
          <LayerCard
            title="2. MCP tool layer"
            body="Every action - search organizations, list/create/update engagements of any type, move a stage, get a pipeline summary, list/create/assign/reply-to tickets, create tasks, log notes - is exposed as an MCP tool over a JSON-RPC endpoint (/api/mcp). Any MCP-compatible client (Claude Desktop, Claude Code, another internal agent) can connect to this CRM directly."
          />
          <LayerCard
            title="3. Agentic frontend"
            body="A chat interface calls an LLM with those same tools. The team asks in plain English - 'assign the Singtel make-good ticket to Ad Ops and draft a reply', 'what DOOH partnerships are up for renewal' - and watches the agent call real tools against real data, live, with every tool call visible for trust and auditability."
          />
        </div>
      </section>

      <section>
        <h2 className="text-[16px] font-semibold text-white">What this demo proves</h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5">
          <li>Full read/write control across all six relationship domains through natural language, not just Q&amp;A on ad sales.</li>
          <li>A real, connectable MCP server - not a mocked chatbot bolted onto a CRM UI.</li>
          <li>A data model grounded in how Mediacorp and the wider media & entertainment industry actually operate - avails and makegoods, not generic deals; licensing direction and territory, not generic content rows; DOOH revenue share, not a flat ad line item.</li>
          <li>A support desk that reflects Mediacorp&apos;s real intake channels and volume patterns, with the agent able to triage, assign, and reply - not just view.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-[16px] font-semibold text-white">Path to production</h2>
        <p className="mt-2">
          For a production rollout we&apos;d stand up a self-hosted open-source CRM (Twenty, EspoCRM, or
          Frappe CRM depending on team preference) behind this same API surface, connect it to Mediacorp&apos;s
          MeID Audience Analytics Hub for targeting-aware recommendations, integrate a real support/ticketing
          backend (Zendesk, Freshdesk, or Salesforce Service Cloud) and a streaming QoE provider (Conviva-style)
          for meWATCH signal quality, add SSO and role-based access per relationship domain, and extend the MCP
          tool set to cover rate-card lookups, rights/territory conflict checks, and DOOH inventory availability.
        </p>
      </section>
    </div>
  );
}

function LayerCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-mc-border bg-mc-panel p-4">
      <div className="text-[13.5px] font-medium text-white">{title}</div>
      <div className="mt-1.5 text-white/60">{body}</div>
    </div>
  );
}
