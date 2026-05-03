"use client";

import { formatMoney } from "@/lib/money";
import { parseResponseJson } from "@/lib/parse-response-json";
import { useEffect, useMemo, useState } from "react";

type Service = {
  id: string;
  name: string;
  durationMinutes: number;
  priceCents: number;
};

type Slot = {
  startAt: string;
  endAt: string;
  mechanicId: string;
};

type Part = {
  id: string;
  name: string;
  stockQuantity: number;
  priceCents: number;
};

export default function BookServicePage() {
  const [services, setServices] = useState<Service[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [serviceId, setServiceId] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotLoading, setSlotLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [selectedParts, setSelectedParts] = useState<
    Record<string, number>
  >({});
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const [svcRes, partsRes] = await Promise.all([
        fetch("/api/services"),
        fetch("/api/parts"),
      ]);
      const svc = await parseResponseJson<{ services?: Service[] }>(svcRes);
      const prt = await parseResponseJson<{ parts?: Part[] }>(partsRes);
      setServices(svc?.services ?? []);
      setParts(prt?.parts ?? []);
    })();
  }, []);

  useEffect(() => {
    if (!serviceId) {
      setSlots([]);
      return;
    }
    setSlotLoading(true);
    const qs = new URLSearchParams({
      serviceId,
      from: new Date().toISOString(),
      days: "14",
    });
    void (async () => {
      try {
        const res = await fetch(`/api/slots?${qs.toString()}`);
        const d = await parseResponseJson<{ slots?: Slot[] }>(res);
        setSlots(d?.slots ?? []);
      } finally {
        setSlotLoading(false);
      }
    })();
  }, [serviceId]);

  const partPayload = useMemo(() => {
    return Object.entries(selectedParts)
      .filter(([, q]) => q > 0)
      .map(([partId, quantity]) => ({ partId, quantity }));
  }, [selectedParts]);

  async function submit() {
    setStatus(null);
    if (!email || !serviceId || !selectedSlot) {
      setStatus("Email, service, and slot are required.");
      return;
    }
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        name,
        serviceId,
        startAt: selectedSlot.startAt,
        parts: partPayload.length ? partPayload : undefined,
      }),
    });
    const body = (await parseResponseJson<{ error?: string }>(res)) ?? {};
    if (!res.ok) {
      setStatus(body.error ?? "Booking failed");
      return;
    }
    setStatus("Booking confirmed. See you in the shop.");
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Book a service
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Slots respect shop hours, service duration, and existing bay occupancy.
          Parts add-ons deduct inventory immediately when stock allows.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
            Contact
          </h3>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Email
            </span>
            <input
              className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Name (optional)
            </span>
            <input
              className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
        </div>

        <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
            Service
          </h3>
          <select
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            value={serviceId}
            onChange={(e) => {
              setServiceId(e.target.value);
              setSelectedSlot(null);
            }}
          >
            <option value="">Choose…</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} · {s.durationMinutes} min · {formatMoney(s.priceCents)}
              </option>
            ))}
          </select>
          {slotLoading && (
            <p className="text-sm text-zinc-500">Loading availability…</p>
          )}
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {slots.map((slot) => (
              <button
                key={`${slot.startAt}-${slot.mechanicId}`}
                type="button"
                onClick={() => setSelectedSlot(slot)}
                className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm ${
                  selectedSlot?.startAt === slot.startAt
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-zinc-200 hover:border-emerald-300 dark:border-zinc-700"
                }`}
              >
                <span>
                  {new Date(slot.startAt).toLocaleString()} →{" "}
                  {new Date(slot.endAt).toLocaleTimeString()}
                </span>
              </button>
            ))}
          </div>
          {!slots.length && serviceId && !slotLoading && (
            <p className="text-sm text-amber-700 dark:text-amber-300">
              No open slots in the selected horizon — extend search or relax shop
              hours in admin.
            </p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
          Optional parts (deducts stock now)
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Only in-stock quantities are allowed on the same booking transaction.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {parts.map((p) => (
            <label
              key={p.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-zinc-100 px-3 py-2 text-sm dark:border-zinc-800"
            >
              <span>
                {p.name}{" "}
                <span className="text-zinc-500">
                  ({p.stockQuantity} on hand)
                </span>
              </span>
              <input
                type="number"
                min={0}
                max={p.stockQuantity}
                className="w-20 rounded border border-zinc-200 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-950"
                value={selectedParts[p.id] ?? 0}
                onChange={(e) =>
                  setSelectedParts((prev) => ({
                    ...prev,
                    [p.id]: Number(e.target.value),
                  }))
                }
              />
            </label>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => void submit()}
        className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
        disabled={!email || !serviceId || !selectedSlot}
      >
        Confirm booking
      </button>

      {status && (
        <p className="rounded-xl bg-zinc-900 px-4 py-3 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900">
          {status}
        </p>
      )}
    </div>
  );
}
