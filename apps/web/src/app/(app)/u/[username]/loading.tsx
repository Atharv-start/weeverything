export default function UserProfileLoading() {
  return (
    <div className="page-wrapper space-y-8 animate-pulse">
      <div className="glass-card p-8 rounded-2xl flex flex-col md:flex-row items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-[var(--color-surface-bright)]" />
        <div className="space-y-2 flex-1 text-center md:text-left">
          <div className="h-7 w-48 bg-[var(--color-surface-bright)] rounded mx-auto md:mx-0" />
          <div className="h-4 w-32 bg-[var(--color-surface-bright)] rounded mx-auto md:mx-0" />
          <div className="h-4 w-80 bg-[var(--color-surface-bright)] rounded mx-auto md:mx-0" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card p-6 rounded-2xl space-y-3">
            <div className="h-5 w-32 bg-[var(--color-surface-bright)] rounded" />
            <div className="h-4 w-full bg-[var(--color-surface-bright)] rounded" />
            <div className="h-4 w-3/4 bg-[var(--color-surface-bright)] rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
