import { DEMO_DASHBOARD_COUNTS } from "@/lib/admin-demo-preview";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

const cards = [
  {
    href: "/admin/parts",
    title: "Parts & inventory",
    body: "SKU catalog, stock counts, restock lead times.",
    countKey: "parts" as const,
  },
  {
    href: "/admin/services",
    title: "Services",
    body: "Duration-based offerings that drive slot generation.",
    countKey: "services" as const,
  },
  {
    href: "/admin/mechanics",
    title: "Mechanics",
    body: "Bay roster and manual status overrides.",
    countKey: "mechanics" as const,
  },
  {
    href: "/admin/shop",
    title: "Shop hours",
    body: "Open/close window plus slot grid step.",
    countKey: "rules" as const,
  },
  {
    href: "/admin/bookings",
    title: "Bookings",
    body: "Confirmed jobs, customer context, assignment audit.",
    countKey: "bookings" as const,
  },
  {
    href: "/admin/preorders",
    title: "Part preorders",
    body: "Out-of-stock reservations waiting on restock.",
    countKey: "preorders" as const,
  },
];

const emptyCounts = {
  parts: 0,
  services: 0,
  mechanics: 0,
  bookings: 0,
  preorders: 0,
  rules: 0,
};

export default async function AdminHomePage() {
  let counts = { ...emptyCounts };
  let dbError: string | null = null;

  try {
    const [parts, services, mechanics, bookings, preorders, rules] =
      await Promise.all([
        prisma.part.count(),
        prisma.service.count(),
        prisma.mechanic.count(),
        prisma.booking.count(),
        prisma.partPreorder.count(),
        prisma.timeSlotRule.count(),
      ]);
    counts = { parts, services, mechanics, bookings, preorders, rules };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Database connection failed";
    dbError = msg.includes("Authentication failed")
      ? "PostgreSQL rejected the username/password. Open .env and set a valid DATABASE_URL (not the placeholder user u)."
      : msg.includes("Can't reach database")
        ? "Cannot reach PostgreSQL. Start the database, then check host/port in DATABASE_URL."
        : `Database error: ${msg}`;
  }

  const { parts, services, mechanics, bookings, preorders, rules } = counts;

  const allCountsZero =
    parts === 0 &&
    services === 0 &&
    mechanics === 0 &&
    bookings === 0 &&
    preorders === 0 &&
    rules === 0;

  const useDemoSnapshot = Boolean(dbError) || allCountsZero;
  const snapshot = useDemoSnapshot ? DEMO_DASHBOARD_COUNTS : counts;

  return (
    <div className="space-y-8">
      {dbError && (
        <div
          className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100"
          role="alert"
        >
          <p className="font-semibold">Database not connected</p>
          <p className="mt-1 opacity-90">{dbError}</p>
          <p className="mt-2 text-xs opacity-80">
            Example:{" "}
            <code className="rounded bg-amber-100/80 px-1.5 py-0.5 dark:bg-amber-900/50">
              postgresql://postgres:YOUR_PASSWORD@localhost:5432/mechanic_shop
            </code>{" "}
            then run{" "}
            <code className="rounded bg-amber-100/80 px-1.5 py-0.5 dark:bg-amber-900/50">
              npx prisma db push
            </code>{" "}
            and{" "}
            <code className="rounded bg-amber-100/80 px-1.5 py-0.5 dark:bg-amber-900/50">
              npm run db:seed
            </code>
            .
          </p>
        </div>
      )}

      <div className="rounded-2xl border border-[var(--gu-sidebar-border)] bg-gradient-to-br from-zinc-50 to-teal-50/30 p-6 dark:from-zinc-900/80 dark:to-teal-950/20">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Database snapshot
        </h2>
        {useDemoSnapshot && !dbError ? (
          <p className="mt-1 text-sm text-violet-700 dark:text-violet-300">
            Showing{" "}
            <span className="font-semibold">sample numbers</span> for layout — DB
            is empty. Run{" "}
            <code className="rounded bg-zinc-200 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
              npm run db:seed
            </code>{" "}
            for real counts.
          </p>
        ) : useDemoSnapshot && dbError ? (
          <p className="mt-1 text-sm text-violet-700 dark:text-violet-300">
            Showing <span className="font-semibold">sample numbers</span> below
            for layout preview while the database is unavailable.
          </p>
        ) : (
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Run{" "}
            <code className="rounded bg-zinc-200 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
              npm run db:seed
            </code>{" "}
            to load demo rows in every section.
          </p>
        )}
        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          <div className="rounded-xl bg-white px-3 py-2 shadow-sm dark:bg-zinc-950">
            <dt className="text-xs text-zinc-500">Parts</dt>
            <dd className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              {snapshot.parts}
            </dd>
          </div>
          <div className="rounded-xl bg-white px-3 py-2 shadow-sm dark:bg-zinc-950">
            <dt className="text-xs text-zinc-500">Services</dt>
            <dd className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              {snapshot.services}
            </dd>
          </div>
          <div className="rounded-xl bg-white px-3 py-2 shadow-sm dark:bg-zinc-950">
            <dt className="text-xs text-zinc-500">Mechanics</dt>
            <dd className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              {snapshot.mechanics}
            </dd>
          </div>
          <div className="rounded-xl bg-white px-3 py-2 shadow-sm dark:bg-zinc-950">
            <dt className="text-xs text-zinc-500">Bookings</dt>
            <dd className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              {snapshot.bookings}
            </dd>
          </div>
          <div className="rounded-xl bg-white px-3 py-2 shadow-sm dark:bg-zinc-950">
            <dt className="text-xs text-zinc-500">Preorders</dt>
            <dd className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              {snapshot.preorders}
            </dd>
          </div>
          <div className="rounded-xl bg-white px-3 py-2 shadow-sm dark:bg-zinc-950">
            <dt className="text-xs text-zinc-500">Slot rules</dt>
            <dd className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              {snapshot.rules}
            </dd>
          </div>
        </dl>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="gu-card group block border-indigo-100/50 p-6 dark:border-indigo-950/40"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {card.title}
              </h2>
              <span className="shrink-0 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-200">
                {snapshot[card.countKey]}
              </span>
            </div>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {card.body}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
