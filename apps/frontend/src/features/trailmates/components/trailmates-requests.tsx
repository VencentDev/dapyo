'use client';

import { ArrowUpRight, Check, Clock3, UserRoundPlus, X } from 'lucide-react';

import type { TrailmateRequest } from '@/features/trailmates/api/trailmates.hooks';

import { TrailmateAvatar } from './trailmate-avatar';

export function TrailmatesRequests({
  incoming,
  outgoing,
  isLoading,
  isResponding,
  onRespond,
}: {
  incoming: TrailmateRequest[];
  outgoing: TrailmateRequest[];
  isLoading: boolean;
  isResponding: boolean;
  onRespond: (id: string, action: 'accept' | 'decline') => void;
}) {
  return (
    <section className="dapyo-card-elevation rounded-[8px] bg-white p-5 ring-1 ring-[#17342e]/[0.06] dark:bg-[#17342e] dark:ring-white/[0.08] sm:p-6">
      <div className="flex items-center gap-2">
        <UserRoundPlus className="size-4 text-[#9a7548] dark:text-[#e8bd78]" aria-hidden="true" />
        <h2 className="text-base font-semibold text-[#213b30] dark:text-[#edf4ef]">Requests</h2>
        {incoming.length > 0 && (
          <span className="rounded-full bg-[#e5ede6] px-2 py-0.5 text-[10px] font-bold text-[#1d604c] dark:bg-white/10 dark:text-[#cde5d3]">
            {incoming.length}
          </span>
        )}
      </div>

      <div className="mt-4">
        <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-[#68796e] dark:text-white/55">
          Incoming
        </h3>
        {isLoading ? (
          <p className="mt-2 text-sm text-[#79877d] dark:text-white/50">Loading requests…</p>
        ) : incoming.length === 0 ? (
          <p className="mt-2 text-sm text-[#79877d] dark:text-white/50">No requests waiting.</p>
        ) : (
          <ul className="mt-2 divide-y divide-[#edf0ec] dark:divide-white/10">
            {incoming.map((request) => (
              <li
                key={request.id}
                className="flex flex-wrap items-center gap-3 py-3 first:pt-1 last:pb-1"
              >
                <TrailmateAvatar name={request.displayName} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#2b4236] dark:text-white/90">
                    {request.displayName || 'Hiker'}
                  </p>
                  <p className="mt-0.5 text-xs text-[#718176] dark:text-white/55">
                    Wants to connect
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onRespond(request.id, 'decline')}
                    disabled={isResponding}
                    className="grid size-9 place-items-center rounded-[8px] border border-[#dce5dd] text-[#596b60] transition-colors hover:bg-[#f2f5f1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d604c] disabled:opacity-50 dark:border-white/15 dark:text-white/70 dark:hover:bg-white/[0.08]"
                    aria-label={`Decline ${request.displayName || 'hiker'}'s request`}
                  >
                    <X className="size-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRespond(request.id, 'accept')}
                    disabled={isResponding}
                    className="inline-flex h-9 items-center gap-1.5 rounded-[8px] bg-[#173f32] px-3 text-xs font-semibold text-white transition-colors hover:bg-[#225c46] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d9aa58] disabled:opacity-50 dark:bg-[#225c46] dark:hover:bg-[#2c7055]"
                  >
                    <Check className="size-3.5" aria-hidden="true" /> Accept
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-5 border-t border-[#edf0ec] pt-4 dark:border-white/10">
        <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-[#68796e] dark:text-white/55">
          Sent
        </h3>
        {isLoading ? (
          <p className="mt-2 text-sm text-[#79877d] dark:text-white/50">Loading sent requests…</p>
        ) : outgoing.length === 0 ? (
          <p className="mt-2 text-sm text-[#79877d] dark:text-white/50">
            Requests you send will show here.
          </p>
        ) : (
          <ul className="mt-2 divide-y divide-[#edf0ec] dark:divide-white/10">
            {outgoing.map((request) => (
              <li key={request.id} className="flex items-center gap-3 py-3 first:pt-1 last:pb-1">
                <TrailmateAvatar name={request.displayName} />
                <p className="min-w-0 flex-1 truncate text-sm font-semibold text-[#2b4236] dark:text-white/90">
                  {request.displayName || 'Hiker'}
                </p>
                <span className="inline-flex items-center gap-1.5 text-xs text-[#718176] dark:text-white/55">
                  <ArrowUpRight className="size-3.5" aria-hidden="true" /> Waiting
                  <Clock3 className="size-3.5" aria-hidden="true" />
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
