"use client";

import { useState } from "react";
import { X, Copy, Check, Trash2, Clock, Download, Link2 } from "lucide-react";
import { FileItem, FileShare } from "@/types/database.types";
import { formatDate } from "@/lib/utils";

interface ShareModalProps {
  file: FileItem | null;
  shares: FileShare[];
  onClose: () => void;
  onCreateShare: (options: {
    expiresInDays: number | null;
    maxAccess: number | null;
    allowDownload: boolean;
  }) => Promise<void>;
  onRevokeShare: (shareId: string) => Promise<void>;
}

export function ShareModal({
  file,
  shares,
  onClose,
  onCreateShare,
  onRevokeShare,
}: ShareModalProps) {
  const [expiresInDays, setExpiresInDays] = useState<string>("7");
  const [maxAccess, setMaxAccess] = useState<string>("");
  const [allowDownload, setAllowDownload] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!file) return null;

  const fileShares = shares.filter((s) => s.file_id === file.id);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      await onCreateShare({
        expiresInDays: expiresInDays === "never" ? null : Number(expiresInDays),
        maxAccess: maxAccess ? Number(maxAccess) : null,
        allowDownload,
      });
    } finally {
      setCreating(false);
    }
  }

  function copyLink(shareToken: string, id: string) {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000";
    navigator.clipboard.writeText(`${origin}/s/${shareToken}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#172D23]/40 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-[#172D23] rounded-xl border border-[#E7E5D9] dark:border-white/15 shadow-xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E7E5D9] dark:border-white/10 flex items-center justify-between">
          <div className="min-w-0 pr-4">
            <h2 className="font-semibold text-[#172D23] dark:text-[#F4F2EA] truncate text-base">
              Share &ldquo;{file.name}&rdquo;
            </h2>
            <p className="text-xs text-[#172D23]/60 dark:text-[#A6B5A3]">
              Create a controlled access link
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#172D23]/50 hover:text-[#172D23] dark:text-[#A6B5A3]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleGenerate} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-[#172D23]/70 dark:text-[#A6B5A3] mb-1.5">
                Expiration
              </label>
              <select
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#E7E5D9] dark:border-white/15 bg-[#F4F2EA]/50 dark:bg-black/20 text-[#172D23] dark:text-white focus:outline-none focus:border-[#245B46]"
              >
                <option value="1">24 hours</option>
                <option value="7">7 days</option>
                <option value="30">30 days</option>
                <option value="never">Never expires</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#172D23]/70 dark:text-[#A6B5A3] mb-1.5">
                Access limit
              </label>
              <input
                type="number"
                min={1}
                placeholder="Unlimited views"
                value={maxAccess}
                onChange={(e) => setMaxAccess(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#E7E5D9] dark:border-white/15 bg-[#F4F2EA]/50 dark:bg-black/20 text-[#172D23] dark:text-white focus:outline-none focus:border-[#245B46]"
              />
            </div>
          </div>

          <label className="flex items-center gap-2.5 text-sm text-[#172D23]/80 dark:text-[#F4F2EA]/80 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={allowDownload}
              onChange={(e) => setAllowDownload(e.target.checked)}
              className="w-4 h-4 rounded accent-[#245B46]"
            />
            <span>Allow recipients to download this file</span>
          </label>

          <button
            type="submit"
            disabled={creating}
            className="w-full py-2.5 px-4 rounded-lg bg-[#245B46] text-white text-xs font-medium hover:bg-[#172D23] transition disabled:opacity-50 cursor-pointer"
          >
            {creating ? "Creating link..." : "Create share link"}
          </button>
        </form>

        <div className="px-6 pb-6 space-y-2.5">
          <div className="flex items-center justify-between text-xs text-[#172D23]/60 dark:text-[#A6B5A3]">
            <span>Active links ({fileShares.length})</span>
            <span>Private by default</span>
          </div>

          {fileShares.length === 0 ? (
            <div className="p-4 rounded-lg bg-[#F4F2EA]/50 dark:bg-white/5 border border-[#E7E5D9] dark:border-white/10 text-center text-xs text-[#172D23]/60 dark:text-[#A6B5A3]">
              No active share links for this document.
            </div>
          ) : (
            <div className="space-y-2 max-h-44 overflow-y-auto">
              {fileShares.map((s) => (
                <div
                  key={s.id}
                  className="p-3 rounded-lg border border-[#E7E5D9] dark:border-white/10 bg-[#F4F2EA]/40 dark:bg-white/5 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5 text-xs font-mono text-[#245B46] dark:text-[#A6B5A3] truncate">
                      <Link2 className="w-3.5 h-3.5 shrink-0" />
                      <span>/s/{s.share_token}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#172D23]/60 dark:text-[#A6B5A3]">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {s.expires_at
                          ? `Expires ${formatDate(s.expires_at)}`
                          : "No expiry"}
                      </span>
                      <span>
                        Views: {s.access_count}
                        {s.max_access_count ? `/${s.max_access_count}` : ""}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        {s.allow_download ? "Downloadable" : "View only"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => copyLink(s.share_token, s.id)}
                      className="px-2.5 py-1 rounded border border-[#E7E5D9] bg-white text-xs font-medium text-[#172D23] hover:bg-[#F4F2EA] flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === s.id ? (
                        <>
                          <Check className="w-3 h-3 text-[#245B46]" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => onRevokeShare(s.id)}
                      className="p-1.5 rounded text-rose-600 hover:bg-rose-50"
                      title="Revoke link"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
