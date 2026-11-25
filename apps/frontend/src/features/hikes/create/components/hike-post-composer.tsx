'use client';

import { ChevronDown } from 'lucide-react';

import type { TrailmateConnection } from '@/features/trailmates/api/trailmates.hooks';

import type { HikeDraft, HikeDraftErrors } from '../lib/hike-draft';
import { HikeMountainNameField } from './hike-mountain-name-field';
import { HikePostMetadata } from './hike-post-metadata';
import { HikePostOrganizerRow } from './hike-post-organizer-row';
import { HikePostPhotos } from './hike-post-photos';
import { HikePostStats } from './hike-post-stats';

export function HikePostComposer({
  draft,
  errors,
  update,
  displayName,
  trailmates,
  isLoadingTrailmates,
  isErrorLoadingTrailmates,
  addPhotos,
  photoError,
  removePhoto,
  updateCaption,
}: {
  draft: HikeDraft;
  errors: HikeDraftErrors;
  update: <K extends keyof HikeDraft>(field: K, value: HikeDraft[K]) => void;
  displayName: string;
  trailmates: TrailmateConnection[];
  isLoadingTrailmates: boolean;
  isErrorLoadingTrailmates: boolean;
  addPhotos: (files: File[]) => void;
  photoError?: string;
  removePhoto: (id: string) => void;
  updateCaption: (id: string, caption: string) => void;
}) {
  return (
    <div className="space-y-5">
      <HikePostOrganizerRow
        displayName={displayName}
        admissionMode={draft.admissionMode}
        update={update}
      />
      <HikePostMetadata
        draft={draft}
        errors={errors}
        update={update}
        trailmates={trailmates}
        isLoadingTrailmates={isLoadingTrailmates}
        isErrorLoadingTrailmates={isErrorLoadingTrailmates}
      />

      <label className="block">
        <span className="sr-only">Hike caption</span>
        <textarea
          value={draft.description}
          onChange={(event) => update('description', event.target.value)}
          placeholder="Share what makes this trail worth the trip…"
          rows={3}
          maxLength={4000}
          aria-invalid={!!errors.description}
          className="w-full resize-y border-0 bg-transparent p-0 text-sm leading-6 text-[#40564b] outline-none placeholder:text-[#859087] focus:ring-0 aria-invalid:text-[#a43f2d] dark:text-white/80 dark:placeholder:text-white/40 dark:aria-invalid:text-[#ffb7a8]"
        />
        <span className="mt-1 flex items-center justify-between text-[10px] text-[#879189] dark:text-white/40">
          {errors.description ? (
            <span role="alert" className="font-medium text-[#a43f2d] dark:text-[#ffb7a8]">
              {errors.description}
            </span>
          ) : (
            <span>Write a short note for the group</span>
          )}
          <span>{draft.description.length}/4000</span>
        </span>
      </label>

      <HikeMountainNameField
        value={draft.mountainName}
        onChange={(value) => update('mountainName', value)}
        error={errors.mountainName}
      />

      <HikePostPhotos
        photos={draft.photos}
        addPhotos={addPhotos}
        photoError={photoError}
        removePhoto={removePhoto}
        updateCaption={updateCaption}
      />
      <HikePostStats draft={draft} errors={errors} update={update} />

      <details className="group rounded-[8px] border border-[#e1e9e1] px-3 py-2.5 dark:border-white/10">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-xs font-semibold text-[#52675a] outline-none marker:hidden focus-visible:ring-2 focus-visible:ring-[#1d604c]/25 dark:text-white/70 [&::-webkit-details-marker]:hidden">
          What should hikers bring or know?
          <ChevronDown
            className="size-3.5 text-[#879189] transition-transform group-open:rotate-180 dark:text-white/45"
            aria-hidden="true"
          />
        </summary>
        <textarea
          value={draft.requirements}
          onChange={(event) => update('requirements', event.target.value)}
          placeholder="Suggested gear, fitness notes, permits, or other requirements."
          rows={3}
          maxLength={4000}
          className="mt-3 w-full resize-y rounded-[7px] border border-[#e1e9e1] bg-white px-3 py-2.5 text-xs leading-5 text-[#354b3e] outline-none focus:border-[#1d604c] dark:border-white/10 dark:bg-white/[0.04] dark:text-white/80"
        />
      </details>
    </div>
  );
}
