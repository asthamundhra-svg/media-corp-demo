"use client";

import { useState, useRef, useEffect } from "react";
import { useRole } from "@/components/RoleSwitcher";

type ChatMessage = { role: "user" | "assistant"; content: string };
type TraceEntry = { tool: string; input: any; result: any };

const SUGGESTIONS = [
  "How's the relationship pipeline looking right now?",
  "Show me all engagements with Samsung",
  "Move the Shopee 11.11 campaign to Negotiation",
  "What meWATCH tickets are still open?",
  "Assign the Singtel make-good ticket to Ad Ops Team and draft a reply",
  "Create a talent booking for Kenneth Wu on the new Channel 8 drama",
  "Any DOOH partnerships coming up for renewal?",
  "Log a note: CJ ENM wants a 12-month exclusivity window",
];

export default function AgentChat({ onActivity }: { onActivity: () => void }) {
  const { role, permissions } = useRole();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi, I'm the Mediacorp Relationship Hub Agent. Ask me about ad sales & agencies, content licensing, talent & production bookings, sponsorships & events, DOOH location partners, or support tickets across meWATCH, Broadcast, Advertiser, and Corporate channels - I'll act on the live CRM in real time.",
    },
  ]);
  const [traces, setTraces] = useState<Record<number, TraceEntry[]>>({});
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    setError(null);
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong calling the agent.");
        setLoading(false);
        return;
      }
      setMessages((cur) => {
        const updated = [...cur, { role: "assistant" as const, content: data.reply }];
        if (data.trace?.length) {
          setTraces((t) => ({ ...t, [updated.length - 1]: data.trace }));
        }
        return updated;
      });
      if (data.trace?.length) onActivity();
    } catch (e: any) {
      setError(e?.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full gap-4">
      <div className="flex flex-1 flex-col rounded-xl border border-mc-border bg-mc-panel overflow-hidden">
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <div
                className={
                  "max-w-[80%] rounded-2xl px-4 py-2.5 text-[13.5px] leading-relaxed whitespace-pre-wrap " +
                  (m.role === "user" ? "bg-mc-blue text-white" : "bg-white/[0.06] text-[#e7edf5]")
                }
              >
                {m.content}
                {traces[i] && traces[i].length > 0 && (
                  <div className="mt-2 space-y-1.5 border-t border-white/10 pt-2">
                    {traces[i].map((t, j) => (
                      <details key={j} className="text-[11.5px] text-white/70">
                        <summary className="cursor-pointer select-none text-mc-cyan">
                          ⚙ {t.tool}({Object.keys(t.input || {}).length ? JSON.stringify(t.input) : ""})
                        </summary>
                        <pre className="mt-1 max-h-40 overflow-auto rounded bg-black/30 p-2 text-[11px]">
                          {JSON.stringify(t.result, null, 2)}
                        </pre>
                      </details>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-white/[0.06] px-4 py-2.5 text-[13.5px] text-white/60">
                thinking, calling tools…
              </div>
            </div>
          )}
          {error && (
            <div className="rounded-lg border border-mc-blue/40 bg-mc-blue/10 px-3 py-2 text-[12.5px] font-medium text-mc-blueBright">
              {error}
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div className="border-t border-mc-border p-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the agent to search, update, or create something…"
              className="flex-1 rounded-lg border border-mc-border bg-black/30 px-3 py-2.5 text-[13.5px] text-white outline-none focus:border-mc-blue/60"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-mc-blue px-4 py-2.5 text-[13.5px] font-medium text-white hover:bg-mc-blueBright disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      </div>

      <div className="hidden w-64 shrink-0 flex-col gap-2 md:flex">
        <div className="rounded-xl border border-mc-border bg-mc-panel p-3">
          <div className="mb-1 text-[11px] uppercase tracking-wide text-white/40">Acting as</div>
          <div className="text-[13px] font-medium text-mc-blueBright">{permissions.label}</div>
          <div className="mt-1 text-[11px] leading-snug text-white/40">{permissions.description}</div>
        </div>
        <div className="rounded-xl border border-mc-border bg-mc-panel p-3">
          <div className="mb-2 text-[11px] uppercase tracking-wide text-white/40">Try asking</div>
          <div className="flex flex-col gap-1.5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                disabled={loading}
                className="rounded-lg border border-mc-border bg-white/[0.03] px-2.5 py-2 text-left text-[12px] text-white/70 hover:border-mc-blue/50 hover:text-white disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
