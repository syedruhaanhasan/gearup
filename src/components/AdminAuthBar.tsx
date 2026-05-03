"use client";

import { parseResponseJson } from "@/lib/parse-response-json";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Me = {
  id: string;
  email: string;
  name: string | null;
  role: string;
};

export function AdminAuthBar() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null | undefined>(undefined);

  useEffect(() => {
    void fetch("/api/auth/me", { credentials: "include" })
      .then((r) => parseResponseJson<{ user: Me | null }>(r))
      .then((d) => setMe(d?.user ?? null));
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    router.replace("/login");
    router.refresh();
  }

  if (me === undefined) {
    return (
      <div className="mb-8 overflow-hidden rounded-2xl border border-[var(--gu-sidebar-border)] bg-[var(--gu-surface)] px-5 py-4 text-sm text-zinc-500 shadow-sm">
        <div className="h-2.5 w-32 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-700" />
        <p className="mt-2 text-xs text-zinc-400">Verifying session…</p>
      </div>
    );
  }

  if (!me) {
    return (
      <div
        className="mb-8 rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50 to-amber-100/50 px-5 py-4 text-sm dark:border-amber-900/50 dark:from-amber-950/40 dark:to-amber-950/20"
        role="status"
      >
        <Link
          href="/login?next=/admin"
          className="font-semibold text-amber-900 underline decoration-amber-500/50 underline-offset-2 transition hover:decoration-amber-800 dark:text-amber-100"
        >
          Sign in
        </Link>{" "}
        <span className="text-amber-900/90 dark:text-amber-200/90">
          to use admin APIs and save your session.
        </span>
      </div>
    );
  }

  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--gu-sidebar-border)] bg-[var(--gu-surface)] px-5 py-4 shadow-md">
      <div className="min-w-0 text-sm">
        <span className="text-zinc-500">Signed in as</span>{" "}
        <span className="font-semibold text-zinc-900 dark:text-zinc-100">{me.email}</span>
        <span className="ml-2 inline-flex rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-indigo-800 dark:bg-indigo-500/25 dark:text-indigo-200">
          {me.role}
        </span>
      </div>
      <button
        type="button"
        onClick={() => void logout()}
        className="shrink-0 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
      >
        Log out
      </button>
    </div>
  );
}
