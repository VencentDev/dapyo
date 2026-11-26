'use client';

import Link from 'next/link';
import { CalendarDays, ChevronDown, MapPin, UsersRound } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { TrailmateConnection } from '@/features/trailmates/api/trailmates.hooks';

import type { HikeDraft, HikeDraftErrors } from '../lib/hike-draft';
import { getInitials, getLocalDateMinimum } from '../lib/hike-post-composer-utils';

export function HikePostMetadata({
  draft,
  errors,
  update,
  trailmates,
  isLoadingTrailmates,
  isErrorLoadingTrailmates,
}: {
  draft: HikeDraft;
  errors: HikeDraftErrors;
  update: <K extends keyof HikeDraft>(field: K, value: HikeDraft[K]) => void;
  trailmates: TrailmateConnection[];
  isLoadingTrailmates: boolean;
  isErrorLoadingTrailmates: boolean;
}) {
  const selectedTrailmates = trailmates.filter((person) =>
    draft.selectedMemberIds.includes(person.userId),
  );

  const toggleTrailmate = (userId: string) => {
    const selected = new Set(draft.selectedMemberIds);
    if (selected.has(userId)) selected.delete(userId);
    else selected.add(userId);
    update('selectedMemberIds', Array.from(selected));
  };

  return (
    <>
      <div className="grid gap-2 border-y border-[#edf0ec] py-3 dark:border-white/10 sm:grid-cols-[minmax(0,1fr)_220px_auto] sm:items-start">
        <label className="relative min-w-0">
          <MapPin
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9a7548] dark:text-[#e8bd78]"
            aria-hidden="true"
          />
          <input
            value={draft.locationName}
            onChange={(event) => update('locationName', event.target.value)}
            placeholder="Choose a meeting location"
            maxLength={500}
            aria-label="Meeting location"
            aria-invalid={!!errors.locationName}
            className="h-10 w-full rounded-[8px] border border-[#d8e2d9] bg-white pl-9 pr-3 text-sm text-[#203a2e] outline-none transition focus:border-[#1d604c] focus:ring-2 focus:ring-[#1d604c]/15 aria-invalid:border-[#b64e34] dark:border-white/15 dark:bg-[#10231f] dark:text-white"
          />
        </label>

        <label className="relative min-w-0">
          <CalendarDays
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9a7548] dark:text-[#e8bd78]"
            aria-hidden="true"
          />
          <input
            type="date"
            aria-label="Hike date"
            value={draft.date}
            min={getLocalDateMinimum()}
            onChange={(event) => update('date', event.target.value)}
            aria-invalid={!!errors.date}
            className="h-10 w-full min-w-0 rounded-[8px] border border-[#d8e2d9] bg-white pl-9 pr-2 text-xs text-[#203a2e] outline-none transition focus:border-[#1d604c] focus:ring-2 focus:ring-[#1d604c]/15 aria-invalid:border-[#b64e34] dark:border-white/15 dark:bg-[#10231f] dark:text-white"
          />
        </label>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-[8px] border border-[#d8e2d9] bg-white px-3 text-xs font-semibold text-[#52675a] transition-colors hover:bg-[#f4f8f4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d604c]/25 dark:border-white/15 dark:bg-white/[0.04] dark:text-white/75 dark:hover:bg-white/[0.08]"
              aria-label={`Include people. ${draft.selectedMemberIds.length} selected.`}
            >
              <UsersRound
                className="size-4 text-[#9a7548] dark:text-[#e8bd78]"
                aria-hidden="true"
              />
              Include people
              {draft.selectedMemberIds.length > 0 && (
                <span className="grid size-5 place-items-center rounded-full bg-[#edf5ee] text-[10px] text-[#31533f] dark:bg-white/10 dark:text-[#cde5d3]">
                  {draft.selectedMemberIds.length}
                </span>
              )}
              <ChevronDown className="size-3.5" aria-hidden="true" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="max-h-80 w-72 overflow-y-auto border-[#dce5dc] dark:border-white/10"
          >
            <DropdownMenuLabel className="text-xs text-[#718176] dark:text-white/55">
              Add Trailmates to the hike
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {isLoadingTrailmates ? (
              <p className="px-3 py-4 text-xs text-[#718176] dark:text-white/55">
                Loading your Trailmates…
              </p>
            ) : isErrorLoadingTrailmates ? (
              <p className="px-3 py-4 text-xs text-[#a43f2d] dark:text-[#ffb7a8]">
                Trailmates could not be loaded. Please reopen the modal to try again.
              </p>
            ) : trailmates.length ? (
              trailmates.map((person) => {
                const selected = draft.selectedMemberIds.includes(person.userId);
                return (
                  <DropdownMenuCheckboxItem
                    key={person.userId}
                    checked={selected}
                    onCheckedChange={() => toggleTrailmate(person.userId)}
                    onSelect={(event) => event.preventDefault()}
                    className="gap-2 py-2 focus:bg-[#edf5ee] dark:focus:bg-white/[0.08]"
                  >
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#e5ede6] text-[10px] font-bold text-[#1d604c] dark:bg-white/10 dark:text-[#cde5d3]">
                      {getInitials(person.displayName || 'Hiker')}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{person.displayName || 'Hiker'}</span>
                  </DropdownMenuCheckboxItem>
                );
              })
            ) : (
              <div className="px-3 py-3">
                <p className="text-xs leading-5 text-[#718176] dark:text-white/55">
                  Add people to your hiking circle first.
                </p>
                <DropdownMenuItem
                  asChild
                  className="mt-2 cursor-pointer text-[#1d604c] dark:text-[#b9d8c2]"
                >
                  <Link href="/trailmates" target="_blank" rel="noreferrer">
                    Find Trailmates
                  </Link>
                </DropdownMenuItem>
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <p className="col-span-full -mb-1 flex items-center gap-1.5 text-[10px] text-[#879189] dark:text-white/45">
          <MapPin className="size-3" aria-hidden="true" />
          Pin coordinates for the meeting point
        </p>
        <div className="col-span-full grid gap-2 sm:grid-cols-2">
          <CoordinateInput
            label="Latitude"
            value={draft.latitude}
            error={errors.latitude}
            min={-90}
            max={90}
            placeholder="14.5995"
            onChange={(value) => update('latitude', value)}
          />
          <CoordinateInput
            label="Longitude"
            value={draft.longitude}
            error={errors.longitude}
            min={-180}
            max={180}
            placeholder="120.9842"
            onChange={(value) => update('longitude', value)}
          />
        </div>
        {(errors.locationName || errors.latitude || errors.longitude || errors.date) && (
          <div
            className="col-span-full flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-medium text-[#a43f2d] dark:text-[#ffb7a8]"
            role="alert"
          >
            {errors.locationName && <span>{errors.locationName}</span>}
            {errors.latitude && <span>{errors.latitude}</span>}
            {errors.longitude && <span>{errors.longitude}</span>}
            {errors.date && <span>{errors.date}</span>}
          </div>
        )}
      </div>

      {selectedTrailmates.length > 0 && (
        <ul aria-label="Included Trailmates" className="flex flex-wrap gap-2">
          {selectedTrailmates.map((person) => (
            <li
              key={person.userId}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#f1f5f0] py-1 pl-1 pr-2.5 text-[11px] font-medium text-[#52675a] dark:bg-white/[0.06] dark:text-white/70"
            >
              <span className="grid size-5 place-items-center rounded-full bg-[#dce9df] text-[8px] font-bold text-[#1d604c] dark:bg-white/10 dark:text-[#cde5d3]">
                {getInitials(person.displayName || 'Hiker')}
              </span>
              {person.displayName || 'Hiker'}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function CoordinateInput({
  label,
  value,
  error,
  min,
  max,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  error?: string;
  min: number;
  max: number;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex min-w-0 items-center gap-2 text-[10px] text-[#718176] dark:text-white/50">
      <span className="shrink-0">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        step="any"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={`Meeting point ${label.toLowerCase()}`}
        aria-invalid={!!error}
        className="h-8 min-w-0 flex-1 rounded-[6px] border border-[#e1e9e1] bg-transparent px-2 text-xs text-[#354b3e] outline-none focus:border-[#1d604c] dark:border-white/10 dark:text-white/80"
      />
    </label>
  );
}
