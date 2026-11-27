import { redirect } from 'next/navigation';

import { HikePageShell } from '@/features/hikes/components/hike-page-shell';
import { HikeChatPageContent } from '@/features/hikes/chat/components/hike-chat-page-content';
import { auth } from '@/lib/auth';

export default async function HikeChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const callbackPath = `/hikes/${id}/chat`;
  const session = await auth();

  if (!session?.user) {
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackPath)}`);
  }

  return (
    <HikePageShell>
      <HikeChatPageContent hikeId={id} />
    </HikePageShell>
  );
}
