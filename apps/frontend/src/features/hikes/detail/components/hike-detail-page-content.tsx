'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  AlertCircle,
  CalendarDays,
  Check,
  ChevronLeft,
  Clock3,
  MapPin,
  Mountain,
  Ruler,
  ShieldCheck,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useSession } from 'next-auth/react';

import { Button } from '@/components/ui/button';
import {
  useAddHikeTrailmate,
  useHike,
  useHikeJoinRequests,
  useJoinHike,
  useRespondToHikeJoinRequest,
  useUpdateHikeGuests,
} from '@/features/hikes/api/hikes.hooks';
import { useTrailmates } from '@/features/trailmates/api/trailmates.hooks';
import { ApiError, apiUrl } from '@/lib/api';

export function HikeDetailPageContent({ hikeId }: { hikeId: string }) {
  const { status: sessionStatus } = useSession();
  const hikeQuery = useHike(hikeId);
  const hike = hikeQuery.data;
  const isHost = hike?.currentUserStatus === 'HOST';
  const requestsQuery = useHikeJoinRequests(hikeId, isHost);
  const trailmatesQuery = useTrailmates(isHost);
  const joinHike = useJoinHike();
  const respondToRequest = useRespondToHikeJoinRequest();
  const addTrailmate = useAddHikeTrailmate();
  const updateGuests = useUpdateHikeGuests();
  const [guestCount, setGuestCount] = useState('0');
  const [selectedTrailmate, setSelectedTrailmate] = useState('');
  const [actionError, setActionError] = useState<string>();

  useEffect(() => {
    if (hike) setGuestCount(String(hike.externalGuestCount));
  }, [hike?.externalGuestCount, hike]);

  if (hikeQuery.isLoading) {
    return (
      <div
        className="dapyo-card-elevation min-w-0 rounded-[8px] bg-white p-8 text-center text-sm text-[#65776c] dark:bg-[#17342e] dark:text-white/60"
        role="status"
      >
        Loading hike…
      </div>
    );
  }
  if (hikeQuery.isError || !hike) {
    return (
      <section className="dapyo-card-elevation min-w-0 rounded-[8px] bg-white p-8 text-center dark:bg-[#17342e]">
        <p role="alert" className="text-sm font-medium text-[#8c3727] dark:text-[#ffb7a8]">
          This hike could not be loaded.
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <Button type="button" variant="outline" onClick={() => void hikeQuery.refetch()}>
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link href="/discover">Browse hikes</Link>
          </Button>
        </div>
      </section>
    );
  }

  const currentStatus = hike.currentUserStatus;
  const callbackPath = `/hikes/${hike.id}`;
  const canJoin = currentStatus === 'NOT_JOINED' && hike.availablePlaces > 0;
  const memberIds = new Set([
    hike.organizer.id,
    ...hike.participants.map((member) => member.userId),
  ]);
  const availableTrailmates = (trailmatesQuery.data ?? []).filter(
    (person) => !memberIds.has(person.userId),
  );
  const guestCountValue = Number(guestCount);
  const guestCountValid = Number.isInteger(guestCountValue) && guestCountValue >= 0;
  const hostIsBusy = respondToRequest.isPending || addTrailmate.isPending || updateGuests.isPending;

  const join = async () => {
    setActionError(undefined);
    try {
      await joinHike.mutateAsync(hike.id);
    } catch (error) {
      setActionError(messageForApiError(error, 'Could not join this hike. Please try again.'));
    }
  };

  const respond = async (userId: string, action: 'accept' | 'decline') => {
    setActionError(undefined);
    try {
      await respondToRequest.mutateAsync({ hikeId: hike.id, userId, action });
    } catch (error) {
      setActionError(messageForApiError(error, 'Could not update this join request.'));
    }
  };

  const addMember = async () => {
    if (!selectedTrailmate) return;
    setActionError(undefined);
    try {
      await addTrailmate.mutateAsync({ hikeId: hike.id, userId: selectedTrailmate });
      setSelectedTrailmate('');
    } catch (error) {
      setActionError(messageForApiError(error, 'Could not add this Trailmate.'));
    }
  };

  const saveGuests = async () => {
    if (!guestCountValid) return;
    setActionError(undefined);
    try {
      await updateGuests.mutateAsync({ hikeId: hike.id, externalGuestCount: guestCountValue });
    } catch (error) {
      setActionError(
        messageForApiError(
          error,
          'Could not update the guest count. Check the remaining capacity.',
        ),
      );
    }
  };

  const signInHref = `/login?callbackUrl=${encodeURIComponent(callbackPath)}`;
  const fullGroupSize = 1 + hike.joinedMemberCount + hike.externalGuestCount;

  return (
    <section className="min-w-0 space-y-5 xl:col-span-2" aria-labelledby="hike-title">
      <Link
        href="/discover"
        className="inline-flex items-center gap-1 text-xs font-semibold text-[#1d604c] hover:text-[#a77845] dark:text-[#b9d8c2] dark:hover:text-[#e8bd78]"
      >
        <ChevronLeft className="size-4" aria-hidden="true" /> Upcoming hikes
      </Link>

      <article className="dapyo-card-elevation overflow-hidden rounded-[8px] bg-white ring-1 ring-[#17342e]/[0.06] dark:bg-[#17342e] dark:ring-white/[0.08]">
        {hike.images.length > 0 && (
          <div className="grid max-h-[420px] grid-cols-2 gap-1 overflow-hidden sm:grid-cols-3">
            {hike.images.slice(0, 5).map((image) => (
              <figure
                key={image.imageId}
                className="relative min-h-36 bg-[#e8eee8] dark:bg-[#10231f] sm:min-h-48"
              >
                <img
                  src={apiUrl(image.url)}
                  alt={image.caption || `Photo of ${hike.mountainName}`}
                  className="h-full w-full object-cover"
                />
                {image.caption && (
                  <figcaption className="absolute inset-x-0 bottom-0 bg-black/55 px-3 py-2 text-xs text-white">
                    {image.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        )}
        <div className="p-5 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#9a7548] dark:text-[#e8bd78]">
                Community hike
              </p>
              <h1
                id="hike-title"
                className="mt-2 text-2xl font-semibold tracking-tight text-[#17342e] dark:text-[#edf4ef] sm:text-3xl"
              >
                {hike.mountainName}
              </h1>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-[#718176] dark:text-white/55">
                <MapPin className="size-3.5 text-[#a77845]" aria-hidden="true" />
                {hike.locationName}
              </p>
              <p className="mt-2 text-sm text-[#586b60] dark:text-white/65">
                Organized by{' '}
                <span className="font-semibold text-[#354b3e] dark:text-white/85">
                  {hike.organizer.displayName || 'DAPYO hiker'}
                </span>
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${hike.availablePlaces > 0 ? 'bg-[#edf5ee] text-[#31533f] dark:bg-[#264536] dark:text-[#cde5d3]' : 'bg-[#f7ece8] text-[#984a35] dark:bg-[#4b3028] dark:text-[#ffc1b1]'}`}
            >
              {hike.availablePlaces > 0 ? `${hike.availablePlaces} places left` : 'Group is full'}
            </span>
          </div>

          <div className="mt-6 grid gap-3 border-y border-[#edf0ec] py-5 dark:border-white/10 sm:grid-cols-2">
            <Info icon={CalendarDays} label="Date">
              {formatDate(hike.scheduledStartAt)}
            </Info>
            <Info icon={Clock3} label="Start time">
              {formatTime(hike.scheduledStartAt)}
            </Info>
            <Info icon={Mountain} label="Difficulty">
              {formatDifficulty(hike.difficulty)}
            </Info>
            {hike.distanceKm != null && (
              <Info icon={Ruler} label="Distance">
                {hike.distanceKm} km
              </Info>
            )}
            <Info icon={MapPin} label="Meeting point">
              {Number(hike.latitude).toFixed(5)}, {Number(hike.longitude).toFixed(5)}
            </Info>
            <Info icon={UsersRound} label="Group size">
              {fullGroupSize} going · {hike.maxParticipants} maximum
            </Info>
            <Info icon={ShieldCheck} label="Joining">
              {hike.admissionMode === 'OPEN'
                ? 'Open while places remain'
                : 'Organizer approves requests'}
            </Info>
          </div>

          <section className="mt-6">
            <h2 className="text-sm font-semibold text-[#203a2e] dark:text-white/90">
              About this hike
            </h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#586b60] dark:text-white/70">
              {hike.description}
            </p>
            {hike.requirements && (
              <div className="mt-4 rounded-[8px] bg-[#f6f8f5] p-4 dark:bg-white/[0.05]">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-[#52675a] dark:text-white/70">
                  What to bring or know
                </h3>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[#586b60] dark:text-white/65">
                  {hike.requirements}
                </p>
              </div>
            )}
          </section>

          <section className="mt-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-[#203a2e] dark:text-white/90">
                Who’s going
              </h2>
              <span className="text-xs text-[#718176] dark:text-white/50">
                {hike.joinedMemberCount + 1} DAPYO members · {hike.externalGuestCount} guests
                without accounts
              </span>
            </div>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              <PersonCard
                id={hike.organizer.id}
                displayName={hike.organizer.displayName}
                label="Organizer"
              />
              {hike.participants.map((person) => (
                <PersonCard
                  key={person.userId}
                  id={person.userId}
                  displayName={person.displayName}
                />
              ))}
            </ul>
          </section>

          <div className="mt-7 border-t border-[#edf0ec] pt-5 dark:border-white/10">
            {currentStatus === 'HOST' ? (
              <div className="flex items-center gap-2 rounded-[8px] bg-[#edf5ee] px-4 py-3 text-sm font-semibold text-[#31533f] dark:bg-white/[0.06] dark:text-[#d7e7da]">
                <Check className="size-4" aria-hidden="true" /> You’re organizing this hike.
              </div>
            ) : currentStatus === 'JOINED' ? (
              <div className="flex items-center gap-2 rounded-[8px] bg-[#edf5ee] px-4 py-3 text-sm font-semibold text-[#31533f] dark:bg-white/[0.06] dark:text-[#d7e7da]">
                <Check className="size-4" aria-hidden="true" /> You’re going on this hike.
              </div>
            ) : currentStatus === 'PENDING' ? (
              <div className="rounded-[8px] bg-[#f7f2e8] px-4 py-3 text-sm font-semibold text-[#815b2e] dark:bg-[#433626] dark:text-[#f0cc90]">
                Your request is waiting for the organizer.
              </div>
            ) : currentStatus === 'NOT_JOINED' && sessionStatus === 'authenticated' ? (
              <Button
                type="button"
                className="w-full bg-[#1d604c] text-white hover:bg-[#174c3d] sm:w-auto"
                disabled={!canJoin || joinHike.isPending}
                onClick={() => void join()}
              >
                {joinHike.isPending
                  ? 'Sending…'
                  : hike.admissionMode === 'OPEN'
                    ? 'Join this hike'
                    : 'Request to join'}
              </Button>
            ) : sessionStatus !== 'authenticated' ? (
              <Button
                asChild
                className="w-full bg-[#1d604c] text-white hover:bg-[#174c3d] sm:w-auto"
              >
                <Link href={signInHref}>Sign in to join</Link>
              </Button>
            ) : null}
            {hike.availablePlaces <= 0 && currentStatus === 'NOT_JOINED' && (
              <p className="mt-2 text-xs text-[#984a35] dark:text-[#ffc1b1]">
                This group has no open places right now.
              </p>
            )}
          </div>
        </div>
      </article>

      {actionError && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-[8px] border border-[#e5b7a6] bg-[#fff4ee] p-3 text-sm text-[#8c3727] dark:border-[#825344] dark:bg-[#402a23] dark:text-[#ffc1b1]"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {actionError}
        </p>
      )}

      {isHost && (
        <section
          className="dapyo-card-elevation space-y-5 rounded-[8px] bg-white p-5 ring-1 ring-[#17342e]/[0.06] dark:bg-[#17342e] dark:ring-white/[0.08] sm:p-6"
          aria-labelledby="organizer-tools-heading"
        >
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#9a7548] dark:text-[#e8bd78]">
              Organizer tools
            </p>
            <h2
              id="organizer-tools-heading"
              className="mt-1 text-lg font-semibold text-[#203a2e] dark:text-white/90"
            >
              Manage your group
            </h2>
          </div>

          {hike.admissionMode === 'APPROVAL' && (
            <section className="border-t border-[#edf0ec] pt-4 dark:border-white/10">
              <h3 className="text-sm font-semibold text-[#354b3e] dark:text-white/85">
                Join requests
              </h3>
              {requestsQuery.isLoading ? (
                <p className="mt-2 text-xs text-[#718176] dark:text-white/50">Loading requests…</p>
              ) : requestsQuery.isError ? (
                <p role="alert" className="mt-2 text-xs text-[#a43f2d] dark:text-[#ffb7a8]">
                  Could not load join requests.
                </p>
              ) : requestsQuery.data?.length ? (
                <ul className="mt-3 divide-y divide-[#edf0ec] dark:divide-white/10">
                  {requestsQuery.data.map((request) => (
                    <li
                      key={request.userId}
                      className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <span className="grid size-9 place-items-center rounded-full bg-[#e5ede6] text-xs font-bold text-[#1d604c] dark:bg-white/10 dark:text-[#cde5d3]">
                        {(request.displayName || 'H').trim().charAt(0).toUpperCase()}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-[#354b3e] dark:text-white/80">
                          {request.displayName || 'DAPYO hiker'}
                        </span>
                        <span className="text-[10px] text-[#718176] dark:text-white/50">
                          Requested {formatDate(request.requestedAt)}
                        </span>
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        disabled={hostIsBusy || hike.availablePlaces < 1}
                        onClick={() => void respond(request.userId, 'accept')}
                        className="bg-[#1d604c] text-white hover:bg-[#174c3d]"
                      >
                        Accept
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={hostIsBusy}
                        onClick={() => void respond(request.userId, 'decline')}
                      >
                        Decline
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-xs text-[#718176] dark:text-white/50">
                  No one is waiting to join.
                </p>
              )}
            </section>
          )}

          <section className="border-t border-[#edf0ec] pt-4 dark:border-white/10">
            <h3 className="text-sm font-semibold text-[#354b3e] dark:text-white/85">
              Add an accepted Trailmate
            </h3>
            {trailmatesQuery.isLoading ? (
              <p className="mt-2 text-xs text-[#718176] dark:text-white/50">Loading Trailmates…</p>
            ) : trailmatesQuery.isError ? (
              <p role="alert" className="mt-2 text-xs text-[#a43f2d] dark:text-[#ffb7a8]">
                Could not load your Trailmates.
              </p>
            ) : availableTrailmates.length === 0 ? (
              <p className="mt-2 text-xs text-[#718176] dark:text-white/50">
                All of your accepted Trailmates are already in this hike.{' '}
                <Link
                  href="/trailmates"
                  className="font-semibold text-[#1d604c] underline dark:text-[#b9d8c2]"
                >
                  Manage Trailmates
                </Link>
              </p>
            ) : (
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <label className="sr-only" htmlFor="add-trailmate">
                  Choose a Trailmate
                </label>
                <select
                  id="add-trailmate"
                  value={selectedTrailmate}
                  onChange={(event) => setSelectedTrailmate(event.target.value)}
                  className="h-10 min-w-0 flex-1 rounded-[8px] border border-[#d8e2d9] bg-white px-3 text-sm text-[#203a2e] outline-none focus:border-[#1d604c] dark:border-white/15 dark:bg-[#10231f] dark:text-white"
                >
                  <option value="">Select a Trailmate</option>
                  {availableTrailmates.map((person) => (
                    <option key={person.userId} value={person.userId}>
                      {person.displayName || 'DAPYO hiker'}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  disabled={!selectedTrailmate || hostIsBusy || hike.availablePlaces < 1}
                  onClick={() => void addMember()}
                  className="bg-[#1d604c] text-white hover:bg-[#174c3d]"
                >
                  Add to hike
                </Button>
              </div>
            )}
          </section>

          <section className="border-t border-[#edf0ec] pt-4 dark:border-white/10">
            <h3 className="text-sm font-semibold text-[#354b3e] dark:text-white/85">
              Guests without DAPYO accounts
            </h3>
            <p className="mt-1 text-xs leading-5 text-[#718176] dark:text-white/50">
              Only the total is shown to other hikers. Guest spots count toward capacity.
            </p>
            <div className="mt-3 flex max-w-sm gap-2">
              <label className="sr-only" htmlFor="hike-guest-count">
                Number of outside guests
              </label>
              <input
                id="hike-guest-count"
                type="number"
                min="0"
                step="1"
                value={guestCount}
                onChange={(event) => setGuestCount(event.target.value)}
                className="h-10 min-w-0 flex-1 rounded-[8px] border border-[#d8e2d9] bg-white px-3 text-sm text-[#203a2e] outline-none focus:border-[#1d604c] dark:border-white/15 dark:bg-[#10231f] dark:text-white"
              />
              <Button
                type="button"
                variant="outline"
                disabled={
                  !guestCountValid || guestCountValue === hike.externalGuestCount || hostIsBusy
                }
                onClick={() => void saveGuests()}
              >
                Save count
              </Button>
            </div>
          </section>
        </section>
      )}
    </section>
  );
}

function Info({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-2.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-[#a77845]" aria-hidden="true" />
      <span>
        <span className="block text-[10px] font-semibold uppercase tracking-wide text-[#829087] dark:text-white/45">
          {label}
        </span>
        <span className="mt-0.5 block text-xs font-medium text-[#354b3e] dark:text-white/80">
          {children}
        </span>
      </span>
    </div>
  );
}

function PersonCard({
  id,
  displayName,
  label,
}: {
  id: string;
  displayName?: string | null;
  label?: string;
}) {
  const name = displayName || 'DAPYO hiker';
  return (
    <li className="flex items-center gap-2.5 rounded-[8px] bg-[#f6f8f5] px-3 py-2.5 dark:bg-white/[0.05]">
      <span className="grid size-8 place-items-center rounded-full bg-[#e5ede6] text-[10px] font-bold text-[#1d604c] dark:bg-white/10 dark:text-[#cde5d3]">
        {name.trim().charAt(0).toUpperCase()}
      </span>
      <span className="min-w-0 flex-1 truncate text-xs font-medium text-[#354b3e] dark:text-white/80">
        {name}
      </span>
      {label && (
        <span className="text-[9px] font-semibold uppercase tracking-wide text-[#9a7548] dark:text-[#e8bd78]">
          {label}
        </span>
      )}
      <span className="sr-only">Hiker id {id}</span>
    </li>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat(undefined, { timeStyle: 'short' }).format(new Date(value));
}

function formatDifficulty(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

function messageForApiError(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    if (error.status === 409)
      return 'This hike’s capacity or membership changed. Refresh the page and try again.';
    if (error.status === 401) return 'Please sign in again to continue.';
  }
  return fallback;
}
