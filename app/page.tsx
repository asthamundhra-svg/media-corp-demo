"use client";

import { useState } from "react";
import AgentChat from "@/components/AgentChat";
import Pipeline from "@/components/Pipeline";
import SupportDesk from "@/components/SupportDesk";
import Organizations from "@/components/Organizations";
import Architecture from "@/components/Architecture";
import RoleSwitcher, { RoleProvider } from "@/components/RoleSwitcher";

type Tab = "agent" | "pipeline" | "support" | "organizations" | "architecture";

const TABS: { id: Tab; label: string }[] = [
  { id: "agent", label: "Agent Chat" },
  { id: "pipeline", label: "Pipeline" },
  { id: "support", label: "Support Desk" },
  { id: "organizations", label: "Organizations" },
  { id: "architecture", label: "Architecture" },
];

export default function Home() {
  const [tab, setTab] = useState<Tab>("agent");
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <RoleProvider>
      <main className="mx-auto flex h-screen max-w-7xl flex-col p-5">
        <header className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-mc-blue to-mc-green font-bold text-white">
              M
            </div>
            <div>
              <div className="text-[15px] font-semibold leading-tight text-white">Mediacorp Relationship Hub</div>
              <div className="text-[11.5px] text-white/40">
                Ad sales · Content licensing · Talent · Sponsorships · DOOH · Support — agentic CRM via MCP
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <nav className="flex gap-1 rounded-lg border border-mc-border bg-mc-panel p-1">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={
                    "rounded-md px-3.5 py-1.5 text-[13px] " +
                    (tab === t.id ? "bg-mc-blue text-white" : "text-white/60 hover:text-white")
                  }
                >
                  {t.label}
                </button>
              ))}
            </nav>
            <RoleSwitcher />
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          {tab === "agent" && <AgentChat onActivity={() => setRefreshKey((k) => k + 1)} />}
          {tab === "pipeline" && <Pipeline refreshKey={refreshKey} />}
          {tab === "support" && <SupportDesk refreshKey={refreshKey} />}
          {tab === "organizations" && <Organizations refreshKey={refreshKey} />}
          {tab === "architecture" && <Architecture />}
        </div>
      </main>
    </RoleProvider>
  );
}
