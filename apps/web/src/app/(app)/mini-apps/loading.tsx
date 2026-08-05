import { CardSkeleton } from '@/components/ui/Skeleton';

export default function MiniAppsLoading() {
  return (
    <div className="page-wrapper-wide space-y-6">
      <div className="h-12 w-64 bg-[var(--color-surface-dim)] rounded-xl animate-pulse" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
