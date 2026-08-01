import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/getStore";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const store = getStore();
  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get("limit") || "50");
  const rows = await store.listActivity(limit);
  return NextResponse.json({ activity: rows });
}
