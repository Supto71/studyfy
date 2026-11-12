import { formatBytes } from "@/lib/utils";

interface StorageQuotaCardProps {
  usedBytes: number;
  quotaBytes: number;
  providerName?: string;
}

export function StorageQuotaCard({
  usedBytes,
  quotaBytes,
  providerName = "Studyfy Cloud",
}: StorageQuotaCardProps) {
  const safeQuota = quotaBytes > 0 ? quotaBytes : 524288000;
  const percentage = Math.min(100, Math.round((usedBytes / safeQuota) * 100));

  const barColor =
    percentage >= 90
      ? "bg-rose-600"
      : percentage >= 75
      ? "bg-amber-600"
      : "bg-[#245B46]";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-[#172D23]/75 dark:text-[#F4F2EA]/75">
        <span className="font-medium">{providerName}</span>
        <span>
          {formatBytes(usedBytes)} / {formatBytes(safeQuota)}
        </span>
      </div>

      <div className="w-full h-1.5 rounded-full bg-[#E7E5D9] dark:bg-white/10 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${Math.max(percentage, usedBytes > 0 ? 2 : 0)}%` }}
        />
      </div>
    </div>
  );
}
