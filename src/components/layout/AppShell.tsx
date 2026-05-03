"use client";

import { parseResponseJson } from "@/lib/parse-response-json";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { LogoMark, NavIcon } from "@/components/layout/NavIcons";
import { PartCompareProvider } from "@/lib/part-compare-context";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useState,
} from "react";

type NavItem = { href: string; label: string };

type Me = {
  id: string;
  email: string;
  name: string | null;
  role: "ADMIN" | "CUSTOMER";
};

const MAIN: NavItem[] = [{ href: "/", label: "Home" }];

const SHOP_FRONT: NavItem[] = [
  { href: "/shop", label: "Live dashboard" },
  { href: "/shop/parts", label: "Parts catalog" },
  { href: "/shop/parts/compare", label: "Compare parts" },
  { href: "/shop/book", label: "Book a service" },
];

const MANAGEMENT: NavItem[] = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/parts", label: "Parts & inventory" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/mechanics", label: "Mechanics" },
  { href: "/admin/shop", label: "Shop hours" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/preorders", label: "Preorders" },
];

const GUEST_ACCOUNT_LINKS: NavItem[] = [
  { href: "/login", label: "Sign in" },
  { href: "/register", label: "Create account" },
];

function linkIsActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarIdentity({
  me,
  authReady,
}: {
  me: Me | null | undefined;
  authReady: boolean;
}) {
  if (!authReady) {
    return (
      <div className="mx-3 mb-4 overflow-hidden rounded-xl border border-[var(--gu-sidebar-border)] bg-[var(--gu-surface)] p-3.5 shadow-sm">
        <div className="h-2.5 w-24 animate-pulse rounded-md bg-zinc-200/90 dark:bg-zinc-700/80" />
        <div className="mt-2.5 h-2 w-32 animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-800/80" />
        <p className="mt-3 text-[10px] text-zinc-400">Loading profile…</p>
      </div>
    );
  }

  if (!me) {
    return (
      <div className="mx-3 mb-4 rounded-xl border border-dashed border-teal-400/40 bg-gradient-to-br from-teal-50/90 to-white p-3.5 dark:border-teal-700/40 dark:from-teal-950/40 dark:to-zinc-900/50">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-400">
          Guest
        </p>
        <p className="mt-1.5 text-xs leading-snug text-zinc-600 dark:text-zinc-400">
          Sign in to book services, save carts, and track preorders.
        </p>
        <Link
          href="/login"
          className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-teal-700 transition hover:gap-2 dark:text-teal-400"
        >
          Sign in <span aria-hidden>→</span>
        </Link>
      </div>
    );
  }

  if (me.role === "ADMIN") {
    return (
      <div className="relative mx-3 mb-4 overflow-hidden rounded-xl border border-white/20 bg-gradient-to-br from-indigo-600 via-violet-600 to-teal-700 p-4 text-white shadow-lg shadow-indigo-950/25">
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-amber-400/20 blur-2xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-teal-400/20 blur-2xl"
          aria-hidden
        />
        <p className="relative text-[10px] font-bold uppercase tracking-[0.22em] text-white/75">
          Administrator
        </p>
        <p className="relative mt-1 truncate text-sm font-semibold tracking-tight">
          {me.name || me.email}
        </p>
        <p className="relative mt-1 truncate text-xs text-white/80">{me.email}</p>
        <span className="relative mt-3 inline-flex items-center rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide backdrop-blur-sm">
          Management & configuration
        </span>
      </div>
    );
  }

  return (
    <div className="mx-3 mb-4 overflow-hidden rounded-xl border border-teal-200/60 bg-gradient-to-br from-teal-500/12 via-emerald-500/8 to-transparent p-4 dark:border-teal-800/50 dark:from-teal-500/15 dark:via-emerald-900/10">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-400">
        Customer
      </p>
      <p className="mt-1 truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        {me.name || "Shop account"}
      </p>
      <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">{me.email}</p>
      <p className="mt-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
        Dashboard, parts catalog, and booking — staff tools stay hidden.
      </p>
    </div>
  );
}

