"use client";

import Link from "next/link";

interface HeaderProps {
  municipalityName?: string;
}

export default function Header({ municipalityName }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#4CAF82] to-[#2d9e6b] rounded-[10px] flex items-center justify-center text-white text-base">
            🗺
          </div>
          <div className="text-base font-bold text-gray-900">
            こそだて<span className="text-[#4CAF82]">マップ</span>
          </div>
        </Link>

        {municipalityName && (
          <div className="flex items-center gap-1 bg-[#f0faf5] border border-[#c8ead8] rounded-full px-3 py-1 text-xs text-[#2d7a5a] font-semibold">
            📍 {municipalityName}
          </div>
        )}
      </div>
    </header>
  );
}
