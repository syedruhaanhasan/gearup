export function AdminDemoBanner() {
  return (
    <div className="mb-4 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-950 dark:border-violet-900/50 dark:bg-violet-950/40 dark:text-violet-100">
      <span className="font-semibold">Sample data preview</span>
      <span className="opacity-90">
        {" "}
        — rows below are static placeholders until the API returns real records
        (database connected + seeded).
      </span>
    </div>
  );
}
