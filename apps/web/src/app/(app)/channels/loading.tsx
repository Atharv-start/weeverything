import { CardSkeleton, HeroSkeleton } from '@/components/ui/Skeleton';

export default function ChannelsLoading() {
  return (
    <div className="page-wrapper-wide space-y-6">
      <HeroSkeleton />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
