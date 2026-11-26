'use client';

import Link from 'next/link';
import { Mountain } from '@boxicons/react';

import { CommunityHikeCard } from '@/features/home/feed/components/community-hike-card';
import { useUpcomingHikes } from '@/features/hikes/api/hikes.hooks';

export function HomeFeedHikes() {
  const hikesQuery = useUpcomingHikes(0, 6);
  const hikes = hikesQuery.data?.content ?? [];

  return (
    <section aria-labelledby="community-hikes-heading" className="mt-6">
      <div className="mb-3 flex items-center justify-between gap-3 px-1">
        <div>
          <h2
            id="community-hikes-heading"
            className="text-base font-semibold tracking-tight text-[#263d33] dark:text-[#edf4ef]"
          >
            Upcoming hikes
          </h2>
          <p className="mt-0.5 text-[10px] text-[#89968e] dark:text-white/50">
            Plans shared by your hiking community
          </p>
        </div>
        <Link
          href="/discover"
          className="shrink-0 rounded-sm text-xs font-semibold text-[#1d604c] hover:text-[#a77845] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d604c] dark:text-[#b9d8c2] dark:hover:text-[#e8bd78]"
        >
          Browse all
        </Link>
      </div>

      {hikesQuery.isLoading ? (
        <div className="space-y-4" role="status" aria-label="Loading upcoming hikes">
          {[0, 1].map((item) => (
            <div
              key={item}
              className="dapyo-card-elevation overflow-hidden rounded-[8px] bg-white ring-1 ring-[#17342e]/[0.06] dark:bg-[#17342e] dark:ring-white/[0.08]"
            >
              <div className="h-36 animate-pulse bg-[#e5ece4] dark:bg-white/[0.05]" />
              <div className="space-y-3 p-4">
                <div className="h-4 w-2/5 animate-pulse rounded bg-[#e5ece4] dark:bg-white/[0.05]" />
                <div className="h-3 w-4/5 animate-pulse rounded bg-[#eef2ed] dark:bg-white/[0.04]" />
                <div className="h-10 animate-pulse rounded bg-[#eef2ed] dark:bg-white/[0.04]" />
              </div>
            </div>
          ))}
        </div>
      ) : hikesQuery.isError ? (
        <div className="dapyo-card-elevation rounded-[8px] bg-white p-6 text-center dark:bg-[#17342e]">
          <p role="alert" className="text-sm font-medium text-[#8c3727] dark:text-[#ffb7a8]">
            Community hikes couldn’t be loaded right now.
          </p>
          <button
            type="button"
            onClick={() => void hikesQuery.refetch()}
            className="mt-3 rounded-sm text-xs font-semibold text-[#1d604c] underline underline-offset-2 dark:text-[#b9d8c2]"
          >
            Try again
          </button>
        </div>
      ) : hikes.length ? (
        <div className="space-y-4">
          {hikes.map((hike) => (
            <CommunityHikeCard key={hike.id} hike={hike} />
          ))}
        </div>
      ) : (
        <div className="dapyo-card-elevation rounded-[8px] bg-white px-6 py-10 text-center dark:bg-[#17342e]">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-[#edf5ee] text-[#1d604c] dark:bg-white/[0.07] dark:text-[#b9d8c2]">
            <Mountain pack="filled" className="size-5" aria-hidden="true" />
          </span>
          <h3 className="mt-3 text-sm font-semibold text-[#203a2e] dark:text-[#edf4ef]">
            No upcoming hikes yet
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-[#718176] dark:text-white/55">
            Organize a hike and it will show up here with its meeting place, schedule, group, and
            details.
          </p>
        </div>
      )}
    </section>
  );
}
