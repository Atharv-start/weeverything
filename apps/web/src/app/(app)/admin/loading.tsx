export default function AdminLoading() {
  return (
    <div className="page-wrapper space-y-8 animate-pulse">
      <div className="header-floating p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="h-3 w-32 bg-[var(--color-surface-bright)] rounded" />
          <div className="h-8 w-64 bg-[var(--color-surface-bright)] rounded" />
          <div className="h-4 w-96 bg-[var(--color-surface-bright)] rounded" />
        </div>
        <div className="h-10 w-36 bg-[var(--color-surface-bright)] rounded-xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card p-5 rounded-2xl space-y-3">
            <div className="h-4 w-24 bg-[var(--color-surface-bright)] rounded" />
            <div className="h-8 w-16 bg-[var(--color-surface-bright)] rounded" />
          </div>
        ))}
      </div>

      <div className="glass-card p-6 rounded-2xl space-y-4">
        <div className="h-6 w-48 bg-[var(--color-surface-bright)] rounded" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 w-full bg-[var(--color-surface-bright)] rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
