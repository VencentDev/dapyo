import { Heart, MapPin, Mountain } from 'lucide-react';

import { HikeOrganizerLauncher } from '@/features/hikes/create/components/hike-organizer-launcher';
import { ActivityFeedPost } from '@/features/home/feed/components/activity-feed-post';
import { HomeFeedNavigation } from '@/features/home/feed/components/home-feed-navigation';
import { HomeFeedSearch } from '@/features/home/feed/components/home-feed-search';
import { HomeFeedSidebar } from '@/features/home/feed/components/home-feed-sidebar';
import { sampleActivities } from '@/features/home/feed/lib/home-feed-preview';

export function HomeFeedContent({ displayName }: { displayName: string }) {
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
      <HomeFeedNavigation displayName={displayName} initials={initials}>
        <section
          id="feed"
          className="min-w-0 scroll-mt-24"
          aria-label="Community search and updates"
        >
          <div className="relative z-20 mb-5">
            <HomeFeedSearch />
          </div>

          <section
            id="community"
            className="dapyo-card-elevation mb-5 rounded-[8px] bg-white p-4 ring-1 ring-[#17342e]/[0.06] dark:bg-[#17342e] dark:ring-white/[0.08] sm:p-5"
            aria-label="Share a hiking update"
          >
            <div className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#dce9df] text-sm font-bold text-[#1d604c] dark:bg-white/10 dark:text-[#dfece3]">
                {initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#233a31] dark:text-white">
                  Share a trail moment
                </p>
                <p className="mt-0.5 text-xs text-[#87948c] dark:text-white/55">
                  Activity sharing will appear here when it is connected.
                </p>
              </div>
              <HikeOrganizerLauncher />
            </div>
            <div className="mt-4 flex flex-wrap gap-2 border-t border-[#edf0ec] pt-3 dark:border-white/10">
              <span className="inline-flex items-center gap-2 rounded-lg bg-[#f5f7f4] px-3 py-2 text-xs text-[#75847b] dark:bg-white/[0.06] dark:text-white/70">
                <Mountain className="size-3.5 text-[#a77845]" aria-hidden="true" />
                Hike recap
              </span>
              <span className="inline-flex items-center gap-2 rounded-lg bg-[#f5f7f4] px-3 py-2 text-xs text-[#75847b] dark:bg-white/[0.06] dark:text-white/70">
                <MapPin className="size-3.5 text-[#a77845]" aria-hidden="true" />
                Trail note
              </span>
              <span className="ml-auto hidden items-center gap-1.5 text-[10px] text-[#9aa59e] dark:text-white/45 sm:inline-flex">
                <Heart className="size-3" aria-hidden="true" /> You choose what to share
              </span>
            </div>
          </section>

          <div className="mb-3 flex items-center justify-between px-1">
            <h2 className="text-base font-semibold tracking-tight text-[#263d33] dark:text-[#edf4ef]">
              From the trail
            </h2>
            <span className="text-[10px] text-[#89968e] dark:text-white/50">
              Sample community updates
            </span>
          </div>
          <div className="space-y-4">
            {sampleActivities.map((post) => (
              <ActivityFeedPost key={post.author} post={post} />
            ))}
          </div>
          <p className="mt-4 px-1 text-[10px] leading-5 text-[#98a39c] dark:text-white/40">
            Feed examples are design previews. Real activity appears only when someone chooses to
            share it.
          </p>
        </section>

        <div className="lg:col-start-2 xl:col-auto">
          <HomeFeedSidebar displayName={displayName} initials={initials} />
        </div>
      </HomeFeedNavigation>
    </main>
  );
}
