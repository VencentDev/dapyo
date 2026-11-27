'use client';

import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { Heart } from '@boxicons/react';

import { Button } from '@/components/ui/button';
import { useJoinHike, useSetHikeLike, type HikeSummary } from '@/features/hikes/api/hikes.hooks';
import { ApiError } from '@/lib/api';

export function CommunityHikeCardActions({
  hikeId,
  status,
  admissionMode,
  hasOpenPlaces,
  isReady,
  likeCount,
  likedByCurrentUser,
}: {
  hikeId: string;
  status: string | null | undefined;
  admissionMode: HikeSummary['admissionMode'];
  hasOpenPlaces: boolean;
  isReady: boolean;
  likeCount: number;
  likedByCurrentUser: boolean;
}) {
  const { status: sessionStatus } = useSession();
  const joinHike = useJoinHike();
  const setHikeLike = useSetHikeLike();
  const [joinError, setJoinError] = useState<string | null>(null);
  const isLikePending = setHikeLike.isPending && setHikeLike.variables?.hikeId === hikeId;
  const pendingLikeState = isLikePending ? setHikeLike.variables?.liked : undefined;
  const displayedLikedState = pendingLikeState ?? likedByCurrentUser;
  const displayedLikeCount = Math.max(
    0,
    likeCount + (displayedLikedState === likedByCurrentUser ? 0 : displayedLikedState ? 1 : -1),
  );

  const handleJoin = async () => {
    setJoinError(null);
    try {
      await joinHike.mutateAsync(hikeId);
    } catch (error) {
      setJoinError(getJoinErrorMessage(error));
    }
  };

  return (
    <>
      {joinError && (
        <p role="alert" className="mt-3 text-xs text-[#8c3727] dark:text-[#ffb7a8]">
          {joinError}
        </p>
      )}
      {setHikeLike.isError && (
        <p role="alert" className="mt-3 text-xs text-[#8c3727] dark:text-[#ffb7a8]">
          Could not update your appreciation. Please try again.
        </p>
      )}

      <div className="mt-2 flex items-center justify-between gap-3 pt-2">
        <div className="inline-flex items-center gap-1.5 text-xs text-[#718176] dark:text-white/60">
          {sessionStatus === 'unauthenticated' ? (
            <Link
              href={`/login?callbackUrl=${encodeURIComponent('/home')}`}
              aria-label="Sign in to appreciate this hike"
              title="Sign in to appreciate this hike"
              className="grid size-9 place-items-center rounded-full text-[#718176] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d604c]/40 hover:text-[#1d604c] dark:text-white/60 dark:hover:text-[#f0a04b]"
            >
              <Heart pack="filled" className="size-5" aria-hidden="true" />
            </Link>
          ) : (
            <button
              type="button"
              aria-pressed={displayedLikedState}
              aria-label={displayedLikedState ? 'Remove appreciation' : 'Appreciate this hike'}
              disabled={sessionStatus !== 'authenticated' || isLikePending}
              onClick={() => setHikeLike.mutate({ hikeId, liked: !likedByCurrentUser })}
              className="grid size-9 place-items-center rounded-full text-[#718176] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d604c]/40 hover:text-[#1d604c] disabled:opacity-60 dark:text-white/60 dark:hover:text-[#f0a04b]"
            >
              <Heart
                pack="filled"
                className={`size-5 ${displayedLikedState ? 'text-[#1d604c] dark:text-[#f0a04b]' : ''}`}
                aria-hidden="true"
              />
            </button>
          )}
          <span aria-live="polite">{displayedLikeCount}</span>
        </div>
        <JoinAction
          status={status}
          sessionStatus={sessionStatus}
          admissionMode={admissionMode}
          hasOpenPlaces={hasOpenPlaces}
          isReady={isReady}
          isPending={joinHike.isPending}
          onJoin={handleJoin}
          hikeId={hikeId}
        />
      </div>
    </>
  );
}

function JoinAction({
  status,
  sessionStatus,
  admissionMode,
  hasOpenPlaces,
  isReady,
  isPending,
  onJoin,
  hikeId,
}: {
  status: string | null | undefined;
  sessionStatus: 'authenticated' | 'loading' | 'unauthenticated';
  admissionMode: HikeSummary['admissionMode'];
  hasOpenPlaces: boolean;
  isReady: boolean;
  isPending: boolean;
  onJoin: () => void;
  hikeId: string;
}) {
  if (status === 'HOST') return <StatusLabel>You’re organizing</StatusLabel>;
  if (status === 'JOINED') return <StatusLabel>You’re going</StatusLabel>;
  if (status === 'PENDING') return <StatusLabel>Request pending</StatusLabel>;

  if (sessionStatus === 'unauthenticated') {
    return (
      <Button asChild className="min-h-10 bg-[#1d604c] px-4 text-white hover:bg-[#174c3d]">
        <Link href={`/login?callbackUrl=${encodeURIComponent(`/hikes/${hikeId}`)}`}>
          Sign in to join
        </Link>
      </Button>
    );
  }

  const canSubmit = isReady && hasOpenPlaces && sessionStatus === 'authenticated';
  return (
    <Button
      type="button"
      disabled={!canSubmit || isPending}
      onClick={onJoin}
      className="min-h-10 bg-[#1d604c] px-4 text-white hover:bg-[#174c3d]"
    >
      {!isReady || sessionStatus === 'loading'
        ? 'Loading…'
        : !hasOpenPlaces
          ? 'Group is full'
          : isPending
            ? 'Sending…'
            : admissionMode === 'OPEN'
              ? 'Join hike'
              : 'Request to join'}
    </Button>
  );
}

function StatusLabel({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex min-h-10 items-center rounded-full bg-[#edf5ee] px-4 text-xs font-semibold text-[#31533f] dark:bg-white/[0.08] dark:text-[#d1e2d6]">
      {children}
    </span>
  );
}

function getJoinErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.payload && typeof error.payload === 'object') {
    if ('message' in error.payload && typeof error.payload.message === 'string') {
      return error.payload.message;
    }
  }
  return 'Could not join this hike. Please try again.';
}
