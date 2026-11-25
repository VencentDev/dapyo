'use client';

import { Check, Clock3, Search, UserPlus } from 'lucide-react';

import type { PublicProfile } from '@/features/trailmates/api/trailmates.hooks';

import { TrailmateAvatar } from './trailmate-avatar';

type RelationshipState = 'connected' | 'incoming' | 'outgoing' | null;

export function TrailmatesSearch({
  query,
  onQueryChange,
  results,
  isLoading,
  error,
  relationshipState,
  isSending,
  onRequest,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  results: PublicProfile[];
  isLoading: boolean;
  error: boolean;
  relationshipState: (userId: string) => RelationshipState;
  isSending: boolean;
  onRequest: (userId: string) => void;
}) {
  const canSearch = query.trim().length >= 2;

  return (
    <section className="dapyo-card-elevation rounded-[8px] bg-white p-5 ring-1 ring-[#17342e]/[0.06] dark:bg-[#17342e] dark:ring-white/[0.08] sm:p-6">
      <div>
        <h2 className="text-base font-semibold text-[#213b30] dark:text-[#edf4ef]">Find hikers</h2>
        <p className="mt-1 text-sm text-[#63756a] dark:text-white/65">
          Search by display name and send a request to connect.
        </p>
      </div>

      <label className="sr-only" htmlFor="trailmates-search">
        Search hikers by name
      </label>
      <div className="mt-4 flex items-center gap-2 rounded-[8px] border border-[#dce5dd] bg-[#fbfcfa] px-3 focus-within:border-[#1d604c] focus-within:ring-2 focus-within:ring-[#1d604c]/15 dark:border-white/15 dark:bg-[#10231f] dark:focus-within:border-[#81ad90]">
        <Search className="size-4 shrink-0 text-[#718378] dark:text-white/45" aria-hidden="true" />
        <input
          id="trailmates-search"
          type="search"
          autoComplete="off"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Type at least 2 characters"
          className="h-11 min-w-0 flex-1 bg-transparent text-sm text-[#203a2e] outline-none placeholder:text-[#89978e] dark:text-white dark:placeholder:text-white/40"
        />
      </div>

      <div className="mt-4" aria-live="polite">
        {!canSearch ? (
          <p className="rounded-[8px] bg-[#f4f7f3] px-4 py-3 text-sm text-[#68796e] dark:bg-white/[0.05] dark:text-white/60">
            Search matches on public display names. Enter at least 2 characters.
          </p>
        ) : isLoading ? (
          <p className="px-1 py-3 text-sm text-[#68796e] dark:text-white/60">Searching hikers…</p>
        ) : error ? (
          <p
            role="alert"
            className="rounded-[8px] bg-[#fff2ea] px-4 py-3 text-sm text-[#804c27] dark:bg-[#4a3328] dark:text-[#ffd2ae]"
          >
            Search is unavailable right now. Try again in a moment.
          </p>
        ) : results.length === 0 ? (
          <p className="rounded-[8px] bg-[#f4f7f3] px-4 py-3 text-sm text-[#68796e] dark:bg-white/[0.05] dark:text-white/60">
            No hikers found with that name.
          </p>
        ) : (
          <ul className="divide-y divide-[#edf0ec] dark:divide-white/10">
            {results.map((profile) => {
              const state = relationshipState(profile.id);
              return (
                <li key={profile.id} className="flex items-center gap-3 py-3 first:pt-1 last:pb-1">
                  <TrailmateAvatar name={profile.displayName} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#2b4236] dark:text-white/90">
                      {profile.displayName || 'Hiker'}
                    </p>
                    <p className="mt-0.5 text-xs text-[#718176] dark:text-white/55">
                      {state === 'connected'
                        ? 'Already a Trailmate'
                        : state === 'incoming'
                          ? 'They sent you a request'
                          : state === 'outgoing'
                            ? 'Request sent'
                            : 'Public profile'}
                    </p>
                  </div>
                  {state === 'connected' ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1d604c] dark:text-[#b9d8c2]">
                      <Check className="size-4" aria-hidden="true" /> Connected
                    </span>
                  ) : state === 'outgoing' ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f4f2e9] px-3 py-2 text-xs font-semibold text-[#755b32] dark:bg-white/[0.08] dark:text-[#e8bd78]">
                      <Clock3 className="size-3.5" aria-hidden="true" /> Pending
                    </span>
                  ) : state === 'incoming' ? (
                    <span className="text-xs font-semibold text-[#1d604c] dark:text-[#b9d8c2]">
                      Respond below
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onRequest(profile.id)}
                      disabled={isSending}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-[8px] bg-[#173f32] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#225c46] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d9aa58] disabled:cursor-wait disabled:opacity-60 dark:bg-[#225c46] dark:hover:bg-[#2c7055]"
                    >
                      <UserPlus className="size-3.5" aria-hidden="true" /> Request
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
