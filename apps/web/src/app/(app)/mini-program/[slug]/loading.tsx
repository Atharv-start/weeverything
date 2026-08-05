export default function MiniProgramLoading() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8 min-h-screen animate-pulse">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-6">
        <div className="space-y-2">
          <div className="h-3 w-36 bg-[var(--color-surface-bright)] rounded" />
          <div className="h-8 w-64 bg-[var(--color-surface-bright)] rounded" />
          <div className="h-4 w-96 bg-[var(--color-surface-bright)] rounded" />
        </div>
      </div>

      <div className="glass-card p-8 rounded-2xl space-y-6">
        <div className="h-10 w-full bg-[var(--color-surface-bright)] rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-[var(--color-surface-bright)] rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
