# StudyFy — Student Cloud Notes PWA (Next.js + Supabase)

A professional, scalable, student-focused cloud document management Progressive Web Application (PWA) built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Supabase (PostgreSQL + Auth + Storage)**, and **pdf-lib**.

---

## Features Implemented

1. **Authentication & Student Profiles**:
   - Email/Password Registration & Sign-In via Supabase Auth (`/login`, `/register`, `/auth/callback`).
   - Automatic student profile provisioning with **500 MB default storage quota** via PostgreSQL trigger.
2. **Personal Cloud Drive Dashboard (`/drive`)**:
   - Color-coded folders and arbitrary **nested folder management** with dynamic Breadcrumb navigation.
   - Direct upload of **PDF, JPG, PNG, WebP, DOCX, and TXT** files to isolated storage paths (`{user_id}/{file_id}.{ext}`).
   - Real-time **Storage Quota Bar** tracking used vs. total storage.
3. **Client-Side Multi-Image to PDF Converter**:
   - Select multiple photos of handwritten notes or whiteboards.
   - Reorder pages (up/down), remove pages, name the output PDF, and compile into a standardized A4 PDF in the browser using `pdf-lib`.
4. **PDF & Image Preview + Download**:
   - Generates short-lived **Signed URLs (60s TTL)** for private files and renders an interactive modal preview.
5. **Search, Filter, Rename, Move & Favorites**:
   - Instant search across folders and files, filter by category (`All`, `PDFs`, `Images`, `Docs`), star favorite notes, rename items, and move files between folders.
6. **Controlled File Sharing (`/s/[token]`)**:
   - Create shareable links with custom **expiration dates** (24h, 7d, 30d, Never), **maximum view/download limits**, **view-only vs. downloadable** toggles, and instant link revocation.
7. **Trash & File Recovery**:
   - Soft-delete (`deleted_at`) protects against accidental deletion.
   - Restore items with one click or permanently purge from Supabase Storage + PostgreSQL to reclaim storage quota.
8. **PWA Ready**:
   - Native Next.js Web App Manifest (`/manifest.webmanifest`) + security-hardened Service Worker (`/sw.js`) that caches static shell assets while never caching private signed storage URLs.

---

## Quick Start

### 1. Run Locally (Interactive Demo Mode works out of the box!)
```bash
npm run dev
```
Open `http://localhost:3000` in your browser. Even before connecting Supabase, **Interactive Sandbox Mode** lets you test folder creation, nested navigation, Image-to-PDF conversion, file uploads, previews, trash recovery, and share links right away.

### 2. Connect Your Supabase Project (For Persistent Cloud Storage)
1. Create a new project at [database.new](https://database.new).
2. Open the **SQL Editor** in your Supabase Dashboard, paste the entire contents of [`supabase/schema.sql`](./supabase/schema.sql), and click **Run**.
3. Copy `.env.example` to `.env.local` and fill in your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```
4. Restart the dev server (`npm run dev`).

