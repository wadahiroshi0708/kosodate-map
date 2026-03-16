// ===================================
// POST /api/events
// クライアントからのイベントバッチを受け取りSupabaseに保存
// ===================================

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { EventRow } from "@/lib/analytics/types";

const ALLOWED_EVENT_TYPES = new Set([
  "search",
  "facility_view",
  "facility_favorite",
  "facility_contact",
  "subsidy_view",
  "municipality_compare",
  "onboarding_step",
  "checklist_view",
  "session_start",
]);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { anonymous_id, events } = body;

    // バリデーション
    if (!anonymous_id || typeof anonymous_id !== "string") {
      return NextResponse.json({ error: "invalid anonymous_id" }, { status: 400 });
    }
    if (!Array.isArray(events) || events.length === 0) {
      return NextResponse.json({ ok: true, inserted: 0 });
    }
    if (events.length > 100) {
      return NextResponse.json({ error: "too many events" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // anonymous_users をupsert（初回訪問の登録 or last_seen_at の更新）
    await supabase
      .from("anonymous_users")
      .upsert(
        {
          anonymous_id,
          last_seen_at: new Date().toISOString(),
          platform: events[0]?.platform ?? "web",
          municipality_id: events[0]?.municipality_id ?? null,
        },
        {
          onConflict: "anonymous_id",
          ignoreDuplicates: false,
        }
      )
      .select();

    // イベントをバリデートして整形
    const rows: Omit<EventRow, "id" | "created_at">[] = events
      .filter((e) => ALLOWED_EVENT_TYPES.has(e.event_type))
      .map((e) => ({
        anonymous_id,
        session_id: String(e.session_id ?? ""),
        event_type: e.event_type,
        occurred_at: e.occurred_at ?? new Date().toISOString(),
        geo_h3_r8: e.geo_h3_r8 ?? null,
        municipality_id: String(e.municipality_id ?? ""),
        platform: e.platform ?? "web",
        properties: e.properties ?? {},
      }));

    if (rows.length === 0) {
      return NextResponse.json({ ok: true, inserted: 0 });
    }

    const { error } = await supabase.from("events").insert(rows);

    if (error) {
      console.error("[events] Supabase insert error:", error.message);
      return NextResponse.json({ error: "db error" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, inserted: rows.length });
  } catch (err) {
    console.error("[events] unexpected error:", err);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}

// GETはヘルスチェック用
export async function GET() {
  return NextResponse.json({ status: "ok" });
}
