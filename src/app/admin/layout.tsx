import { AdminAuthBar } from "@/components/AdminAuthBar";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto min-h-full max-w-6xl px-4 py-10 sm:px-6 lg:py-12">
      <header className="relative mb-8 overflow-hidden rounded-2xl border border-indigo-200/50 bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-teal-500/5 px-6 py-8 dark:border-indigo-900/50 dark:from-indigo-950/50 dark:via-violet-950/30 dark:to-teal-950/20">
        <div className="pointer-events-none absolute -left-8 top-0 h-36 w-36 rounded-full bg-indigo-400/15 blur-3xl dark:bg-indigo-500/10" />
        <p className="relative text-[10px] font-bold uppercase tracking-[0.22em] text-indigo-700 dark:text-indigo-400">
          Admin
        </p>
        <div className="relative mt-2 flex flex-wrap items-end justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Operations console
          </h1>
          <Link
            href="/shop"
            className="rounded-full bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-teal-600/25 transition hover:shadow-lg"
          >
            View shop front
          </Link>
        </div>
        <p className="relative mt-4 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Deep sections live in the sidebar under{" "}
          <span className="font-semibold text-indigo-800 dark:text-indigo-300">Management</span>{" "}
          when you are signed in as staff.
        </p>
      </header>
      <AdminAuthBar />
      {children}
    </div>
  );
}
