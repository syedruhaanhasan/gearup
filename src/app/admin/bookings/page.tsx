"use client";

import { AdminDemoBanner } from "@/components/AdminDemoBanner";
import { DEMO_BOOKINGS } from "@/lib/admin-demo-preview";
import { formatMoney } from "@/lib/money";
import { parseResponseJson } from "@/lib/parse-response-json";
import { useEffect, useState } from "react";

type Booking = {
  id: string;
  startAt: string;
  endAt: string;
  status: string;
  totalPriceCents: number;
  user: { email: string; name: string | null };
  service: { name: string; priceCents: number };
  mechanic: { name: string };
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setError(null);
    const res = await fetch("/api/bookings", {
      credentials: "include",
    });
    if (!res.ok) {
      setError("Could not load bookings (check API key).");
      return;
    }
    const data = await parseResponseJson<{ bookings?: Booking[] }>(res);
    setBookings(data?.bookings ?? []);
  }

  useEffect(() => {
    void refresh();
  }, []);

  const showingPreview = bookings.length === 0;
  const displayBookings = showingPreview ? DEMO_BOOKINGS : bookings;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Bookings pipeline
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Confirmed jobs with customer context — export or POS hooks land here
          next.
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
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Mechanic</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {displayBookings.map((b) => (
              <tr
                key={b.id}
                className={
                  showingPreview
                    ? "bg-violet-50/40 dark:bg-violet-950/15"
                    : undefined
                }
              >
                <td className="px-4 py-3 text-xs text-zinc-600 dark:text-zinc-300">
                  <div>{new Date(b.startAt).toLocaleString()}</div>
                  <div className="text-zinc-400">
                    → {new Date(b.endAt).toLocaleTimeString()}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-zinc-900 dark:text-zinc-50">
                    {b.user.email}
                  </div>
                  {b.user.name && (
                    <div className="text-xs text-zinc-500">{b.user.name}</div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div>{b.service.name}</div>
                  <div className="text-xs text-zinc-500">
                    {formatMoney(b.service.priceCents)}
                  </div>
                </td>
                <td className="px-4 py-3">{b.mechanic.name}</td>
                <td className="px-4 py-3">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                    {formatMoney(b.totalPriceCents)}
                  </span>
                </td>
                <td className="px-4 py-3">{b.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
