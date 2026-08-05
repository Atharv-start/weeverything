import { ListSkeleton } from '@/components/ui/Skeleton';

export default function NotificationsLoading() {
  return (
    <div className="page-wrapper space-y-6">
      <div className="h-10 w-48 bg-[var(--color-surface-dim)] rounded-xl animate-pulse" />
      <ListSkeleton count={6} />
    </div>
  );
}
