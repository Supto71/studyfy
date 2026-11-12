"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { StudyfyLogo } from "@/components/brand/StudyfyLogo";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      if (data.session) {
        router.push("/drive");
        router.refresh();
      } else {
        setSuccessMsg(
          "Account created. Please check your email to confirm your registration."
        );
        setLoading(false);
      }
    } catch {
      setError(
        "Supabase credentials are not configured in .env.local yet. You can open the workspace directly from the navigation bar."
      );
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F4F2EA] text-[#172D23] p-6">
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between">
        <Link href="/">
          <StudyfyLogo size="md" variant="ink" />
        </Link>
        <Link
          href="/login"
          className="text-xs font-medium text-[#172D23]/70 hover:text-[#172D23]"
        >
          Sign in
        </Link>
      </header>

      <main className="w-full max-w-sm mx-auto my-12">
        <div className="mb-8">
          <h1 className="font-editorial text-3xl text-[#172D23]">
            Create your workspace
          </h1>
          <p className="text-sm text-[#172D23]/65 mt-1">
            Includes 500 MB of private Studyfy Cloud storage.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-800">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#245B46]" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#172D23]/75 mb-1.5">
              Full name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Arif Rahman"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-white border border-[#E7E5D9] text-[#172D23] placeholder:text-[#172D23]/35 focus:outline-none focus:border-[#245B46]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#172D23]/75 mb-1.5">
              Email address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.edu"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-white border border-[#E7E5D9] text-[#172D23] placeholder:text-[#172D23]/35 focus:outline-none focus:border-[#245B46]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#172D23]/75 mb-1.5">
              Password (minimum 6 characters)
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-white border border-[#E7E5D9] text-[#172D23] placeholder:text-[#172D23]/35 focus:outline-none focus:border-[#245B46]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-[#245B46] text-white font-medium text-sm hover:bg-[#172D23] transition disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </button>
        </form>
      </main>

      <footer className="text-center text-xs text-[#172D23]/50">
        Studyfy — Your Knowledge. Your Space.
      </footer>
    </div>
  );
}
