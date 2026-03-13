"use client";

import { useState, useEffect, useCallback } from "react";
import type { MunicipalityChecklist, PersonaChecklist, ChecklistItem } from "@/lib/data/types";

interface ChecklistClientProps {
  checklist: MunicipalityChecklist;
  municipalityName: string;
}

// localStorage のキー
const PERSONA_KEY = "kosodate_checklist_persona";
const CHECKED_KEY = "kosodate_checklist_checked";

export default function ChecklistClient({
  checklist,
  municipalityName,
}: ChecklistClientProps) {
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  // localStorage から復元
  useEffect(() => {
    try {
      const savedPersona = localStorage.getItem(PERSONA_KEY);
      const savedChecked = localStorage.getItem(CHECKED_KEY);
      if (savedPersona) setSelectedPersonaId(savedPersona);
      if (savedChecked) setCheckedItems(new Set(JSON.parse(savedChecked)));
    } catch {
      // localStorage が使えない環境（SSR等）は無視
    }
    setLoaded(true);
  }, []);

  // ペルソナ変更
  const handlePersonaSelect = useCallback((personaId: string) => {
    setSelectedPersonaId(personaId);
    try {
      localStorage.setItem(PERSONA_KEY, personaId);
    } catch {}
  }, []);

  // チェック状態の切り替え
  const handleToggle = useCallback((itemId: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      try {
        localStorage.setItem(CHECKED_KEY, JSON.stringify([...next]));
      } catch {}
      return next;
    });
  }, []);

  // チェックをリセット
  const handleReset = useCallback(() => {
    if (!window.confirm("チェックをすべてリセットしますか？")) return;
    setCheckedItems(new Set());
    try {
      localStorage.removeItem(CHECKED_KEY);
    } catch {}
  }, []);

  const selectedPersona = checklist.personas.find(
    (p) => p.id === selectedPersonaId
  );

  // 全アイテム数と完了数
  const totalItems = selectedPersona
    ? selectedPersona.sections.reduce((sum, s) => sum + s.items.length, 0)
    : 0;
  const doneItems = selectedPersona
    ? selectedPersona.sections
        .flatMap((s) => s.items)
        .filter((item) => checkedItems.has(item.id)).length
    : 0;
  const progress = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

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
      <div className="bg-gradient-to-r from-[#2d9e6b] to-[#1a7a52] rounded-xl p-4 text-white">
        <h2 className="text-base font-bold mb-1">転入チェックリスト</h2>
        <p className="text-xs text-green-200">
          {municipalityName}に転入したらやること。あなたの状況を選んでスタート。
        </p>
      </div>

      {/* ペルソナ選択 */}
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-3">あなたの家族構成は？</p>
        <div className="grid grid-cols-3 gap-2">
          {checklist.personas.map((persona) => {
            const isSelected = selectedPersonaId === persona.id;
            return (
              <button
                key={persona.id}
                onClick={() => handlePersonaSelect(persona.id)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-center ${
                  isSelected
                    ? "border-[#2d9e6b] bg-[#f0faf5] shadow-sm"
                    : "border-gray-200 bg-white"
                }`}
              >
                <span className="text-2xl">{persona.icon}</span>
                <span
                  className={`text-xs font-semibold leading-tight ${
                    isSelected ? "text-[#2d9e6b]" : "text-gray-700"
                  }`}
                >
                  {persona.label}
                </span>
                <span className="text-[10px] text-gray-400 leading-tight">
                  {persona.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* チェックリスト本体 */}
      {selectedPersona ? (
        <>
          {/* 進捗バー */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">
                {selectedPersona.icon} {selectedPersona.label}の進捗
              </span>
              <span className="text-sm font-bold" style={{ color: selectedPersona.color }}>
                {doneItems}/{totalItems}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${progress}%`,
                  backgroundColor: selectedPersona.color,
                }}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-400">{progress}% 完了</span>
              {doneItems > 0 && (
                <button
                  onClick={handleReset}
                  className="text-xs text-gray-400 underline"
                >
                  リセット
                </button>
              )}
            </div>
          </div>

          {/* セクション別チェックリスト */}
          {selectedPersona.sections.map((section) => (
            <div key={section.id}>
              <h3 className="text-sm font-bold text-gray-700 mb-2">
                {section.title}
              </h3>
              <div className="space-y-2">
                {section.items.map((item) => (
                  <ChecklistItemCard
                    key={item.id}
                    item={item}
                    checked={checkedItems.has(item.id)}
                    onToggle={handleToggle}
                    accentColor={selectedPersona.color}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* 完了メッセージ */}
          {progress === 100 && (
            <div className="bg-[#f0faf5] border border-[#c8ead8] rounded-xl p-4 text-center">
              <p className="text-2xl mb-1">🎉</p>
              <p className="text-sm font-bold text-[#2d9e6b]">
                すべての手続きが完了しました！
              </p>
              <p className="text-xs text-green-600 mt-1">
                {municipalityName}での新生活をお楽しみください
              </p>
            </div>
          )}
        </>
      ) : (
        /* 未選択時のガイド */
        <div className="bg-white rounded-xl p-6 text-center border border-gray-100">
          <p className="text-3xl mb-3">☝️</p>
          <p className="text-sm font-semibold text-gray-600 mb-1">
            上から家族構成を選んでください
          </p>
          <p className="text-xs text-gray-400">
            あなたに必要な手続き・設定が表示されます
          </p>
        </div>
      )}

      {/* 注意書き */}
      <div className="bg-yellow-50 rounded-xl p-3 text-xs text-yellow-700 border border-yellow-200">
        <p className="font-semibold mb-1">⚠ ご注意</p>
        <ul className="space-y-1 text-yellow-600">
          <li>・ 手続きの期限・内容は変更されることがあります。</li>
          <li>・ 詳細は各窓口に直接ご確認ください。</li>
          <li>・ チェック状態はこのスマホに保存されます。</li>
        </ul>
      </div>
    </div>
  );
}

// 個別チェックアイテムカード
function ChecklistItemCard({
  item,
  checked,
  onToggle,
  accentColor,
}: {
  item: ChecklistItem;
  checked: boolean;
  onToggle: (id: string) => void;
  accentColor: string;
}) {
  const urgencyBadge: Record<string, { label: string; bg: string; text: string }> = {
    high: { label: "急ぎ", bg: "bg-red-50", text: "text-red-600" },
    medium: { label: "優先", bg: "bg-orange-50", text: "text-orange-600" },
    low: { label: "", bg: "", text: "" },
  };

  const badge = urgencyBadge[item.urgency];

  return (
    <button
      onClick={() => onToggle(item.id)}
      className={`w-full text-left p-3 rounded-xl border transition-all ${
        checked
          ? "bg-gray-50 border-gray-200 opacity-60"
          : "bg-white border-gray-200 shadow-sm"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* チェックボックス */}
        <div
          className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 transition-all ${
            checked ? "border-gray-300 bg-gray-200" : "border-gray-300"
          }`}
          style={checked ? {} : { borderColor: accentColor }}
        >
          {checked && <span className="text-gray-400 text-xs">✓</span>}
        </div>

        {/* テキスト */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-sm font-medium ${
                checked ? "line-through text-gray-400" : "text-gray-800"
              }`}
            >
              {item.text}
            </span>
            {badge.label && (
              <span
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${badge.bg} ${badge.text}`}
              >
                {badge.label}
              </span>
            )}
          </div>

          {item.deadline && (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[10px] text-gray-400">🗓</span>
              <span
                className={`text-[11px] font-semibold ${
                  item.urgency === "high" ? "text-red-500" : "text-gray-500"
                }`}
              >
                {item.deadline}
              </span>
            </div>
          )}

          {item.note && (
            <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
              {item.note}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}
