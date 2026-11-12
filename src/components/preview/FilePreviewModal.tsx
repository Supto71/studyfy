"use client";

import { X, Download, ExternalLink, FileText, Pencil } from "lucide-react";
import { FileItem } from "@/types/database.types";
import { formatBytes, formatDate, getFileCategory } from "@/lib/utils";

interface FilePreviewModalProps {
  file: FileItem | null;
  previewUrl: string | null;
  onClose: () => void;
  onEdit?: (file: FileItem) => void;
}

export function FilePreviewModal({
  file,
  previewUrl,
  onClose,
  onEdit,
}: FilePreviewModalProps) {
  if (!file || !previewUrl) return null;

  const category = getFileCategory(file.mime_type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#172D23]/60 backdrop-blur-xs p-3 sm:p-6">
      <div className="bg-white dark:bg-[#172D23] rounded-xl border border-[#E7E5D9] dark:border-white/15 shadow-2xl w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="px-5 py-3.5 border-b border-[#E7E5D9] dark:border-white/10 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h3 className="font-semibold text-[#172D23] dark:text-[#F4F2EA] truncate text-sm sm:text-base">
              {file.name}
            </h3>
            <p className="text-xs text-[#172D23]/60 dark:text-[#A6B5A3]">
              {formatBytes(file.size_bytes)} • Added{" "}
              {formatDate(file.created_at)}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onEdit(file);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E7E5D9] dark:border-white/15 text-stone-700 dark:text-stone-200 text-xs font-semibold hover:bg-stone-50 dark:hover:bg-white/10 transition cursor-pointer"
                title="Edit file details"
              >
                <Pencil className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                <span>Edit</span>
              </button>
            )}
            <a
              href={previewUrl}
              download={file.name}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#245B46] text-white text-xs font-medium hover:bg-[#172D23] transition"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </a>
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg border border-[#E7E5D9] dark:border-white/15 text-[#172D23]/70 dark:text-[#A6B5A3] hover:bg-[#F4F2EA] dark:hover:bg-white/10"
              title="Open in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border border-[#E7E5D9] dark:border-white/15 text-[#172D23]/70 dark:text-[#A6B5A3] hover:bg-[#F4F2EA] dark:hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Viewer Body */}
        <div className="flex-1 bg-[#F4F2EA] dark:bg-black/40 flex items-center justify-center overflow-auto p-3 sm:p-6">
          {category === "pdf" ? (
            <iframe
              src={previewUrl}
              title={file.name}
              className="w-full h-full rounded-lg bg-white border border-[#E7E5D9]"
            />
          ) : category === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt={file.name}
              className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
            />
          ) : (
            <div className="bg-white dark:bg-[#172D23] border border-[#E7E5D9] dark:border-white/10 p-8 rounded-xl max-w-md text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#F4F2EA] dark:bg-white/10 text-[#245B46] dark:text-[#A6B5A3] flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-[#172D23] dark:text-white">
                {file.name}
              </h4>
              <p className="text-xs text-[#172D23]/65 dark:text-[#A6B5A3] leading-relaxed">
                Browser preview is available for PDFs and images. Download this
                file to open it in your desktop application.
              </p>
              <a
                href={previewUrl}
                download={file.name}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#245B46] text-white text-xs font-medium hover:bg-[#172D23]"
              >
                <Download className="w-4 h-4" />
                Download ({formatBytes(file.size_bytes)})
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
