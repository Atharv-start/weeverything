import { ChatSkeleton } from '@/components/ui/Skeleton';

export default function ChatsLoading() {
  return (
    <div className="p-6">
      <ChatSkeleton />
    </div>
  );
}
