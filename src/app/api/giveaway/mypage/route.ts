import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/line/auth";
import { transformItemRow, transformRequestRow } from "@/lib/supabase/transform";
import type { GiveawayItemRow, GiveawayRequestRow } from "@/lib/supabase/types";

// GET /api/giveaway/mypage?municipality=soja
export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "LINEログインが必要です" }, { status: 401 });
  }

  const municipality = new URL(request.url).searchParams.get("municipality");

  // 自分の出品アイテム
  let itemsQuery = getSupabaseAdmin()
    .from("giveaway_items")
    .select("*")
    .eq("line_user_id", user.userId)
    .order("created_at", { ascending: false });

  if (municipality) {
    itemsQuery = itemsQuery.eq("municipality_id", municipality);
  }

  const { data: myItems } = await itemsQuery;

  // 自分がリクエストしたアイテム
  const { data: myRequests } = await getSupabaseAdmin()
    .from("giveaway_requests")
    .select("*, giveaway_items(*)")
    .eq("requester_line_user_id", user.userId)
    .order("created_at", { ascending: false });

  // 自分のアイテムへのリクエスト
  const itemIds = ((myItems ?? []) as GiveawayItemRow[]).map((i) => i.id);
  let receivedRequests: GiveawayRequestRow[] = [];
  if (itemIds.length > 0) {
    const { data } = await getSupabaseAdmin()
      .from("giveaway_requests")
      .select("*")
      .in("item_id", itemIds)
      .order("created_at", { ascending: false });
    receivedRequests = (data ?? []) as GiveawayRequestRow[];
  }

  return NextResponse.json({
    myItems: ((myItems ?? []) as GiveawayItemRow[]).map(transformItemRow),
    myRequests: myRequests ?? [],
    receivedRequests: receivedRequests.map(transformRequestRow),
  });
}
