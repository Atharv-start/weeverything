import { CardSkeleton, ListSkeleton } from '@/components/ui/Skeleton';

export default function SettingsLoading() {
  return (
    <div className="page-wrapper space-y-6">
      <div className="h-10 w-48 bg-[var(--color-surface-dim)] rounded-xl animate-pulse" />
      <CardSkeleton />
      <ListSkeleton count={4} />
    </div>
  );
}
