-- ============================================================================
-- STUDYFY: STUDENT CLOUD NOTES - SUPABASE POSTGRESQL SCHEMA & SECURITY
-- Run this entire script inside the Supabase SQL Editor.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. TABLES
-- ----------------------------------------------------------------------------

-- 1.1 User Profiles & Storage Quota Tracking
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    storage_quota_bytes BIGINT NOT NULL DEFAULT 524288000, -- 500 MB default
    used_storage_bytes BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 1.2 Folders (Adjacency List for Nested Hierarchy)
CREATE TABLE IF NOT EXISTS public.folders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.folders(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#4F46E5',
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_folders_unique_active_name
ON public.folders (user_id, COALESCE(parent_id, '00000000-0000-0000-0000-000000000000'), name)
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_folders_user_parent
ON public.folders (user_id, parent_id)
WHERE deleted_at IS NULL;

-- 1.3 Files Metadata (Actual binary stays in Supabase Storage)
CREATE TABLE IF NOT EXISTS public.files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    storage_path TEXT NOT NULL UNIQUE,
    mime_type TEXT NOT NULL,
    size_bytes BIGINT NOT NULL CHECK (size_bytes >= 0),
    is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_files_user_folder
ON public.files (user_id, folder_id)
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_files_trash
ON public.files (user_id)
WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_files_search
ON public.files USING gin (to_tsvector('english', name));

-- 1.4 Controlled Share Links
CREATE TABLE IF NOT EXISTS public.file_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id UUID NOT NULL REFERENCES public.files(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    share_token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ DEFAULT NULL,
    max_access_count INT DEFAULT NULL,
    access_count INT NOT NULL DEFAULT 0,
    allow_download BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_file_shares_token
ON public.file_shares (share_token);

-- ----------------------------------------------------------------------------
-- 2. AUTOMATED TRIGGERS & FUNCTIONS
-- ----------------------------------------------------------------------------

-- 2.1 Auto-create profile row upon user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2.2 Automatically track storage usage on file insert / permanent delete
CREATE OR REPLACE FUNCTION public.update_storage_usage()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.profiles
        SET used_storage_bytes = used_storage_bytes + NEW.size_bytes,
            updated_at = timezone('utc'::text, now())
        WHERE id = NEW.user_id;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.profiles
        SET used_storage_bytes = GREATEST(0, used_storage_bytes - OLD.size_bytes),
            updated_at = timezone('utc'::text, now())
        WHERE id = OLD.user_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_files_storage_usage ON public.files;
CREATE TRIGGER trg_files_storage_usage
    AFTER INSERT OR DELETE ON public.files
    FOR EACH ROW EXECUTE PROCEDURE public.update_storage_usage();

-- ----------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_shares ENABLE ROW LEVEL SECURITY;

-- Profiles: Only owner can read/update
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.profiles;
CREATE POLICY "Users can manage their own profile"
ON public.profiles FOR ALL TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Folders: Only owner can read/write/delete
DROP POLICY IF EXISTS "Users can manage their own folders" ON public.folders;
CREATE POLICY "Users can manage their own folders"
ON public.folders FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Files: Only owner can manage their files
DROP POLICY IF EXISTS "Users can manage their own files" ON public.files;
CREATE POLICY "Users can manage their own files"
ON public.files FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- File Shares: Only creator can manage share links
DROP POLICY IF EXISTS "Users can manage shares for their files" ON public.file_shares;
CREATE POLICY "Users can manage shares for their files"
ON public.file_shares FOR ALL TO authenticated
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

-- ----------------------------------------------------------------------------
-- 4. STORAGE BUCKET & STORAGE RLS POLICIES
-- ----------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'student-notes',
    'student-notes',
    false,
    52428800, -- 50 MB max per file
    ARRAY[
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/webp',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
)
ON CONFLICT (id) DO NOTHING;

-- Storage Policy: Upload to own user_id folder only
DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
CREATE POLICY "Users can upload their own files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'student-notes' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage Policy: Read own files
DROP POLICY IF EXISTS "Users can view their own files" ON storage.objects;
CREATE POLICY "Users can view their own files"
ON storage.objects FOR SELECT TO authenticated
USING (
    bucket_id = 'student-notes' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage Policy: Update own files
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
CREATE POLICY "Users can update their own files"
ON storage.objects FOR UPDATE TO authenticated
USING (
    bucket_id = 'student-notes' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage Policy: Delete own files
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE TO authenticated
USING (
    bucket_id = 'student-notes' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

