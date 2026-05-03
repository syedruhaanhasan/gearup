export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto min-h-full max-w-5xl px-4 py-10 sm:px-6 lg:py-12">
      <header className="relative mb-10 overflow-hidden rounded-2xl border border-[var(--gu-sidebar-border)] bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-transparent px-6 py-8 dark:from-teal-950/40 dark:via-emerald-950/20">
        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-teal-400/20 blur-3xl dark:bg-teal-500/10" />
        <p className="relative text-[10px] font-bold uppercase tracking-[0.22em] text-teal-700 dark:text-teal-400">
          Customer
        </p>
        <h1 className="relative mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Shop front
        </h1>
        <p className="relative mt-3 max-w-xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Use the sidebar to switch between the live dashboard, parts catalog, and booking — only
          links you need are shown for your account.
        </p>
      </header>
      {children}
    </div>
  );
}
