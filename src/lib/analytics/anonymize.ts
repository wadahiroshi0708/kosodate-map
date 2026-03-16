// ===================================
// 匿名化ユーティリティ
// - LINE User ID → 不可逆ハッシュ (anonymous_id)
// - 緯度経度 → H3インデックス（解像度8, ≈600m圏）
// - 時刻 → 分単位に丸め
// ===================================

import { latLngToCell } from "h3-js";

const ANONYMOUS_ID_SALT = process.env.NEXT_PUBLIC_ANON_ID_SALT ?? "kosodate-map-v1";

/**
 * LINE User ID → SHA-256ハッシュ → anonymous_id
 * 同一ユーザーは常に同じIDになる（再訪問追跡を可能にする）
 * LINE IDには戻せない（プライバシー保護）
 */
export async function toAnonymousId(lineUserId: string): Promise<string> {
  const input = `${ANONYMOUS_ID_SALT}:${lineUserId}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * ブラウザセッション用の匿名ID
 * LINEログインしていない場合はlocalStorageのランダムUUIDを使用
 */
export function getOrCreateSessionAnonymousId(): string {
  const KEY = "kosodate_anon_id";
  if (typeof window === "undefined") return "server";

  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}

/**
 * 緯度経度 → H3インデックス（解像度8, ≈600m圏）
 * 個人の位置特定を防ぎながら空間集計を可能にする
 */
export function toH3Index(lat: number, lng: number, resolution: 8 | 7 = 8): string {
  return latLngToCell(lat, lng, resolution);
}

/**
 * 時刻を分単位に丸める（個人特定リスクを低減）
 */
export function roundToMinute(date: Date = new Date()): string {
  const d = new Date(date);
  d.setSeconds(0, 0);
  return d.toISOString();
}

/**
 * セッションIDを生成（タブ/ウィンドウ単位）
 * sessionStorageに保存するためタブを閉じるとリセット
 */
export function getOrCreateSessionId(): string {
  const KEY = "kosodate_session_id";
  if (typeof window === "undefined") return "server";

  let id = sessionStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(KEY, id);
  }
  return id;
}

/**
 * User-Agentからデバイスカテゴリを判定
 */
export function getDeviceCategory(): "mobile" | "tablet" | "desktop" {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "tablet";
  if (/mobile|android|iphone|ipod|blackberry|opera mini|windows phone/i.test(ua)) return "mobile";
  return "desktop";
}

/**
 * リファラーからドメインのみを抽出（個人情報を含むパスを除去）
 */
export function sanitizeReferrer(): string | null {
  if (typeof document === "undefined") return null;
  try {
    const ref = document.referrer;
    if (!ref) return null;
    const url = new URL(ref);
    return url.hostname;
  } catch {
    return null;
  }
}
