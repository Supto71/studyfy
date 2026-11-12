/**
 * IndexedDB Offline Storage & Upload Queue Engine for StudyFy PWA
 * Stores pinned offline document blobs and pending upload jobs locally.
 */

export interface OfflinePinnedFile {
  id: string;
  provider: "studyfy_cloud" | "google_drive";
  name: string;
  mimeType: string;
  sizeBytes: number;
  blob: Blob | null;
  pinnedAt: string;
}

export interface UploadJobItem {
  id: string;
  fileName: string;
  sizeBytes: number;
  provider: "studyfy_cloud" | "google_drive";
  status: "completed" | "uploading" | "pending" | "failed";
  errorMessage?: string;
  createdAt: string;
}

const DB_NAME = "studyfy_offline_vault";
const DB_VERSION = 1;
const STORE_FILES = "offline_files";
const STORE_JOBS = "upload_jobs";

function openOfflineDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !("indexedDB" in window)) {
      reject(new Error("IndexedDB not available"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_FILES)) {
        db.createObjectStore(STORE_FILES, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_JOBS)) {
        db.createObjectStore(STORE_JOBS, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function listOfflineFiles(): Promise<OfflinePinnedFile[]> {
  try {
    const db = await openOfflineDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_FILES, "readonly");
      const store = tx.objectStore(STORE_FILES);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

export async function saveFileOffline(item: OfflinePinnedFile): Promise<void> {
  try {
    if (typeof navigator !== "undefined" && navigator.storage?.persist) {
      await navigator.storage.persist();
    }
    const db = await openOfflineDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_FILES, "readwrite");
      const store = tx.objectStore(STORE_FILES);
      const req = store.put(item);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Ignore on unsupported environments
  }
}

export async function removeOfflineFile(id: string): Promise<void> {
  try {
    const db = await openOfflineDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_FILES, "readwrite");
      const store = tx.objectStore(STORE_FILES);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Ignore
  }
}

export async function getBrowserStorageEstimate(): Promise<{
  usageBytes: number;
  quotaBytes: number;
}> {
  if (typeof navigator !== "undefined" && navigator.storage?.estimate) {
    try {
      const est = await navigator.storage.estimate();
      return {
        usageBytes: est.usage || 0,
        quotaBytes: est.quota || 1073741824,
      };
    } catch {
      return { usageBytes: 0, quotaBytes: 1073741824 };
    }
  }
  return { usageBytes: 0, quotaBytes: 1073741824 };
}

