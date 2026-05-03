"use client";

import { parseResponseJson } from "@/lib/parse-response-json";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name: name || undefined }),
    });
    const data = await parseResponseJson<{ error?: unknown }>(res);
    setLoading(false);
    if (!res.ok) {
      setError(
        typeof data?.error === "string"
          ? data.error
          : "Could not create account",
      );
      return;
    }
    router.replace("/login?registered=1");
  }

  return (
    <main className="relative mx-auto flex min-h-full max-w-md flex-col justify-center px-6 py-16">
      <div className="pointer-events-none absolute left-1/2 top-8 h-48 w-64 -translate-x-1/2 rounded-full bg-emerald-400/15 blur-3xl dark:bg-emerald-700/10" />
      <div className="gu-panel relative p-8 sm:p-9">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Create account
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Registers as a customer. Shop admins are created via seed / ops — not
          self-service.
        </p>

        <form onSubmit={(e) => void onSubmit(e)} className="mt-6 space-y-4">
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Name (optional)
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="gu-input mt-1.5 text-zinc-900 dark:text-zinc-100"
            />
          </label>
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
              Password (min 8 characters)
            </span>
            <input
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="gu-input mt-1.5 text-zinc-900 dark:text-zinc-100"
            />
          </label>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          <button type="submit" disabled={loading} className="gu-btn-primary mt-1 w-full py-3">
            {loading ? "Creating…" : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-teal-700 underline decoration-teal-500/30 underline-offset-2 dark:text-teal-400"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
