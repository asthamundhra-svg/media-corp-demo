import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/getStore";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const store = getStore();
  const row = await store.getOrganization(params.id);
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  const [contacts, engagements, tickets, notes] = await Promise.all([
    store.listContacts({ orgId: params.id }),
    store.listEngagements({ orgId: params.id }),
    store.listTickets({ orgId: params.id }),
    store.listNotes({ orgId: params.id }),
  ]);
  return NextResponse.json({ organization: row, contacts, engagements, tickets, notes });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const store = getStore();
  const body = await req.json();
  const row = await store.updateOrganization(params.id, body);
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ organization: row });
}
