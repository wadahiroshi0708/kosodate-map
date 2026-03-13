"use client";

import { useState, useEffect, useMemo } from "react";
import type { MunicipalityShops, Shop, PointStrategy } from "@/lib/data/types";

interface ShopsClientProps {
  shops: MunicipalityShops;
  municipalityName: string;
}

const PERSONA_KEY = "kosodate_checklist_persona";

// ペルソナラベル（チェックリストと共有）
const PERSONA_LABELS: Record<string, { icon: string; label: string }> = {
  "dual-income":   { icon: "👨‍👩‍👦", label: "共働き世帯" },
  "stay-at-home":  { icon: "👩‍👧", label: "専業主婦・主夫" },
  "single-parent": { icon: "👤", label: "ひとり親" },
};

function StarRating({ stars, max = 5 }: { stars: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={`text-sm ${i < stars ? "text-yellow-400" : "text-gray-200"}`}>
          ★
        </span>
      ))}
    </div>
  );
}

export default function ShopsClient({ shops, municipalityName }: ShopsClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("supermarket");
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // チェックリストと同じ localStorage キーからペルソナを復元
  useEffect(() => {
    try {
      const saved = localStorage.getItem(PERSONA_KEY);
      if (saved) setSelectedPersona(saved);
    } catch {}
    setLoaded(true);
  }, []);

  const filteredShops = useMemo(
    () => shops.shops.filter((s) => s.category === selectedCategory),
    [shops.shops, selectedCategory]
  );

  // ペルソナ選択時：おすすめ度順でソート
  const sortedShops = useMemo(() => {
    if (!selectedPersona) return filteredShops;
    return [...filteredShops].sort((a, b) => {
      const starA = a.persona_fit[selectedPersona]?.stars ?? 0;
      const starB = b.persona_fit[selectedPersona]?.stars ?? 0;
      return starB - starA;
    });
  }, [filteredShops, selectedPersona]);

  const currentStrategy = useMemo(
    () => shops.point_strategy.find((s) => s.persona === selectedPersona) ?? null,
    [shops.point_strategy, selectedPersona]
  );

  if (!loaded) {
    return (
      <div className="p-4 space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded-xl" />
        <div className="h-24 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* ヘッダーバナー */}
      <div className="bg-gradient-to-r from-[#f97316] to-[#ea580c] rounded-xl p-4 text-white">
        <h2 className="text-base font-bold mb-1">生活インフラガイド</h2>
        <p className="text-xs text-orange-200">
          {municipalityName}のスーパー・ドラッグストアを比較。ポイント戦略で賢く節約。
        </p>
      </div>

      {/* ペルソナ選択（あなたへのおすすめを切り替え） */}
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-2">あなたの家族構成に合わせて並び替え</p>
        <div className="flex gap-2 flex-wrap">
          {Object.entries(PERSONA_LABELS).map(([id, { icon, label }]) => (
            <button
              key={id}
              onClick={() => setSelectedPersona(selectedPersona === id ? null : id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                selectedPersona === id
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-white text-gray-600 border-gray-200"
              }`}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ペルソナ別ポイント戦略バナー */}
      {currentStrategy && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{currentStrategy.icon}</span>
            <h3 className="text-sm font-bold text-amber-800">{currentStrategy.title}</h3>
          </div>
          <div className="bg-white rounded-lg px-3 py-2 mb-3 border border-amber-100">
            <p className="text-xs text-amber-700 font-semibold">💡 おすすめコンボ</p>
            <p className="text-sm font-bold text-gray-800 mt-0.5">{currentStrategy.recommended_combo}</p>
          </div>
          <ul className="space-y-1.5">
            {currentStrategy.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-amber-700">
                <span className="flex-shrink-0 font-bold">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* カテゴリタブ */}
      <div className="overflow-x-auto pb-1 -mx-4 px-4">
        <div className="flex gap-2 min-w-max">
          {shops.categories.map((cat) => {
            const count = shops.shops.filter((s) => s.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? "bg-orange-500 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span className="opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 並び替えインジケーター */}
      {selectedPersona && (
        <p className="text-xs text-orange-600 font-medium">
          ✨ {PERSONA_LABELS[selectedPersona]?.label}へのおすすめ順で表示中
        </p>
      )}

      {/* ショップカード一覧 */}
      <div className="space-y-3">
        {sortedShops.map((shop) => (
          <ShopCard key={shop.id} shop={shop} selectedPersona={selectedPersona} />
        ))}
      </div>

      {/* 注意書き */}
      <div className="bg-yellow-50 rounded-xl p-3 text-xs text-yellow-700 border border-yellow-200">
        <p className="font-semibold mb-1">⚠ ご注意</p>
        <ul className="space-y-1 text-yellow-600">
          <li>・ 店舗情報・ポイント内容は変更されることがあります。</li>
          <li>・ ※マークの店舗は位置情報が未確認のものです。</li>
          <li>・ 来店前に各店舗のアプリ・公式サイトでご確認ください。</li>
        </ul>
      </div>
    </div>
  );
}

function ShopCard({
  shop,
  selectedPersona,
}: {
  shop: Shop;
  selectedPersona: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const personaFit = selectedPersona ? shop.persona_fit[selectedPersona] : null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* カードヘッダー */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4"
      >
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            {/* 名前 + チェーン */}
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-[15px] text-gray-900">{shop.name}</h3>
              {!shop.geocoded && (
                <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">※位置未確認</span>
              )}
            </div>
            {/* ポイントバッジ */}
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: shop.point_system.color }}
              >
                {shop.point_system.name}
              </span>
              <span className="text-xs text-gray-500">{shop.hours}</span>
            </div>
            {/* ポイントレート */}
            <p className="text-xs text-gray-500 mt-1">{shop.point_system.rate}</p>
          </div>
          {/* 展開アイコン */}
          <span className="text-gray-400 text-sm mt-0.5">{expanded ? "▲" : "▼"}</span>
        </div>

        {/* ペルソナおすすめ度（選択時のみ） */}
        {personaFit && (
          <div className="mt-3 bg-orange-50 rounded-lg p-2.5 border border-orange-100">
            <div className="flex items-center gap-2 mb-1">
              <StarRating stars={personaFit.stars} />
              <span className="text-xs font-semibold text-orange-700">
                あなたへのおすすめ度
              </span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">{personaFit.reason}</p>
          </div>
        )}
      </button>

      {/* 展開コンテンツ */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
          {/* 特売日・お得情報 */}
          {shop.point_system.special_days && (
            <div className="flex items-start gap-2 bg-yellow-50 rounded-lg p-3 border border-yellow-100">
              <span className="text-base">🗓</span>
              <div>
                <p className="text-xs font-bold text-yellow-800">お得な日</p>
                <p className="text-xs text-yellow-700 mt-0.5">{shop.point_system.special_days}</p>
              </div>
            </div>
          )}

          {/* 交換レート */}
          <div className="flex items-start gap-2">
            <span className="text-base">🎁</span>
            <div>
              <p className="text-xs font-bold text-gray-700">ポイント交換</p>
              <p className="text-xs text-gray-500 mt-0.5">{shop.point_system.redemption}</p>
            </div>
          </div>

          {/* アプリ情報 */}
          {shop.point_system.app && (
            <div className="flex items-start gap-2">
              <span className="text-base">📱</span>
              <div>
                <p className="text-xs font-bold text-gray-700">アプリ</p>
                <p className="text-xs text-gray-500 mt-0.5">{shop.point_system.app}</p>
              </div>
            </div>
          )}

          {/* 特徴フィーチャーチップ */}
          {shop.features.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-700 mb-1.5">この店の特徴</p>
              <div className="flex flex-wrap gap-1.5">
                {shop.features.map((f) => (
                  <span
                    key={f}
                    className="text-[11px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 全ペルソナのおすすめ度 */}
          <div>
            <p className="text-xs font-bold text-gray-700 mb-2">家族構成別おすすめ度</p>
            <div className="space-y-2">
              {Object.entries(PERSONA_LABELS).map(([personaId, { icon, label }]) => {
                const fit = shop.persona_fit[personaId];
                if (!fit) return null;
                return (
                  <div key={personaId} className="flex items-start gap-2">
                    <span className="text-sm">{icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-600">{label}</span>
                        <StarRating stars={fit.stars} />
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{fit.reason}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 店舗メモ */}
          {shop.notes && (
            <p className="text-xs text-gray-400 italic leading-relaxed border-t border-gray-100 pt-2">
              {shop.notes}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
