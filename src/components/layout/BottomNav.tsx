"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface BottomNavProps {
  municipalityId: string;
}

export default function BottomNav({ municipalityId }: BottomNavProps) {
  const pathname = usePathname();

  const navItems = [
    {
      href: `/${municipalityId}`,
      icon: "🏠",
      label: "ホーム",
      isActive: pathname === `/${municipalityId}`,
    },
    {
      href: `/${municipalityId}`,
      icon: "🏫",
      label: "保育園",
      isActive: pathname?.includes("/nurseries"),
    },
    {
      href: `/${municipalityId}`,
      icon: "🏥",
      label: "医療機関",
      isActive: false,
      disabled: true,
    },
    {
      href: `/${municipalityId}`,
      icon: "📋",
      label: "行政支援",
      isActive: false,
      disabled: true,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-lg mx-auto flex">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex-1 flex flex-col items-center py-2 text-xs transition-colors ${
              item.disabled
                ? "opacity-40 pointer-events-none"
                : item.isActive
                  ? "text-[#2d9e6b] font-semibold"
                  : "text-gray-500"
            }`}
          >
            <span className="text-lg mb-0.5">{item.icon}</span>
            <span>{item.label}</span>
            {item.disabled && (
              <span className="text-[9px] text-gray-400">準備中</span>
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
}
