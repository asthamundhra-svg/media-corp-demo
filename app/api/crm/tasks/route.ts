import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/getStore";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const store = getStore();
  const { searchParams } = new URL(req.url);
  const doneParam = searchParams.get("done");
  const done = doneParam === null ? undefined : doneParam === "true";
  const engagementId = searchParams.get("engagementId") || undefined;
  const ticketId = searchParams.get("ticketId") || undefined;
  const orgId = searchParams.get("orgId") || undefined;
  const rows = await store.listTasks({ done, engagementId, ticketId, orgId });
  return NextResponse.json({ tasks: rows });
}

export async function POST(req: NextRequest) {
  const store = getStore();
  const body = await req.json();
  const row = await store.createTask({
    title: body.title,
    engagementId: body.engagementId ?? null,
    ticketId: body.ticketId ?? null,
    orgId: body.orgId ?? null,
    dueDate: body.dueDate ?? new Date().toISOString(),
    done: body.done ?? false,
    owner: body.owner ?? "Astha Mundhra",
  });
  return NextResponse.json({ task: row }, { status: 201 });
}
