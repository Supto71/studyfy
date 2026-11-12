"use client";

import { useState, useEffect } from "react";
import {
  X,
  FileUp,
  ArrowUp,
  ArrowDown,
  Trash2,
  Loader2,
  RotateCw,
  Download,
} from "lucide-react";
import { convertImagesToPdf } from "@/lib/pdf-generator";
import { formatBytes } from "@/lib/utils";
import { Folder } from "@/types/database.types";

interface PageItem {
  id: string;
  file: File;
  previewUrl: string;
  rotation: number;
}

interface ImageToPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  folders?: Folder[];
  currentFolderId?: string | null;
  onPdfCreated: (pdfFile: File, targetFolderId?: string | null) => Promise<void>;
}

export function ImageToPdfModal({
  isOpen,
  onClose,
  folders = [],
  currentFolderId = null,
  onPdfCreated,
}: ImageToPdfModalProps) {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [pdfName, setPdfName] = useState("Compiled-Notes");
  const [selectedFolderId, setSelectedFolderId] = useState<string>(
    currentFolderId || "root"
  );
  const [converting, setConverting] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedFolderId(currentFolderId || "root");
  }, [currentFolderId]);

  if (!isOpen) return null;

  function handleSelectFiles(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files).filter((f) =>
      f.type.startsWith("image/")
    );
    const newPages: PageItem[] = filesArray.map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
      rotation: 0,
    }));
    setPages((prev) => [...prev, ...newPages]);
    setError(null);
    e.target.value = "";
  }

  function movePage(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= pages.length) return;
    const copy = [...pages];
    const [item] = copy.splice(index, 1);
    copy.splice(target, 0, item);
    setPages(copy);
  }

  function rotatePage(index: number) {
    setPages((prev) =>
      prev.map((p, idx) =>
        idx === index ? { ...p, rotation: (p.rotation + 90) % 360 } : p
      )
    );
  }

  function removePage(index: number) {
    setPages((prev) => {
      const target = prev[index];
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((_, idx) => idx !== index);
    });
  }

  async function buildPdfFile(): Promise<File | null> {
    if (pages.length === 0) {
      setError("Please select at least one image.");
      return null;
    }

    setConverting(true);
    setError(null);

    try {
      const pdfFile = await convertImagesToPdf(
        pages.map((p) => ({ file: p.file, rotation: p.rotation })),
        pdfName,
        (current, total) => {
          setProgressText(`Formatting page ${current} of ${total}...`);
        }
      );
      return pdfFile;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to convert images to PDF"
      );
      return null;
    } finally {
      setConverting(false);
      setProgressText("");
    }
  }

  async function handleSaveToWorkspace() {
    const pdfFile = await buildPdfFile();
    if (!pdfFile) return;

    setConverting(true);
    setProgressText("Saving to workspace...");
    try {
      const dest = selectedFolderId === "root" ? null : selectedFolderId;
      await onPdfCreated(pdfFile, dest);
      pages.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      setPages([]);
      onClose();
    } finally {
      setConverting(false);
      setProgressText("");
    }
  }

  async function handleDirectDownload() {
    const pdfFile = await buildPdfFile();
    if (!pdfFile) return;

    const url = URL.createObjectURL(pdfFile);
    const a = document.createElement("a");
    a.href = url;
    a.download = pdfFile.name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#172D23]/40 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-[#172D23] rounded-xl border border-[#E7E5D9] dark:border-white/15 shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-[#E7E5D9] dark:border-white/10 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-[#172D23] dark:text-[#F4F2EA] text-base">
              Image to PDF
            </h2>
            <p className="text-xs text-[#172D23]/60 dark:text-[#A6B5A3]">
              Combine images into a single A4 document
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#172D23]/50 hover:text-[#172D23] dark:text-[#A6B5A3] hover:bg-[#F4F2EA] dark:hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#172D23]/70 dark:text-[#A6B5A3] mb-1.5">
                Document title
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={pdfName}
                  onChange={(e) => setPdfName(e.target.value)}
                  placeholder="Lecture-Notes"
                  className="w-full px-3 py-2 text-sm rounded-l-lg border border-[#E7E5D9] dark:border-white/15 bg-[#F4F2EA]/50 dark:bg-black/20 text-[#172D23] dark:text-white focus:outline-none focus:border-[#245B46]"
                />
                <span className="px-3 py-2 text-xs bg-[#F4F2EA] dark:bg-white/10 border border-l-0 border-[#E7E5D9] dark:border-white/15 rounded-r-lg text-[#172D23]/60 dark:text-[#A6B5A3]">
                  .pdf
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#172D23]/70 dark:text-[#A6B5A3] mb-1.5">
                Save to folder
              </label>
              <select
                value={selectedFolderId}
                onChange={(e) => setSelectedFolderId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#E7E5D9] dark:border-white/15 bg-[#F4F2EA]/50 dark:bg-black/20 text-[#172D23] dark:text-white focus:outline-none focus:border-[#245B46]"
              >
                <option value="root">My Files (Root)</option>
                {folders
                  .filter((f) => f.deleted_at === null)
                  .map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <label className="flex flex-col items-center justify-center p-6 border border-dashed border-[#A6B5A3] rounded-xl bg-[#F4F2EA]/40 hover:bg-[#F4F2EA] dark:bg-white/5 transition cursor-pointer">
            <FileUp className="w-5 h-5 text-[#245B46] mb-2" />
            <span className="text-sm font-medium text-[#172D23] dark:text-white">
              Select images (JPG, PNG, WebP)
            </span>
            <span className="text-xs text-[#172D23]/60 dark:text-[#A6B5A3] mt-0.5">
              Reorder or rotate pages below before generating
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleSelectFiles}
              className="hidden"
            />
          </label>

          {pages.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs text-[#172D23]/60 dark:text-[#A6B5A3]">
                <span>
                  {pages.length} {pages.length === 1 ? "page" : "pages"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    pages.forEach((p) => URL.revokeObjectURL(p.previewUrl));
                    setPages([]);
                  }}
                  className="text-rose-600 hover:underline cursor-pointer"
                >
                  Clear all
                </button>
              </div>

              <div className="divide-y divide-[#E7E5D9] dark:divide-white/10 border border-[#E7E5D9] dark:border-white/15 rounded-lg max-h-60 overflow-y-auto">
                {pages.map((p, idx) => (
                  <div
                    key={p.id}
                    className="p-2.5 flex items-center justify-between gap-3 bg-white dark:bg-transparent"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-12 rounded bg-[#F4F2EA] overflow-hidden shrink-0 flex items-center justify-center border border-[#E7E5D9]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.previewUrl}
                          alt={p.file.name}
                          className="w-full h-full object-cover"
                          style={{ transform: `rotate(${p.rotation}deg)` }}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-[#172D23] dark:text-white truncate">
                          {idx + 1}. {p.file.name}
                        </p>
                        <p className="text-[11px] text-[#172D23]/55 dark:text-[#A6B5A3]">
                          {formatBytes(p.file.size)}
                          {p.rotation > 0 ? ` • Rotated ${p.rotation}°` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => rotatePage(idx)}
                        className="p-1.5 rounded hover:bg-[#F4F2EA] dark:hover:bg-white/10 text-[#172D23]/70 dark:text-[#A6B5A3]"
                        title="Rotate 90°"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => movePage(idx, -1)}
                        className="p-1.5 rounded hover:bg-[#F4F2EA] dark:hover:bg-white/10 disabled:opacity-30 text-[#172D23]/70 dark:text-[#A6B5A3]"
                        title="Move up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === pages.length - 1}
                        onClick={() => movePage(idx, 1)}
                        className="p-1.5 rounded hover:bg-[#F4F2EA] dark:hover:bg-white/10 disabled:opacity-30 text-[#172D23]/70 dark:text-[#A6B5A3]"
                        title="Move down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removePage(idx)}
                        className="p-1.5 rounded hover:bg-rose-50 text-rose-600"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-[#F4F2EA]/60 dark:bg-black/20 border-t border-[#E7E5D9] dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleDirectDownload}
            disabled={converting || pages.length === 0}
            className="px-3.5 py-2 rounded-lg text-xs font-medium border border-[#E7E5D9] bg-white text-[#172D23] hover:bg-[#F4F2EA] disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Download PDF
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={converting}
              className="px-4 py-2 rounded-lg text-xs font-medium text-[#172D23]/70 dark:text-[#A6B5A3] hover:bg-[#E7E5D9]/50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveToWorkspace}
              disabled={converting || pages.length === 0}
              className="px-4 py-2 rounded-lg text-xs font-medium bg-[#245B46] text-white hover:bg-[#172D23] disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {converting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{progressText || "Generating..."}</span>
                </>
              ) : (
                <span>Save to workspace</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
