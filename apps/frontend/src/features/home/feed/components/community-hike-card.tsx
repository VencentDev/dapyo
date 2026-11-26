'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import {
  Calendar as CalendarIcon,
  DotsVertical,
  EditAlt,
  Footsteps,
  Globe,
  LocationPin,
  Lock,
  Mountain,
  Trash,
  UserPlus,
  X,
} from '@boxicons/react';

import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CommunityHikeCardActions } from '@/features/home/feed/components/community-hike-card-actions';
import { useHike, type HikeSummary } from '@/features/hikes/api/hikes.hooks';
import { apiUrl } from '@/lib/api';

type HikerAvatar = {
  id: string;
  name: string;
  avatarUrl?: string | null;
};

export function CommunityHikeCard({ hike: summary }: { hike: HikeSummary }) {
  const hikeQuery = useHike(summary.id);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const hike = hikeQuery.data;
  const hasOpenPlaces = summary.availablePlaces > 0;
  const totalGoing = 1 + summary.joinedMemberCount + summary.externalGuestCount;
  const featuredImage = hike?.images[0];
  const guestNames = hike?.externalGuestNames ?? [];
  const unnamedGuestCount = Math.max(0, (hike?.externalGuestCount ?? 0) - guestNames.length);
  const isOrganizer = hike?.currentUserStatus === 'HOST';
  const hikers = hike
    ? ([
        {
          id: hike.organizer.id,
          name: hike.organizer.displayName || 'Organizer',
          avatarUrl: hike.organizer.avatarUrl,
        },
        ...hike.participants.map((person) => ({
          id: person.userId,
          name: person.displayName || 'DAPYO hiker',
          avatarUrl: person.avatarUrl,
        })),
        ...guestNames.map((name, index) => ({
          id: `guest-${index}-${name}`,
          name,
        })),
        ...(unnamedGuestCount > 0
          ? [
              {
                id: 'unnamed-guests',
                name: `${unnamedGuestCount} unnamed ${unnamedGuestCount === 1 ? 'guest' : 'guests'}`,
              },
            ]
          : []),
      ] satisfies HikerAvatar[])
    : [];
  const visibleHikers = hikers.slice(0, 2);
  const hiddenHikers = hikers.slice(2);

  return (
    <article className="dapyo-card-elevation overflow-hidden rounded-[8px] bg-white ring-1 ring-[#17342e]/[0.06] dark:bg-[#17342e] dark:ring-white/[0.08]">
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#dce9df] text-sm font-bold text-[#1d604c] dark:bg-white/10 dark:text-[#dfece3]">
            {getInitials(
              hike?.organizer.displayName || summary.organizer.displayName || 'DAPYO hiker',
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-[#354b3e] dark:text-white/85">
              {hike?.organizer.displayName || summary.organizer.displayName || 'DAPYO hiker'}
              <span className="ml-1 font-normal text-[#87948c] dark:text-white/50">
                is organizing
              </span>
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#eaf3eb] px-2.5 py-1 text-[10px] font-semibold text-[#1d604c] dark:bg-[#264536] dark:text-[#cde5d3]">
                {summary.admissionMode === 'OPEN' ? (
                  <Globe
                    pack="filled"
                    className="size-3 text-[#1d604c] dark:text-[#cde5d3]"
                    aria-hidden="true"
                  />
                ) : (
                  <Lock
                    pack="filled"
                    className="size-3 text-[#1d604c] dark:text-[#cde5d3]"
                    aria-hidden="true"
                  />
                )}
                {summary.admissionMode === 'OPEN' ? 'Anyone can join' : 'Approval required'}
              </span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${hasOpenPlaces ? 'bg-[#eaf3eb] text-[#1d604c] dark:bg-[#264536] dark:text-[#cde5d3]' : 'bg-[#f7ece8] text-[#984a35] dark:bg-[#4b3028] dark:text-[#ffc1b1]'}`}
            >
              {hasOpenPlaces ? `${summary.availablePlaces} places left` : 'Full'}
            </span>
            {isOrganizer && <OrganizerMenu />}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <span className="grid size-12 shrink-0 place-items-center rounded-[14px] bg-[#eaf3eb] text-[#1d604c] dark:bg-white/[0.08] dark:text-[#cde5d3]">
            <Mountain pack="filled" className="size-6" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-[#1d604c] dark:text-[#cde5d3]">
              <Link
                href={`/hikes/${summary.id}`}
                className="rounded-sm hover:text-[#174c3d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d604c] dark:hover:text-white"
              >
                {summary.mountainName}
              </Link>
            </h2>
            <p className="mt-1 flex min-w-0 items-start gap-1.5 text-[10px] leading-4 text-[#718176] dark:text-white/55">
              <LocationPin
                pack="filled"
                className="mt-0.5 size-3.5 shrink-0 text-[#1d604c] dark:text-[#cde5d3]"
                aria-hidden="true"
              />
              <span className="min-w-0 break-words">
                <span className="font-semibold text-[#1d604c] dark:text-[#cde5d3]">
                  Meeting place:
                </span>{' '}
                {summary.locationName}
              </span>
            </p>
          </div>
        </div>

        {hike ? (
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#586b60] dark:text-white/70">
            {hike.description}
          </p>
        ) : hikeQuery.isError ? (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#8c3727] dark:text-[#ffb7a8]">
            <span>Some hike details couldn’t be loaded.</span>
            <button
              type="button"
              onClick={() => void hikeQuery.refetch()}
              className="font-semibold underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        ) : (
          <p
            className="mt-3 h-10 animate-pulse rounded bg-[#f3f6f2] dark:bg-white/[0.06]"
            aria-label="Loading hike description"
          />
        )}
      </div>

      {featuredImage ? (
        <button
          type="button"
          onClick={() => setIsImageViewerOpen(true)}
          aria-label={`View full image from ${summary.mountainName}`}
          className="group relative block h-[320px] w-full cursor-zoom-in overflow-hidden bg-[#e2eae1] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1d604c] sm:h-[380px] dark:bg-[#10231f]"
        >
          <Image
            src={apiUrl(featuredImage.url)}
            alt={`Hike photo from ${summary.mountainName}`}
            fill
            unoptimized
            sizes="(min-width: 1280px) 640px, (min-width: 768px) 70vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
          <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1.5 text-[10px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            View full image
          </span>
        </button>
      ) : (
        <div className="grid h-[320px] place-items-center bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.5),_transparent_58%),linear-gradient(145deg,_#e8f0e8,_#cfded2)] text-[#1d604c] sm:h-[380px] dark:bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_58%),linear-gradient(145deg,_#1d3a30,_#10231f)] dark:text-[#b9d8c2]">
          <Mountain pack="filled" className="size-10 opacity-80" aria-hidden="true" />
        </div>
      )}

      <div className="p-4 sm:p-5">
        <dl className="grid grid-cols-[1.1fr_0.75fr_1.2fr_1fr] items-center gap-x-2 border-y border-[#edf0ec] py-3 text-xs dark:border-white/10">
          <HikeDetail icon={CalendarIcon} label="Schedule">
            {formatDate(summary.scheduledDate)}
          </HikeDetail>
          <HikeDetail icon={UserPlus} label="Group size">
            {totalGoing} / {summary.maxParticipants}
          </HikeDetail>
          <DifficultySummary
            rating={summary.difficultyRating}
            label={formatDifficulty(summary.difficulty)}
          />
          <WhoGoingSummary hikers={visibleHikers} hiddenHikers={hiddenHikers} />
        </dl>

        {hike?.requirements && (
          <div className="mt-4 rounded-[8px] bg-[#f6f8f5] p-3 dark:bg-white/[0.05]">
            <h3 className="text-[10px] font-semibold uppercase tracking-wide text-[#52675a] dark:text-white/70">
              What to bring or know
            </h3>
            <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-[#586b60] dark:text-white/65">
              {hike.requirements}
            </p>
          </div>
        )}

        <CommunityHikeCardActions
          hikeId={summary.id}
          status={hike?.currentUserStatus}
          admissionMode={summary.admissionMode}
          hasOpenPlaces={hasOpenPlaces}
          isReady={Boolean(hike)}
        />
      </div>

      {featuredImage && (
        <Dialog open={isImageViewerOpen} onOpenChange={setIsImageViewerOpen}>
          <DialogContent
            showCloseButton={false}
            className="w-[calc(100%-1.5rem)] max-w-6xl border-0 bg-black p-2 sm:p-3"
          >
            <DialogTitle className="sr-only">{summary.mountainName} hike image</DialogTitle>
            <DialogClose asChild>
              <button
                type="button"
                aria-label="Close full image"
                className="absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <X pack="filled" className="size-4" aria-hidden="true" />
              </button>
            </DialogClose>
            <div className="relative h-[78svh] w-full">
              <Image
                src={apiUrl(featuredImage.url)}
                alt={`Full-size hike photo from ${summary.mountainName}`}
                fill
                unoptimized
                sizes="100vw"
                className="object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </article>
  );
}

function HikeDetail({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof CalendarIcon;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <dt className="flex items-center gap-1.5 text-[10px] text-[#87948c] dark:text-white/50">
        <Icon
          pack="filled"
          className="size-3 shrink-0 text-[#1d604c] dark:text-[#cde5d3]"
          aria-hidden="true"
        />
        {label}
      </dt>
      <dd className="mt-1 truncate font-semibold text-[#354b3e] dark:text-white/80">{children}</dd>
    </div>
  );
}

function DifficultySummary({ rating, label }: { rating: number; label: string }) {
  const footCount = Number.isInteger(rating) ? Math.min(5, Math.max(1, rating)) : 3;

  return (
    <div className="min-w-0">
      <dt className="text-[10px] text-[#87948c] dark:text-white/50">Difficulty</dt>
      <dd
        role="img"
        aria-label={`${label}, difficulty ${footCount} out of 5`}
        className="mt-1 flex min-w-0 items-center gap-1"
        title={`${label} · ${footCount} out of 5`}
      >
        <span className="inline-flex shrink-0 items-center gap-px">
          {Array.from({ length: footCount }, (_, index) => (
            <Footsteps
              key={index}
              pack="filled"
              className="size-[11px] text-[#1d604c] dark:text-[#cde5d3]"
              aria-hidden="true"
            />
          ))}
        </span>
        <span className="truncate text-[10px] font-semibold text-[#354b3e] dark:text-white/80">
          {label}
        </span>
      </dd>
    </div>
  );
}

function WhoGoingSummary({
  hikers,
  hiddenHikers,
}: {
  hikers: HikerAvatar[];
  hiddenHikers: HikerAvatar[];
}) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] text-[#87948c] dark:text-white/50">Who’s going</dt>
      <dd className="mt-1 flex h-8 items-center">
        <div className="flex items-center -space-x-1.5 sm:-space-x-2">
          {hikers.map((person) => (
            <HikerAvatar key={person.id} person={person} />
          ))}
          {hiddenHikers.length > 0 && (
            <span
              title={hiddenHikers.map((person) => person.name).join(', ')}
              aria-label={`${hiddenHikers.length} more hikers: ${hiddenHikers.map((person) => person.name).join(', ')}`}
              className="relative grid size-6 place-items-center rounded-full border-2 border-white bg-[#eaf3eb] text-[9px] font-semibold text-[#1d604c] dark:border-[#17342e] dark:bg-[#31533f] dark:text-[#d1e2d6] sm:size-8 sm:text-[10px]"
            >
              +{hiddenHikers.length}
            </span>
          )}
        </div>
      </dd>
    </div>
  );
}

function HikerAvatar({ person }: { person: HikerAvatar }) {
  return (
    <span
      role="img"
      aria-label={person.name}
      title={person.name}
      className="relative grid size-6 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-white bg-[#dce9df] text-[9px] font-bold text-[#1d604c] dark:border-[#17342e] dark:bg-white/10 dark:text-[#dfece3] sm:size-8 sm:text-[10px]"
    >
      {person.avatarUrl ? (
        <Image
          src={person.avatarUrl}
          alt=""
          fill
          sizes="(min-width: 640px) 32px, 24px"
          unoptimized
          className="object-cover"
        />
      ) : (
        getInitials(person.name)
      )}
    </span>
  );
}

function OrganizerMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Hike post options"
          className="grid size-8 place-items-center rounded-full text-[#1d604c] transition-colors hover:bg-[#eaf3eb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d604c]/30 dark:text-[#cde5d3] dark:hover:bg-white/[0.08]"
        >
          <DotsVertical pack="filled" className="size-4" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 border-[#dce5dc] dark:border-white/10">
        <DropdownMenuItem className="gap-2 text-[#1d604c] focus:bg-[#eaf3eb] focus:text-[#1d604c] dark:text-[#cde5d3] dark:focus:bg-white/[0.08]">
          <EditAlt pack="filled" className="size-4" aria-hidden="true" />
          Edit post
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 text-[#a43f2d] focus:bg-[#fff1ed] focus:text-[#a43f2d] dark:text-[#ffb7a8] dark:focus:bg-white/[0.08]">
          <Trash
            pack="filled"
            className="size-4 text-[#1d604c] dark:text-[#cde5d3]"
            aria-hidden="true"
          />
          Delete post
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function getInitials(value: string) {
  return (
    value
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'H'
  );
}

function formatDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
    new Date(year, month - 1, day),
  );
}

function formatDifficulty(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase();
}
