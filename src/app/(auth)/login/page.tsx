"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { StudyfyLogo } from "@/components/brand/StudyfyLogo";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      router.push("/drive");
      router.refresh();
    } catch {
      setError(
        "Supabase credentials are not configured in .env.local yet. You can open the workspace directly below."
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
          href="/register"
          className="text-xs font-medium text-[#172D23]/70 hover:text-[#172D23]"
        >
          Create account
        </Link>
      </header>

      <main className="w-full max-w-sm mx-auto my-12">
        <div className="mb-8">
          <h1 className="font-editorial text-3xl text-[#172D23]">
            Welcome back
          </h1>
          <p className="text-sm text-[#172D23]/65 mt-1">
            Sign in to your personal workspace.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
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
              Password
            </label>
            <input
              type="password"
              required
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
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-[#E7E5D9]">
          <Link
            href="/drive"
            className="w-full py-2.5 px-4 rounded-lg border border-[#E7E5D9] bg-white hover:bg-[#F4F2EA]/60 text-[#172D23] text-xs font-medium flex items-center justify-center gap-1.5 transition"
          >
            <span>Continue to workspace</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#245B46]" />
          </Link>
        </div>
      </main>

      <footer className="text-center text-xs text-[#172D23]/50">
        Studyfy — Your Knowledge. Your Space.
      </footer>
    </div>
  );
}
