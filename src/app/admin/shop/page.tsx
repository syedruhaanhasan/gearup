"use client";

import { AdminDemoBanner } from "@/components/AdminDemoBanner";
import {
  DEMO_SHOP_SETTINGS,
  DEMO_TIME_SLOT_RULES,
} from "@/lib/admin-demo-preview";
import { parseResponseJson } from "@/lib/parse-response-json";
import { useEffect, useState } from "react";

type Settings = {
  openTime: string;
  closeTime: string;
  slotStepMinutes: number;
  timezone: string;
};

type TimeSlotRule = {
  id: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  slotStepMin: number | null;
  active: boolean;
};

const dayLabel = (d: number) =>
  ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][
    d
  ] ?? String(d);

export default function AdminShopPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [rules, setRules] = useState<TimeSlotRule[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [settingsFromDb, setSettingsFromDb] = useState(true);

  useEffect(() => {
    void (async () => {
      const [setRes, rulesRes] = await Promise.all([
        fetch("/api/shop/settings", { credentials: "include" }),
        fetch("/api/shop/time-slot-rules", { credentials: "include" }),
      ]);
      const d = await parseResponseJson<{ settings?: Settings }>(setRes);
      if (d?.settings) {
        setSettings(d.settings);
        setSettingsFromDb(true);
      } else {
        setSettings({ ...DEMO_SHOP_SETTINGS });
        setSettingsFromDb(false);
      }
      const rd = await parseResponseJson<{ rules?: TimeSlotRule[] }>(rulesRes);
      setRules(rd?.rules ?? []);
      setLoading(false);
    })();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setMessage(null);
    const res = await fetch("/api/shop/settings", {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(settings),
    });
    if (!res.ok) {
      const body = (await parseResponseJson<{ error?: unknown }>(res)) ?? {};
      setMessage(body.error ? JSON.stringify(body.error) : "Save failed");
      return;
    }
    setMessage("Shop hours updated.");
    setSettingsFromDb(true);
  }

  if (loading || !settings) {
    return <p className="text-sm text-zinc-500">Loading shop…</p>;
  }

  const rulesPreview = rules.length === 0;
  const displayRules = rulesPreview ? DEMO_TIME_SLOT_RULES : rules;
  const showingPreview = !settingsFromDb || rulesPreview;

  return (
    <div className="space-y-10">
      {showingPreview && <AdminDemoBanner />}

      <form onSubmit={save} className="max-w-xl space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Shop hours & slot grid
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Default window used by the slot generator. Closing time blocks same-day
            overflow; next-day slots roll automatically when the day is full.
          </p>
        </div>

        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Open (HH:MM, 24h)
          </span>
          <input
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            value={settings.openTime}
            onChange={(e) =>
              setSettings((s) => s && { ...s, openTime: e.target.value })
            }
          />
        </label>
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Close (HH:MM)
          </span>
          <input
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            value={settings.closeTime}
            onChange={(e) =>
              setSettings((s) => s && { ...s, closeTime: e.target.value })
            }
          />
        </label>
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Slot step (minutes)
          </span>
          <input
            type="number"
            min={5}
            max={240}
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            value={settings.slotStepMinutes}
            onChange={(e) =>
              setSettings((s) =>
                s ? { ...s, slotStepMinutes: Number(e.target.value) } : s,
              )
            }
          />
        </label>
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Timezone label (display only in starter — DB stores UTC instants)
          </span>
          <input
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            value={settings.timezone}
            onChange={(e) =>
              setSettings((s) => s && { ...s, timezone: e.target.value })
            }
          />
        </label>

        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
        >
          Save settings
        </button>

        {message && (
          <p className="rounded-xl bg-zinc-900 px-4 py-3 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900">
            {message}
          </p>
        )}
      </form>

      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Weekly time-slot rules
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Demo rows from seed (per weekday). The live slot API currently uses
            shop defaults above; wire these rules into{" "}
            <code className="rounded bg-zinc-200 px-1 text-xs dark:bg-zinc-800">
              computeAvailableSlots
            </code>{" "}
            when you need day-specific grids.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
            <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:bg-zinc-900/60">
              <tr>
                <th className="px-4 py-3">Day</th>
                <th className="px-4 py-3">Open</th>
                <th className="px-4 py-3">Close</th>
                <th className="px-4 py-3">Step (min)</th>
                <th className="px-4 py-3">Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {displayRules.map((r) => (
                <tr
                  key={r.id}
                  className={
                    rulesPreview
                      ? "bg-violet-50/40 dark:bg-violet-950/15"
                      : undefined
                  }
                >
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                    {dayLabel(r.dayOfWeek)}
                  </td>
                  <td className="px-4 py-3">{r.openTime}</td>
                  <td className="px-4 py-3">{r.closeTime}</td>
                  <td className="px-4 py-3">{r.slotStepMin ?? "—"}</td>
                  <td className="px-4 py-3">{r.active ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
