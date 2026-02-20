"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export const dynamic = 'force-dynamic';

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    authError === "auth_failed" ? "Authentication failed. Please try again." : null
  );

  const supabase = createClient();

  async function handleEmailSignIn() {
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  }

  const inputClass = (hasError?: boolean) =>
    `w-full bg-[#0d1117] border rounded px-3 py-2.5 text-[#e6edf3] text-sm placeholder-[#484f58] focus:outline-none focus:ring-1 transition-colors ${
      hasError
        ? "border-[#f85149] focus:ring-[#f85149] focus:border-[#f85149]"
        : "border-[#30363d] focus:ring-[#58a6ff] focus:border-[#58a6ff]"
    }`;

  return (
    <main
      className="min-h-screen bg-[#010409] text-[#e6edf3] flex flex-col"
      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
    >
      {/* Header */}
      <header className="border-b border-[#21262d] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
            <path d="M3 17l4-8 4 4 4-6 4 10" stroke="#58a6ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 21h18" stroke="#30363d" strokeWidth="1" />
          </svg>
          <a href="/" className="text-[#58a6ff] font-medium tracking-tight">StrategyGrader</a>
          <span className="text-[#484f58] text-xs">v1.0 MVP</span>
        </div>
        <div className="text-[#484f58] text-xs hidden sm:block">
          Not financial advice — educational analysis only
        </div>
      </header>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <div className="text-xs text-[#58a6ff] tracking-widest uppercase mb-3">Welcome Back</div>
            <h1 className="text-2xl font-semibold text-[#e6edf3] leading-tight mb-2">
              Sign in to your account
            </h1>
            <p className="text-[#8b949e] text-sm">
              Access your strategy history and playbook.
            </p>
          </div>

          <div className="border border-[#21262d] rounded-lg bg-[#0d1117] divide-y divide-[#21262d]">
            {/* Google OAuth */}
            <div className="px-6 py-5">
              <button
                onClick={handleGoogleSignIn}
                disabled={googleLoading || loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-[#0d1117] border border-[#30363d] hover:border-[#58a6ff] text-[#e6edf3] text-sm rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {googleLoading ? (
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                )}
                Continue with Google
              </button>
            </div>

            {/* Divider */}
            <div className="px-6 py-4 flex items-center gap-3">
              <div className="flex-1 h-px bg-[#21262d]" />
              <span className="text-[#484f58] text-xs">or</span>
              <div className="flex-1 h-px bg-[#21262d]" />
            </div>

            {/* Email + Password */}
            <div className="px-6 py-5 space-y-4">
              {error && (
                <div className="px-4 py-3 bg-[#1a0a0a] border border-[#f85149] rounded text-[#f85149] text-xs">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-xs text-[#8b949e] mb-1.5">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className={inputClass()}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleEmailSignIn()}
                />
              </div>
              <div>
                <label className="block text-xs text-[#8b949e] mb-1.5">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className={inputClass()}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleEmailSignIn()}
                />
              </div>
            </div>

            {/* Submit */}
            <div className="px-6 py-5">
              <button
                onClick={handleEmailSignIn}
                disabled={loading || googleLoading}
                className="w-full px-8 py-3 bg-[#58a6ff] hover:bg-[#79b8ff] disabled:bg-[#21262d] disabled:text-[#484f58] text-[#010409] font-semibold text-sm rounded transition-colors disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  "Sign In →"
                )}
              </button>
            </div>
          </div>

          <p className="text-center text-[#484f58] text-xs mt-6">
            Don&apos;t have an account?{" "}
            <a href="/auth/sign-up" className="text-[#58a6ff] hover:text-[#79b8ff] transition-colors">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
