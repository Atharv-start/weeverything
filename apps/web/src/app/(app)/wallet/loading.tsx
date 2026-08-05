import { CardSkeleton, ListSkeleton } from '@/components/ui/Skeleton';

export default function WalletLoading() {
  return (
    <div className="page-wrapper space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <ListSkeleton count={4} />
    </div>
  );
}
