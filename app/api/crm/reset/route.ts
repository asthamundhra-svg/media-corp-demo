import { NextResponse } from "next/server";
import { getStore } from "@/lib/getStore";

export const dynamic = "force-dynamic";

export async function POST() {
  const store = getStore();
  await store.reset();
  return NextResponse.json({ ok: true });
}
