import { getSessionFromCookies } from "@/lib/auth-session";
import Link from "next/link";

export default async function HomePage() {
  const user = await getSessionFromCookies();

  return (
    <main className="relative mx-auto flex min-h-full max-w-5xl flex-col gap-12 px-6 py-16 lg:gap-16 lg:py-20">
      <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[min(100%,42rem)] -translate-x-1/2 rounded-full bg-gradient-to-br from-teal-400/25 via-emerald-400/15 to-transparent blur-3xl dark:from-teal-600/20 dark:via-emerald-900/10" />

      <div className="relative">
        <p className="inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-teal-800 dark:border-teal-500/25 dark:bg-teal-500/10 dark:text-teal-300">
          Gear Up · Mechanic Shop
        </p>
        <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
          {user ? `Welcome back, ${user.name || "User"}!` : "Operations and shop front,"}{" "}
          {!user && (
            <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent dark:from-teal-400 dark:to-emerald-400">
              tuned for real bays.
            </span>
          )}
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
          Duration-aware booking, live mechanic status, and inventory with preorder when stock
          runs dry — one cohesive workspace for staff and customers.
        </p>
        {!user && (
          <p className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/login"
              className="gu-btn-primary inline-flex px-6 py-2.5 shadow-lg shadow-teal-600/25"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-xl border border-[var(--gu-sidebar-border)] bg-[var(--gu-surface)] px-5 py-2.5 text-sm font-semibold text-zinc-700 shadow-sm transition hover:border-teal-400/40 hover:shadow-md dark:text-zinc-300"
            >
              Create account
            </Link>
          </p>
        )}
      </div>

      <div className="relative grid gap-5 sm:grid-cols-2">
        <Link href="/shop" className="gu-card group block p-7">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-400">
            Customer
          </span>
          <h2 className="mt-3 text-xl font-bold text-zinc-900 dark:text-zinc-50">Shop front</h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Live bay board, parts shelf, and guided booking — tailored for drivers.
          </p>
          <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-teal-700 transition group-hover:gap-3 dark:text-teal-400">
            Open dashboard
            <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </span>
        </Link>
        <Link href="/admin" className="gu-card group block border-indigo-200/40 p-7 dark:border-indigo-900/40">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-700 dark:text-indigo-400">
            Staff
          </span>
          <h2 className="mt-3 text-xl font-bold text-zinc-900 dark:text-zinc-50">Operations console</h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Parts, services, hours, mechanics, bookings — admin tools when you sign in as staff.
          </p>
          <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 transition group-hover:gap-3 dark:text-indigo-400">
            Open console
            <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </span>
        </Link>
      </div>
    </main>
  );
}
