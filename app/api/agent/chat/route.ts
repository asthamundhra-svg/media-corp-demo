import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getToolByName, toolsAsAnthropicFormat, toolsAsOpenAIFormat } from "@/lib/mcpTools";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SYSTEM_PROMPT = `You are the Mediacorp Relationship Hub Agent, an AI assistant embedded in Mediacorp's CRM.
Mediacorp is Singapore's national media network - TV (Channel 5, 8, U, Suria, Vasantham, CNA),
radio (Class 95FM, Gold 905FM, Capital 958FM, YES 933FM, Love 972FM, CNA938), digital (meWATCH, meLISTEN,
CNA.asia) and a DOOH out-of-home network - reaching about 99% of the population weekly across four languages.

Mediacorp manages far more than an advertiser sales pipeline, and so do you. You help the team across six
real relationship domains:
1. Ad Sales & Agencies - advertisers and their media agencies of record, campaigns booked using real
   ad-ops vocabulary (avails, negotiation, booked, makegoods handled via notes/tasks, rate cards).
2. Content Licensing & Syndication - content Mediacorp licenses IN for meWATCH (e.g. Korean dramas from
   CJ ENM, Turkish dramas from Global Agency, factual formats from Beyond Distribution) and content
   Mediacorp syndicates OUT to regional broadcasters (Astro Malaysia, GMA Network, Viu Asia).
3. Talent & Production Partners - actors, radio DJs, hosts and presenters (via their talent agencies) and
   independent production houses (e.g. Beach House Pictures, Akanga Film Asia) - bookings, fees, contracts.
4. Sponsorship & Events - Star Awards, National Day Parade Telecast, festivals and roadshows, distinct
   from straight ad spots.
5. DOOH Location Partners - malls, transit operators and property owners (CapitaLand, SMRT Media,
   Frasers Property, ComfortDelGro) hosting Mediacorp's out-of-home screens - inventory, revenue share,
   contract terms.
6. Support Desk - tickets across 4 real Mediacorp channels: meWATCH (streaming app issues), Broadcast
   (TV + Radio - signal, subtitles, IMDA content complaints, song ID, contests), Advertiser (make-goods,
   invoice disputes, creative rejections), and Corporate (press inquiries, licensing requests, DMCA).

You have full read AND write access to all of this via tools: search/get organizations, list/create/update
engagements across all 5 types, move engagement stages, get pipeline summaries, list/create tickets, assign
tickets, change ticket status, and draft/log ticket replies, plus tasks and notes. Always call tools to look
up or change real data rather than guessing - when a user asks you to do something (create an engagement,
move a stage, assign or reply to a ticket, log a note, create a task), actually call the tool, don't just
describe what you would do. Keep responses concise and concrete, referencing real organization/engagement/
ticket names. Prices are in Singapore dollars (SGD).`;

export async function POST(req: NextRequest) {
  const groqKey = process.env.GROQ_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (!groqKey && !anthropicKey) {
    return NextResponse.json(
      {
        error:
          "No model provider configured on this deployment yet. Add GROQ_API_KEY or ANTHROPIC_API_KEY in the Vercel project's environment variables to enable the agent.",
      },
      { status: 500 }
    );
  }

  const { messages } = await req.json();

  try {
    if (groqKey) {
      const result = await runGroqAgentLoop(groqKey, messages);
      return NextResponse.json(result);
    } else {
      const result = await runAnthropicAgentLoop(anthropicKey!, messages);
      return NextResponse.json(result);
    }
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Agent call failed" }, { status: 500 });
  }
}

// ---------- Anthropic (Claude) tool-use loop ----------
async function runAnthropicAgentLoop(apiKey: string, messages: any[]) {
  const anthropic = new Anthropic({ apiKey });
  const conversation: Anthropic.MessageParam[] = messages.map((m: any) => ({
    role: m.role,
    content: m.content,
  }));
  const trace: any[] = [];
  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5";

  for (let turn = 0; turn < 8; turn++) {
    const response = await anthropic.messages.create({
      model,
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      tools: toolsAsAnthropicFormat() as any,
      messages: conversation,
    });

    conversation.push({ role: "assistant", content: response.content });
    const toolUses = response.content.filter((b: any) => b.type === "tool_use");

    if (toolUses.length === 0) {
      const text = response.content
        .filter((b: any) => b.type === "text")
        .map((b: any) => b.text)
        .join("\n");
      return { reply: text, trace };
    }

    const toolResults: any[] = [];
    for (const use of toolUses as any[]) {
      const tool = getToolByName(use.name);
      let result: any;
      let isError = false;
      try {
        result = tool ? await tool.execute(use.input) : { error: `Unknown tool ${use.name}` };
      } catch (err: any) {
        result = { error: err?.message || "Tool execution failed" };
        isError = true;
      }
      trace.push({ tool: use.name, input: use.input, result });
      toolResults.push({
        type: "tool_result",
        tool_use_id: use.id,
        content: JSON.stringify(result),
        is_error: isError,
      });
    }
    conversation.push({ role: "user", content: toolResults });
  }

  return { reply: "I ran out of steps working through that - could you narrow the request a bit?", trace };
}

// ---------- Groq (OpenAI-compatible function calling) loop ----------
async function runGroqAgentLoop(apiKey: string, messages: any[]) {
  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
  const trace: any[] = [];

  const conversation: any[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages.map((m: any) => ({
      role: m.role,
      content: typeof m.content === "string" ? m.content : JSON.stringify(m.content),
    })),
  ];

  const tools = toolsAsOpenAIFormat();

  for (let turn = 0; turn < 8; turn++) {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: conversation,
        tools,
        tool_choice: "auto",
        temperature: 0.3,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Groq API error (${res.status}): ${errText.slice(0, 300)}`);
    }

    const data = await res.json();
    const choice = data.choices?.[0];
    const message = choice?.message;
    if (!message) throw new Error("Groq returned no message");

    conversation.push(message);

    const toolCalls = message.tool_calls || [];
    if (toolCalls.length === 0) {
      return { reply: message.content || "", trace };
    }

    for (const call of toolCalls) {
      const name = call.function?.name;
      let input: any = {};
      try {
        input = call.function?.arguments ? JSON.parse(call.function.arguments) : {};
      } catch {
        input = {};
      }
      const tool = getToolByName(name);
      let result: any;
      try {
        result = tool ? await tool.execute(input) : { error: `Unknown tool ${name}` };
      } catch (err: any) {
        result = { error: err?.message || "Tool execution failed" };
      }
      trace.push({ tool: name, input, result });
      conversation.push({
        role: "tool",
        tool_call_id: call.id,
        content: JSON.stringify(result),
      });
    }
  }

  return { reply: "I ran out of steps working through that - could you narrow the request a bit?", trace };
}
