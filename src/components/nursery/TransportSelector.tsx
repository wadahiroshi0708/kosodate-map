"use client";

import type { TransportMode } from "@/lib/data/types";

interface TransportSelectorProps {
  selected: TransportMode;
  onChange: (mode: TransportMode) => void;
}

const modes: { value: TransportMode; icon: string; label: string }[] = [
  { value: "walk", icon: "🚶", label: "徒歩" },
  { value: "bike", icon: "🚲", label: "自転車" },
  { value: "car", icon: "🚗", label: "車" },
];

export default function TransportSelector({
  selected,
  onChange,
}: TransportSelectorProps) {
  return (
    <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
      {modes.map((mode) => (
        <button
          key={mode.value}
          onClick={() => onChange(mode.value)}
          className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-md text-xs font-medium transition-all ${
            selected === mode.value
              ? "bg-white text-[#2d9e6b] shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <span>{mode.icon}</span>
          <span>{mode.label}</span>
        </button>
      ))}
    </div>
  );
}
