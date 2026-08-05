export default function ChatConversationLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 h-[calc(100vh-5rem)] flex flex-col animate-pulse">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--color-surface-bright)]" />
          <div className="space-y-1">
            <div className="h-4 w-36 bg-[var(--color-surface-bright)] rounded" />
            <div className="h-3 w-20 bg-[var(--color-surface-bright)] rounded" />
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <div className="flex justify-start">
          <div className="h-12 w-64 bg-[var(--color-surface-bright)] rounded-2xl" />
        </div>
        <div className="flex justify-end">
          <div className="h-10 w-48 bg-[var(--color-surface-bright)] rounded-2xl" />
        </div>
        <div className="flex justify-start">
          <div className="h-16 w-72 bg-[var(--color-surface-bright)] rounded-2xl" />
        </div>
      </div>

      <div className="h-14 w-full bg-[var(--color-surface-bright)] rounded-2xl" />
    </div>
  );
}
