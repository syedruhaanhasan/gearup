"use client";

import { AdminDemoBanner } from "@/components/AdminDemoBanner";
import { DEMO_PREORDERS } from "@/lib/admin-demo-preview";
import { formatMoney } from "@/lib/money";
import { parseResponseJson } from "@/lib/parse-response-json";
import { useEffect, useState } from "react";

type Preorder = {
  id: string;
  quantity: number;
  expectedBy: string;
  status: string;
  createdAt: string;
  user: { email: string; name: string | null };
  part: { name: string; priceCents: number };
};

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AdminPreordersPage() {
  const [rows, setRows] = useState<Preorder[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setError(null);
    const res = await fetch("/api/preorders", {
      credentials: "include",
    });
    if (!res.ok) {
      setError("Could not load preorders.");
      return;
    }
    const data = await parseResponseJson<{ preorders?: Preorder[] }>(res);
    setRows(data?.preorders ?? []);
  }

  useEffect(() => {
    void refresh();
  }, []);

  const showingPreview = rows.length === 0;
  const displayRows = showingPreview ? DEMO_PREORDERS : rows;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Part preorders
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Out-of-stock reservations from the shop front — expected dates follow
          each part&apos;s restock lead.
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {showingPreview && <AdminDemoBanner />}

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
          <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:bg-zinc-900/60">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Part</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Expected by</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {displayRows.map((r) => (
              <tr
                key={r.id}
                className={
                  showingPreview
                    ? "bg-violet-50/40 dark:bg-violet-950/15"
                    : undefined
                }
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-zinc-900 dark:text-zinc-50">
                    {r.user.email}
                  </div>
                  {r.user.name && (
                    <div className="text-xs text-zinc-500">{r.user.name}</div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div>{r.part.name}</div>
                  <div className="text-xs text-zinc-500">
                    {formatMoney(r.part.priceCents)} list
                  </div>
                </td>
                <td className="px-4 py-3">{r.quantity}</td>
                <td className="px-4 py-3 text-xs text-zinc-600 dark:text-zinc-300">
                  {new Date(r.expectedBy).toLocaleDateString()}{" "}
                  <span className="text-zinc-400">
                    (
                    {dayNames[new Date(r.expectedBy).getDay()]}
                    )
                  </span>
                </td>
                <td className="px-4 py-3">{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
