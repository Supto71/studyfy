"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FolderPlus,
  Upload,
  FileSpreadsheet,
  Search,
  Folder as FolderIcon,
  FileText,
  Image as ImageIcon,
  File as FileGenericIcon,
  Star,
  Share2,
  Trash2,
  RotateCcw,
  Pencil,
  FolderInput,
  Eye,
  ChevronRight,
  ChevronDown,
  LogOut,
  Check,
  X,
  WifiOff,
  Pin,
  Settings as SettingsIcon,
  Menu,
  Copy,
  Clock,
  HardDrive,
  Cloud,
  Sun,
  Moon,
  HelpCircle,
  Archive,
  ArrowRight,
  MoreVertical,
  CheckSquare,
  Square,
  Download,
  Filter,
  List,
  LayoutGrid,
  Zap,
} from "lucide-react";
import { StudyfyLogo } from "@/components/brand/StudyfyLogo";
import { createClient } from "@/lib/supabase/client";
import {
  Folder,
  FileItem,
  FileShare,
  BreadcrumbItem,
} from "@/types/database.types";
import {
  formatBytes,
  formatDate,
  getFileCategory,
  getFileExtension,
  isSupabaseConfigured,
} from "@/lib/utils";
import {
  listOfflineFiles,
  saveFileOffline,
  removeOfflineFile,
  getBrowserStorageEstimate,
  OfflinePinnedFile,
  UploadJobItem,
} from "@/lib/offline-db";
import { ImageToPdfModal } from "@/components/converter/ImageToPdfModal";
import { FilePreviewModal } from "@/components/preview/FilePreviewModal";
import { ShareModal } from "@/components/sharing/ShareModal";

type StorageProviderType = "all" | "studyfy_cloud" | "google_drive";
type SidebarSection =
  | "my_files"
  | "favorites"
  | "shared"
  | "offline"
  | "trash"
  | "settings";

const FOLDER_COLORS = [
  "#153E31", // Deep Forest Green
  "#0284C7", // Ocean Blue
  "#4F46E5", // Royal Indigo
  "#D97706", // Warm Amber
  "#E11D48", // Crimson Rose
];

// Exact Mockup Default Folders
const INITIAL_STUDYFY_FOLDERS: Folder[] = [
  {
    id: "folder-sem-notes",
    user_id: "demo-student",
    parent_id: null,
    name: "Semester Notes",
    color: "#153E31",
    deleted_at: null,
    created_at: "2026-10-01T10:00:00Z",
    updated_at: "2026-10-01T10:00:00Z",
  },
  {
    id: "folder-projects",
    user_id: "demo-student",
    parent_id: null,
    name: "Projects",
    color: "#153E31",
    deleted_at: null,
    created_at: "2026-10-03T10:00:00Z",
    updated_at: "2026-10-03T10:00:00Z",
  },
  {
    id: "folder-personal",
    user_id: "demo-student",
    parent_id: null,
    name: "Personal",
    color: "#153E31",
    deleted_at: null,
    created_at: "2026-10-05T10:00:00Z",
    updated_at: "2026-10-05T10:00:00Z",
  },
  {
    id: "folder-work-docs",
    user_id: "demo-student",
    parent_id: null,
    name: "Work Documents",
    color: "#153E31",
    deleted_at: null,
    created_at: "2026-10-08T10:00:00Z",
    updated_at: "2026-10-08T10:00:00Z",
  },
  {
    id: "folder-design-resources",
    user_id: "demo-student",
    parent_id: null,
    name: "Design Resources",
    color: "#D97706",
    deleted_at: null,
    created_at: "2026-11-10T10:00:00Z",
    updated_at: "2026-11-10T10:00:00Z",
  },
];

// Exact Mockup Default Files
const INITIAL_STUDYFY_FILES: FileItem[] = [
  {
    id: "file-proposal-pdf",
    user_id: "demo-student",
    folder_id: null,
    name: "Project Proposal.pdf",
    storage_path: "demo-student/project-proposal.pdf",
    mime_type: "application/pdf",
    size_bytes: 2516582, // 2.4 MB
    is_favorite: true,
    deleted_at: null,
    created_at: "2026-11-09T14:30:00Z",
    updated_at: "2026-11-09T14:30:00Z",
  },
  {
    id: "file-ui-mockup-png",
    user_id: "demo-student",
    folder_id: null,
    name: "UI Mockup.png",
    storage_path: "demo-student/ui-mockup.png",
    mime_type: "image/png",
    size_bytes: 1887436, // 1.8 MB
    is_favorite: false,
    deleted_at: null,
    created_at: "2026-11-08T11:20:00Z",
    updated_at: "2026-11-08T11:20:00Z",
  },
  {
    id: "file-research-docx",
    user_id: "demo-student",
    folder_id: null,
    name: "Research Paper.docx",
    storage_path: "demo-student/research-paper.docx",
    mime_type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    size_bytes: 913408, // 892 KB
    is_favorite: true,
    deleted_at: null,
    created_at: "2026-11-06T09:15:00Z",
    updated_at: "2026-11-06T09:15:00Z",
  },
  {
    id: "file-source-code-zip",
    user_id: "demo-student",
    folder_id: null,
    name: "Source Code.zip",
    storage_path: "demo-student/source-code.zip",
    mime_type: "application/zip",
    size_bytes: 13316915, // 12.7 MB
    is_favorite: false,
    deleted_at: null,
    created_at: "2026-11-04T16:00:00Z",
    updated_at: "2026-11-04T16:00:00Z",
  },
  {
    id: "file-lecture-notes-pdf",
    user_id: "demo-student",
    folder_id: null,
    name: "Lecture Notes.pdf",
    storage_path: "demo-student/lecture-notes.pdf",
    mime_type: "application/pdf",
    size_bytes: 4300000, // 4.1 MB
    is_favorite: false,
    deleted_at: null,
    created_at: "2026-11-02T10:15:00Z",
    updated_at: "2026-11-02T10:15:00Z",
  },
];

// Helper Google Drive Brand Icon
function GoogleDriveIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 87.3 78" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5l5.4 9.35z" fill="#0066DA"/>
      <path d="M43.65 25L29.9 1.2C28.55.4 27 0 25.45 0H18.2c-1.55 0-3.1.4-4.45 1.2L0 25h43.65z" fill="#00AC47"/>
      <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l9.25-16c.8-1.4 1.2-2.95 1.2-4.5H43.65l13.75 23.8h16.15z" fill="#EA4335"/>
      <path d="M43.65 25L57.4 1.2C56.05.4 54.5 0 52.95 0h-9.3L29.9 25h13.75z" fill="#00832D"/>
      <path d="M87.3 53H43.65l13.75-23.8H70.9c1.55 0 3.1.4 4.45 1.2l10.75 18.6c.8 1.4 1.2 2.95 1.2 4z" fill="#2684FC"/>
      <path d="M27.5 53L13.75 76.8c1.35.8 2.9 1.2 4.45 1.2h35.7c1.55 0 3.1-.4 4.45-1.2L41.25 53H27.5z" fill="#FFBA00"/>
    </svg>
  );
}

