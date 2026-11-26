'use client';

import { CalendarDays, MapPin, UsersRound, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import type { HikeDraft } from '../lib/hike-draft';
import { parseLocalDate } from '../lib/hike-draft';

export function HikeReviewStep({ draft }: { draft: HikeDraft }) {
  const date = parseLocalDate(draft.date);
  const formatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'full' });
  const capacity = Number(draft.maxParticipants) || 0;
  const selectedCount = draft.selectedMemberIds.length;
  const guestCount = Number(draft.externalGuestCount) || 0;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-[#1d382c] dark:text-[#edf4ef]">
          Review your hike
        </h2>
        <p className="mt-1 text-sm text-[#65776c] dark:text-white/60">
          Make sure the details look right. You can edit any step before publishing.
        </p>
      </div>
      <div className="space-y-4 rounded-[8px] border border-[#e1e9e1] p-4 dark:border-white/10">
        <ReviewRow icon={MapPin} label="Trail or location">
          <strong>{draft.locationName || 'Location not set'}</strong>
          <span className="block text-xs font-normal text-[#718176] dark:text-white/50">
            {draft.latitude || '—'}, {draft.longitude || '—'}
          </span>
        </ReviewRow>
        <ReviewRow icon={CalendarDays} label="When">
          <strong>{date ? formatter.format(date) : 'Date not set'}</strong>
        </ReviewRow>
        <ReviewRow icon={UsersRound} label="Group">
          <strong>
            {capacity} total places · {capacity - 1 - selectedCount - guestCount} available
          </strong>
          <span className="block text-xs font-normal text-[#718176] dark:text-white/50">
            You + {selectedCount} Trailmates + {guestCount} guests ·{' '}
            {draft.admissionMode === 'OPEN' ? 'Open to join' : 'Organizer approval'}
          </span>
        </ReviewRow>
        <div className="border-t border-[#edf0ec] pt-4 dark:border-white/10">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#718176] dark:text-white/50">
            About this hike
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[#354b3e] dark:text-white/80">
            {draft.description || 'Description not added'}
          </p>
          {draft.requirements.trim() && (
            <>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[#718176] dark:text-white/50">
                What to bring or know
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[#354b3e] dark:text-white/80">
                {draft.requirements}
              </p>
            </>
          )}
        </div>
        <div className="border-t border-[#edf0ec] pt-4 dark:border-white/10">
          <p className="text-sm font-semibold text-[#354b3e] dark:text-white/85">
            {draft.photos.length} {draft.photos.length === 1 ? 'photo' : 'photos'}
          </p>
          <p className="mt-1 text-xs text-[#718176] dark:text-white/50">
            Photos and captions appear on the hike listing.
          </p>
        </div>
      </div>
    </div>
  );
}

function ReviewRow({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#edf5ee] text-[#1d604c] dark:bg-white/[0.07] dark:text-[#b9d8c2]">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#718176] dark:text-white/50">
          {label}
        </p>
        <div className="mt-0.5 text-sm text-[#354b3e] dark:text-white/85">{children}</div>
      </div>
    </div>
  );
}
