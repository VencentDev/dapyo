'use client';

import { Footprints, Ruler, UsersRound } from 'lucide-react';

import { getRemainingPlaces, type HikeDraft, type HikeDraftErrors } from '../lib/hike-draft';

const difficulties: { value: HikeDraft['difficulty']; label: string }[] = [
  { value: 'EASY', label: 'Easy' },
  { value: 'MODERATE', label: 'Moderate' },
  { value: 'CHALLENGING', label: 'Challenging' },
];

export function HikePostStats({
  draft,
  errors,
  update,
}: {
  draft: HikeDraft;
  errors: HikeDraftErrors;
  update: <K extends keyof HikeDraft>(field: K, value: HikeDraft[K]) => void;
}) {
  const remaining = getRemainingPlaces(draft);

  return (
    <>
      <div className="grid grid-cols-2 divide-x divide-[#edf0ec] border-y border-[#edf0ec] py-3 dark:divide-white/10 dark:border-white/10 sm:grid-cols-4">
        <label className="px-3 first:pl-0">
          <span className="flex items-center gap-1.5 text-[10px] text-[#879189] dark:text-white/45">
            <Ruler className="size-3.5 text-[#a77845] dark:text-[#e8bd78]" aria-hidden="true" />
            Distance · optional
          </span>
          <span className="mt-1 flex items-center gap-1.5">
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              min="0.1"
              max="99999.99"
              value={draft.distanceKm}
              onChange={(event) => update('distanceKm', event.target.value)}
              placeholder="—"
              aria-label="Trail distance in kilometers"
              aria-invalid={!!errors.distanceKm}
              className="w-20 border-0 bg-transparent p-0 text-sm font-semibold text-[#354b3e] outline-none focus:ring-0 aria-invalid:text-[#a43f2d] dark:text-white/80 dark:aria-invalid:text-[#ffb7a8]"
            />
            <span className="text-xs text-[#879189] dark:text-white/45">km</span>
          </span>
          {errors.distanceKm && <FieldError>{errors.distanceKm}</FieldError>}
        </label>

        <label className="px-3">
          <span className="flex items-center gap-1.5 text-[10px] text-[#879189] dark:text-white/45">
            <UsersRound
              className="size-3.5 text-[#a77845] dark:text-[#e8bd78]"
              aria-hidden="true"
            />
            Capacity
          </span>
          <span className="mt-1 flex items-center gap-1.5">
            <input
              type="number"
              min="1"
              step="1"
              value={draft.maxParticipants}
              onChange={(event) => update('maxParticipants', event.target.value)}
              aria-label="Hike capacity in people"
              aria-invalid={!!errors.maxParticipants}
              className="w-12 border-0 bg-transparent p-0 text-sm font-semibold text-[#354b3e] outline-none focus:ring-0 aria-invalid:text-[#a43f2d] dark:text-white/80 dark:aria-invalid:text-[#ffb7a8]"
            />
            <span className="text-xs text-[#879189] dark:text-white/45">people</span>
          </span>
          {errors.maxParticipants && <FieldError>{errors.maxParticipants}</FieldError>}
        </label>

        <label className="px-3">
          <span className="flex items-center gap-1.5 text-[10px] text-[#879189] dark:text-white/45">
            <UsersRound
              className="size-3.5 text-[#a77845] dark:text-[#e8bd78]"
              aria-hidden="true"
            />
            Guests without accounts
          </span>
          <span className="mt-1 flex items-center gap-1.5">
            <input
              type="number"
              min="0"
              step="1"
              value={draft.externalGuestCount}
              onChange={(event) => update('externalGuestCount', event.target.value)}
              aria-label="Guests without DAPYO accounts"
              aria-invalid={!!errors.externalGuestCount}
              className="w-12 border-0 bg-transparent p-0 text-sm font-semibold text-[#354b3e] outline-none focus:ring-0 aria-invalid:text-[#a43f2d] dark:text-white/80 dark:aria-invalid:text-[#ffb7a8]"
            />
            <span className="text-xs text-[#879189] dark:text-white/45">people</span>
          </span>
          {errors.externalGuestCount && <FieldError>{errors.externalGuestCount}</FieldError>}
        </label>

        <div className="px-3 pr-0">
          <span className="flex items-center gap-1.5 text-[10px] text-[#879189] dark:text-white/45">
            <UsersRound
              className="size-3.5 text-[#a77845] dark:text-[#e8bd78]"
              aria-hidden="true"
            />
            Still looking for
          </span>
          <p
            className={`mt-1 text-sm font-semibold ${remaining !== null && remaining < 0 ? 'text-[#a43f2d] dark:text-[#ffb7a8]' : 'text-[#31533f] dark:text-[#cde5d3]'}`}
            aria-live="polite"
          >
            {remaining === null || remaining < 0 ? 'Check capacity' : `${remaining} more`}
          </p>
        </div>
      </div>
      <p className="pt-1 text-[10px] text-[#879189] dark:text-white/45">
        Capacity includes you, included Trailmates, and guests already coming.
      </p>

      <fieldset className="space-y-2">
        <legend className="text-xs font-semibold text-[#52675a] dark:text-white/70">
          Trail difficulty
        </legend>
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Trail difficulty">
          {difficulties.map((difficulty, index) => {
            const selected = draft.difficulty === difficulty.value;
            return (
              <button
                key={difficulty.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => update('difficulty', difficulty.value)}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-[8px] border px-2 py-2 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d604c]/25 ${selected ? 'border-[#1d604c] bg-[#edf5ee] text-[#31533f] dark:border-[#82b094] dark:bg-white/[0.08] dark:text-[#cde5d3]' : 'border-[#e1e9e1] bg-white text-[#718176] hover:border-[#aac4ad] dark:border-white/10 dark:bg-white/[0.03] dark:text-white/55 dark:hover:border-white/25'}`}
              >
                <span
                  className="flex items-center gap-0.5 text-[#a77845] dark:text-[#e8bd78]"
                  aria-hidden="true"
                >
                  {Array.from({ length: index + 1 }, (_, foot) => (
                    <Footprints key={foot} className="size-3.5" />
                  ))}
                </span>
                {difficulty.label}
              </button>
            );
          })}
        </div>
      </fieldset>
    </>
  );
}

function FieldError({ children }: { children: string }) {
  return (
    <span className="mt-1 block text-[10px] font-medium text-[#a43f2d] dark:text-[#ffb7a8]">
      {children}
    </span>
  );
}
