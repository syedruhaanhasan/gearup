"use client";

import { useEffect, useState } from "react";

type LiveMechanic = {
  id: string;
  name: string;
  liveStatus: "AVAILABLE" | "BUSY";
};

export function LiveMechanicsBoard() {
  const [mechanics, setMechanics] = useState<LiveMechanic[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const es = new EventSource("/api/stream/mechanics");
    es.onmessage = (ev) => {
      try {
        const body = JSON.parse(ev.data) as { mechanics?: LiveMechanic[] };
        if (body.mechanics) setMechanics(body.mechanics);
      } catch {
        setError("Could not parse live feed");
      }
    };
    es.onerror = () => {
      setError("Live feed interrupted — reconnecting…");
    };
    return () => es.close();
  }, []);

  return (
    <section className="gu-panel p-6 sm:p-7">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Live mechanic floor
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Updates stream over Server-Sent Events (SSE). Swap for Socket.IO +
            Redis when you scale out.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm dark:text-emerald-200">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
          Live
        </span>
      </div>
      {error && (
        <p className="mb-3 text-sm text-amber-700 dark:text-amber-300">{error}</p>
      )}
      <ul className="grid gap-3 sm:grid-cols-2">
        {(mechanics ?? []).map((m) => (
          <li
            key={m.id}
            className="flex items-center justify-between rounded-xl border border-[var(--gu-sidebar-border)] bg-zinc-50/50 px-4 py-3 transition hover:bg-teal-500/[0.04] dark:bg-zinc-900/40 dark:hover:bg-teal-500/5"
          >
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {m.name}
            </span>
            <span
              className={
                m.liveStatus === "AVAILABLE"
                  ? "rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-200"
                  : "rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-900 dark:text-amber-100"
              }
            >
              {m.liveStatus === "AVAILABLE" ? "Free" : "Busy"}
            </span>
          </li>
        ))}
      </ul>
      {!mechanics?.length && (
        <p className="text-sm text-zinc-500">
          Waiting for first payload… If this hangs, ensure the API route is
          reachable.
        </p>
      )}
    </section>
  );
}
