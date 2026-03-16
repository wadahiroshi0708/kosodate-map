import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/line/auth";
import { transformItemRow } from "@/lib/supabase/transform";
import type { GiveawayItemRow } from "@/lib/supabase/types";

// GET /api/giveaway/items?municipality=soja&category=toys
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const municipality = searchParams.get("municipality");
  const category = searchParams.get("category");

  if (!municipality) {
    return NextResponse.json({ error: "municipality is required" }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdmin();
  let query = supabaseAdmin
    .from("giveaway_items")
    .select("*")
    .eq("municipality_id", municipality)
    .in("status", ["available", "reserved"])
    .order("created_at", { ascending: false });

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const items = ((data ?? []) as GiveawayItemRow[]).map(transformItemRow);
  return NextResponse.json({ items });
}

// POST /api/giveaway/items
export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "LINEログインが必要です" }, { status: 401 });
  }

  const body = await request.json();
  const { municipalityId, title, description, category, ageRange, condition, facilityId, facilityName } = body;

  if (!municipalityId || !title || !category) {
    return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("giveaway_items")
    .insert({
      municipality_id: municipalityId,
      line_user_id: user.userId,
      display_name: user.displayName,
      title,
      description: description || null,
      category,
      age_range: ageRange || null,
      condition: condition || null,
      facility_id: facilityId || null,
      facility_name: facilityName || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ item: transformItemRow(data as GiveawayItemRow) }, { status: 201 });
}
