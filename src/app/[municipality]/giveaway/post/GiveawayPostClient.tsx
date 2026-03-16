"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLiff } from "@/hooks/useLiff";
import { createGiveawayItem } from "@/lib/api/giveaway";
import {
  GIVEAWAY_CATEGORY_LABELS,
  GIVEAWAY_CONDITION_LABELS,
  GIVEAWAY_AGE_RANGES,
  type GiveawayCategory,
  type GiveawayCondition,
} from "@/lib/data/types";

interface Props {
  municipalityId: string;
  municipalityName: string;
  facilities: { id: string; name: string; subArea: string }[];
}

export default function GiveawayPostClient({ municipalityId, municipalityName, facilities }: Props) {
  const router = useRouter();
  const { isLoggedIn, loading: liffLoading } = useLiff();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<GiveawayCategory | "">("");
  const [ageRange, setAgeRange] = useState("");
  const [condition, setCondition] = useState<GiveawayCondition | "">("");
  const [description, setDescription] = useState("");
  const [facilityId, setFacilityId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const selectedFacility = facilities.find((f) => f.id === facilityId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !category) return;

    setSubmitting(true);
    setError("");

    try {
      await createGiveawayItem({
        municipalityId,
        title,
        category,
        description: description || undefined,
        ageRange: ageRange || undefined,
        condition: condition || undefined,
        facilityId: facilityId || undefined,
        facilityName: selectedFacility?.name,
      });
      router.push(`/${municipalityId}/giveaway`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "登録に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  if (!liffLoading && !isLoggedIn) {
    return (
      <div className="p-4 space-y-4">
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
          onClick={() => router.back()}
          className="text-gray-400 text-sm"
        >
          ← 戻る
        </button>
        <h2 className="text-base font-bold text-gray-900">アイテムを出品</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* タイトル */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            タイトル <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例: サイズ80 冬物セット"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300"
            required
          />
        </div>

        {/* カテゴリ */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            カテゴリ <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2 flex-wrap">
            {(Object.entries(GIVEAWAY_CATEGORY_LABELS) as [GiveawayCategory, { icon: string; label: string }][]).map(
              ([key, { icon, label }]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCategory(key)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    category === key
                      ? "bg-[#e05a8c] text-white border-[#e05a8c]"
                      : "bg-white text-gray-600 border-gray-200"
                  }`}
                >
                  <span>{icon}</span>
                  <span>{label}</span>
                </button>
              )
            )}
          </div>
        </div>

        {/* 対象年齢 */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">対象年齢</label>
          <div className="flex gap-2 flex-wrap">
            {GIVEAWAY_AGE_RANGES.map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setAgeRange(ageRange === range ? "" : range)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  ageRange === range
                    ? "bg-pink-100 text-pink-700 border-pink-300"
                    : "bg-white text-gray-600 border-gray-200"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* 状態 */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">状態</label>
          <div className="flex gap-2 flex-wrap">
            {(Object.entries(GIVEAWAY_CONDITION_LABELS) as [GiveawayCondition, string][]).map(
              ([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCondition(condition === key ? "" : key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    condition === key
                      ? "bg-pink-100 text-pink-700 border-pink-300"
                      : "bg-white text-gray-600 border-gray-200"
                  }`}
                >
                  {label}
                </button>
              )
            )}
          </div>
        </div>

        {/* 説明 */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">説明（任意）</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="サイズ、枚数、ブランドなど自由に記入"
            rows={3}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300 resize-none"
          />
        </div>

        {/* 受渡し施設 */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">受渡し施設（任意）</label>
          <select
            value={facilityId}
            onChange={(e) => setFacilityId(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300 bg-white"
          >
            <option value="">選択してください</option>
            {facilities.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}（{f.subArea}）
              </option>
            ))}
          </select>
          <p className="text-[11px] text-gray-400 mt-1">
            施設が物品の中継場所になります。直接の受け渡しは行いません。
          </p>
        </div>

        {/* エラー */}
        {error && (
          <div className="bg-red-50 rounded-xl p-3 text-xs text-red-600 border border-red-200">
            {error}
          </div>
        )}

        {/* 送信 */}
        <button
          type="submit"
          disabled={!title || !category || submitting}
          className="w-full py-3 rounded-xl text-sm font-bold text-white bg-[#e05a8c] hover:bg-[#c2185b] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? "登録中..." : "出品する"}
        </button>
      </form>
    </div>
  );
}
