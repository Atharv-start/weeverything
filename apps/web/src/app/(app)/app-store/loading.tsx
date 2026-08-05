import { CardSkeleton } from '@/components/ui/Skeleton';

export default function AppStoreLoading() {
  return (
    <div className="page-wrapper-wide space-y-6">
      <div className="h-12 w-64 bg-[var(--color-surface-dim)] rounded-xl animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
