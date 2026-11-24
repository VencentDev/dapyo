import type { ReactNode } from 'react';

import { HomeFeedNavigation } from '@/features/home/feed/components/home-feed-navigation';
import { auth } from '@/lib/auth';

export async function HikePageShell({ children }: { children: ReactNode }) {
  const session = await auth();
  const displayName = session?.user?.name || 'Guest hiker';
  const initials =
    displayName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'H';

  return (
    <main
      data-social-home
      className="full-bleed -my-6 min-h-[100svh] bg-[#f2f4f0] pb-24 text-[#172a24] dark:bg-[#10231f] dark:text-[#edf4ef] lg:pb-8"
    >
      <HomeFeedNavigation
        displayName={displayName}
        initials={initials}
        isAuthenticated={!!session?.user}
      >
        {children}
      </HomeFeedNavigation>
    </main>
  );
}
