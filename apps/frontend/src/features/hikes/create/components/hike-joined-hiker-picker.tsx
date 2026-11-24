'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Check, Plus, Search, UserRound, UserRoundPlus, X } from 'lucide-react';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { usePublicProfileSearch } from '@/features/trailmates/api/trailmates.hooks';
import type { PublicProfile } from '@/features/trailmates/api/trailmates.hooks';
import { TrailmateAvatar } from '@/features/trailmates/components/trailmate-avatar';

import type { HikeJoinedHiker } from '../lib/hike-joined-hiker';

export function HikeJoinedHikerPicker({
  selectedHikers,
  onChange,
}: {
  selectedHikers: HikeJoinedHiker[];
  onChange: (hikers: HikeJoinedHiker[]) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedQuery(query.trim()), 250);
    return () => window.clearTimeout(timeoutId);
  }, [query]);

  const search = usePublicProfileSearch(debouncedQuery);
  const normalizedName = query.trim().toLocaleLowerCase();
  const selectedProfileIds = useMemo(
    () =>
      new Set(selectedHikers.filter((hiker) => hiker.kind === 'profile').map((hiker) => hiker.id)),
    [selectedHikers],
  );
  const matchingProfiles = (search.data ?? []).filter(
    (profile) => !selectedProfileIds.has(profile.id),
  );
  const hasSelectedProfileMatch = (search.data ?? []).some((profile) =>
    selectedProfileIds.has(profile.id),
  );
  const isSearching =
    query.trim().length >= 2 && (query.trim() !== debouncedQuery || search.isFetching);
  const guestAlreadyAdded = selectedHikers.some(
    (hiker) => hiker.kind === 'guest' && hiker.name.trim().toLocaleLowerCase() === normalizedName,
  );

  const addProfile = (profile: PublicProfile) => {
    if (selectedProfileIds.has(profile.id)) return;
    onChange([
      ...selectedHikers,
      {
        id: profile.id,
        name: profile.displayName?.trim() || 'Hiker',
        kind: 'profile',
      },
    ]);
    setQuery('');
  };

  const addGuest = () => {
    const name = query.trim();
    if (!name || guestAlreadyAdded) return;

    const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    onChange([...selectedHikers, { id: `guest:${uniqueId}`, name, kind: 'guest' }]);
    setQuery('');
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setQuery('');
          setDebouncedQuery('');
        }
      }}
    >
      <DialogTrigger asChild>
        <button
          type="button"
          aria-expanded={isOpen}
          aria-label={`Tag joined hikers. ${selectedHikers.length} selected.`}
          className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md px-1.5 text-[11px] font-medium text-[#536b5d] transition-colors hover:bg-[#edf5ee] hover:text-[#1d604c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d604c]/25 dark:text-white/65 dark:hover:bg-white/[0.08] dark:hover:text-white"
        >
          <UserRound className="size-3.5 text-[#9a7548] dark:text-[#e8bd78]" aria-hidden="true" />
          <span>Tag joined hikers</span>
          <span className="grid min-w-4 place-items-center rounded-full bg-[#edf5ee] px-1 text-[9px] font-semibold text-[#31533f] dark:bg-white/10 dark:text-[#cde5d3]">
            {selectedHikers.length}
          </span>
        </button>
      </DialogTrigger>

      <DialogContent
        showCloseButton
        overlayClassName="bg-black/35 backdrop-blur-sm dark:bg-black/60"
        className="flex max-h-[84svh] w-[calc(100%-1.5rem)] max-w-xl flex-col gap-0 overflow-hidden rounded-xl border border-[#dce5dd] bg-[#fcfdfb] p-0 text-[#203a2e] shadow-2xl dark:border-white/10 dark:bg-[#142923] dark:text-white"
      >
        <DialogHeader className="shrink-0 border-b border-[#edf0ec] px-5 py-4 pr-14 text-left dark:border-white/10 sm:px-6">
          <DialogTitle className="text-base font-semibold text-[#213b30] dark:text-[#edf4ef]">
            Tag joined hikers
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm leading-5 text-[#718176] dark:text-white/55">
            Search DAPYO profiles or add someone by name. Tagged hikers count toward your capacity.
          </DialogDescription>
        </DialogHeader>

        <div className="shrink-0 px-5 pt-4 sm:px-6">
          <label className="sr-only" htmlFor="joined-hiker-search">
            Search a profile or enter a guest name
          </label>
          <div className="flex items-center gap-2 rounded-[8px] border border-[#d8e2d9] bg-white px-3 focus-within:border-[#1d604c] focus-within:ring-2 focus-within:ring-[#1d604c]/15 dark:border-white/15 dark:bg-white/[0.04] dark:focus-within:border-[#81ad90]">
            <Search
              className="size-4 shrink-0 text-[#718176] dark:text-white/45"
              aria-hidden="true"
            />
            <input
              id="joined-hiker-search"
              type="search"
              autoComplete="off"
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && query.trim()) {
                  event.preventDefault();
                  addGuest();
                }
              }}
              placeholder="Search a profile or enter a name"
              className="h-11 min-w-0 flex-1 bg-transparent text-sm text-[#203a2e] outline-none placeholder:text-[#89978e] dark:text-white dark:placeholder:text-white/40"
            />
            <button
              type="button"
              aria-label={
                query.trim() ? `Add ${query.trim()} as a guest` : 'Enter a name to add a guest'
              }
              title="Add typed name as a guest"
              disabled={!query.trim() || guestAlreadyAdded}
              onClick={addGuest}
              className="grid size-8 shrink-0 place-items-center rounded-full text-[#1d604c] transition-colors hover:bg-[#eaf3eb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d604c]/30 disabled:cursor-not-allowed disabled:opacity-35 dark:text-[#b9d8c2] dark:hover:bg-white/[0.1]"
            >
              <UserRoundPlus className="size-[18px]" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-3 sm:px-6" aria-live="polite">
          {query.trim().length < 2 ? (
            <p className="rounded-[8px] bg-[#f4f7f3] px-4 py-3 text-sm leading-5 text-[#68796e] dark:bg-white/[0.05] dark:text-white/60">
              Type at least 2 characters to search profiles, or use the person-plus button to add a
              guest.
            </p>
          ) : isSearching ? (
            <p className="px-1 py-3 text-sm text-[#68796e] dark:text-white/60">
              Searching profiles…
            </p>
          ) : search.isError ? (
            <p
              role="alert"
              className="rounded-[8px] bg-[#fff2ea] px-4 py-3 text-sm text-[#804c27] dark:bg-[#4a3328] dark:text-[#ffd2ae]"
            >
              Profile search is unavailable. You can still use the person-plus button to add a
              guest.
            </p>
          ) : matchingProfiles.length > 0 ? (
            <ul className="divide-y divide-[#edf0ec] dark:divide-white/10">
              {matchingProfiles.map((profile) => (
                <li key={profile.id} className="flex items-center gap-3 py-2.5">
                  {profile.avatarUrl ? (
                    <Image
                      src={profile.avatarUrl}
                      alt=""
                      width={40}
                      height={40}
                      unoptimized
                      className="size-10 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <TrailmateAvatar name={profile.displayName} />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#2b4236] dark:text-white/90">
                      {profile.displayName || 'Hiker'}
                    </p>
                    <p className="mt-0.5 text-xs text-[#718176] dark:text-white/55">
                      DAPYO profile
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Add ${profile.displayName || 'hiker'} to this hike`}
                    onClick={() => addProfile(profile)}
                    className="grid size-9 shrink-0 place-items-center rounded-full bg-[#eaf3eb] text-[#1d604c] transition-colors hover:bg-[#d9eadb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d604c]/30 dark:bg-white/[0.08] dark:text-[#b9d8c2] dark:hover:bg-white/[0.14]"
                  >
                    <Plus className="size-4" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          ) : hasSelectedProfileMatch ? (
            <p className="rounded-[8px] bg-[#f4f7f3] px-4 py-3 text-sm text-[#68796e] dark:bg-white/[0.05] dark:text-white/60">
              Matching profiles are already tagged.
            </p>
          ) : null}
        </div>

        <div className="shrink-0 border-t border-[#edf0ec] px-5 py-3 dark:border-white/10 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold text-[#52675a] dark:text-white/70">
              Selected hikers{' '}
              <span className="text-[#1d604c] dark:text-[#b9d8c2]">{selectedHikers.length}</span>
            </p>
            {selectedHikers.length > 0 && (
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-xs font-medium text-[#718176] underline-offset-2 hover:text-[#1d604c] hover:underline dark:text-white/50 dark:hover:text-white"
              >
                Clear all
              </button>
            )}
          </div>
          {selectedHikers.length > 0 ? (
            <ul
              aria-label="Selected hikers"
              className="mt-2 flex max-h-28 flex-wrap gap-2 overflow-y-auto"
            >
              {selectedHikers.map((hiker) => (
                <li
                  key={hiker.id}
                  className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-[#dce8dd] bg-[#f1f6f1] py-1 pl-3 pr-1 text-xs font-medium text-[#355343] dark:border-white/10 dark:bg-white/[0.06] dark:text-white/80"
                >
                  <span className="max-w-48 truncate">{hiker.name}</span>
                  {hiker.kind === 'profile' && <span className="sr-only">DAPYO profile</span>}
                  {hiker.kind === 'guest' && <span className="sr-only">Guest</span>}
                  <button
                    type="button"
                    aria-label={`Remove ${hiker.name}`}
                    onClick={() =>
                      onChange(selectedHikers.filter((selected) => selected.id !== hiker.id))
                    }
                    className="grid size-6 shrink-0 place-items-center rounded-full text-[#718176] transition-colors hover:bg-white hover:text-[#a43f2d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d604c]/30 dark:text-white/55 dark:hover:bg-white/10 dark:hover:text-[#ffb7a8]"
                  >
                    <X className="size-3.5" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-xs text-[#879189] dark:text-white/45">
              Names you add will appear here.
            </p>
          )}
        </div>

        <DialogFooter className="shrink-0 border-t border-[#edf0ec] px-5 py-3 dark:border-white/10 sm:px-6">
          <DialogClose asChild>
            <button
              type="button"
              className="inline-flex h-9 items-center gap-2 rounded-[8px] bg-[#1d604c] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#174c3d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d9aa58]"
            >
              <Check className="size-4" aria-hidden="true" />
              Done
            </button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
