"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLiff } from "@/hooks/useLiff";
import { fetchGiveawayItem, requestGiveawayItem } from "@/lib/api/giveaway";
import {
  GIVEAWAY_CATEGORY_LABELS,
  GIVEAWAY_CONDITION_LABELS,
  type GiveawayItem,
} from "@/lib/data/types";

interface Props {
  municipalityId: string;
  itemId: string;
}

export default function GiveawayDetailClient({ municipalityId, itemId }: Props) {
  const router = useRouter();
  const { isLoggedIn, profile } = useLiff();

  const [item, setItem] = useState<GiveawayItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<"success" | "error" | "already" | null>(null);

  useEffect(() => {
    fetchGiveawayItem(itemId)
      .then(setItem)
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  }, [itemId]);

  const isOwner = profile?.userId === item?.lineUserId;

  const handleRequest = async () => {
    setRequesting(true);
    try {
      await requestGiveawayItem(itemId, message || undefined);
      setResult("success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      setResult(msg.includes("リクエスト済み") ? "already" : "error");
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded-xl" />
        <div className="h-32 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="p-4 text-center py-10 text-gray-400 text-sm">
        アイテムが見つかりませんでした
      </div>
    );
  }

  const catLabel = GIVEAWAY_CATEGORY_LABELS[item.category];

  return (
    <div className="p-4 space-y-4">
      {/* 戻るリンク */}
      <button
        onClick={() => router.push(`/${municipalityId}/giveaway`)}
        className="text-gray-400 text-sm"
      >
        ← 一覧に戻る
      </button>

      {/* アイテム詳細カード */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
        {/* タイトル + カテゴリ */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center text-2xl">
            {catLabel?.icon}
          </div>
          <div className="flex-1">
            <h1 className="font-bold text-lg text-gray-900 leading-snug">{item.title}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">
                {catLabel?.label}
              </span>
              {item.condition && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                  {GIVEAWAY_CONDITION_LABELS[item.condition]}
                </span>
              )}
              {item.ageRange && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                  {item.ageRange}
                </span>
              )}
              {item.status === "reserved" && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                  交渉中
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 説明 */}
        {item.description && (
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
            {item.description}
          </p>
        )}

        {/* 出品者 */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>👤 {item.displayName}</span>
        </div>

        {/* 受渡し施設 */}
        {item.facilityName && (
          <div className="bg-gray-50 rounded-lg p-3 text-xs">
            <p className="font-semibold text-gray-600 mb-1">📍 受渡し施設</p>
            <p className="text-gray-500">{item.facilityName}</p>
          </div>
        )}

        {/* リクエスト数 */}
        {item.requestCount !== undefined && item.requestCount > 0 && (
          <p className="text-xs text-gray-400">
            {item.requestCount}人がリクエスト中
          </p>
        )}
      </div>

      {/* アクションエリア */}
      {item.status === "available" && !isOwner && isLoggedIn && !result && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
          <h3 className="font-bold text-sm text-gray-800">🙋 このアイテムが欲しい！</h3>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="メッセージ（任意）例: サイズ80を探していました！"
            rows={2}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 resize-none"
          />
          <button
            onClick={handleRequest}
            disabled={requesting}
            className="w-full py-3 rounded-xl text-sm font-bold text-white bg-[#e05a8c] hover:bg-[#c2185b] disabled:bg-gray-300 transition-colors"
          >
            {requesting ? "送信中..." : "欲しい！リクエストを送る"}
          </button>
        </div>
      )}

      {/* 結果メッセージ */}
      {result === "success" && (
        <div className="bg-green-50 rounded-xl p-4 text-sm text-green-700 border border-green-200 text-center">
          <p className="font-bold mb-1">🎉 リクエストを送信しました！</p>
          <p className="text-xs">出品者が承認するとLINEで通知が届きます。</p>
        </div>
      )}
      {result === "already" && (
        <div className="bg-yellow-50 rounded-xl p-4 text-sm text-yellow-700 border border-yellow-200 text-center">
          すでにリクエスト済みです。
        </div>
      )}
      {result === "error" && (
        <div className="bg-red-50 rounded-xl p-4 text-sm text-red-600 border border-red-200 text-center">
          リクエストに失敗しました。もう一度お試しください。
        </div>
      )}

      {/* オーナー向け案内 */}
      {isOwner && (
        <div className="bg-pink-50 rounded-xl p-3 text-xs text-pink-700 border border-pink-200 text-center">
          これはあなたの出品です。
          <button
            onClick={() => router.push(`/${municipalityId}/giveaway/mypage`)}
            className="underline font-semibold ml-1"
          >
            マイページでリクエストを確認
          </button>
        </div>
      )}

      {/* 未ログイン */}
      {!isLoggedIn && (
        <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700 border border-blue-200">
          <p className="font-semibold mb-1">💡 リクエストするには</p>
          <p>LINEアプリ内からこのページを開いてください。</p>
        </div>
      )}
    </div>
  );
}
