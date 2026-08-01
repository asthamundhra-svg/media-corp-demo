# Mediacorp Relationship Hub - Demo

Open-source-CRM-style backend + MCP tool layer + Claude/Groq-powered agentic chat frontend, modeling the
real relationship domains a broadcaster like Mediacorp (Singapore) manages: ad sales & agencies, content
licensing & syndication, talent & production partners, sponsorships & events, DOOH location partners, and
a support desk across meWATCH, Broadcast, Advertiser, and Corporate channels.

## Run locally

```bash
npm install
cp .env.example .env.local   # then fill in the values below
npm run dev
```

Open http://localhost:3000

## Environment variables (.env.local)

- `GROQ_API_KEY` or `ANTHROPIC_API_KEY` - at least one, powers the agent chat tab.
- `GROQ_MODEL` - optional, defaults to `llama-3.3-70b-versatile`.
- `ANTHROPIC_MODEL` - optional, defaults to `claude-sonnet-4-5`.
- `DATABASE_URL` - optional Postgres/Neon connection string. Without it, the app
  runs on an in-memory seeded data store (fine for a single-session demo).

## What's inside

- `app/api/crm/*` - REST CRUD for organizations, contacts, engagements (5 types), tickets, tasks, notes.
- `app/api/mcp/route.ts` - a real MCP JSON-RPC server exposing all CRM actions as tools.
  Any MCP client can connect to `POST /api/mcp`.
- `app/api/agent/chat/route.ts` - the agentic chat loop (Groq or Claude tool-calling)
  that calls the same tools defined in `lib/mcpTools.ts`.
- `components/AgentChat.tsx`, `Pipeline.tsx`, `SupportDesk.tsx`, `Organizations.tsx`, `Architecture.tsx` - the five tabs.
- `lib/seedData.ts` - Mediacorp-flavored demo data grounded in real M&E industry research: advertisers,
  agencies, content distributors, talent agencies, production houses, event sponsors, and DOOH location
  partners, across Channel 5/8/U, Suria, Vasantham, CNA, meWATCH, meLISTEN, and radio stations.
