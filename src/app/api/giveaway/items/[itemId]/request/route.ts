import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/line/auth";

// POST /api/giveaway/items/[itemId]/request
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "LINEログインが必要です" }, { status: 401 });
  }

  const { itemId } = await params;
  const supabaseAdmin = getSupabaseAdmin();

  const body = await request.json();

  // アイテムの存在・ステータス確認
  const { data: item } = await supabaseAdmin
    .from("giveaway_items")
    .select("*")
    .eq("id", itemId)
    .eq("status", "available")
    .single();

  if (!item) {
    return NextResponse.json({ error: "このアイテムは現在利用できません" }, { status: 404 });
  }

  // 自分のアイテムにはリクエストできない
  if (item.line_user_id === user.userId) {
    return NextResponse.json({ error: "自分のアイテムにはリクエストできません" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("giveaway_requests")
    .insert({
      item_id: itemId,
      requester_line_user_id: user.userId,
      requester_display_name: user.displayName,
      message: body.message || null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "すでにリクエスト済みです" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ request: data }, { status: 201 });
}
