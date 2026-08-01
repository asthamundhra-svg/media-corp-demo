import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/getStore";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const store = getStore();
  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get("orgId") || undefined;
  const q = searchParams.get("q") || undefined;
  const isTalentParam = searchParams.get("isTalent");
  const isTalent = isTalentParam === null ? undefined : isTalentParam === "true";
  const rows = await store.listContacts({ orgId, q, isTalent });
  return NextResponse.json({ contacts: rows });
}

export async function POST(req: NextRequest) {
  const store = getStore();
  const body = await req.json();
  const row = await store.createContact({
    orgId: body.orgId ?? null,
    name: body.name,
    title: body.title ?? "",
    email: body.email ?? "",
    phone: body.phone ?? "",
    isTalent: body.isTalent ?? false,
    talentType: body.talentType ?? null,
  });
  return NextResponse.json({ contact: row }, { status: 201 });
}
