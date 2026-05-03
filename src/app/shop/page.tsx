import { LiveMechanicsBoard } from "@/components/LiveMechanicsBoard";
import Link from "next/link";

export default function ShopDashboardPage() {
  return (
    <div className="flex flex-col gap-10">
      <LiveMechanicsBoard />
      <div className="grid gap-5 md:grid-cols-2">
        <Link href="/shop/parts" className="gu-card group block p-7">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Parts shelf</h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Stock counts, preorder when inventory is dry, and transparent restock timing.
          </p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-teal-700 group-hover:gap-3 dark:text-teal-400">
            Browse parts →
          </span>
        </Link>
        <Link href="/shop/book" className="gu-card group block p-7">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Book a bay</h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Pick a service, choose the next honest slot, optional parts add-ons.
          </p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-teal-700 group-hover:gap-3 dark:text-teal-400">
            Start booking →
          </span>
        </Link>
      </div>
    </div>
  );
}
