import type { AvailabilityStatus } from "@/lib/data/types";

interface AvailabilityBadgeProps {
  status: AvailabilityStatus;
  ageLabel: string;
  size?: "sm" | "md";
}

const statusConfig: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  "○": { bg: "bg-green-100", text: "text-green-700", label: "○ 空きあり" },
  "△": { bg: "bg-yellow-100", text: "text-yellow-700", label: "△ 残りわずか" },
  "×": { bg: "bg-red-100", text: "text-red-600", label: "× 空きなし" },
};

export default function AvailabilityBadge({
  status,
  ageLabel,
  size = "sm",
}: AvailabilityBadgeProps) {
  if (status === null) return null;

  const config = statusConfig[status] ?? {
    bg: "bg-gray-100",
    text: "text-gray-500",
    label: "−",
  };

  const sizeClass = size === "sm" ? "text-xs px-1.5 py-0.5" : "text-sm px-2 py-1";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md font-medium ${config.bg} ${config.text} ${sizeClass}`}
    >
      <span className="opacity-70">{ageLabel}</span>
      <span>{status}</span>
    </span>
  );
}
