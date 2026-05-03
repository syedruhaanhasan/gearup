"use client";

import Link from "next/link";

const year = new Date().getFullYear();

type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: "ADMIN" | "CUSTOMER";
};

export function SiteFooter({
  showManagementLinks = false,
  session,
  onSignOut,
}: {
  showManagementLinks?: boolean;
  session?: SessionUser | null;
  onSignOut?: () => void | Promise<void>;
}) {
  return (
    <footer className="mt-auto border-t border-[var(--gu-sidebar-border)] bg-gradient-to-b from-transparent to-zinc-100/80 dark:to-zinc-950/80">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div
          className={`grid gap-10 sm:grid-cols-2 ${showManagementLinks ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}
        >
          <div className="animate-gu-page">
            <p className="flex items-center gap-2 text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              <span className="inline-block h-2 w-2 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 shadow-sm shadow-teal-500/40" />
              Gear Up
            </p>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Mechanic shop scheduling, parts, and live bay status — built for day-to-day
              operations.
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-500/90">
              Customer
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  href="/shop"
                  className="text-zinc-700 transition hover:text-teal-700 hover:underline dark:text-zinc-300 dark:hover:text-teal-400"
                >
                  Live dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/shop/parts"
                  className="text-zinc-700 transition hover:text-teal-700 hover:underline dark:text-zinc-300 dark:hover:text-teal-400"
                >
                  Parts catalog
                </Link>
              </li>
              <li>
                <Link
                  href="/shop/book"
                  className="text-zinc-700 transition hover:text-teal-700 hover:underline dark:text-zinc-300 dark:hover:text-teal-400"
                >
                  Book a service
                </Link>
              </li>
            </ul>
          </div>
          {showManagementLinks && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-700 dark:text-indigo-400">
                Management
              </p>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link
                    href="/admin"
                    className="text-zinc-700 transition hover:text-indigo-700 hover:underline dark:text-zinc-300 dark:hover:text-indigo-400"
                  >
                    Admin console
                  </Link>
                </li>
              </ul>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Account</p>
            {session === undefined ? (
              <p className="mt-4 text-sm text-zinc-400">Loading…</p>
            ) : session ? (
              <div className="mt-4 space-y-3 text-sm">
                <p className="truncate font-medium text-zinc-800 dark:text-zinc-200">{session.email}</p>
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                    session.role === "ADMIN"
                      ? "bg-indigo-500/15 text-indigo-800 dark:bg-indigo-500/25 dark:text-indigo-200"
                      : "bg-teal-500/15 text-teal-800 dark:bg-teal-500/20 dark:text-teal-200"
                  }`}
                >
                  {session.role === "ADMIN" ? "Admin" : "Customer"}
                </span>
                {onSignOut && (
                  <button
                    type="button"
                    onClick={() => void onSignOut()}
                    className="block text-left font-medium text-teal-700 underline-offset-4 transition hover:text-teal-900 hover:underline dark:text-teal-400 dark:hover:text-teal-200"
                  >
                    Sign out
                  </button>
                )}
              </div>
            ) : (
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link
                    href="/login"
                    className="font-medium text-teal-700 transition hover:underline dark:text-teal-400"
                  >
                    Sign in
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register"
                    className="text-zinc-700 transition hover:text-teal-700 hover:underline dark:text-zinc-300 dark:hover:text-teal-400"
                  >
                    Create account
                  </Link>
                </li>
              </ul>
            )}
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-[var(--gu-sidebar-border)] pt-8 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Gear Up Mechanic Shop. All rights reserved.</p>
          <p className="text-zinc-400">
            Support:{" "}
            <a
              href="mailto:support@gearup.example"
              className="transition hover:text-teal-700 dark:hover:text-teal-400"
            >
              support@gearup.example
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
