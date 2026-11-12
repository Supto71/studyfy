import Link from "next/link";
import {
  ArrowRight,
  Folder,
  FileText,
  Image as ImageIcon,
  Search,
  CheckCircle2,
  ShieldCheck,
  HardDrive,
  Cloud,
  WifiOff,
  Share2,
} from "lucide-react";
import { StudyfyLogo } from "@/components/brand/StudyfyLogo";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#111827]">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <StudyfyLogo size="md" variant="ink" showTagline />

          <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium text-slate-600">
            <a
              href="#benefits"
              className="hover:text-[#1B4D3E] transition-colors"
            >
              Overview
            </a>
            <a
              href="#workflow"
              className="hover:text-[#1B4D3E] transition-colors"
            >
              How it works
            </a>
            <a
              href="#storage"
              className="hover:text-[#1B4D3E] transition-colors"
            >
              Cloud Storage
            </a>
            <a
              href="#offline"
              className="hover:text-[#1B4D3E] transition-colors"
            >
              Offline & Sharing
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="px-4 py-2.5 text-[15px] font-semibold text-slate-700 hover:text-[#1B4D3E] transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/drive"
              className="px-5 py-2.5 text-[15px] font-semibold rounded-xl bg-[#1B4D3E] text-white hover:bg-[#143B2F] transition-all shadow-sm"
            >
              Open Workspace
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* 1. HERO SECTION & REALISTIC WORKSPACE PREVIEW */}
        <section className="max-w-6xl mx-auto px-6 pt-16 pb-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1B4D3E]/8 border border-[#1B4D3E]/15 text-[#1B4D3E] text-sm font-semibold mb-6">
              <span className="w-2 h-2 rounded-full bg-[#1F7A5C]" />
              <span>Personal Cloud Workspace</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
              Keep your knowledge close.{" "}
              <span className="text-[#1B4D3E]">Wherever life takes you.</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl">
              Your notes, documents and important work, organized in one
              personal cloud workspace with built-in PDF tools, Google Drive
              connectivity, and offline access.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/drive"
                className="inline-flex items-center gap-2.5 px-7 py-4 rounded-xl bg-[#1B4D3E] text-white text-base font-semibold hover:bg-[#143B2F] transition-all shadow-md shadow-[#1B4D3E]/15"
              >
                <span>Open Workspace</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center px-7 py-4 rounded-xl bg-white border border-slate-200 text-slate-800 text-base font-semibold hover:bg-slate-50 transition-all shadow-2xs"
              >
                Create Free Account
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-6 text-sm font-medium text-slate-500">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1F7A5C]" />
                500 MB Studyfy Cloud included
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1F7A5C]" />
                Client-side Image to PDF
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1F7A5C]" />
                Works offline
              </span>
            </div>
          </div>

          {/* Realistic Workspace Preview */}
          <div className="mt-14 rounded-2xl border border-slate-200/90 bg-white shadow-[0_20px_50px_-15px_rgba(17,24,39,0.08)] overflow-hidden">
            {/* Window Top Bar */}
            <div className="px-6 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-300" />
                <span className="w-3 h-3 rounded-full bg-slate-300" />
                <span className="w-3 h-3 rounded-full bg-slate-300" />
                <span className="ml-3 font-semibold text-slate-700">
                  Studyfy Workspace — My Files
                </span>
              </div>
              <span className="font-medium text-slate-600">
                7.9 MB of 500 MB used
              </span>
            </div>

            {/* Simulated Workspace Interior */}
            <div className="grid grid-cols-1 md:grid-cols-12 min-h-[460px]">
              {/* Deep Forest Sidebar Preview */}
              <div className="hidden md:flex md:col-span-3 bg-[#112A22] text-white p-5 flex-col justify-between">
                <div className="space-y-6">
                  <div className="space-y-1.5 text-[15px]">
                    <div className="px-3.5 py-2.5 rounded-xl bg-[#1F7A5C] text-white font-semibold">
                      My Files
                    </div>
                    <div className="px-3.5 py-2.5 text-slate-300 font-medium">
                      Favorites
                    </div>
                    <div className="px-3.5 py-2.5 text-slate-300 font-medium">
                      Shared Links
                    </div>
                    <div className="px-3.5 py-2.5 text-slate-300 font-medium">
                      Offline Access
                    </div>
                    <div className="px-3.5 py-2.5 text-slate-300 font-medium">
                      Trash
                    </div>
                    <div className="px-3.5 py-2.5 text-slate-300 font-medium">
                      Settings
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 space-y-2">
                  <div className="flex justify-between font-semibold">
                    <span>Studyfy Cloud</span>
                    <span className="text-emerald-400">2%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="w-4 h-full bg-emerald-400" />
                  </div>
                  <p className="text-slate-400">7.9 MB of 500 MB used</p>
                </div>
              </div>

              {/* Main Document Area Preview */}
              <div className="md:col-span-9 p-6 sm:p-8 space-y-7 bg-white">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      My Files
                    </h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                      Studyfy Cloud • 3 folders, 3 documents
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-500 w-full sm:w-64">
                    <Search className="w-4 h-4" />
                    <span>Search files and folders...</span>
                  </div>
                </div>

                {/* Folders Strip */}
                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Folders
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    {[
                      "Research & Literature",
                      "Distributed Systems",
                      "Course Syllabi & Notes",
                    ].map((folderName) => (
                      <div
                        key={folderName}
                        className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center gap-3 text-[15px] font-semibold text-slate-800"
                      >
                        <Folder className="w-5 h-5 text-[#1B4D3E] fill-[#1B4D3E]/15 shrink-0" />
                        <span className="truncate">{folderName}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Document Rows */}
                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Documents
                  </p>
                  <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden text-[15px]">
                    <div className="p-4 flex items-center justify-between gap-4 bg-white">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-[#1B4D3E]/10 text-[#1B4D3E] flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <span className="font-semibold text-slate-900 truncate">
                          PostgreSQL-RLS-Security-Specification.pdf
                        </span>
                      </div>
                      <div className="flex items-center gap-5 text-sm text-slate-500 shrink-0">
                        <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-md bg-emerald-50 text-[#1B4D3E] text-xs font-semibold">
                          Offline Ready
                        </span>
                        <span className="font-medium">2.3 MB</span>
                      </div>
                    </div>

                    <div className="p-4 flex items-center justify-between gap-4 bg-white">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-[#1B4D3E]/10 text-[#1B4D3E] flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <span className="font-semibold text-slate-900 truncate">
                          Cloud-Storage-Abstraction-Whitepaper.pdf
                        </span>
                      </div>
                      <div className="flex items-center gap-5 text-sm text-slate-500 shrink-0">
                        <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
                          Shared Link
                        </span>
                        <span className="font-medium">3.9 MB</span>
                      </div>
                    </div>

                    <div className="p-4 flex items-center justify-between gap-4 bg-white">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                        <span className="font-semibold text-slate-900 truncate">
                          System-Topology-Whiteboard-Capture.png
                        </span>
                      </div>
                      <div className="flex items-center gap-5 text-sm text-slate-500 shrink-0">
                        <span className="font-medium">1.3 MB</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. THREE CORE PRODUCT BENEFITS */}
        <section
          id="benefits"
          className="border-t border-slate-200 bg-white py-24"
        >
          <div className="max-w-6xl mx-auto px-6">
            <div className="max-w-2xl mb-14">
              <p className="text-sm font-bold uppercase tracking-wider text-[#1B4D3E] mb-2">
                Core Capabilities
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Designed for clarity, speed, and focus.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 border-t border-slate-200 pt-10">
              <div>
                <span className="inline-block px-2.5 py-1 rounded-md bg-[#1B4D3E]/10 text-[#1B4D3E] text-xs font-bold mb-4">
                  01
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  Structured Organization
                </h3>
                <p className="mt-3 text-base text-slate-600 leading-relaxed">
                  Keep coursework, research literature, and project documents in
                  nested folders with fast search, clean metadata, and two-stage
                  trash recovery.
                </p>
              </div>

              <div>
                <span className="inline-block px-2.5 py-1 rounded-md bg-[#1B4D3E]/10 text-[#1B4D3E] text-xs font-bold mb-4">
                  02
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  Built-in Document Tools
                </h3>
                <p className="mt-3 text-base text-slate-600 leading-relaxed">
                  Compile multiple handwritten pages or whiteboard photos into
                  clean, standardized A4 PDFs directly in your browser—with page
                  rotation and ordering.
                </p>
              </div>

              <div>
                <span className="inline-block px-2.5 py-1 rounded-md bg-[#1B4D3E]/10 text-[#1B4D3E] text-xs font-bold mb-4">
                  03
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  Anywhere Access
                </h3>
                <p className="mt-3 text-base text-slate-600 leading-relaxed">
                  Work seamlessly across Studyfy Cloud and Google Drive, and pin
                  essential readings for offline access when studying or
                  traveling without internet.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. HOW STUDYFY WORKS */}
        <section
          id="workflow"
          className="border-t border-slate-200 py-24 max-w-6xl mx-auto px-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5">
              <p className="text-sm font-bold uppercase tracking-wider text-[#1B4D3E] mb-2">
                How Studyfy Works
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                From raw captures to a permanent knowledge library.
              </h2>
              <p className="mt-4 text-base text-slate-600 leading-relaxed">
                Studyfy removes friction between capturing information and
                retrieving it months later. Advanced tools stay out of your way
                until you need them.
              </p>
            </div>

            <div className="lg:col-span-7 divide-y divide-slate-200 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <div className="pb-6 flex flex-col sm:flex-row sm:items-baseline gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1B4D3E] w-24 shrink-0">
                  Step 01
                </span>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Upload files or convert image scans to PDF
                  </h3>
                  <p className="mt-2 text-base text-slate-600 leading-relaxed">
                    Drop PDFs, images, or Word documents directly into your
                    workspace, or use the built-in Image-to-PDF tool to merge
                    lecture photos into a single readable file.
                  </p>
                </div>
              </div>

              <div className="py-6 flex flex-col sm:flex-row sm:items-baseline gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1B4D3E] w-24 shrink-0">
                  Step 02
                </span>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Organize into folders, favorites, and offline collections
                  </h3>
                  <p className="mt-2 text-base text-slate-600 leading-relaxed">
                    Group materials by subject, project, or semester. Star
                    frequent references and mark key readings available offline
                    on your computer or phone.
                  </p>
                </div>
              </div>

              <div className="pt-6 flex flex-col sm:flex-row sm:items-baseline gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1B4D3E] w-24 shrink-0">
                  Step 03
                </span>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Preview, download, or share with full control
                  </h3>
                  <p className="mt-2 text-base text-slate-600 leading-relaxed">
                    Read documents in the distraction-free viewer or generate
                    time-limited share links for classmates, colleagues, and
                    collaborators.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. BUILT-IN CLOUD & GOOGLE DRIVE + 5. OFFLINE & 6. SHARING */}
        <section
          id="storage"
          className="border-t border-slate-200 bg-white py-24"
        >
          <div className="max-w-6xl mx-auto px-6 space-y-16">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-wider text-[#1B4D3E] mb-2">
                Storage, Offline & Sharing
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Built for reliability and privacy.
              </h2>
            </div>

            <div
              id="offline"
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              <div className="p-7 rounded-2xl bg-[#F7F8FA] border border-slate-200/90 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#1B4D3E] text-white flex items-center justify-center">
                  <HardDrive className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Studyfy Cloud (Private by Default)
                </h3>
                <p className="text-base text-slate-600 leading-relaxed">
                  Powered by Supabase Storage and PostgreSQL Row-Level Security.
                  Files are stored in isolated user paths and delivered through
                  short-lived signed URLs.
                </p>
              </div>

              <div className="p-7 rounded-2xl bg-[#F7F8FA] border border-slate-200/90 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#1B4D3E] text-white flex items-center justify-center">
                  <Cloud className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Google Drive Integration
                </h3>
                <p className="text-base text-slate-600 leading-relaxed">
                  Connect your Google Drive account in Settings whenever needed.
                  Browse, upload, and preview Drive files through a dedicated
                  storage adapter without mixing folder structures.
                </p>
              </div>

              <div className="p-7 rounded-2xl bg-[#F7F8FA] border border-slate-200/90 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#1B4D3E] text-white flex items-center justify-center">
                  <WifiOff className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Offline Access in IndexedDB
                </h3>
                <p className="text-base text-slate-600 leading-relaxed">
                  Pin important PDFs and notes to keep a local copy inside your
                  browser&apos;s storage. Studyfy tracks local usage and queues
                  uploads if your connection drops.
                </p>
              </div>

              <div className="p-7 rounded-2xl bg-[#F7F8FA] border border-slate-200/90 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#1B4D3E] text-white flex items-center justify-center">
                  <Share2 className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Controlled Share Links
                </h3>
                <p className="text-base text-slate-600 leading-relaxed">
                  Generate secure links with custom expiration dates, maximum
                  view limits, download toggles, and one-click revocation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 7. FINAL CALL TO ACTION */}
        <section className="border-t border-slate-200 py-24 max-w-6xl mx-auto px-6">
          <div className="rounded-3xl bg-[#112A22] text-white p-10 sm:p-16 text-center space-y-6 shadow-xl">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-2xl mx-auto leading-tight">
              Ready to organize your workspace?
            </h2>
            <p className="text-lg text-slate-300 max-w-xl mx-auto">
              Start storing, converting, and organizing your documents in
              Studyfy today.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/drive"
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-[#1F7A5C] text-white text-base font-bold hover:bg-emerald-500 transition-all shadow-md"
              >
                <span>Open Studyfy Workspace</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 8. FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-10 px-6 text-sm text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <StudyfyLogo size="sm" variant="ink" showTagline />
          <div className="flex items-center gap-6 font-medium">
            <span className="inline-flex items-center gap-1.5 text-slate-700">
              <ShieldCheck className="w-4 h-4 text-[#1F7A5C]" />
              Row-Level Security
            </span>
            <Link href="/login" className="hover:text-slate-900">
              Sign in
            </Link>
            <Link href="/register" className="hover:text-slate-900">
              Register
            </Link>
            <Link href="/drive" className="hover:text-slate-900">
              Workspace
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
