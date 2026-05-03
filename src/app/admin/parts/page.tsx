"use client";

import { AdminDemoBanner } from "@/components/AdminDemoBanner";
import { DEMO_PARTS } from "@/lib/admin-demo-preview";
import { formatMoney } from "@/lib/money";
import { parseResponseJson } from "@/lib/parse-response-json";
import { useEffect, useState } from "react";

type Part = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  stockQuantity: number;
  restockLeadDays: number;
};

export default function AdminPartsPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const showingPreview = parts.length === 0;
  const displayParts = showingPreview ? DEMO_PARTS : parts;
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "0",
    restockDays: "2",
  });

  async function refresh() {
    const res = await fetch("/api/parts", { credentials: "include" });
    const data = await parseResponseJson<{ parts?: Part[] }>(res);
    setParts(data?.parts ?? []);
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function createPart(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const priceCents = Math.round(parseFloat(form.price || "0") * 100);
    const res = await fetch("/api/parts", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: form.name,
        description: form.description || undefined,
        priceCents,
        stockQuantity: Number(form.stock),
        restockLeadDays: Number(form.restockDays),
      }),
    });
    if (!res.ok) {
      const body =
        (await parseResponseJson<{ error?: unknown }>(res)) ?? {};
      setMessage(body.error ? JSON.stringify(body.error) : "Create failed");
      return;
    }
    setForm({
      name: "",
      description: "",
      price: "",
      stock: "0",
      restockDays: "2",
    });
    setMessage("Part saved.");
    void refresh();
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Parts catalog
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Stock drives availability messaging; restock lead powers preorder ETAs.
        </p>
      </div>

      <form
        onSubmit={createPart}
        className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 md:grid-cols-2"
      >
        <label className="text-sm">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Name
          </span>
          <input
            required
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </label>
        <label className="text-sm">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Price (USD)
          </span>
          <input
            required
            type="number"
            step="0.01"
            min="0"
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
          />
        </label>
        <label className="text-sm md:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Description
          </span>
          <textarea
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            rows={3}
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
          />
        </label>
        <label className="text-sm">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Stock qty
          </span>
          <input
            type="number"
            min={0}
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            value={form.stock}
            onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
          />
        </label>
        <label className="text-sm">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Restock lead (days)
          </span>
          <input
            type="number"
            min={0}
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            value={form.restockDays}
            onChange={(e) =>
              setForm((f) => ({ ...f, restockDays: e.target.value }))
            }
          />
        </label>
        <div className="md:col-span-2">
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
          >
            Add part
          </button>
        </div>
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
              <th className="px-4 py-3">Part</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Restock lead</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {displayParts.map((p) => (
              <tr
                key={p.id}
                className={
                  showingPreview
                    ? "bg-violet-50/40 dark:bg-violet-950/15"
                    : undefined
                }
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-zinc-900 dark:text-zinc-50">
                    {p.name}
                  </div>
                  {p.description && (
                    <div className="text-xs text-zinc-500">{p.description}</div>
                  )}
                </td>
                <td className="px-4 py-3">{formatMoney(p.priceCents)}</td>
                <td className="px-4 py-3">{p.stockQuantity}</td>
                <td className="px-4 py-3">{p.restockLeadDays} days</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
