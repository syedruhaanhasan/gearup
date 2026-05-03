"use client";

import { AdminDemoBanner } from "@/components/AdminDemoBanner";
import { DEMO_SERVICES } from "@/lib/admin-demo-preview";
import { formatMoney } from "@/lib/money";
import { parseResponseJson } from "@/lib/parse-response-json";
import { useEffect, useState } from "react";

type Service = {
  id: string;
  name: string;
  durationMinutes: number;
  priceCents: number;
  active: boolean;
};

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const showingPreview = services.length === 0;
  const displayServices = showingPreview ? DEMO_SERVICES : services;
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    duration: "60",
    price: "",
  });

  async function refresh() {
    const res = await fetch("/api/services?all=1", {
      credentials: "include",
    });
    const data = await parseResponseJson<{ services?: Service[] }>(res);
    setServices(data?.services ?? []);
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function createService(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const priceCents = Math.round(parseFloat(form.price || "0") * 100);
    const res = await fetch("/api/services", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: form.name,
        description: form.description || undefined,
        durationMinutes: Number(form.duration),
        priceCents,
      }),
    });
    if (!res.ok) {
      const body =
        (await parseResponseJson<{ error?: unknown }>(res)) ?? {};
      setMessage(body.error ? JSON.stringify(body.error) : "Create failed");
      return;
    }
    setForm({ name: "", description: "", duration: "60", price: "" });
    setMessage("Service added.");
    void refresh();
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Services
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Duration feeds slot occupancy — changing duration reshapes the grid.
        </p>
      </div>

      <form
        onSubmit={createService}
        className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 md:grid-cols-2"
      >
        <label className="text-sm md:col-span-2">
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
            Duration (minutes)
          </span>
          <input
            required
            type="number"
            min={5}
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            value={form.duration}
            onChange={(e) =>
              setForm((f) => ({ ...f, duration: e.target.value }))
            }
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
        <div className="md:col-span-2">
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
          >
            Add service
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
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Duration</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {displayServices.map((s) => (
              <tr
                key={s.id}
                className={
                  showingPreview
                    ? "bg-violet-50/40 dark:bg-violet-950/15"
                    : undefined
                }
              >
                <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                  {s.name}
                </td>
                <td className="px-4 py-3">{s.durationMinutes} min</td>
                <td className="px-4 py-3">{formatMoney(s.priceCents)}</td>
                <td className="px-4 py-3">{s.active ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
