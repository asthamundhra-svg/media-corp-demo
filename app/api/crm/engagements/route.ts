import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/getStore";
import { EngagementPhase, EngagementType } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const store = getStore();
  const { searchParams } = new URL(req.url);
  const type = (searchParams.get("type") as EngagementType) || undefined;
  const phase = (searchParams.get("phase") as EngagementPhase) || undefined;
  const orgId = searchParams.get("orgId") || undefined;
  const q = searchParams.get("q") || undefined;
  const rows = await store.listEngagements({ type, phase, orgId, q });
  return NextResponse.json({ engagements: rows });
}

export async function POST(req: NextRequest) {
  const store = getStore();
  const body = await req.json();
  const row = await store.createEngagement({
    type: body.type ?? "AdCampaign",
    name: body.name,
    orgId: body.orgId,
    secondaryOrgId: body.secondaryOrgId ?? null,
    contactId: body.contactId ?? null,
    stage: body.stage ?? "Prospecting",
    valueSgd: body.valueSgd ?? 0,
    startDate: body.startDate ?? new Date().toISOString(),
    endDate: body.endDate ?? new Date().toISOString(),
    properties: body.properties ?? {},
    owner: body.owner ?? "Astha Mundhra",
  });
  return NextResponse.json({ engagement: row }, { status: 201 });
}
