export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  storage_quota_bytes: number;
  used_storage_bytes: number;
  created_at: string;
  updated_at: string;
}

export interface Folder {
  id: string;
  user_id: string;
  parent_id: string | null;
  name: string;
  color: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface FileItem {
  id: string;
  user_id: string;
  folder_id: string | null;
  name: string;
  storage_path: string;
  mime_type: string;
  size_bytes: number;
  is_favorite: boolean;
  notes?: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface FileShare {
  id: string;
  file_id: string;
  created_by: string;
  share_token: string;
  expires_at: string | null;
  max_access_count: number | null;
  access_count: number;
  allow_download: boolean;
  created_at: string;
}

export interface BreadcrumbItem {
  id: string | null;
  name: string;
}

