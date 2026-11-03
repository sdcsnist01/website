"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    searchParams.get("error") === "unauthorized"
      ? "Your account does not have admin access."
      : null,
  );

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profile?.role !== "admin") {
      await supabase.auth.signOut();
      setError("Your account does not have admin access.");
      setLoading(false);
      return;
    }

    const next = searchParams.get("next") || "/admin/events";
    router.push(next);
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <div className="mb-8 text-center">
        <p className="font-mono-ui text-[11px] tracking-[2.5px] text-primary">SDC SNIST</p>
        <h1 className="font-grotesk mt-2 text-3xl font-bold text-on-surface">Admin sign in</h1>
        <p className="mt-2 text-sm text-on-surface-variant">Manage events for the SDC website.</p>
      </div>

      <form onSubmit={handleLogin} className="glass-card space-y-5 rounded-xl p-8">
        {error ? (
          <p role="alert" className="rounded-lg border border-primary/30 bg-[#fdf0f0] px-4 py-3 text-sm text-[#7a1220]">{error}</p>
        ) : null}

        <label className="block space-y-2">
          <span className="font-mono-ui text-[11px] uppercase tracking-[1.5px] text-on-surface-variant">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-[#d8d2cf] bg-white px-4 py-3 text-on-surface outline-none transition-colors focus:border-primary focus-visible:ring-4 focus-visible:ring-primary/15"
          />
        </label>

        <label className="block space-y-2">
          <span className="font-mono-ui text-[11px] uppercase tracking-[1.5px] text-on-surface-variant">Password</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-[#d8d2cf] bg-white px-4 py-3 text-on-surface outline-none transition-colors focus:border-primary focus-visible:ring-4 focus-visible:ring-primary/15"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="pressable flex min-h-12 w-full items-center justify-center rounded-full bg-primary text-sm font-semibold uppercase tracking-[1.5px] text-white transition-colors hover:bg-primary-dim disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-on-surface-variant">
        Admin access is granted by role in Supabase. Ask a maintainer to set your profile role to{" "}
        <code className="text-primary">admin</code>.
      </p>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <LoginForm />
    </Suspense>
  );
}