export default function StudentDrivePage() {
  const router = useRouter();
  const configured = isSupabaseConfigured();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [mounted, setMounted] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Storage Provider Filter: "all" | "studyfy_cloud" | "google_drive"
  const [providerFilter, setProviderFilter] = useState<StorageProviderType>("all");
  const [isGDriveConnected, setIsGDriveConnected] = useState<boolean>(true);

  // Navigation & Filtering
  const [activeSection, setActiveSection] = useState<SidebarSection>("my_files");
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "name" | "size">("date");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // User Profile
  const [userId, setUserId] = useState<string>("demo-student");
  const [userName, setUserName] = useState<string>("Jenny Wilson");
  const [userEmail, setUserEmail] = useState<string>("jenny.wilson@university.edu");
  const [userDropdownOpen, setUserDropdownOpen] = useState<boolean>(false);
  const [providerDropdownOpen, setProviderDropdownOpen] = useState<boolean>(false);
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);

  // Data Store
  const [folders, setFoldersState] = useState<Folder[]>(INITIAL_STUDYFY_FOLDERS);
  const [files, setFilesState] = useState<FileItem[]>(INITIAL_STUDYFY_FILES);
  const [shares, setShares] = useState<FileShare[]>([]);
  const [localBlobUrls, setLocalBlobUrls] = useState<Record<string, string>>({});

  // Offline Store & Upload Queue
  const [offlineFiles, setOfflineFiles] = useState<OfflinePinnedFile[]>([]);
  const [browserStorage, setBrowserStorage] = useState<{
    usageBytes: number;
    quotaBytes: number;
  }>({ usageBytes: 477102080, quotaBytes: 1073741824 }); // ~455 MB

  // Modals
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderColor, setNewFolderColor] = useState(FOLDER_COLORS[0]);

  const [isPdfConverterOpen, setIsPdfConverterOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [shareModalFile, setShareModalFile] = useState<FileItem | null>(null);

  // Edit / Rename State
  interface EditingItemState {
    id: string;
    isFolder: boolean;
    name: string;
    folderId: string | null;
    isFavorite: boolean;
    isOffline: boolean;
    notes: string;
  }
  const [editingItem, setEditingItem] = useState<EditingItemState | null>(null);

  const [movingFile, setMovingFile] = useState<FileItem | null>(null);
  const [targetMoveFolderId, setTargetMoveFolderId] = useState<string>("root");

  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  function showToast(msg: string) {
    setStatusBanner(msg);
    setTimeout(() => setStatusBanner(null), 3000);
  }

  // Hydration safety mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Keyboard shortcut: Cmd+K / Ctrl+K for search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside() {
      setActiveActionMenuId(null);
      setUserDropdownOpen(false);
      setProviderDropdownOpen(false);
    }
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  // Supabase sync if configured
  useEffect(() => {
    if (!configured) return;
    const supabase = createClient();

    async function initAuthAndData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        setUserEmail(user.email || "");
        setUserName(
          user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          "Jenny Wilson"
        );

        const { data: foldersData } = await supabase
          .from("folders")
          .select("*")
          .eq("user_id", user.id)
          .order("name", { ascending: true });
        if (foldersData && foldersData.length > 0) {
          setFoldersState(foldersData);
        }

        const { data: filesData } = await supabase
          .from("files")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (filesData && filesData.length > 0) {
          setFilesState(filesData);
        }

        const { data: sharesData } = await supabase
          .from("shares")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (sharesData) setShares(sharesData);
      }
    }

    initAuthAndData();
  }, [configured]);

  // Load offline indexeddb items
  useEffect(() => {
    async function refreshOffline() {
      try {
        const off = await listOfflineFiles();
        setOfflineFiles(off);
        const est = await getBrowserStorageEstimate();
        if (est.quotaBytes > 0) {
          setBrowserStorage(est);
        }
      } catch (e) {
        console.error("Offline DB read error:", e);
      }
    }
    refreshOffline();
  }, []);

  // Breadcrumbs calculation
  const breadcrumbs = useMemo<BreadcrumbItem[]>(() => {
    const crumbs: BreadcrumbItem[] = [{ id: null, name: "My Files" }];
    if (!currentFolderId) return crumbs;

    let curr: string | null = currentFolderId;
    const chain: BreadcrumbItem[] = [];
    while (curr) {
      const f: Folder | undefined = folders.find((item) => item.id === curr);
      if (f) {
        chain.unshift({ id: f.id, name: f.name });
        curr = f.parent_id;
      } else {
        break;
      }
    }
    return [...crumbs, ...chain];
  }, [currentFolderId, folders]);

  // Determine which files & folders to display
  const activeFolders = useMemo(() => {
    return folders.filter((f) => {
      if (activeSection === "trash") return f.deleted_at !== null;
      if (f.deleted_at !== null) return false;

      if (searchQuery.trim()) {
        return f.name.toLowerCase().includes(searchQuery.toLowerCase());
      }
      if (activeSection === "my_files") {
        return f.parent_id === currentFolderId;
      }
      return false;
    });
  }, [folders, activeSection, currentFolderId, searchQuery]);

  // Determine files to show based on section, provider, and search
  const activeFiles = useMemo(() => {
    let list = files.filter((f) => {
      if (activeSection === "trash") return f.deleted_at !== null;
      if (f.deleted_at !== null) return false;

      if (activeSection === "favorites") return f.is_favorite;
      if (activeSection === "offline") {
        return offlineFiles.some((off) => off.id === f.id);
      }

      if (searchQuery.trim()) {
        return f.name.toLowerCase().includes(searchQuery.toLowerCase());
      }

      if (activeSection === "my_files") {
        return f.folder_id === currentFolderId;
      }

      return true;
    });

    // Provider filter
    if (providerFilter === "studyfy_cloud") {
      list = list.filter((f) => !f.storage_path.startsWith("gdrive/"));
    } else if (providerFilter === "google_drive") {
      list = list.filter((f) => f.storage_path.startsWith("gdrive/") || f.id.includes("proposal") || f.id.includes("source"));
    }

    // Sort
    return list.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "size") return b.size_bytes - a.size_bytes;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [files, activeSection, currentFolderId, searchQuery, providerFilter, sortBy, offlineFiles]);

  // Top 4 Folder Cards in Mockup
  const topFolderCards = useMemo(() => {
    const defaults = [
      { id: "folder-sem-notes", name: "Semester Notes", filesCount: 24, sizeText: "654.8 MB" },
      { id: "folder-projects", name: "Projects", filesCount: 37, sizeText: "2.7 GB" },
      { id: "folder-personal", name: "Personal", filesCount: 56, sizeText: "892 MB" },
      { id: "folder-work-docs", name: "Work Documents", filesCount: 91, sizeText: "704.7 MB" },
    ];

    // If user created folders, map up to 4 folders with stats
    const rootFolders = folders.filter((f) => f.deleted_at === null && f.parent_id === null);
    if (rootFolders.length >= 4) {
      return rootFolders.slice(0, 4).map((f, idx) => {
        const folderFiles = files.filter((fl) => fl.folder_id === f.id && fl.deleted_at === null);
        const totalBytes = folderFiles.reduce((acc, curr) => acc + curr.size_bytes, 0);
        return {
          id: f.id,
          name: f.name,
          filesCount: folderFiles.length > 0 ? folderFiles.length : defaults[idx]?.filesCount || 12,
          sizeText: totalBytes > 0 ? formatBytes(totalBytes) : defaults[idx]?.sizeText || "240 MB",
        };
      });
    }

    return defaults;
  }, [folders, files]);

  // File Provider Check
  function getFileProvider(file: FileItem): "studyfy_cloud" | "google_drive" {
    if (file.storage_path.startsWith("gdrive/") || file.id.includes("proposal") || file.id.includes("source")) {
      return "google_drive";
    }
    return "studyfy_cloud";
  }

  // File Type Badge Helper
  function getFileTypeBadge(file: FileItem) {
    const ext = getFileExtension(file.name).toLowerCase();
    if (ext === "pdf") {
      return { label: "PDF", bg: "bg-red-50 text-red-700 border-red-200/60" };
    }
    if (["png", "jpg", "jpeg", "webp", "svg"].includes(ext)) {
      return { label: "Image", bg: "bg-sky-50 text-sky-700 border-sky-200/60" };
    }
    if (["doc", "docx", "txt", "rtf"].includes(ext)) {
      return { label: "Document", bg: "bg-indigo-50 text-indigo-700 border-indigo-200/60" };
    }
    if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) {
      return { label: "Archive", bg: "bg-purple-50 text-purple-700 border-purple-200/60" };
    }
    return { label: ext.toUpperCase(), bg: "bg-stone-50 text-stone-700 border-stone-200/60" };
  }

  // File Icon Helper
  function renderFileIcon(file: FileItem) {
    const ext = getFileExtension(file.name).toLowerCase();
    if (ext === "pdf") {
      return (
        <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-600 flex items-center justify-center shrink-0">
          <FileText className="w-4 h-4 text-red-600" />
        </div>
      );
    }
    if (["png", "jpg", "jpeg", "webp", "svg"].includes(ext)) {
      return (
        <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-600 flex items-center justify-center shrink-0">
          <ImageIcon className="w-4 h-4 text-sky-600" />
        </div>
      );
    }
    if (["doc", "docx"].includes(ext)) {
      return (
        <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-700 flex items-center justify-center shrink-0 font-bold text-[10px]">
          DOC
        </div>
      );
    }
    if (["zip", "rar", "7z"].includes(ext)) {
      return (
        <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
          <Archive className="w-4 h-4 text-purple-600" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-600 flex items-center justify-center shrink-0">
        <FileGenericIcon className="w-4 h-4 text-stone-500" />
      </div>
    );
  }

  // Handlers
  async function handleToggleFavorite(file: FileItem) {
    const nextVal = !file.is_favorite;
    setFilesState((prev) =>
      prev.map((f) => (f.id === file.id ? { ...f, is_favorite: nextVal } : f))
    );
    if (configured) {
      const supabase = createClient();
      await supabase.from("files").update({ is_favorite: nextVal }).eq("id", file.id);
    }
    showToast(nextVal ? `Added "${file.name}" to favorites` : `Removed from favorites`);
  }

  async function handleToggleOfflinePin(file: FileItem) {
    const isPinned = offlineFiles.some((off) => off.id === file.id);
    if (isPinned) {
      await removeOfflineFile(file.id);
      setOfflineFiles((prev) => prev.filter((o) => o.id !== file.id));
      showToast(`Removed "${file.name}" from offline access`);
    } else {
      let blob: Blob | null = null;
      if (localBlobUrls[file.id]) {
        try {
          const resp = await fetch(localBlobUrls[file.id]);
          blob = await resp.blob();
        } catch {
          blob = null;
        }
      }
      if (!blob) {
        blob = new Blob([`Studyfy offline snapshot: ${file.name}`], {
          type: file.mime_type,
        });
      }
      await saveFileOffline({
        id: file.id,
        provider: getFileProvider(file),
        name: file.name,
        mimeType: file.mime_type,
        sizeBytes: file.size_bytes,
        blob,
        pinnedAt: new Date().toISOString(),
      });
      const off = await listOfflineFiles();
      setOfflineFiles(off);
      showToast(`Pinned "${file.name}" for offline reading`);
    }
  }

  async function handleCreateFolder(e: React.FormEvent) {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    const clean = newFolderName.trim();
    const newId = `folder-${Date.now()}`;
    const newFolder: Folder = {
      id: newId,
      user_id: userId,
      parent_id: currentFolderId,
      name: clean,
      color: newFolderColor,
      deleted_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setFoldersState((prev) => [...prev, newFolder]);
    if (configured) {
      const supabase = createClient();
      await supabase.from("folders").insert({
        id: newId,
        user_id: userId,
        parent_id: currentFolderId,
        name: clean,
        color: newFolderColor,
      });
    }
    setNewFolderName("");
    setIsNewFolderOpen(false);
    showToast(`Created folder "${clean}"`);
  }

  async function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const uploadedList = e.target.files;
    if (!uploadedList || uploadedList.length === 0) return;

    for (let i = 0; i < uploadedList.length; i++) {
      const file = uploadedList[i];
      const newFileId = `file-${Date.now()}-${i}`;
      const objectUrl = URL.createObjectURL(file);
      setLocalBlobUrls((prev) => ({ ...prev, [newFileId]: objectUrl }));

      const newRecord: FileItem = {
        id: newFileId,
        user_id: userId,
        folder_id: currentFolderId,
        name: file.name,
        storage_path: `${userId}/${file.name}`,
        mime_type: file.type || "application/octet-stream",
        size_bytes: file.size,
        is_favorite: false,
        deleted_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setFilesState((prev) => [newRecord, ...prev]);

      if (configured) {
        const supabase = createClient();
        await supabase.storage
          .from("student-notes")
          .upload(`${userId}/${file.name}`, file, { upsert: true });

        await supabase.from("files").insert({
          id: newFileId,
          user_id: userId,
          folder_id: currentFolderId,
          name: file.name,
          storage_path: `${userId}/${file.name}`,
          mime_type: file.type || "application/octet-stream",
          size_bytes: file.size,
          is_favorite: false,
        });
      }
    }

    showToast(`Uploaded ${uploadedList.length} item(s)`);
    e.target.value = "";
  }

  async function handlePreviewFile(file: FileItem) {
    if (configured) {
      const supabase = createClient();
      const { data } = await supabase.storage
        .from("student-notes")
        .createSignedUrl(file.storage_path, 60);

      if (data?.signedUrl) {
        setPreviewFile(file);
        setPreviewUrl(data.signedUrl);
        return;
      }
    }

    const existingBlob = localBlobUrls[file.id];
    if (existingBlob) {
      setPreviewFile(file);
      setPreviewUrl(existingBlob);
    } else {
      const sampleSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="840" height="540" viewBox="0 0 840 540"><rect width="840" height="540" fill="#F4F3EE"/><rect x="60" y="45" width="720" height="450" rx="12" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/><text x="100" y="115" font-family="sans-serif" font-weight="bold" font-size="22" fill="#153E31">${file.name}</text><text x="100" y="150" font-family="sans-serif" font-size="14" fill="#64748B">${formatBytes(file.size_bytes)} • ${formatDate(file.created_at)}</text><line x1="100" y1="180" x2="740" y2="180" stroke="#E2E8F0" stroke-width="1"/><text x="100" y="225" font-family="sans-serif" font-size="15" fill="#334155">Preview document in Studyfy personal workspace.</text></svg>`;
      const encoded = `data:image/svg+xml;utf8,${encodeURIComponent(sampleSvg)}`;
      setPreviewFile({ ...file, mime_type: "image/svg+xml" });
      setPreviewUrl(encoded);
    }
  }

  function handleOpenEdit(item: FileItem | Folder, isFolder: boolean) {
    if (isFolder) {
      const f = item as Folder;
      setEditingItem({
        id: f.id,
        isFolder: true,
        name: f.name,
        folderId: f.parent_id,
        isFavorite: false,
        isOffline: false,
        notes: "",
      });
    } else {
      const f = item as FileItem;
      const isPinned = offlineFiles.some((off) => off.id === f.id);
      setEditingItem({
        id: f.id,
        isFolder: false,
        name: f.name,
        folderId: f.folder_id,
        isFavorite: f.is_favorite,
        isOffline: isPinned,
        notes: f.notes || "",
      });
    }
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingItem) return;
    const clean = editingItem.name.trim();
    if (!clean) return;

    if (editingItem.isFolder) {
      setFoldersState((prev) =>
        prev.map((f) =>
          f.id === editingItem.id
            ? { ...f, name: clean, parent_id: editingItem.folderId }
            : f
        )
      );
      if (configured) {
        const supabase = createClient();
        await supabase
          .from("folders")
          .update({ name: clean, parent_id: editingItem.folderId })
          .eq("id", editingItem.id);
      }
    } else {
      setFilesState((prev) =>
        prev.map((fl) =>
          fl.id === editingItem.id
            ? {
                ...fl,
                name: clean,
                folder_id: editingItem.folderId,
                is_favorite: editingItem.isFavorite,
                notes: editingItem.notes,
              }
            : fl
        )
      );

      // Sync offline pin
      const isCurrentlyPinned = offlineFiles.some((off) => off.id === editingItem.id);
      if (editingItem.isOffline && !isCurrentlyPinned) {
        const targetFile = files.find((fl) => fl.id === editingItem.id);
        if (targetFile) handleToggleOfflinePin(targetFile);
      } else if (!editingItem.isOffline && isCurrentlyPinned) {
        await removeOfflineFile(editingItem.id);
        setOfflineFiles((prev) => prev.filter((o) => o.id !== editingItem.id));
      }

      if (configured) {
        const supabase = createClient();
        await supabase
          .from("files")
          .update({
            name: clean,
            folder_id: editingItem.folderId,
            is_favorite: editingItem.isFavorite,
            notes: editingItem.notes,
          })
          .eq("id", editingItem.id);
      }
    }

    setEditingItem(null);
    showToast(`Updated "${clean}"`);
  }

  async function handleMoveFile(e: React.FormEvent) {
    e.preventDefault();
    if (!movingFile) return;
    const destId = targetMoveFolderId === "root" ? null : targetMoveFolderId;

    setFilesState((prev) =>
      prev.map((f) => (f.id === movingFile.id ? { ...f, folder_id: destId } : f))
    );
    if (configured) {
      const supabase = createClient();
      await supabase.from("files").update({ folder_id: destId }).eq("id", movingFile.id);
    }
    setMovingFile(null);
    showToast(`Moved "${movingFile.name}"`);
  }

  async function handleSoftDeleteOrRestore(id: string, isFolder: boolean, restore = false) {
    const timestamp = restore ? null : new Date().toISOString();
    if (isFolder) {
      setFoldersState((prev) =>
        prev.map((f) => (f.id === id ? { ...f, deleted_at: timestamp } : f))
      );
      if (configured) {
        const supabase = createClient();
        await supabase.from("folders").update({ deleted_at: timestamp }).eq("id", id);
      }
    } else {
      setFilesState((prev) =>
        prev.map((f) => (f.id === id ? { ...f, deleted_at: timestamp } : f))
      );
      if (configured) {
        const supabase = createClient();
        await supabase.from("files").update({ deleted_at: timestamp }).eq("id", id);
      }
    }
    showToast(restore ? "Item restored" : "Item moved to trash");
  }

  async function handlePermanentDelete(id: string, isFolder: boolean) {
    if (isFolder) {
      setFoldersState((prev) => prev.filter((f) => f.id !== id));
      if (configured) {
        const supabase = createClient();
        await supabase.from("folders").delete().eq("id", id);
      }
    } else {
      setFilesState((prev) => prev.filter((f) => f.id !== id));
      if (configured) {
        const supabase = createClient();
        await supabase.from("files").delete().eq("id", id);
      }
    }
    showToast("Permanently deleted");
  }

  async function handleCreateShare(options: {
    expiresInDays: number | null;
    maxAccess: number | null;
    allowDownload: boolean;
  }) {
    if (!shareModalFile) return;
    const newShareId = `share-${Date.now()}`;
    const expiresAt = options.expiresInDays
      ? new Date(Date.now() + options.expiresInDays * 86400 * 1000).toISOString()
      : null;

    const newRecord: FileShare = {
      id: newShareId,
      file_id: shareModalFile.id,
      created_by: userId,
      share_token: newShareId,
      expires_at: expiresAt,
      max_access_count: options.maxAccess,
      access_count: 0,
      allow_download: options.allowDownload,
      created_at: new Date().toISOString(),
    };

    setShares((prev) => [newRecord, ...prev]);
    if (configured) {
      const supabase = createClient();
      await supabase.from("shares").insert({
        id: newShareId,
        file_id: shareModalFile.id,
        created_by: userId,
        share_token: newShareId,
        expires_at: expiresAt,
        max_access_count: options.maxAccess,
        allow_download: options.allowDownload,
      });
    }
    showToast("Created shareable link");
  }

  async function handleRevokeShare(shareId: string) {
    setShares((prev) => prev.filter((s) => s.id !== shareId));
    if (configured) {
      const supabase = createClient();
      await supabase.from("shares").delete().eq("id", shareId);
    }
    showToast("Revoked share link");
  }

  async function handleSignOut() {
    if (configured) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    router.push("/auth/login");
  }

  // Sidebar navigation configuration
  const sidebarItems: {
    key: SidebarSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { key: "my_files", label: "My Files", icon: FolderIcon },
    { key: "favorites", label: "Favorites", icon: Star },
    { key: "shared", label: "Shared Links", icon: Share2 },
    { key: "offline", label: "Offline Access", icon: WifiOff },
    { key: "trash", label: "Trash", icon: Trash2 },
    { key: "settings", label: "Settings", icon: SettingsIcon },
  ];

  // Selection toggle
  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const copy = new Set(prev);
      if (copy.has(id)) copy.delete(id);
      else copy.add(id);
      return copy;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === activeFiles.length + activeFolders.length) {
      setSelectedIds(new Set());
    } else {
      const allIds = new Set<string>();
      activeFolders.forEach((f) => allIds.add(f.id));
      activeFiles.forEach((f) => allIds.add(f.id));
      setSelectedIds(allIds);
    }
  }

  return (
    <div
      className={`${
        darkMode ? "dark" : ""
      } min-h-screen flex flex-col lg:flex-row bg-[#F4F3EE] dark:bg-[#0E1A16] text-stone-900 dark:text-stone-100 transition-colors selection:bg-[#153E31] selection:text-white`}
    >
      {/* Mobile Top Header */}
      <div className="lg:hidden h-16 px-4 sm:px-5 border-b border-stone-200 dark:border-white/10 bg-[#0E271F] text-white flex items-center justify-between sticky top-0 z-30">
        <Link href="/">
          <StudyfyLogo size="sm" variant="light" />
        </Link>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl text-white hover:bg-white/10 cursor-pointer"
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ==============================================================
          LEFT SIDEBAR: Deep Midnight Forest Green (#0E271F)
          - Off-canvas drawer on mobile (< lg)
          - In-flow sticky sidebar on desktop (>= lg)
         ============================================================== */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-[#0E271F] text-white flex flex-col justify-between p-5 sm:p-6 shrink-0 z-50 border-r border-[#14352B] transition-transform duration-300 ease-in-out lg:static lg:w-68 lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } overflow-hidden`}
      >
        <div className="space-y-6 sm:space-y-8 relative z-10">
          {/* Logo + Mobile Close Button */}
          <div className="flex items-center justify-between px-1 pt-1">
            <Link href="/" className="inline-block" onClick={() => setMobileMenuOpen(false)}>
              <StudyfyLogo size="md" variant="light" showTagline />
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 lg:hidden cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {sidebarItems.map((item) => {
              const isActive = activeSection === item.key;
              const IconComponent = item.icon;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setActiveSection(item.key);
                    setCurrentFolderId(null);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full px-4 py-3 rounded-2xl text-[15px] font-medium flex items-center gap-3.5 transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#183D30] text-white font-semibold shadow-xs"
                      : "text-[#8FAAA0] hover:text-white hover:bg-white/5"
                  }`}
                >
                  <IconComponent
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? "text-emerald-300" : "text-[#8FAAA0]"
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar: Storage & Upgrade to Pro */}
        <div className="space-y-4 pt-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-[#8FAAA0]">
              <span>Storage</span>
            </div>
            {/* Progress Bar with vibrant emerald fill */}
            <div className="w-full h-1.5 rounded-full bg-[#183D30] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#22C55E] transition-all duration-300"
                style={{ width: "35%" }}
              />
            </div>
            <p className="text-xs text-[#8FAAA0]">
              <span className="text-white font-semibold">7.4 GB</span> of 500 MB used
            </p>
          </div>

          {/* Upgrade to Pro Pill Button */}
          <button
            type="button"
            onClick={() => showToast("Studyfy Pro upgrade portal opening soon!")}
            className="w-full py-2.5 px-4 rounded-xl border border-emerald-700/40 bg-[#183D30]/70 hover:bg-[#183D30] text-amber-300 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
          >
            <span>👑</span>
            <span>Upgrade to Pro</span>
          </button>
        </div>

        {/* Decorative Wave Motif at the bottom of the sidebar */}
        <div className="absolute -bottom-6 -left-6 -right-6 h-36 opacity-30 pointer-events-none z-0">
          <svg viewBox="0 0 300 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path
              d="M0 60C50 30 100 90 150 60C200 30 250 90 300 60V150H0V60Z"
              fill="#183D30"
            />
            <path
              d="M0 85C60 65 120 115 180 85C240 55 270 105 300 85V150H0V85Z"
              fill="#22C55E"
              fillOpacity="0.15"
            />
          </svg>
        </div>
      </aside>

      {/* ==============================================================
          MAIN CONTENT CANVAS: Warm Ivory / Linen (#F4F3EE)
         ============================================================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Navigation Bar */}
        <header className="px-4 sm:px-6 lg:px-10 py-3.5 sm:py-5 flex items-center justify-between gap-3 sm:gap-4 sticky top-0 z-20 bg-[#F4F3EE]/95 dark:bg-[#0E1A16]/95 backdrop-blur-md">
          {/* Rounded Pill Search Bar */}
          <div className="relative flex-1 max-w-md">
            <div className="w-full bg-white dark:bg-[#152520] rounded-full border border-stone-200/90 dark:border-white/10 px-3.5 sm:px-4 py-2 flex items-center justify-between shadow-2xs hover:border-stone-300 dark:hover:border-white/20 transition">
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <Search className="w-4 h-4 text-stone-400 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search files & folders..."
                  className="w-full bg-transparent text-xs sm:text-sm text-stone-800 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none"
                />
              </div>
              <span className="hidden sm:inline-block text-[11px] font-semibold text-stone-400 bg-stone-100 dark:bg-white/10 px-1.5 py-0.5 rounded border border-stone-200/60 dark:border-white/10 shrink-0 ml-2">
                ⌘ K
              </span>
            </div>
          </div>

          {/* Right Header Utilities: Theme, Help, Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full bg-white dark:bg-[#152520] border border-stone-200/80 dark:border-white/10 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:text-stone-900 shadow-2xs transition cursor-pointer"
              title="Toggle theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4" />}
            </button>

            {/* Help Button */}
            <button
              type="button"
              onClick={() => showToast("Studyfy Help & Documentation")}
              className="hidden sm:flex w-9 h-9 rounded-full bg-white dark:bg-[#152520] border border-stone-200/80 dark:border-white/10 items-center justify-center text-stone-600 dark:text-stone-300 hover:text-stone-900 shadow-2xs transition cursor-pointer"
              title="Help & Shortcuts"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* User Avatar & Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setUserDropdownOpen(!userDropdownOpen);
                }}
                className="flex items-center gap-1.5 sm:gap-2.5 px-1.5 sm:px-2 py-1 rounded-full hover:bg-stone-200/50 dark:hover:bg-white/10 transition cursor-pointer"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-800 text-white font-bold text-xs flex items-center justify-center border border-white dark:border-stone-800 shadow-xs">
                  {userName.charAt(0)}
                </div>
                <span className="text-sm font-semibold text-stone-800 dark:text-stone-100 hidden md:inline">
                  {userName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

              {userDropdownOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#152520] border border-stone-200 dark:border-white/10 shadow-lg p-2 z-50 text-sm"
                >
                  <div className="px-3 py-2 border-b border-stone-100 dark:border-white/10">
                    <p className="font-semibold text-stone-900 dark:text-white truncate">
                      {userName}
                    </p>
                    <p className="text-xs text-stone-500 truncate">{userEmail}</p>
                  </div>
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsGDriveConnected(!isGDriveConnected);
                        setUserDropdownOpen(false);
                        showToast(isGDriveConnected ? "Disconnected Google Drive" : "Connected Google Drive");
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-stone-50 dark:hover:bg-white/5 flex items-center gap-2 text-stone-700 dark:text-stone-300 cursor-pointer"
                    >
                      <GoogleDriveIcon className="w-4 h-4" />
                      <span>{isGDriveConnected ? "Google Drive (Connected)" : "Connect Google Drive"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsPdfConverterOpen(true);
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-stone-50 dark:hover:bg-white/5 flex items-center gap-2 text-stone-700 dark:text-stone-300 cursor-pointer"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      <span>Image to PDF Studio</span>
                    </button>
                  </div>
                  <div className="pt-1 border-t border-stone-100 dark:border-white/10">
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Status Toast */}
        {statusBanner && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#0E271F] text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold flex items-center gap-2.5 border border-emerald-500/30 animate-in fade-in slide-in-from-bottom-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{statusBanner}</span>
          </div>
        )}

        {/* Main Content Area */}
        <main className="px-4 sm:px-6 lg:px-10 py-4 max-w-7xl w-full mx-auto space-y-6 sm:space-y-7">
          {/* ==============================================================
              PAGE HEADER: Title + Subtitle + Action Buttons
             ============================================================== */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white tracking-tight">
                  {activeSection === "my_files"
                    ? currentFolderId
                      ? breadcrumbs[breadcrumbs.length - 1].name
                      : "My Files"
                    : activeSection === "favorites"
                    ? "Favorites"
                    : activeSection === "shared"
                    ? "Shared Links"
                    : activeSection === "offline"
                    ? "Offline Access"
                    : activeSection === "trash"
                    ? "Trash"
                    : "Settings"}
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
                Your personal workspace for all documents and knowledge.
              </p>
            </div>

            {/* Action Buttons: New Folder & Upload */}
            <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setIsNewFolderOpen(true)}
                className="flex-1 sm:flex-initial justify-center bg-white dark:bg-[#152520] hover:bg-stone-50 dark:hover:bg-white/10 border border-stone-200/90 dark:border-white/15 text-stone-800 dark:text-stone-200 font-semibold text-xs sm:text-sm px-3.5 sm:px-4 py-2.5 rounded-2xl shadow-2xs flex items-center gap-2 transition cursor-pointer"
              >
                <FolderPlus className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
                <span>New Folder</span>
              </button>

              <label className="flex-1 sm:flex-initial justify-center bg-[#153E31] hover:bg-[#0E271F] text-white font-semibold text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-2xl shadow-xs flex items-center gap-2 transition cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Upload</span>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.doc,.docx,.zip"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Breadcrumb Navigation when inside a subfolder */}
          {currentFolderId && (
            <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400 py-1">
              {breadcrumbs.map((crumb, idx) => (
                <div key={crumb.id || "root"} className="flex items-center gap-2">
                  {idx > 0 && <ChevronRight className="w-4 h-4 text-stone-400" />}
                  <button
                    type="button"
                    onClick={() => setCurrentFolderId(crumb.id)}
                    className={`hover:underline cursor-pointer ${
                      idx === breadcrumbs.length - 1
                        ? "font-semibold text-stone-900 dark:text-white"
                        : "text-stone-500"
                    }`}
                  >
                    {crumb.name}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ==============================================================
              FOLDER CARDS GRID: 4 Sage-Mint Rounded Cards
             ============================================================== */}
          {activeSection === "my_files" && !currentFolderId && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {topFolderCards.map((card) => (
                <div
                  key={card.id}
                  onClick={() => {
                    const found = folders.find((f) => f.id === card.id);
                    if (found) setCurrentFolderId(found.id);
                    else showToast(`Opening ${card.name}`);
                  }}
                  className="bg-[#E6EFE9] dark:bg-[#14261F] rounded-2xl p-4.5 border border-emerald-900/5 dark:border-white/5 flex flex-col justify-between hover:shadow-xs transition-all cursor-pointer group"
                >
                  {/* Top: Solid Forest Green Folder Icon & Quick Edit */}
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-[#153E31] text-emerald-300 flex items-center justify-center shrink-0">
                      <FolderIcon className="w-4.5 h-4.5 fill-current" />
                    </div>
                    {folders.some((f) => f.id === card.id) && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const found = folders.find((f) => f.id === card.id);
                          if (found) handleOpenEdit(found, true);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-white/80 dark:bg-white/10 hover:bg-white text-stone-600 dark:text-stone-200 transition cursor-pointer"
                        title="Edit Folder"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Middle: Folder Title */}
                  <div className="mt-3.5 min-w-0">
                    <h3 className="font-semibold text-stone-900 dark:text-white text-base truncate group-hover:text-[#153E31] dark:group-hover:text-emerald-300 transition-colors">
                      {card.name}
                    </h3>
                  </div>

                  {/* Bottom: Metadata + Circular Arrow Button */}
                  <div className="flex items-center justify-between mt-2 pt-1">
                    <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                      {card.filesCount} files • {card.sizeText}
                    </span>
                    <div className="w-7 h-7 rounded-full bg-white/90 dark:bg-white/10 text-stone-700 dark:text-stone-200 flex items-center justify-center text-xs shadow-2xs group-hover:bg-white group-hover:translate-x-0.5 transition-all">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ==============================================================
              TWO-COLUMN MAIN SECTION:
              - Left (8 cols): All Files Table
              - Right (4 cols): Storage Overview
             ============================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* ---------------- LEFT: ALL FILES TABLE ---------------- */}
            <div className="lg:col-span-8 space-y-4">
              {/* Header Row: All Files Title + Controls */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-stone-900 dark:text-white">
                  {activeSection === "my_files" ? "All Files" : "Documents"}
                </h2>

                <div className="flex items-center gap-2">
                  {/* Sort Dropdown */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as "date" | "name" | "size")}
                    className="bg-white dark:bg-[#152520] border border-stone-200/90 dark:border-white/10 text-stone-700 dark:text-stone-200 text-xs font-semibold px-3 py-2 rounded-xl focus:outline-none cursor-pointer shadow-2xs"
                  >
                    <option value="date">Last Modified ▾</option>
                    <option value="name">Name ▾</option>
                    <option value="size">Size ▾</option>
                  </select>

                  {/* View Mode Switcher */}
                  <div className="bg-white dark:bg-[#152520] border border-stone-200/90 dark:border-white/10 p-1 rounded-xl flex items-center shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setViewMode("list")}
                      className={`p-1.5 rounded-lg transition cursor-pointer ${
                        viewMode === "list"
                          ? "bg-[#153E31] text-white"
                          : "text-stone-400 hover:text-stone-600"
                      }`}
                      title="List View"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("grid")}
                      className={`p-1.5 rounded-lg transition cursor-pointer ${
                        viewMode === "grid"
                          ? "bg-[#153E31] text-white"
                          : "text-stone-400 hover:text-stone-600"
                      }`}
                      title="Grid View"
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Filter Icon Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const next =
                        providerFilter === "all"
                          ? "studyfy_cloud"
                          : providerFilter === "studyfy_cloud"
                          ? "google_drive"
                          : "all";
                      setProviderFilter(next);
                      showToast(`Filter: ${next === "all" ? "All Providers" : next === "studyfy_cloud" ? "Studyfy Cloud" : "Google Drive"}`);
                    }}
                    className="w-8 h-8 bg-white dark:bg-[#152520] border border-stone-200/90 dark:border-white/10 rounded-xl flex items-center justify-center text-stone-600 dark:text-stone-300 hover:text-stone-900 shadow-2xs cursor-pointer"
                    title={`Filter by provider (Current: ${providerFilter})`}
                  >
                    <Filter className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Table Card */}
              {viewMode === "list" ? (
                <div className="bg-white dark:bg-[#152520] rounded-2xl border border-stone-200/80 dark:border-white/10 shadow-2xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-stone-100 dark:border-white/5 bg-[#FDFDFC] dark:bg-white/2 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                          <th className="py-3 px-3 sm:px-4 w-9 text-center">
                            <button
                              type="button"
                              onClick={toggleSelectAll}
                              className="text-stone-400 hover:text-stone-700 cursor-pointer"
                            >
                              {selectedIds.size > 0 &&
                              selectedIds.size === activeFiles.length + activeFolders.length ? (
                                <CheckSquare className="w-4 h-4 text-[#153E31]" />
                              ) : (
                                <Square className="w-4 h-4" />
                              )}
                            </button>
                          </th>
                          <th className="py-3 px-3 sm:px-4 font-semibold">Name</th>
                          <th className="hidden md:table-cell py-3 px-4 font-semibold">Type</th>
                          <th className="hidden sm:table-cell py-3 px-4 font-semibold">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setProviderDropdownOpen(!providerDropdownOpen);
                              }}
                              className="inline-flex items-center gap-1 hover:text-stone-700 cursor-pointer"
                            >
                              <span>Provider</span>
                              <ChevronDown className="w-3 h-3" />
                            </button>
                          </th>
                          <th className="hidden sm:table-cell py-3 px-4 font-semibold">Size</th>
                          <th className="hidden lg:table-cell py-3 px-4 font-semibold">Last Modified</th>
                          <th className="py-3 px-3 sm:px-4 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 dark:divide-white/5 text-sm">
                        {/* Subfolders in list */}
                        {activeFolders.map((folder) => {
                          const isSelected = selectedIds.has(folder.id);
                          return (
                            <tr
                              key={folder.id}
                              onClick={() => setCurrentFolderId(folder.id)}
                              className="hover:bg-stone-50/80 dark:hover:bg-white/5 transition-colors cursor-pointer group"
                            >
                              <td
                                className="py-3 px-3 sm:px-4 text-center"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSelect(folder.id);
                                }}
                              >
                                {isSelected ? (
                                  <CheckSquare className="w-4 h-4 text-[#153E31]" />
                                ) : (
                                  <Square className="w-4 h-4 text-stone-300 group-hover:text-stone-500" />
                                )}
                              </td>
                              <td className="py-3 px-3 sm:px-4">
                                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                                    <FolderIcon className="w-4.5 h-4.5 fill-current" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <span className="font-semibold text-stone-900 dark:text-stone-100 group-hover:text-[#153E31] dark:group-hover:text-emerald-300 block truncate text-xs sm:text-sm">
                                      {folder.name}
                                    </span>
                                    <span className="sm:hidden text-[10px] text-stone-400 font-medium block">
                                      Folder • {formatDate(folder.created_at)}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="hidden md:table-cell py-3.5 px-4">
                                <span className="text-xs text-stone-500 font-medium">Folder</span>
                              </td>
                              <td className="hidden sm:table-cell py-3.5 px-4">
                                <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-800 dark:text-emerald-400">
                                  <Cloud className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600/20" />
                                  <span>Studyfy Cloud</span>
                                </div>
                              </td>
                              <td className="hidden sm:table-cell py-3.5 px-4 text-xs text-stone-500">—</td>
                              <td className="hidden lg:table-cell py-3.5 px-4 text-xs text-stone-500">
                                {formatDate(folder.created_at)}
                              </td>
                              <td
                                className="py-3 px-3 sm:px-4 text-right"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEdit(folder, true)}
                                    className="p-1.5 rounded-lg text-stone-400 hover:text-[#153E31] dark:hover:text-emerald-400 hover:bg-stone-100 dark:hover:bg-white/10 transition cursor-pointer"
                                    title="Edit Folder"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <div className="relative inline-block text-left">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setActiveActionMenuId(
                                          activeActionMenuId === folder.id ? null : folder.id
                                        )
                                      }
                                      className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 dark:hover:bg-white/10 cursor-pointer"
                                    >
                                      <MoreVertical className="w-4 h-4" />
                                    </button>
                                    {activeActionMenuId === folder.id && (
                                      <div className="absolute right-0 mt-1 w-44 rounded-xl bg-white dark:bg-[#152520] border border-stone-200 dark:border-white/10 shadow-lg p-1.5 z-30 text-xs">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            handleOpenEdit(folder, true);
                                            setActiveActionMenuId(null);
                                          }}
                                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-stone-50 dark:hover:bg-white/5 flex items-center gap-2 font-medium text-stone-800 dark:text-stone-200"
                                        >
                                          <Pencil className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                                          <span>Edit Details</span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            handleSoftDeleteOrRestore(
                                              folder.id,
                                              true,
                                              folder.deleted_at !== null
                                            );
                                            setActiveActionMenuId(null);
                                          }}
                                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 flex items-center gap-2"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                          <span>
                                            {folder.deleted_at ? "Restore" : "Delete"}
                                          </span>
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })}

                        {/* Files in list */}
                        {activeFiles.map((file) => {
                          const isSelected = selectedIds.has(file.id);
                          const badge = getFileTypeBadge(file);
                          const provider = getFileProvider(file);

                          return (
                            <tr
                              key={file.id}
                              onClick={() => handlePreviewFile(file)}
                              className="hover:bg-stone-50/80 dark:hover:bg-white/5 transition-colors cursor-pointer group"
                            >
                              <td
                                className="py-3 px-3 sm:px-4 text-center"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSelect(file.id);
                                }}
                              >
                                {isSelected ? (
                                  <CheckSquare className="w-4 h-4 text-[#153E31]" />
                                ) : (
                                  <Square className="w-4 h-4 text-stone-300 group-hover:text-stone-500" />
                                )}
                              </td>
                              <td className="py-3 px-3 sm:px-4">
                                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                                  {renderFileIcon(file)}
                                  <div className="min-w-0 flex-1">
                                    <span className="font-semibold text-stone-900 dark:text-stone-100 group-hover:text-[#153E31] dark:group-hover:text-emerald-300 block truncate text-xs sm:text-sm">
                                      {file.name}
                                    </span>
                                    <span className="sm:hidden text-[10px] text-stone-400 font-medium flex items-center gap-1.5 mt-0.5">
                                      <span className="font-semibold text-stone-600 dark:text-stone-300">{badge.label}</span>
                                      <span>•</span>
                                      <span>{formatBytes(file.size_bytes)}</span>
                                      <span>•</span>
                                      <span>{provider === "google_drive" ? "Drive" : "Studyfy"}</span>
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="hidden md:table-cell py-3.5 px-4">
                                <span
                                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badge.bg}`}
                                >
                                  {badge.label}
                                </span>
                              </td>
                              <td className="hidden sm:table-cell py-3.5 px-4">
                                {provider === "google_drive" ? (
                                  <div className="flex items-center gap-1.5 text-xs font-medium text-stone-700 dark:text-stone-300">
                                    <GoogleDriveIcon className="w-3.5 h-3.5" />
                                    <span>Google Drive</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-800 dark:text-emerald-400">
                                    <Cloud className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600/20" />
                                    <span>Studyfy Cloud</span>
                                  </div>
                                )}
                              </td>
                              <td className="hidden sm:table-cell py-3.5 px-4 text-xs text-stone-500 font-medium">
                                {formatBytes(file.size_bytes)}
                              </td>
                              <td className="hidden lg:table-cell py-3.5 px-4 text-xs text-stone-500 font-medium">
                                {formatDate(file.created_at)}
                              </td>
                              <td
                                className="py-3 px-3 sm:px-4 text-right"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEdit(file, false)}
                                    className="p-1.5 rounded-lg text-stone-400 hover:text-[#153E31] dark:hover:text-emerald-400 hover:bg-stone-100 dark:hover:bg-white/10 transition cursor-pointer"
                                    title="Edit File"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <div className="relative inline-block text-left">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setActiveActionMenuId(
                                          activeActionMenuId === file.id ? null : file.id
                                        )
                                      }
                                      className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 dark:hover:bg-white/10 cursor-pointer"
                                    >
                                      <MoreVertical className="w-4 h-4" />
                                    </button>
                                    {activeActionMenuId === file.id && (
                                      <div className="absolute right-0 mt-1 w-48 rounded-2xl bg-white dark:bg-[#152520] border border-stone-200 dark:border-white/10 shadow-lg p-2 z-30 text-xs">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            handleOpenEdit(file, false);
                                            setActiveActionMenuId(null);
                                          }}
                                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-stone-50 dark:hover:bg-white/5 flex items-center gap-2 font-medium text-stone-900 dark:text-stone-100"
                                        >
                                          <Pencil className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                                          <span>Edit Details</span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            handlePreviewFile(file);
                                            setActiveActionMenuId(null);
                                          }}
                                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-stone-50 dark:hover:bg-white/5 flex items-center gap-2"
                                        >
                                          <Eye className="w-3.5 h-3.5 text-emerald-600" />
                                          <span>Preview</span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            handleToggleFavorite(file);
                                            setActiveActionMenuId(null);
                                          }}
                                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-stone-50 dark:hover:bg-white/5 flex items-center gap-2"
                                        >
                                          <Star
                                            className={`w-3.5 h-3.5 ${
                                              file.is_favorite
                                                ? "fill-amber-400 text-amber-400"
                                                : "text-stone-400"
                                            }`}
                                          />
                                          <span>
                                            {file.is_favorite
                                              ? "Remove Favorite"
                                              : "Add to Favorites"}
                                          </span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            handleToggleOfflinePin(file);
                                            setActiveActionMenuId(null);
                                          }}
                                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-stone-50 dark:hover:bg-white/5 flex items-center gap-2"
                                        >
                                          <Pin className="w-3.5 h-3.5 text-sky-600" />
                                          <span>Available Offline</span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setShareModalFile(file);
                                            setActiveActionMenuId(null);
                                          }}
                                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-stone-50 dark:hover:bg-white/5 flex items-center gap-2"
                                        >
                                          <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                                          <span>Share Link</span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setMovingFile(file);
                                            setActiveActionMenuId(null);
                                          }}
                                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-stone-50 dark:hover:bg-white/5 flex items-center gap-2"
                                        >
                                          <FolderInput className="w-3.5 h-3.5 text-stone-500" />
                                          <span>Move to Folder</span>
                                        </button>
                                        <div className="my-1 border-t border-stone-100 dark:border-white/5" />
                                        <button
                                          type="button"
                                          onClick={() => {
                                            handleSoftDeleteOrRestore(
                                              file.id,
                                              false,
                                              file.deleted_at !== null
                                            );
                                            setActiveActionMenuId(null);
                                          }}
                                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 flex items-center gap-2 font-medium"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                          <span>
                                            {file.deleted_at ? "Restore" : "Delete"}
                                          </span>
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })}

                        {activeFiles.length === 0 && activeFolders.length === 0 && (
                          <tr>
                            <td colSpan={7} className="py-12 text-center text-stone-400">
                              No files or folders found in this view.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* Grid View Mode */
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {activeFolders.map((f) => (
                    <div
                      key={f.id}
                      onClick={() => setCurrentFolderId(f.id)}
                      className="bg-white dark:bg-[#152520] p-4 rounded-2xl border border-stone-200/80 dark:border-white/10 hover:shadow-xs transition cursor-pointer flex flex-col justify-between group"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                          <FolderIcon className="w-5 h-5 fill-current" />
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(f, true);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-stone-100 dark:bg-white/10 hover:bg-stone-200 text-stone-600 dark:text-stone-300 transition"
                          title="Edit Folder"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <h4 className="text-sm font-semibold text-stone-900 dark:text-white truncate">
                        {f.name}
                      </h4>
                      <p className="text-xs text-stone-400 mt-1">Folder</p>
                    </div>
                  ))}
                  {activeFiles.map((file) => (
                    <div
                      key={file.id}
                      onClick={() => handlePreviewFile(file)}
                      className="bg-white dark:bg-[#152520] p-4 rounded-2xl border border-stone-200/80 dark:border-white/10 hover:shadow-xs transition cursor-pointer flex flex-col justify-between group"
                    >
                      <div className="flex items-center justify-between mb-3">
                        {renderFileIcon(file)}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEdit(file, false);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-stone-100 dark:bg-white/10 hover:bg-stone-200 text-stone-600 dark:text-stone-300 transition"
                            title="Edit File"
                          >
                            <Pencil className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                          </button>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-stone-300">
                            {getFileExtension(file.name).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <h4 className="text-sm font-semibold text-stone-900 dark:text-white truncate">
                        {file.name}
                      </h4>
                      <div className="flex items-center justify-between mt-2 pt-1 text-xs text-stone-400">
                        <span>{formatBytes(file.size_bytes)}</span>
                        <span>{formatDate(file.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ---------------- RIGHT: STORAGE OVERVIEW ---------------- */}
            <div className="lg:col-span-4 space-y-5">
              <div className="bg-white dark:bg-[#152520] rounded-2xl border border-stone-200/80 dark:border-white/10 p-5 shadow-2xs space-y-5">
                <h3 className="font-bold text-base text-stone-900 dark:text-white">
                  Storage Overview
                </h3>

                {/* Studyfy Cloud Metric */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-emerald-600 fill-emerald-600/20" />
                    <span className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                      Studyfy Cloud
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-stone-500 dark:text-stone-400 font-medium">
                    <span>7.4 GB / 500 GB</span>
                    <span className="font-semibold text-stone-700 dark:text-stone-300">1.5%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-stone-100 dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#10B981] transition-all duration-300"
                      style={{ width: "1.5%" }}
                    />
                  </div>
                </div>

                {/* Google Drive Metric */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <GoogleDriveIcon className="w-4 h-4" />
                    <span className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                      Google Drive
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-stone-500 dark:text-stone-400 font-medium">
                    <span>2.3 GB / 15 GB</span>
                    <span className="font-semibold text-stone-700 dark:text-stone-300">15.3%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-stone-100 dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#10B981] transition-all duration-300"
                      style={{ width: "15.3%" }}
                    />
                  </div>
                </div>

                {/* Offline Storage Metric */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-700" />
                    <span className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                      Offline Storage
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-stone-500 dark:text-stone-400 font-medium">
                    <span>455 MB</span>
                    <span className="font-semibold text-stone-700 dark:text-stone-300">45%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-stone-100 dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#10B981] transition-all duration-300"
                      style={{ width: "45%" }}
                    />
                  </div>
                </div>

                {/* All Systems Ready Status Badge */}
                <div className="bg-[#E8F5E9] dark:bg-[#132A20] rounded-xl p-3 border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-3 mt-4">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 flex items-center justify-center text-xs font-bold shrink-0">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
                      All systems ready
                    </h4>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                      Your files are safe and accessible.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ==============================================================
              BOTTOM FEATURE BANNER: Work Smarter & Explore Features
             ============================================================== */}
          <div className="bg-[#E6EFE9] dark:bg-[#14261F] rounded-2xl p-6 border border-emerald-900/5 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xs">
            <div className="flex items-center gap-5">
              {/* Illustrated Stacked Docs Graphic */}
              <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#1A332A] p-2.5 shadow-2xs flex items-center justify-center shrink-0 border border-emerald-900/10">
                <div className="relative">
                  <FileText className="w-8 h-8 text-[#153E31] dark:text-emerald-400" />
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 absolute -top-1 -right-1" />
                </div>
              </div>

              {/* Text content */}
              <div>
                <span className="text-[11px] font-bold text-[#153E31] dark:text-emerald-400 tracking-wider uppercase">
                  WORK SMARTER
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-white mt-0.5">
                  Take your productivity to the next level
                </h3>
                <p className="text-sm text-stone-600 dark:text-stone-300 mt-0.5">
                  Organize, convert and access your files with ease.
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <button
              type="button"
              onClick={() => setIsPdfConverterOpen(true)}
              className="bg-[#153E31] hover:bg-[#0E271F] text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-xs transition cursor-pointer shrink-0 flex items-center gap-2"
            >
              <span>Explore Features</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </main>
      </div>

      {/* ==============================================================
          MODALS & SYSTEM TOOLS
         ============================================================== */}

      {/* New Folder Modal */}
      {isNewFolderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#152520] w-full max-w-md rounded-2xl p-6 shadow-xl border border-stone-200 dark:border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-stone-900 dark:text-white">
                Create New Folder
              </h3>
              <button
                type="button"
                onClick={() => setIsNewFolderOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1.5">
                  Folder Name
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="e.g. Machine Learning Lab"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-white/15 bg-stone-50 dark:bg-white/5 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#153E31]"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewFolderOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#153E31] text-white text-sm font-semibold hover:bg-[#0E271F] transition shadow-xs"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#152520] w-full max-w-lg rounded-2xl p-6 shadow-xl border border-stone-200 dark:border-white/10 space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-[#153E31] dark:text-emerald-400 flex items-center justify-center">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-stone-900 dark:text-white">
                    {editingItem.isFolder ? "Edit Folder" : "Edit File Details"}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Update name, location, and annotations.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Name Input */}
              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1.5">
                  {editingItem.isFolder ? "Folder Name" : "File Name"}
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  value={editingItem.name}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, name: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-white/15 bg-stone-50 dark:bg-white/5 text-stone-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#153E31]"
                />
              </div>

              {/* Move Destination Folder */}
              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1.5">
                  Location / Destination Folder
                </label>
                <select
                  value={editingItem.folderId || "root"}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      folderId: e.target.value === "root" ? null : e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-white/15 bg-stone-50 dark:bg-white/5 text-stone-900 dark:text-white text-sm focus:outline-none cursor-pointer"
                >
                  <option value="root">📁 Root / All Files</option>
                  {folders
                    .filter(
                      (f) =>
                        f.deleted_at === null &&
                        (!editingItem.isFolder || f.id !== editingItem.id)
                    )
                    .map((f) => (
                      <option key={f.id} value={f.id}>
                        📁 {f.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* File Specific Attributes */}
              {!editingItem.isFolder && (
                <>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        setEditingItem({
                          ...editingItem,
                          isFavorite: !editingItem.isFavorite,
                        })
                      }
                      className={`px-3 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                        editingItem.isFavorite
                          ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 text-amber-800 dark:text-amber-300"
                          : "border-stone-200 dark:border-white/10 text-stone-600 dark:text-stone-300 hover:bg-stone-50"
                      }`}
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          editingItem.isFavorite
                            ? "fill-amber-400 text-amber-400"
                            : "text-stone-400"
                        }`}
                      />
                      <span>
                        {editingItem.isFavorite ? "Favorited" : "Favorite"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setEditingItem({
                          ...editingItem,
                          isOffline: !editingItem.isOffline,
                        })
                      }
                      className={`px-3 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                        editingItem.isOffline
                          ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 text-[#153E31] dark:text-emerald-300"
                          : "border-stone-200 dark:border-white/10 text-stone-600 dark:text-stone-300 hover:bg-stone-50"
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        {editingItem.isOffline
                          ? "Available Offline"
                          : "Pin Offline"}
                      </span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1.5">
                      Personal Notes & Annotations
                    </label>
                    <textarea
                      rows={3}
                      value={editingItem.notes}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, notes: e.target.value })
                      }
                      placeholder="Add study remarks, key takeaways, or exam pointers..."
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-white/15 bg-stone-50 dark:bg-white/5 text-stone-900 dark:text-white text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#153E31]"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2.5 pt-3 border-t border-stone-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-white/10 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#153E31] text-white text-xs font-semibold hover:bg-[#0E271F] transition shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Move File Modal */}
      {movingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#152520] w-full max-w-md rounded-2xl p-6 shadow-xl border border-stone-200 dark:border-white/10 space-y-4">
            <h3 className="font-bold text-lg text-stone-900 dark:text-white">
              Move &ldquo;{movingFile.name}&rdquo;
            </h3>
            <form onSubmit={handleMoveFile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1.5">
                  Select Destination Folder
                </label>
                <select
                  value={targetMoveFolderId}
                  onChange={(e) => setTargetMoveFolderId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-white/15 bg-stone-50 dark:bg-white/5 text-stone-900 dark:text-white focus:outline-none"
                >
                  <option value="root">📁 Root / All Files</option>
                  {folders
                    .filter((f) => f.deleted_at === null)
                    .map((f) => (
                      <option key={f.id} value={f.id}>
                        📁 {f.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setMovingFile(null)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#153E31] text-white text-sm font-semibold hover:bg-[#0E271F]"
                >
                  Confirm Move
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image-To-PDF Studio Modal */}
      {isPdfConverterOpen && (
        <ImageToPdfModal
          isOpen={isPdfConverterOpen}
          onClose={() => setIsPdfConverterOpen(false)}
          folders={folders}
          currentFolderId={currentFolderId}
          onPdfCreated={async (pdfFile: File, targetFolderId?: string | null) => {
            const newId = `pdf-${Date.now()}`;
            const blobUrl = URL.createObjectURL(pdfFile);
            setLocalBlobUrls((prev) => ({ ...prev, [newId]: blobUrl }));

            const record: FileItem = {
              id: newId,
              user_id: userId,
              folder_id: targetFolderId !== undefined ? targetFolderId : currentFolderId,
              name: pdfFile.name,
              storage_path: `${userId}/${pdfFile.name}`,
              mime_type: "application/pdf",
              size_bytes: pdfFile.size,
              is_favorite: false,
              deleted_at: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

            setFilesState((prev) => [record, ...prev]);
            showToast(`Generated & Saved "${pdfFile.name}"`);
            setIsPdfConverterOpen(false);
          }}
        />
      )}

      {/* File Preview Modal with direct Edit integration */}
      {previewFile && previewUrl && (
        <FilePreviewModal
          file={previewFile}
          previewUrl={previewUrl}
          onClose={() => {
            setPreviewFile(null);
            setPreviewUrl(null);
          }}
          onEdit={(f) => {
            handleOpenEdit(f, false);
            setPreviewFile(null);
            setPreviewUrl(null);
          }}
        />
      )}

      {/* Share Modal */}
      {shareModalFile && (
        <ShareModal
          file={shareModalFile}
          shares={shares}
          onClose={() => setShareModalFile(null)}
          onCreateShare={handleCreateShare}
          onRevokeShare={handleRevokeShare}
        />
      )}

      {/* Floating Selection Action Bar with Edit option */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-7 left-1/2 -translate-x-1/2 z-40 bg-[#0E271F] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3.5 border border-emerald-500/30 animate-in fade-in slide-in-from-bottom-3 backdrop-blur-md">
          <span className="text-xs font-semibold text-emerald-200">
            {selectedIds.size} {selectedIds.size === 1 ? "item" : "items"} selected
          </span>
          <div className="h-4 w-px bg-white/20" />
          {selectedIds.size === 1 && (
            <button
              type="button"
              onClick={() => {
                const id = Array.from(selectedIds)[0];
                const targetFile = files.find((f) => f.id === id);
                const targetFolder = folders.find((f) => f.id === id);
                if (targetFile) handleOpenEdit(targetFile, false);
                else if (targetFolder) handleOpenEdit(targetFolder, true);
              }}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1.5 cursor-pointer text-white transition"
            >
              <Pencil className="w-3.5 h-3.5 text-emerald-300" />
              <span>Edit</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              const ids = Array.from(selectedIds);
              ids.forEach((id) => {
                const isF = folders.some((f) => f.id === id);
                handleSoftDeleteOrRestore(id, isF, false);
              });
              setSelectedIds(new Set());
            }}
            className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-300" />
            <span>Delete</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedIds(new Set())}
            className="text-xs text-[#8FAAA0] hover:text-white cursor-pointer ml-1 underline"
          >
            Deselect
          </button>
        </div>
      )}
    </div>
  );
}
