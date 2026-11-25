'use client';

import { ImagePlus, X } from 'lucide-react';

import type { HikeDraft, HikeDraftErrors } from '../lib/hike-draft';
import { availableHikePhotoSlots, hikePhotoLimit } from '../lib/hike-photos';

export function HikeDetailsStep({
  draft,
  errors,
  update,
  addPhotos,
  photoError,
  removePhoto,
  updateCaption,
}: {
  draft: HikeDraft;
  errors: HikeDraftErrors;
  update: <K extends keyof HikeDraft>(field: K, value: HikeDraft[K]) => void;
  addPhotos: (files: File[]) => void;
  photoError?: string;
  removePhoto: (id: string) => void;
  updateCaption: (id: string, caption: string) => void;
}) {
  const remainingSlots = availableHikePhotoSlots(draft.photos.length);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-[#1d382c] dark:text-[#edf4ef]">
          Add the details
        </h2>
        <p className="mt-1 text-sm text-[#65776c] dark:text-white/60">
          Tell hikers what to expect and share a few photos of the route.
        </p>
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-[#354b3e] dark:text-white/80">
          Trail difficulty
        </span>
        <select
          value={draft.difficulty}
          onChange={(event) => update('difficulty', event.target.value as HikeDraft['difficulty'])}
          className="h-11 w-full rounded-[8px] border border-[#d8e2d9] bg-white px-3 text-sm text-[#203a2e] outline-none focus:border-[#1d604c] focus:ring-2 focus:ring-[#1d604c]/15 dark:border-white/15 dark:bg-[#10231f] dark:text-white"
        >
          <option value="EASY">Easy</option>
          <option value="MODERATE">Moderate</option>
          <option value="CHALLENGING">Challenging</option>
        </select>
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-[#354b3e] dark:text-white/80">
          About this hike
        </span>
        <textarea
          value={draft.description}
          onChange={(event) => update('description', event.target.value)}
          placeholder="Describe the route, pace, and what the group can look forward to."
          rows={4}
          maxLength={4000}
          aria-invalid={!!errors.description}
          className="w-full resize-y rounded-[8px] border border-[#d8e2d9] bg-white px-3 py-2.5 text-sm text-[#203a2e] outline-none focus:border-[#1d604c] focus:ring-2 focus:ring-[#1d604c]/15 aria-invalid:border-[#b64e34] dark:border-white/15 dark:bg-[#10231f] dark:text-white"
        />
        <span className="flex justify-between text-xs text-[#718176] dark:text-white/50">
          {errors.description ? (
            <FieldError>{errors.description}</FieldError>
          ) : (
            <span>Required</span>
          )}
          <span>{draft.description.length}/4000</span>
        </span>
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-[#354b3e] dark:text-white/80">
          What should hikers bring or know?{' '}
          <span className="font-normal text-[#718176] dark:text-white/50">(optional)</span>
        </span>
        <textarea
          value={draft.requirements}
          onChange={(event) => update('requirements', event.target.value)}
          placeholder="Suggested gear, fitness notes, permits, or other requirements."
          rows={3}
          maxLength={4000}
          className="w-full resize-y rounded-[8px] border border-[#d8e2d9] bg-white px-3 py-2.5 text-sm text-[#203a2e] outline-none focus:border-[#1d604c] focus:ring-2 focus:ring-[#1d604c]/15 dark:border-white/15 dark:bg-[#10231f] dark:text-white"
        />
      </label>

      <section className="space-y-3 rounded-[8px] border border-[#e1e9e1] p-4 dark:border-white/10">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-[#354b3e] dark:text-white/85">
              Trail photos
            </h3>
            <p className="mt-1 text-xs text-[#718176] dark:text-white/55">
              Up to {hikePhotoLimit} JPG, PNG, or WebP images; 10 MB each.
            </p>
          </div>
          <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-[8px] border border-[#d8e2d9] px-3 text-xs font-semibold text-[#31533f] transition-colors hover:bg-[#f1f7f1] has-[:disabled]:pointer-events-none has-[:disabled]:opacity-50 dark:border-white/15 dark:text-[#d7e7da] dark:hover:bg-white/[0.07]">
            <ImagePlus className="size-4" aria-hidden="true" />
            Add photos
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              disabled={remainingSlots === 0}
              className="sr-only"
              onChange={(event) => {
                addPhotos(Array.from(event.target.files ?? []));
                event.currentTarget.value = '';
              }}
            />
          </label>
        </div>
        {draft.photos.length === 0 ? (
          <p className="rounded-[8px] bg-[#f6f8f5] px-3 py-4 text-center text-xs text-[#718176] dark:bg-white/[0.04] dark:text-white/50">
            Photos are optional and will appear on the hike listing.
          </p>
        ) : (
          <ul className="space-y-3">
            {draft.photos.map((photo) => (
              <PhotoRow
                key={photo.id}
                photo={photo}
                remove={() => removePhoto(photo.id)}
                updateCaption={updateCaption}
              />
            ))}
          </ul>
        )}
        {photoError && (
          <p role="alert" className="text-xs font-medium text-[#a43f2d] dark:text-[#ffb7a8]">
            {photoError}
          </p>
        )}
      </section>
    </div>
  );
}

function PhotoRow({
  photo,
  remove,
  updateCaption,
}: {
  photo: HikeDraft['photos'][number];
  remove: () => void;
  updateCaption: (id: string, caption: string) => void;
}) {
  return (
    <li className="flex items-center gap-3 rounded-[8px] bg-[#f6f8f5] p-2.5 dark:bg-white/[0.04]">
      <img src={photo.previewUrl} alt="" className="size-14 shrink-0 rounded-[6px] object-cover" />
      <label className="min-w-0 flex-1 space-y-1">
        <span className="sr-only">Caption for {photo.file.name}</span>
        <input
          value={photo.caption}
          onChange={(event) => updateCaption(photo.id, event.target.value)}
          placeholder="Add a caption (optional)"
          maxLength={500}
          className="h-9 w-full rounded-[6px] border border-[#d8e2d9] bg-white px-2.5 text-xs text-[#203a2e] outline-none focus:border-[#1d604c] dark:border-white/15 dark:bg-[#10231f] dark:text-white"
        />
        <span className="block truncate text-[10px] text-[#718176] dark:text-white/50">
          {photo.file.name}
        </span>
      </label>
      <button
        type="button"
        onClick={remove}
        aria-label={`Remove ${photo.file.name}`}
        className="grid size-8 shrink-0 place-items-center rounded-full text-[#718176] hover:bg-white hover:text-[#a43f2d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d604c] dark:text-white/60 dark:hover:bg-white/10"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </li>
  );
}

function FieldError({ children }: { children: string }) {
  return (
    <span role="alert" className="text-xs font-medium text-[#a43f2d] dark:text-[#ffb7a8]">
      {children}
    </span>
  );
}
