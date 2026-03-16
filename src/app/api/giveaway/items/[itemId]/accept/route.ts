import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/line/auth";
import { sendLinePush } from "@/lib/line/messaging";

// POST /api/giveaway/items/[itemId]/accept
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "LINEログインが必要です" }, { status: 401 });
  }

  const { itemId } = await params;
  const { requestId } = await request.json();

  // アイテムの所有者確認
  const { data: item } = await getSupabaseAdmin()
    .from("giveaway_items")
    .select("*")
    .eq("id", itemId)
    .eq("line_user_id", user.userId)
    .single();

  if (!item) {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  // リクエストの確認
  const { data: giveawayRequest } = await getSupabaseAdmin()
    .from("giveaway_requests")
    .select("*")
    .eq("id", requestId)
    .eq("item_id", itemId)
    .eq("status", "pending")
    .single();

  if (!giveawayRequest) {
    return NextResponse.json({ error: "リクエストが見つかりません" }, { status: 404 });
  }

  // リクエスト承認
  await getSupabaseAdmin()
    .from("giveaway_requests")
    .update({ status: "accepted" })
    .eq("id", requestId);

  // 他のリクエストを拒否
  await getSupabaseAdmin()
    .from("giveaway_requests")
    .update({ status: "rejected" })
    .eq("item_id", itemId)
    .neq("id", requestId)
    .eq("status", "pending");

  // アイテムをreservedに更新
  await getSupabaseAdmin()
    .from("giveaway_items")
    .update({ status: "reserved" })
    .eq("id", itemId);

  // LINE通知: リクエスター宛
  const facilityText = item.facility_name ? `\n受け渡し場所: ${item.facility_name}` : "";
  await sendLinePush(
    giveawayRequest.requester_line_user_id,
    `🎉 お譲りリクエストが承認されました！\n\n「${item.title}」の譲り手さんがリクエストを承認しました。${facilityText}\n\n施設での受け渡しをお願いします。`
  );

  // LINE通知: 出品者宛（確認）
  await sendLinePush(
    user.userId,
    `✅ 「${item.title}」のお譲りが成立しました！\n\nお相手: ${giveawayRequest.requester_display_name}さん${facilityText}\n\n施設への持ち込みをお願いします。`
  );

  return NextResponse.json({ success: true });
}
