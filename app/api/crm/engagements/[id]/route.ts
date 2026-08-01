import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/getStore";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const store = getStore();
  const row = await store.getEngagement(params.id);
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  const [tasks, notes] = await Promise.all([
    store.listTasks({ engagementId: params.id }),
    store.listNotes({ engagementId: params.id }),
  ]);
  return NextResponse.json({ engagement: row, tasks, notes });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const store = getStore();
  const body = await req.json();
  const row = await store.updateEngagement(params.id, body);
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ engagement: row });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const store = getStore();
  const ok = await store.deleteEngagement(params.id);
  return NextResponse.json({ deleted: ok });
}
