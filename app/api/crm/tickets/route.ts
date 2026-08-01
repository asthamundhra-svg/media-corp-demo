import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/getStore";
import { TicketChannel, TicketStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const store = getStore();
  const { searchParams } = new URL(req.url);
  const channel = (searchParams.get("channel") as TicketChannel) || undefined;
  const status = (searchParams.get("status") as TicketStatus) || undefined;
  const orgId = searchParams.get("orgId") || undefined;
  const q = searchParams.get("q") || undefined;
  const rows = await store.listTickets({ channel, status, orgId, q });
  return NextResponse.json({ tickets: rows });
}

export async function POST(req: NextRequest) {
  const store = getStore();
  const body = await req.json();
  const row = await store.createTicket({
    channel: body.channel ?? "meWATCH",
    category: body.category ?? "",
    subject: body.subject,
    body: body.body ?? "",
    requesterName: body.requesterName ?? "",
    requesterContact: body.requesterContact ?? "",
    orgId: body.orgId ?? null,
    status: body.status ?? "New",
    priority: body.priority ?? "Medium",
    assignee: body.assignee ?? "Unassigned",
    resolvedAt: null,
  });
  return NextResponse.json({ ticket: row }, { status: 201 });
}
