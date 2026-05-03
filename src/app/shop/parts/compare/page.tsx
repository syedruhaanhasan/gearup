"use client";

import { formatMoney } from "@/lib/money";
import { usePartCompare } from "@/lib/part-compare-context";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ComparePartsPage() {
  const { selected, removePart, clearAll } = usePartCompare();
  const router = useRouter();

  if (selected.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Compare parts
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Select parts from the catalog to see a side-by-side comparison.
          </p>
        </div>
        <div className="gu-card p-8 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No parts selected for comparison.
          </p>
          <Link
            href="/shop/parts"
            className="gu-btn-primary mt-4 inline-flex px-5 py-2 text-sm"
          >
            Browse parts
          </Link>
        </div>
      </div>
    );
  }

  const allPrices = selected.map((p) => p.priceCents);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);

  const allStock = selected.map((p) => p.stockQuantity);
  const minStock = Math.min(...allStock);
  const maxStock = Math.max(...allStock);

  const allLead = selected.map((p) => p.restockLeadDays);
  const minLead = Math.min(...allLead);
  const maxLead = Math.max(...allLead);

  const rows = [
    { label: "Price", key: "price" as const },
    { label: "Stock", key: "stock" as const },
    { label: "Restock lead", key: "lead" as const },
    { label: "Description", key: "desc" as const },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Compare parts
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Side-by-side view of selected parts. Best values are highlighted.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => router.push("/shop/parts")}
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            Back to catalog
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="rounded-lg bg-zinc-800 px-4 py-2 text-xs font-semibold text-white transition hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600"
          >
            Clear all
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[40rem] border-separate border-spacing-0 rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 border-b border-r border-zinc-200 bg-zinc-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                Attribute
              </th>
              {selected.map((p) => (
                <th
                  key={p.id}
                  className="min-w-[12rem] border-b border-zinc-200 px-4 py-3 text-left dark:border-zinc-800"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      {p.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removePart(p.id)}
                      className="rounded-md p-1 text-zinc-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                      aria-label={`Remove ${p.name}`}
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key}>
                <td className="sticky left-0 z-10 border-b border-r border-zinc-200 bg-zinc-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                  {row.label}
                </td>
                {selected.map((p) => {
                  let content: React.ReactNode;
                  let isBest = false;
                  let isWorst = false;

                  if (row.key === "price") {
                    content = formatMoney(p.priceCents);
                    if (selected.length > 1) {
                      if (p.priceCents === minPrice) isBest = true;
                      if (p.priceCents === maxPrice) isWorst = true;
                    }
                  } else if (row.key === "stock") {
                    content =
                      p.stockQuantity > 0 ? (
                        <span className="font-medium text-emerald-700 dark:text-emerald-300">
                          {p.stockQuantity} in stock
                        </span>
                      ) : (
                        <span className="font-medium text-amber-700 dark:text-amber-300">
                          Out of stock
                        </span>
                      );
                    if (selected.length > 1) {
                      if (p.stockQuantity === maxStock) isBest = true;
                      if (p.stockQuantity === minStock) isWorst = true;
                    }
                  } else if (row.key === "lead") {
                    content = `${p.restockLeadDays} day${p.restockLeadDays === 1 ? "" : "s"}`;
                    if (selected.length > 1) {
                      if (p.restockLeadDays === minLead) isBest = true;
                      if (p.restockLeadDays === maxLead) isWorst = true;
                    }
                  } else {
                    content = p.description ?? "—";
                  }

                  return (
                    <td
                      key={p.id}
                      className={`border-b border-zinc-200 px-4 py-3 text-sm dark:border-zinc-800 ${
                        isBest
                          ? "bg-emerald-50/60 font-semibold text-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-100"
                          : isWorst
                            ? "bg-amber-50/40 text-zinc-700 dark:bg-amber-950/10 dark:text-zinc-300"
                            : "text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      {content}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-emerald-500/20" />
          Best value
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-amber-500/20" />
          Less favorable
        </span>
      </div>
    </div>
  );
}
