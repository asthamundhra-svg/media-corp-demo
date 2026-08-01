import { NextRequest, NextResponse } from "next/server";
import { getToolByName } from "@/lib/mcpTools";

export const dynamic = "force-dynamic";

// Thin wrapper around the shared `send_channel_reply` MCP tool so the
// Support Desk UI's reply composer and the agent chat go through the exact
// same channel-aware reply + delivery-confirmation logic.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const tool = getToolByName("send_channel_reply");
  if (!tool) return NextResponse.json({ error: "send_channel_reply tool not available" }, { status: 500 });
  const result = await tool.execute({ ticketId: params.id, body: body.body });
  if (result?.error) return NextResponse.json(result, { status: 404 });
  return NextResponse.json(result);
}
