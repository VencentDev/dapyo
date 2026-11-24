'use client';

import Link from 'next/link';
import { Check, HeartHandshake, ShieldCheck, UsersRound } from 'lucide-react';

import type { TrailmateConnection } from '@/features/trailmates/api/trailmates.hooks';

import { getRemainingPlaces, type HikeDraft, type HikeDraftErrors } from '../lib/hike-draft';

export function HikeGroupStep({
  draft,
  errors,
  update,
  trailmates,
  isLoading,
  isError,
}: {
  draft: HikeDraft;
  errors: HikeDraftErrors;
  update: <K extends keyof HikeDraft>(field: K, value: HikeDraft[K]) => void;
  trailmates: TrailmateConnection[];
  isLoading: boolean;
  isError: boolean;
}) {
  const remaining = getRemainingPlaces(draft);

  const toggleTrailmate = (userId: string) => {
    const selected = new Set(draft.selectedMemberIds);
    if (selected.has(userId)) selected.delete(userId);
    else selected.add(userId);
    update('selectedMemberIds', Array.from(selected));
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-[#1d382c] dark:text-[#edf4ef]">
          Who’s coming along?
        </h2>
        <p className="mt-1 text-sm text-[#65776c] dark:text-white/60">
          Set the total group limit, add your Trailmates, and choose how new hikers join.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[#354b3e] dark:text-white/80">
            Total group size
          </span>
          <input
            type="number"
            min="1"
            step="1"
            value={draft.maxParticipants}
            onChange={(event) => update('maxParticipants', event.target.value)}
            aria-invalid={!!errors.maxParticipants}
            className="h-11 w-full rounded-[8px] border border-[#d8e2d9] bg-white px-3 text-sm text-[#203a2e] outline-none focus:border-[#1d604c] focus:ring-2 focus:ring-[#1d604c]/15 aria-invalid:border-[#b64e34] dark:border-white/15 dark:bg-[#10231f] dark:text-white"
          />
          {errors.maxParticipants && <FieldError>{errors.maxParticipants}</FieldError>}
          <span className="block text-xs text-[#718176] dark:text-white/50">
            Includes you, Trailmates, guests, and other joiners.
          </span>
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[#354b3e] dark:text-white/80">
            Guests without DAPYO accounts
          </span>
          <input
            type="number"
            min="0"
            step="1"
            value={draft.externalGuestCount}
            onChange={(event) => update('externalGuestCount', event.target.value)}
            aria-invalid={!!errors.externalGuestCount}
            className="h-11 w-full rounded-[8px] border border-[#d8e2d9] bg-white px-3 text-sm text-[#203a2e] outline-none focus:border-[#1d604c] focus:ring-2 focus:ring-[#1d604c]/15 aria-invalid:border-[#b64e34] dark:border-white/15 dark:bg-[#10231f] dark:text-white"
          />
          {errors.externalGuestCount && <FieldError>{errors.externalGuestCount}</FieldError>}
          <span className="block text-xs text-[#718176] dark:text-white/50">
            Their names aren’t collected; the listing shows a count.
          </span>
        </label>
      </div>

      <div
        className={`flex items-center justify-between gap-3 rounded-[8px] border px-4 py-3 ${remaining !== null && remaining < 0 ? 'border-[#d59579] bg-[#fff3ec] dark:border-[#8d5540] dark:bg-[#422c25]' : 'border-[#dbe7dc] bg-[#edf5ee] dark:border-white/10 dark:bg-white/[0.05]'}`}
      >
        <div className="flex items-center gap-2.5">
          <UsersRound className="size-4 text-[#1d604c] dark:text-[#b9d8c2]" aria-hidden="true" />
          <span className="text-sm font-semibold text-[#31533f] dark:text-white/80">
            {remaining === null
              ? 'Places left'
              : remaining < 0
                ? 'Over group limit'
                : `${remaining} ${remaining === 1 ? 'place' : 'places'} left`}
          </span>
        </div>
        <span className="text-xs text-[#607368] dark:text-white/55">
          1 organizer + {draft.selectedMemberIds.length} Trailmates +{' '}
          {Number(draft.externalGuestCount) || 0} guests
        </span>
      </div>

      <section className="rounded-[8px] border border-[#e1e9e1] p-4 dark:border-white/10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-[#354b3e] dark:text-white/85">
              Add your Trailmates
            </h3>
            <p className="mt-1 text-xs text-[#718176] dark:text-white/55">
              They’ll be added to the hike immediately.
            </p>
          </div>
          <HeartHandshake
            className="size-4 text-[#a77845] dark:text-[#e8bd78]"
            aria-hidden="true"
          />
        </div>
        {isLoading ? (
          <p className="mt-3 text-sm text-[#718176] dark:text-white/55">Loading Trailmates…</p>
        ) : isError ? (
          <p role="alert" className="mt-3 text-sm text-[#a43f2d] dark:text-[#ffb7a8]">
            Could not load your Trailmates. You can try again when you return to this step.
          </p>
        ) : trailmates.length === 0 ? (
          <p className="mt-3 rounded-[8px] bg-[#f6f8f5] px-3 py-3 text-xs leading-5 text-[#68796e] dark:bg-white/[0.05] dark:text-white/60">
            You don’t have any accepted Trailmates yet.{' '}
            <Link
              href="/trailmates"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-[#1d604c] underline underline-offset-2 hover:text-[#a77845] dark:text-[#b9d8c2] dark:hover:text-[#e8bd78]"
            >
              Find hikers
            </Link>{' '}
            and add them here.
          </p>
        ) : (
          <ul className="mt-3 max-h-44 divide-y divide-[#edf0ec] overflow-y-auto dark:divide-white/10">
            {trailmates.map((trailmate) => {
              const selected = draft.selectedMemberIds.includes(trailmate.userId);
              return (
                <li key={trailmate.userId}>
                  <label className="flex cursor-pointer items-center gap-3 py-2.5">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleTrailmate(trailmate.userId)}
                      className="size-4 accent-[#1d604c]"
                    />
                    <span className="grid size-8 place-items-center rounded-full bg-[#e5ede6] text-[10px] font-bold text-[#1d604c] dark:bg-white/10 dark:text-[#cde5d3]">
                      {(trailmate.displayName || 'H').trim().charAt(0).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-[#354b3e] dark:text-white/80">
                      {trailmate.displayName || 'Hiker'}
                    </span>
                    {selected && (
                      <Check
                        className="size-4 text-[#1d604c] dark:text-[#b9d8c2]"
                        aria-hidden="true"
                      />
                    )}
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold text-[#354b3e] dark:text-white/85">
          How should new hikers join?
        </legend>
        <label className="flex cursor-pointer items-start gap-3 rounded-[8px] border border-[#dbe5dc] p-3.5 transition-colors has-[:checked]:border-[#1d604c] has-[:checked]:bg-[#f1f7f1] dark:border-white/10 dark:has-[:checked]:border-[#82b094] dark:has-[:checked]:bg-white/[0.06]">
          <input
            type="radio"
            name="admissionMode"
            value="OPEN"
            checked={draft.admissionMode === 'OPEN'}
            onChange={() => update('admissionMode', 'OPEN')}
            className="mt-0.5 size-4 accent-[#1d604c]"
          />
          <span className="flex-1">
            <span className="block text-sm font-semibold text-[#354b3e] dark:text-white/85">
              Open for all
            </span>
            <span className="mt-0.5 block text-xs leading-5 text-[#718176] dark:text-white/55">
              Anyone can join while places are available.
            </span>
          </span>
          <Check
            className="mt-0.5 size-4 text-[#1d604c] opacity-0 dark:text-[#b9d8c2]"
            aria-hidden="true"
          />
        </label>
        <label className="flex cursor-pointer items-start gap-3 rounded-[8px] border border-[#dbe5dc] p-3.5 transition-colors has-[:checked]:border-[#1d604c] has-[:checked]:bg-[#f1f7f1] dark:border-white/10 dark:has-[:checked]:border-[#82b094] dark:has-[:checked]:bg-white/[0.06]">
          <input
            type="radio"
            name="admissionMode"
            value="APPROVAL"
            checked={draft.admissionMode === 'APPROVAL'}
            onChange={() => update('admissionMode', 'APPROVAL')}
            className="mt-0.5 size-4 accent-[#1d604c]"
          />
          <span className="flex-1">
            <span className="block text-sm font-semibold text-[#354b3e] dark:text-white/85">
              Approve each request
            </span>
            <span className="mt-0.5 block text-xs leading-5 text-[#718176] dark:text-white/55">
              You decide who joins. Requests don’t reserve a place until accepted.
            </span>
          </span>
          <ShieldCheck
            className="mt-0.5 size-4 text-[#1d604c] dark:text-[#b9d8c2]"
            aria-hidden="true"
          />
        </label>
      </fieldset>
    </div>
  );
}

function FieldError({ children }: { children: string }) {
  return (
    <span className="block text-xs font-medium text-[#a43f2d] dark:text-[#ffb7a8]">{children}</span>
  );
}
