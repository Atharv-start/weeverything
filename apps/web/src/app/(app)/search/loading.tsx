import { ListSkeleton } from '@/components/ui/Skeleton';

export default function SearchLoading() {
  return (
    <div className="page-wrapper space-y-6">
      <div className="h-14 w-full bg-[var(--color-surface-dim)] rounded-2xl animate-pulse" />
      <ListSkeleton count={5} />
    </div>
  );
}
