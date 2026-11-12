import type { Metadata } from "next";
import Link from "next/link";
import { Download, FileText, ShieldAlert, Clock } from "lucide-react";
import { StudyfyLogo } from "@/components/brand/StudyfyLogo";
import { createClient } from "@/lib/supabase/server";
import { formatBytes, formatDate, isSupabaseConfigured } from "@/lib/utils";

interface SharedPageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({
  params,
}: SharedPageProps): Promise<Metadata> {
  const { token } = await params;
  return {
    title: `Shared Document (${token.slice(0, 8)}) — Studyfy`,
    description:
      "View or download this shared document on Studyfy — Your Knowledge. Your Space.",
  };
}

export default async function SharedFilePage({ params }: SharedPageProps) {
  const { token } = await params;
  const configured = isSupabaseConfigured();

  if (!configured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F2EA] p-6">
        <div className="max-w-md w-full bg-white rounded-xl border border-[#E7E5D9] p-8 text-center space-y-4">
          <div className="w-10 h-10 rounded-lg bg-[#F4F2EA] text-[#245B46] flex items-center justify-center mx-auto">
            <FileText className="w-5 h-5" />
          </div>
          <h1 className="font-editorial text-2xl text-[#172D23]">
            Shared Document Link
          </h1>
          <p className="text-xs font-mono text-[#245B46]">/s/{token}</p>
          <p className="text-xs text-[#172D23]/65 leading-relaxed">
            Configure your Supabase project credentials in{" "}
            <code className="px-1.5 py-0.5 bg-[#F4F2EA] rounded">
              .env.local
            </code>{" "}
            to verify share tokens on the server and serve signed URLs.
          </p>
          <Link
            href="/drive"
            className="inline-block px-5 py-2.5 rounded-lg bg-[#245B46] text-white text-xs font-medium hover:bg-[#172D23]"
          >
            Return to workspace
          </Link>
        </div>
      </div>
    );
  }

  const supabase = await createClient();

  const { data: share } = await supabase
    .from("file_shares")
    .select("*, files(*)")
    .eq("share_token", token)
    .single();

  const isExpired =
    share?.expires_at && new Date(share.expires_at) < new Date();
  const isLimitReached =
    share?.max_access_count !== null &&
    share?.max_access_count !== undefined &&
    share.access_count >= share.max_access_count;

  if (!share || !share.files || isExpired || isLimitReached) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F2EA] p-6">
        <div className="max-w-md w-full bg-white rounded-xl border border-[#E7E5D9] p-8 text-center space-y-4">
          <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h1 className="font-editorial text-2xl text-[#172D23]">
            Link Unavailable
          </h1>
          <p className="text-xs text-[#172D23]/65 leading-relaxed">
            This shared link has expired, reached its maximum view limit, or
            been revoked by its owner.
          </p>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 rounded-lg bg-[#245B46] text-white text-xs font-medium hover:bg-[#172D23]"
          >
            Go to Studyfy
          </Link>
        </div>
      </div>
    );
  }

  const file = share.files;
  const { data: signedData } = await supabase.storage
    .from("student-notes")
    .createSignedUrl(file.storage_path, 120);

  return (
    <div className="min-h-screen bg-[#F4F2EA] flex flex-col">
      <header className="h-16 bg-white border-b border-[#E7E5D9] px-6 flex items-center justify-between">
        <Link href="/">
          <StudyfyLogo size="md" variant="ink" />
        </Link>
        <span className="text-xs text-[#172D23]/60">Shared document</span>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 flex flex-col gap-6">
        <div className="bg-white rounded-xl border border-[#E7E5D9] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-lg font-semibold text-[#172D23]">
              {file.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#172D23]/60">
              <span>{formatBytes(file.size_bytes)}</span>
              <span>•</span>
              <span>Shared {formatDate(share.created_at)}</span>
              {share.expires_at && (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 text-amber-700">
                    <Clock className="w-3.5 h-3.5" />
                    Expires {formatDate(share.expires_at)}
                  </span>
                </>
              )}
            </div>
          </div>

          {share.allow_download && signedData?.signedUrl && (
            <a
              href={signedData.signedUrl}
              download={file.name}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#245B46] text-white text-xs font-medium hover:bg-[#172D23] transition shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </a>
          )}
        </div>

        {signedData?.signedUrl && (
          <div className="flex-1 min-h-[540px] bg-white rounded-xl overflow-hidden border border-[#E7E5D9] flex items-center justify-center p-2">
            {file.mime_type === "application/pdf" ? (
              <iframe
                src={signedData.signedUrl}
                title={file.name}
                className="w-full h-[640px] bg-white border-0"
              />
            ) : file.mime_type.startsWith("image/") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={signedData.signedUrl}
                alt={file.name}
                className="max-w-full max-h-[640px] object-contain"
              />
            ) : (
              <div className="text-center text-[#172D23]/60 p-8">
                <p className="text-xs">
                  Preview is supported for PDF and image documents. Use the
                  download button above to open this file.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
