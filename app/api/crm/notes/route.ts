import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/getStore";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const store = getStore();
  const { searchParams } = new URL(req.url);
  const engagementId = searchParams.get("engagementId") || undefined;
  const ticketId = searchParams.get("ticketId") || undefined;
  const orgId = searchParams.get("orgId") || undefined;
  const rows = await store.listNotes({ engagementId, ticketId, orgId });
  return NextResponse.json({ notes: rows });
}

export async function POST(req: NextRequest) {
  const store = getStore();
  const body = await req.json();
  const row = await store.createNote({
    body: body.body,
    engagementId: body.engagementId ?? null,
    ticketId: body.ticketId ?? null,
    orgId: body.orgId ?? null,
    contactId: body.contactId ?? null,
    author: body.author ?? "Astha Mundhra",
  });
  return NextResponse.json({ note: row }, { status: 201 });
}
