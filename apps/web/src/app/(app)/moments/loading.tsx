import { CardSkeleton } from '@/components/ui/Skeleton';

export default function MomentsLoading() {
  return (
    <div className="page-wrapper space-y-6">
      <div className="h-10 w-48 bg-[var(--color-surface-dim)] rounded-xl animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
