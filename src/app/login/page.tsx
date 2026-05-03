"use client";

import { parseResponseJson } from "@/lib/parse-response-json";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const err = searchParams.get("error");
  const nextRaw = searchParams.get("next") ?? "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    const data = await parseResponseJson<{
      user?: { role: string };
      error?: unknown;
    }>(res);
    setLoading(false);
    if (!res.ok) {
      setError(typeof data?.error === "string" ? data.error : "Login failed");
      return;
    }
    const role = data?.user?.role;
    const wantsAdmin = nextRaw.startsWith("/admin");
    if (wantsAdmin && role !== "ADMIN") {
      router.replace("/shop?notice=admin-only");
      return;
    }
    router.replace(nextRaw);
    router.refresh();
  }

  return (
    <main className="relative mx-auto flex min-h-full max-w-md flex-col justify-center px-6 py-16">
      <div className="pointer-events-none absolute left-1/2 top-8 h-48 w-64 -translate-x-1/2 rounded-full bg-teal-400/20 blur-3xl dark:bg-teal-600/10" />
      <div className="gu-panel relative p-8 sm:p-9">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Sign in
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Admin staff use an account with role{" "}
          <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-900">
            ADMIN
          </code>
          . Customers can sign in after registering.
        </p>

        {err === "forbidden" && (
          <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
            That account cannot open the admin console.
          </p>
        )}
        {err === "session" && (
          <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
            Session expired — please sign in again.
          </p>
        )}

        <form onSubmit={(e) => void onSubmit(e)} className="mt-6 space-y-4">
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Email
            </span>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="gu-input mt-1.5 text-zinc-900 dark:text-zinc-100"
            />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Password
            </span>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="gu-input mt-1.5 text-zinc-900 dark:text-zinc-100"
            />
          </label>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          <button type="submit" disabled={loading} className="gu-btn-primary mt-1 w-full py-3">
            {loading ? "Signing in…" : "Continue"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
          No account?{" "}
          <Link
            href="/register"
            className="font-semibold text-teal-700 underline decoration-teal-500/30 underline-offset-2 dark:text-teal-400"
          >
            Register
          </Link>
          {" · "}
          <Link href="/" className="text-zinc-500">
            Home
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm text-zinc-500">Loading…</div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
