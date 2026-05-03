"use client";

import { formatMoney } from "@/lib/money";
import { parseResponseJson } from "@/lib/parse-response-json";
import { usePartCompare } from "@/lib/part-compare-context";
import Link from "next/link";
import { useEffect, useState } from "react";

type Part = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  stockQuantity: number;
  restockLeadDays: number;
};

export default function ShopPartsPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [qty, setQty] = useState(1);
  const [message, setMessage] = useState<string | null>(null);
  const { selected, togglePart, isSelected, clearAll } = usePartCompare();

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/parts");
        const d = await parseResponseJson<{ parts?: Part[] }>(res);
        setParts(d?.parts ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function preorder(partId: string) {
    setMessage(null);
    const res = await fetch("/api/preorders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        partId,
        quantity: qty,
      }),
    });
    const body = (await parseResponseJson<{ error?: string }>(res)) ?? {};
    if (!res.ok) {
      setMessage(body.error ?? "Preorder failed");
      return;
    }
    setMessage("Preorder recorded — we will notify you before pickup.");
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Parts
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          In stock ships today. Out of stock shows expected availability based on
          admin restock lead time. Select up to 4 parts to compare side-by-side.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Email for preorder
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-emerald-500/30 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950"
          placeholder="you@example.com"
        />
      </div>

      {loading && (
        <p className="text-sm text-zinc-500">Loading parts catalog…</p>
      )}

      <ul className="grid gap-4 md:grid-cols-2">
        {parts.map((p) => {
          const checked = isSelected(p.id);
          return (
            <li
              key={p.id}
              className={`flex flex-col rounded-2xl border bg-white p-5 shadow-sm dark:bg-zinc-950 ${
                checked
                  ? "border-teal-400 dark:border-teal-600"
                  : "border-zinc-200 dark:border-zinc-800"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => togglePart(p)}
                      className="h-4 w-4 rounded border-zinc-300 text-teal-600 focus:ring-teal-500 dark:border-zinc-600 dark:bg-zinc-900"
                    />
                    <span className="sr-only">Compare {p.name}</span>
                  </label>
                  <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                      {p.name}
                    </h3>
                    {p.description && (
                      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                        {p.description}
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {formatMoney(p.priceCents)}
                </p>
              </div>
              <div className="mt-4 text-sm">
                {p.stockQuantity > 0 ? (
                  <span className="font-medium text-emerald-700 dark:text-emerald-300">
                    Available ({p.stockQuantity} items)
                  </span>
                ) : (
                  <div className="space-y-1">
                    <p className="font-medium text-amber-800 dark:text-amber-200">
                      Out of stock
                    </p>
                    <p className="text-zinc-600 dark:text-zinc-400">
                      Estimated availability in {p.restockLeadDays} day
                      {p.restockLeadDays === 1 ? "" : "s"} — preorder to reserve
                      your place in line.
                    </p>
                  </div>
                )}
              </div>
              {p.stockQuantity === 0 && (
                <div className="mt-4 flex flex-wrap items-end gap-3">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Qty
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={qty}
                      onChange={(e) => setQty(Number(e.target.value))}
                      className="mt-1 w-24 rounded-lg border border-zinc-200 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => void preorder(p.id)}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                    disabled={!email}
                  >
                    Book in advance
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {message && (
        <p className="rounded-xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-900 dark:text-emerald-100">
          {message}
        </p>
      )}

      {selected.length > 0 && (
        <div className="fixed bottom-6 left-1/2 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-2xl border border-teal-200 bg-white/95 p-4 shadow-xl backdrop-blur-sm dark:border-teal-800 dark:bg-zinc-950/95 sm:bottom-8 sm:p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                {selected.length} part{selected.length === 1 ? "" : "s"} selected
              </p>
              <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                {selected.map((p) => p.name).join(", ")}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={clearAll}
                className="rounded-lg px-3 py-2 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                Clear
              </button>
              <Link
                href="/shop/parts/compare"
                className="rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-teal-700"
              >
                Compare
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
