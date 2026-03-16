import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { transformItemRow } from "@/lib/supabase/transform";
import type { GiveawayItemRow } from "@/lib/supabase/types";

// GET /api/giveaway/items/[itemId]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const { itemId } = await params;
  const supabaseAdmin = getSupabaseAdmin();

  const { data: item, error } = await supabaseAdmin
    .from("giveaway_items")
    .select("*")
    .eq("id", itemId)
    .single();

  if (error || !item) {
    return NextResponse.json({ error: "アイテムが見つかりません" }, { status: 404 });
  }

  const { count } = await supabaseAdmin
    .from("giveaway_requests")
    .select("*", { count: "exact", head: true })
    .eq("item_id", itemId)
    .eq("status", "pending");

  return NextResponse.json({
    item: { ...transformItemRow(item as GiveawayItemRow), requestCount: count ?? 0 },
  });
}
