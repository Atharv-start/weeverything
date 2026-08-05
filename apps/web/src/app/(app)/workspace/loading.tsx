import { ListSkeleton, HeroSkeleton } from '@/components/ui/Skeleton';

export default function WorkspaceLoading() {
  return (
    <div className="page-wrapper space-y-6">
      <HeroSkeleton />
      <ListSkeleton count={5} />
    </div>
  );
}
