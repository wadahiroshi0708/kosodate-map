"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLiff } from "@/hooks/useLiff";
import { fetchMyGiveawayData, acceptGiveawayRequest } from "@/lib/api/giveaway";
import {
  GIVEAWAY_CATEGORY_LABELS,
  type GiveawayItem,
  type GiveawayRequest,
} from "@/lib/data/types";

interface Props {
  municipalityId: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  available:  { label: "出品中",   color: "bg-green-100 text-green-700" },
  reserved:   { label: "交渉中",   color: "bg-yellow-100 text-yellow-700" },
  completed:  { label: "完了",     color: "bg-gray-100 text-gray-500" },
  cancelled:  { label: "取消",     color: "bg-red-100 text-red-600" },
  pending:    { label: "承認待ち", color: "bg-yellow-100 text-yellow-700" },
  accepted:   { label: "承認済み", color: "bg-green-100 text-green-700" },
  rejected:   { label: "見送り",   color: "bg-gray-100 text-gray-500" },
};

export default function GiveawayMypageClient({ municipalityId }: Props) {
  const router = useRouter();
  const { isLoggedIn, loading: liffLoading } = useLiff();

  const [tab, setTab] = useState<"items" | "requests">("items");
  const [myItems, setMyItems] = useState<GiveawayItem[]>([]);
  const [myRequests, setMyRequests] = useState<(GiveawayRequest & { giveaway_items: GiveawayItem })[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<GiveawayRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn && !liffLoading) return;
    if (liffLoading) return;

    fetchMyGiveawayData(municipalityId)
      .then((data) => {
        setMyItems(data.myItems);
        setMyRequests(data.myRequests);
        setReceivedRequests(data.receivedRequests);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [municipalityId, isLoggedIn, liffLoading]);

  const handleAccept = async (itemId: string, requestId: string) => {
    setAcceptingId(requestId);
    try {
      await acceptGiveawayRequest(itemId, requestId);
      // リロード
      const data = await fetchMyGiveawayData(municipalityId);
      setMyItems(data.myItems);
      setReceivedRequests(data.receivedRequests);
    } catch {
      alert("承認に失敗しました");
    } finally {
      setAcceptingId(null);
    }
  };

  if (!liffLoading && !isLoggedIn) {
    return (
      <div className="p-4">
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700 border border-blue-200 text-center">
          <p className="font-semibold mb-2">💡 LINEログインが必要です</p>
          <p>LINEアプリ内からこのページを開いてください。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* ヘッダー */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.push(`/${municipalityId}/giveaway`)}
          className="text-gray-400 text-sm"
        >
          ← 戻る
        </button>
        <h2 className="text-base font-bold text-gray-900">📋 マイページ</h2>
      </div>

      {/* タブ */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setTab("items")}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
            tab === "items" ? "bg-white text-[#e05a8c] shadow-sm" : "text-gray-500"
          }`}
        >
          出品中 ({myItems.length})
        </button>
        <button
          onClick={() => setTab("requests")}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
            tab === "requests" ? "bg-white text-[#e05a8c] shadow-sm" : "text-gray-500"
          }`}
        >
          リクエスト ({myRequests.length})
        </button>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {/* 出品中タブ */}
      {!loading && tab === "items" && (
        <div className="space-y-3">
          {myItems.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">
              まだ出品していません
            </div>
          )}
          {myItems.map((item) => {
            const itemRequests = receivedRequests.filter(
              (r) => r.itemId === item.id && r.status === "pending"
            );
            const statusInfo = STATUS_LABELS[item.status];
            return (
              <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-pink-50 flex items-center justify-center text-lg">
                    {GIVEAWAY_CATEGORY_LABELS[item.category]?.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/${municipalityId}/giveaway/${item.id}`}
                      className="font-bold text-sm text-gray-900 hover:text-[#e05a8c] truncate block"
                    >
                      {item.title}
                    </Link>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusInfo?.color}`}>
                      {statusInfo?.label}
                    </span>
                  </div>
                </div>

                {/* 受信リクエスト */}
                {itemRequests.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-semibold text-gray-600">
                      リクエスト ({itemRequests.length}件)
                    </p>
                    {itemRequests.map((req) => (
                      <div
                        key={req.id}
                        className="bg-pink-50 rounded-lg p-3 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {req.requesterDisplayName}
                          </p>
                          {req.message && (
                            <p className="text-xs text-gray-500 mt-0.5">{req.message}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleAccept(item.id, req.id)}
                          disabled={acceptingId === req.id}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#e05a8c] hover:bg-[#c2185b] disabled:bg-gray-300 transition-colors"
                        >
                          {acceptingId === req.id ? "..." : "承認"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* リクエストタブ */}
      {!loading && tab === "requests" && (
        <div className="space-y-3">
          {myRequests.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">
              まだリクエストしていません
            </div>
          )}
          {myRequests.map((req) => {
            const statusInfo = STATUS_LABELS[req.status];
            const item = req.giveaway_items;
            return (
              <Link
                key={req.id}
                href={`/${municipalityId}/giveaway/${req.itemId}`}
                className="block bg-white rounded-xl shadow-sm border border-gray-100 p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-pink-50 flex items-center justify-center text-lg">
                    {item ? GIVEAWAY_CATEGORY_LABELS[item.category as keyof typeof GIVEAWAY_CATEGORY_LABELS]?.icon : "🎁"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-900 truncate">
                      {item?.title ?? "アイテム"}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusInfo?.color}`}>
                        {statusInfo?.label}
                      </span>
                      {req.message && (
                        <span className="text-[10px] text-gray-400 truncate">
                          {req.message}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
