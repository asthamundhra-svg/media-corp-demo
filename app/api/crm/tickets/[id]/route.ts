import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/getStore";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const store = getStore();
  const row = await store.getTicket(params.id);
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  const [tasks, notes] = await Promise.all([
    store.listTasks({ ticketId: params.id }),
    store.listNotes({ ticketId: params.id }),
  ]);
  return NextResponse.json({ ticket: row, tasks, notes });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const store = getStore();
  const body = await req.json();
  const row = await store.updateTicket(params.id, body);
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ticket: row });
}