function NavSection({
  title,
  items,
  pathname,
  onNavigate,
  variant = "teal",
}: {
  title: string;
  items: NavItem[];
  pathname: string;
  onNavigate: () => void;
  variant?: "teal" | "violet";
}) {
  const activeBorder =
    variant === "violet"
      ? "border-l-[var(--gu-violet)] bg-[var(--gu-violet-muted)] text-indigo-950 dark:text-indigo-50"
      : "border-l-[var(--gu-accent)] bg-[var(--gu-accent-muted)] text-[var(--gu-accent-text)] dark:text-teal-50";

  const inactiveHover =
    variant === "violet"
      ? "hover:border-l-indigo-400/50 hover:bg-indigo-500/[0.07] dark:hover:bg-indigo-500/10"
      : "hover:border-l-teal-400/40 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/60";

  return (
    <div className="px-3 py-2">
      <p className="mb-2.5 px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
        {title}
      </p>
      <ul className="space-y-1">
        {items.map((item) => {
          const active = linkIsActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                className={`group flex items-center gap-2.5 rounded-r-lg border-l-[3px] py-1.5 pl-2 pr-2 text-sm font-medium transition-all duration-200 ease-out ${
                  active
                    ? `${activeBorder} shadow-sm`
                    : `border-l-transparent text-zinc-600 dark:text-zinc-400 ${inactiveHover} hover:pl-2.5 dark:hover:text-zinc-200`
                } ${!active ? "hover:translate-x-0.5" : ""}`}
              >
                <span
                  className="flex h-5 w-5 flex-none items-center justify-center text-current"
                  aria-hidden
                >
                  <NavIcon
                    href={item.href}
                    className={`transition-opacity duration-200 ${
                      active ? "opacity-100" : "opacity-55 group-hover:opacity-90"
                    }`}
                  />
                </span>
                <span className="min-w-0 flex-1 truncate leading-snug">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function AccountBlock({
  user,
  pathname,
  onNavigate,
  onLogout,
}: {
  user: Me | null | undefined;
  pathname: string;
  onNavigate: () => void;
  onLogout: () => void | Promise<void>;
}) {
  if (user === undefined) {
    return (
      <div className="px-3 py-2">
        <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
          Account
        </p>
        <p className="px-2 text-sm text-zinc-400">Checking session…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <NavSection
        title="Account"
        items={GUEST_ACCOUNT_LINKS}
        pathname={pathname}
        onNavigate={onNavigate}
        variant="teal"
      />
    );
  }

  return (
    <div className="border-t border-[var(--gu-sidebar-border)] px-3 py-4">
      <p className="mb-3 px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
        Session
      </p>
      <div className="rounded-xl border border-[var(--gu-sidebar-border)] bg-zinc-50/80 p-3 dark:bg-zinc-900/50">
        <p className="truncate text-xs font-medium text-zinc-900 dark:text-zinc-100">
          {user.email}
        </p>
        <span
          className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
            user.role === "ADMIN"
              ? "bg-indigo-500/15 text-indigo-800 dark:bg-indigo-500/25 dark:text-indigo-200"
              : "bg-teal-500/15 text-teal-800 dark:bg-teal-500/20 dark:text-teal-200"
          }`}
        >
          {user.role === "ADMIN" ? "Admin" : "Customer"}
        </span>
        <button
          type="button"
          onClick={() => {
            void onLogout();
            onNavigate();
          }}
          className="mt-3 w-full rounded-lg bg-zinc-200/90 py-2 text-xs font-semibold text-zinc-800 transition hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const panelId = useId();
  const [me, setMe] = useState<Me | null | undefined>(undefined);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  useEffect(() => {
    void fetch("/api/auth/me", { credentials: "include" })
      .then((r) => parseResponseJson<{ user: Me | null }>(r))
      .then((d) => setMe(d?.user ?? null));
  }, [pathname]);

  useEffect(() => {
    closeSidebar();
  }, [pathname, closeSidebar]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSidebar();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sidebarOpen, closeSidebar]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setMe(null);
    router.refresh();
    if (pathname.startsWith("/admin")) {
      router.replace("/login");
    }
  }

  const isAdmin = me?.role === "ADMIN";
  const authReady = me !== undefined;

  return (
    <div className="gu-page-bg flex min-h-screen flex-col">
      <header className="gu-glass-header sticky top-0 z-[60] flex h-[3.65rem] shrink-0 items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            type="button"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--gu-sidebar-border)] bg-[var(--gu-surface)] text-zinc-700 shadow-sm transition hover:border-teal-400/40 hover:shadow-md lg:hidden dark:text-zinc-200"
            aria-expanded={sidebarOpen}
            aria-controls={panelId}
            aria-label="Open navigation menu"
            onClick={() => setSidebarOpen(true)}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link href="/" className="group flex min-w-0 items-center gap-2.5">
            <LogoMark className="h-9 w-9 shrink-0 shadow-md transition group-hover:scale-[1.03]" />
            <span className="truncate bg-gradient-to-r from-zinc-900 to-zinc-600 bg-clip-text text-lg font-bold tracking-tight text-transparent dark:from-white dark:to-zinc-400">
              Gear Up
            </span>
          </Link>
          {authReady && me && (
            <span
              className={`hidden shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider sm:inline ${
                me.role === "ADMIN"
                  ? "bg-indigo-500/15 text-indigo-800 dark:bg-indigo-500/25 dark:text-indigo-200"
                  : "bg-teal-500/15 text-teal-800 dark:bg-teal-500/20 dark:text-teal-200"
              }`}
            >
              {me.role === "ADMIN" ? "Staff" : "Customer"}
            </span>
          )}
        </div>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Quick links">
          <Link
            href="/shop"
            className="rounded-xl px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-teal-500/10 hover:text-teal-800 dark:text-zinc-400 dark:hover:bg-teal-500/10 dark:hover:text-teal-200"
          >
            Shop
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              className="rounded-xl px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-indigo-500/10 hover:text-indigo-800 dark:text-zinc-400 dark:hover:bg-indigo-500/15 dark:hover:text-indigo-200"
            >
              Admin
            </Link>
          )}
          {!authReady ? (
            <span className="rounded-lg px-3 py-2 text-sm text-zinc-400" aria-busy>
              …
            </span>
          ) : me ? (
            <button
              type="button"
              onClick={() => void logout()}
              className="rounded-xl px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              Sign out
            </button>
          ) : (
            <Link
              href="/login"
              className="rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-teal-600/20 transition hover:shadow-lg dark:shadow-teal-900/30"
            >
              Sign in
            </Link>
          )}
        </nav>
      </header>

      <div className="flex flex-1">
        {sidebarOpen && (
          <button
            type="button"
            className="animate-gu-backdrop fixed inset-0 z-40 bg-slate-900/55 backdrop-blur-[2px] lg:hidden"
            aria-label="Close navigation menu"
            onClick={closeSidebar}
          />
        )}

        <aside
          id={panelId}
          className={`fixed bottom-0 left-0 top-[3.65rem] z-50 flex w-[min(292px,100vw-2rem)] flex-col overflow-y-auto border-r border-[var(--gu-sidebar-border)] bg-[var(--gu-sidebar)] shadow-2xl backdrop-blur-xl transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] dark:shadow-black/40 lg:static lg:top-auto lg:z-0 lg:w-64 lg:min-h-[calc(100vh-3.65rem)] lg:max-w-none lg:translate-x-0 lg:bg-[var(--gu-sidebar)] lg:shadow-none ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="flex items-center justify-between border-b border-[var(--gu-sidebar-border)] px-4 py-3.5 lg:hidden">
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              {!authReady ? "Menu" : isAdmin ? "Navigation · Staff" : me ? "Navigation · Customer" : "Navigation · Guest"}
            </span>
            <button
              type="button"
              className="rounded-xl p-2 text-zinc-500 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
              aria-label="Close menu"
              onClick={closeSidebar}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <SidebarIdentity me={me} authReady={authReady} />

          <nav className="flex-1 pb-4 pt-1 lg:pt-0" aria-label="Main navigation">
            <NavSection title="Main" items={MAIN} pathname={pathname} onNavigate={closeSidebar} variant="teal" />
            <NavSection
              title="Shop front"
              items={SHOP_FRONT}
              pathname={pathname}
              onNavigate={closeSidebar}
              variant="teal"
            />
            {isAdmin && (
              <NavSection
                title="Management"
                items={MANAGEMENT}
                pathname={pathname}
                onNavigate={closeSidebar}
                variant="violet"
              />
            )}
            <AccountBlock user={me} pathname={pathname} onNavigate={closeSidebar} onLogout={logout} />
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div key={pathname} className="animate-gu-page flex-1">
            <PartCompareProvider>{children}</PartCompareProvider>
          </div>
          <SiteFooter
            showManagementLinks={isAdmin === true}
            session={authReady ? me : undefined}
            onSignOut={() => void logout()}
          />
        </div>
      </div>
    </div>
  );
}
