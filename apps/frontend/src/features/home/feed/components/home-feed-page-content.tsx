import { redirect } from 'next/navigation';

import { HomeFeedContent } from '@/features/home/feed/components/home-feed-content';
import { auth } from '@/lib/auth';

export async function HomeFeedPageContent() {
  const session = await auth();

  if (!session) {
    redirect('/login?callbackUrl=%2Fhome');
  }

  return <HomeFeedContent displayName={session.user?.name || 'Hiker'} />;
}
