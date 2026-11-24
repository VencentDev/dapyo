'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Compass,
  MapPin,
  Mountain,
  Ruler,
  ShieldCheck,
  UsersRound,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useUpcomingHikes } from '@/features/hikes/api/hikes.hooks';

export function HikeDiscoveryPageContent() {
  const [page, setPage] = useState(0);
  const hikesQuery = useUpcomingHikes(page, 12);
  const data = hikesQuery.data;

  return (
    <section className="min-w-0 space-y-5 xl:col-span-2" aria-labelledby="discover-hikes-heading">
      <header className="dapyo-card-elevation rounded-[8px] bg-white p-6 ring-1 ring-[#17342e]/[0.06] dark:bg-[#17342e] dark:ring-white/[0.08] sm:p-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#9a7548] dark:text-[#e8bd78]">
          Find your next trail crew
        </p>
        <h1
          id="discover-hikes-heading"
          className="mt-2 text-2xl font-semibold tracking-tight text-[#17342e] dark:text-[#edf4ef]"
        >
          Upcoming hikes
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#586b60] dark:text-white/70">
          Explore public plans, see who’s going, and join a hike that fits your pace.
        </p>
      </header>

      {hikesQuery.isLoading ? (
        <div
          className="dapyo-card-elevation rounded-[8px] bg-white p-8 text-center text-sm text-[#65776c] dark:bg-[#17342e] dark:text-white/60"
          role="status"
        >
          Loading upcoming hikes…
        </div>
      ) : hikesQuery.isError ? (
        <div className="dapyo-card-elevation rounded-[8px] bg-white p-8 text-center dark:bg-[#17342e]">
          <p role="alert" className="text-sm font-medium text-[#8c3727] dark:text-[#ffb7a8]">
            Upcoming hikes couldn’t be loaded right now.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={() => void hikesQuery.refetch()}
          >
            Try again
          </Button>
        </div>
      ) : data?.content.length ? (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {data.content.map((hike) => (
              <article
                key={hike.id}
                className="dapyo-card-elevation flex min-h-[250px] flex-col rounded-[8px] bg-white p-5 ring-1 ring-[#17342e]/[0.06] dark:bg-[#17342e] dark:ring-white/[0.08]"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-[8px] bg-[#edf5ee] text-[#1d604c] dark:bg-white/[0.07] dark:text-[#b9d8c2]">
                    <Compass className="size-5" aria-hidden="true" />
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${hike.availablePlaces > 0 ? 'bg-[#edf5ee] text-[#31533f] dark:bg-[#264536] dark:text-[#cde5d3]' : 'bg-[#f7ece8] text-[#984a35] dark:bg-[#4b3028] dark:text-[#ffc1b1]'}`}
                  >
                    {hike.availablePlaces > 0 ? `${hike.availablePlaces} places left` : 'Full'}
                  </span>
                </div>
                <h2 className="mt-4 text-lg font-semibold text-[#203a2e] dark:text-[#edf4ef]">
                  <Link
                    href={`/hikes/${hike.id}`}
                    className="rounded-sm hover:text-[#1d604c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d604c] dark:hover:text-[#b9d8c2]"
                  >
                    {hike.mountainName}
                  </Link>
                </h2>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-[#718176] dark:text-white/55">
                  <MapPin className="size-3.5 text-[#a77845]" aria-hidden="true" />
                  {hike.locationName}
                </p>
                <p className="mt-1 text-[11px] text-[#718176] dark:text-white/55">
                  Organized by {hike.organizer.displayName || 'DAPYO hiker'}
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-[#586b60] dark:text-white/65">
                  <span className="flex items-center gap-2">
                    <CalendarDays className="size-3.5 text-[#a77845]" aria-hidden="true" />
                    {formatDate(hike.scheduledStartAt)}
                  </span>
                  <span className="flex items-center gap-2">
                    <Ruler className="size-3.5 text-[#a77845]" aria-hidden="true" />
                    {hike.distanceKm ? `${hike.distanceKm} km` : 'Distance not set'}
                  </span>
                  <span className="flex items-center gap-2">
                    <UsersRound className="size-3.5 text-[#a77845]" aria-hidden="true" />
                    {1 + hike.joinedMemberCount + hike.externalGuestCount}/{hike.maxParticipants}{' '}
                    going
                  </span>
                  <span className="flex items-center gap-2">
                    <Mountain className="size-3.5 text-[#a77845]" aria-hidden="true" />
                    {formatDifficulty(hike.difficulty)}
                  </span>
                  <span className="col-span-full flex items-center gap-2">
                    <ShieldCheck className="size-3.5 text-[#a77845]" aria-hidden="true" />
                    {hike.admissionMode === 'OPEN' ? 'Open to join' : 'Organizer approval'}
                  </span>
                </div>
                <Link
                  href={`/hikes/${hike.id}`}
                  className="mt-auto inline-flex min-h-10 items-center justify-center gap-2 rounded-[8px] bg-[#1d604c] px-4 pt-3 text-xs font-semibold text-white transition-colors hover:bg-[#174c3d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8bd78]"
                >
                  View hike <ChevronRight className="size-4" aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
          <nav
            aria-label="Upcoming hike pages"
            className="dapyo-card-elevation flex items-center justify-between rounded-[8px] bg-white px-4 py-3 dark:bg-[#17342e]"
          >
            <span className="text-xs text-[#718176] dark:text-white/55">
              Page {data.page + 1} of {Math.max(1, data.totalPages)}
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 0}
                onClick={() => setPage((current) => Math.max(0, current - 1))}
              >
                <ChevronLeft className="mr-1 size-4" aria-hidden="true" /> Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page + 1 >= data.totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                Next <ChevronRight className="ml-1 size-4" aria-hidden="true" />
              </Button>
            </div>
          </nav>
        </>
      ) : (
        <div className="dapyo-card-elevation rounded-[8px] bg-white px-6 py-12 text-center dark:bg-[#17342e]">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-[#edf5ee] text-[#1d604c] dark:bg-white/[0.07] dark:text-[#b9d8c2]">
            <Compass className="size-5" aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-base font-semibold text-[#203a2e] dark:text-[#edf4ef]">
            No upcoming hikes yet
          </h2>
          <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-[#718176] dark:text-white/55">
            Check back soon or organize the first hike for your trail crew.
          </p>
        </div>
      )}
    </section>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value),
  );
}

function formatDifficulty(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase();
}
