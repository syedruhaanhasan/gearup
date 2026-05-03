"use client";

import { AdminDemoBanner } from "@/components/AdminDemoBanner";
import { DEMO_MECHANICS } from "@/lib/admin-demo-preview";
import { parseResponseJson } from "@/lib/parse-response-json";
import { useEffect, useState } from "react";

type Mechanic = {
  id: string;
  name: string;
  storedStatus: "AVAILABLE" | "BUSY";
  liveStatus: "AVAILABLE" | "BUSY";
};

export default function AdminMechanicsPage() {
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const showingPreview = mechanics.length === 0;
  const displayMechanics = showingPreview ? DEMO_MECHANICS : mechanics;
  const [name, setName] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function refresh() {
    const res = await fetch("/api/mechanics", { credentials: "include" });
    const data = await parseResponseJson<{ mechanics?: Mechanic[] }>(res);
    setMechanics(data?.mechanics ?? []);
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function addMechanic(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const res = await fetch("/api/mechanics", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) {
      const body =
        (await parseResponseJson<{ error?: unknown }>(res)) ?? {};
      setMessage(body.error ? JSON.stringify(body.error) : "Create failed");
      return;
    }
    setName("");
    setMessage("Mechanic added.");
    void refresh();
  }

  async function toggleStatus(m: Mechanic) {
    if (m.id.startsWith("demo-")) return;
    setMessage(null);
    const next = m.storedStatus === "AVAILABLE" ? "BUSY" : "AVAILABLE";
    const res = await fetch(`/api/mechanics/${m.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: next }),
    });
    if (!res.ok) {
      setMessage("Update failed");
      return;
    }
    void refresh();
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Mechanics
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Manual status overrides combine with active appointments for the live
          tile — flipping to Busy blocks new assignment logic immediately.
        </p>
      </div>

      <form
        onSubmit={addMechanic}
        className="flex flex-wrap items-end gap-3 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <label className="flex-1 text-sm">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            New mechanic name
          </span>
          <input
            required
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
        >
          Add mechanic
        </button>
      </form>

      {message && (
        <p className="rounded-xl bg-zinc-900 px-4 py-3 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900">
          {message}
        </p>
      )}

      {showingPreview && <AdminDemoBanner />}

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
          <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:bg-zinc-900/60">
            <tr>
              <th className="px-4 py-3">Mechanic</th>
              <th className="px-4 py-3">Stored status</th>
              <th className="px-4 py-3">Live floor</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {displayMechanics.map((m) => (
              <tr
                key={m.id}
                className={
                  showingPreview
                    ? "bg-violet-50/40 dark:bg-violet-950/15"
                    : undefined
                }
              >
                <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                  {m.name}
                </td>
                <td className="px-4 py-3">{m.storedStatus}</td>
                <td className="px-4 py-3">{m.liveStatus}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    disabled={m.id.startsWith("demo-")}
                    onClick={() => void toggleStatus(m)}
                    className="rounded-lg border border-zinc-200 px-3 py-1 text-xs font-semibold hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:hover:bg-zinc-900"
                  >
                    Toggle stored
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
