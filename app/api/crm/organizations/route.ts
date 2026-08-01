import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/getStore";
import { OrgCategory } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const store = getStore();
  const { searchParams } = new URL(req.url);
  const category = (searchParams.get("category") as OrgCategory) || undefined;
  const q = searchParams.get("q") || undefined;
  const rows = await store.listOrganizations({ category, q });
  return NextResponse.json({ organizations: rows });
}

export async function POST(req: NextRequest) {
  const store = getStore();
  const body = await req.json();
  const row = await store.createOrganization({
    name: body.name,
    category: body.category ?? "Advertiser",
    industry: body.industry ?? "",
    hqCity: body.hqCity ?? "Singapore",
    website: body.website ?? "",
    agencyOfRecord: body.agencyOfRecord ?? null,
  });
  return NextResponse.json({ organization: row }, { status: 201 });
}
