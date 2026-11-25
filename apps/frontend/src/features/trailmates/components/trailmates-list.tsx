'use client';

import { HeartHandshake, UserMinus } from 'lucide-react';

import type { TrailmateConnection } from '@/features/trailmates/api/trailmates.hooks';

import { TrailmateAvatar } from './trailmate-avatar';

export function TrailmatesList({
  trailmates,
  isLoading,
  isRemoving,
  onRemove,
}: {
  trailmates: TrailmateConnection[];
  isLoading: boolean;
  isRemoving: boolean;
  onRemove: (userId: string) => void;
}) {
  return (
    <section className="dapyo-card-elevation rounded-[8px] bg-white p-5 ring-1 ring-[#17342e]/[0.06] dark:bg-[#17342e] dark:ring-white/[0.08] sm:p-6">
      <div className="flex items-center gap-2">
        <HeartHandshake className="size-4 text-[#9a7548] dark:text-[#e8bd78]" aria-hidden="true" />
        <h2 className="text-base font-semibold text-[#213b30] dark:text-[#edf4ef]">
          Your Trailmates
        </h2>
        <span className="rounded-full bg-[#f1f5f0] px-2 py-0.5 text-[10px] font-bold text-[#506457] dark:bg-white/10 dark:text-white/70">
          {trailmates.length}
        </span>
      </div>

      {isLoading ? (
        <p className="mt-4 text-sm text-[#718176] dark:text-white/55">Loading your Trailmates…</p>
      ) : trailmates.length === 0 ? (
        <div className="mt-4 rounded-[8px] border border-dashed border-[#d7e1d8] bg-[#f8faf7] px-4 py-5 text-center dark:border-white/15 dark:bg-white/[0.04]">
          <p className="text-sm font-semibold text-[#41574a] dark:text-white/80">
            Your hiking circle starts here.
          </p>
          <p className="mt-1 text-xs leading-5 text-[#718176] dark:text-white/55">
            Search for hikers above and connect when they accept your request.
          </p>
        </div>
      ) : (
        <ul className="mt-3 divide-y divide-[#edf0ec] dark:divide-white/10">
          {trailmates.map((trailmate) => (
            <li
              key={trailmate.userId}
              className="flex items-center gap-3 py-3 first:pt-1 last:pb-1"
            >
              <TrailmateAvatar name={trailmate.displayName} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#2b4236] dark:text-white/90">
                  {trailmate.displayName || 'Hiker'}
                </p>
                <p className="mt-0.5 text-xs text-[#718176] dark:text-white/55">
                  Connected Trailmate
                </p>
              </div>
              <button
                type="button"
                onClick={() => onRemove(trailmate.userId)}
                disabled={isRemoving}
                aria-label={`Remove ${trailmate.displayName || 'hiker'} from Trailmates`}
                className="grid size-9 place-items-center rounded-[8px] text-[#718176] transition-colors hover:bg-[#fff1eb] hover:text-[#8c4525] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d604c] disabled:opacity-50 dark:text-white/55 dark:hover:bg-[#56382c] dark:hover:text-[#ffd2ae]"
              >
                <UserMinus className="size-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
