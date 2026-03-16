"use client";

// ===================================
// AnalyticsProvider
// LiffContextのプロフィール情報を受け取り
// トラッカーを初期化する
// ===================================

import { useContext, useEffect, type ReactNode } from "react";
import { LiffContext } from "./LiffProvider";
import { initTracker, retryBufferedEvents } from "@/lib/analytics/tracker";

interface Props {
  municipalityId: string;
  children: ReactNode;
}

export default function AnalyticsProvider({ municipalityId, children }: Props) {
  const { profile, loading, isLiff } = useContext(LiffContext);

  useEffect(() => {
    // LIFFの初期化完了を待つ
    if (loading) return;

    const platform = isLiff ? "line_liff" : "web";

    initTracker({
      municipalityId,
      lineUserId: profile?.userId,  // LINEログイン済みなら匿名ハッシュ化
      platform,
    }).then(() => {
      // バッファされていた失敗イベントを再送
      if (profile?.userId) {
        import("@/lib/analytics/anonymize").then(({ toAnonymousId }) =>
          toAnonymousId(profile.userId).then((anonId) => retryBufferedEvents(anonId))
        );
      }
    });
  }, [loading, profile, isLiff, municipalityId]);

  return <>{children}</>;
}
