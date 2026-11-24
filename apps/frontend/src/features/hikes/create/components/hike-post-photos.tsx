'use client';

import Image from 'next/image';
import { ImagePlus, X } from 'lucide-react';

import type { HikeDraftPhoto } from '../lib/hike-draft';
import { hikePhotoLimit } from '../lib/hike-photos';

export function HikePostPhotos({
  photos,
  addPhotos,
  photoError,
  removePhoto,
  updateCaption,
}: {
  photos: HikeDraftPhoto[];
  addPhotos: (files: File[]) => void;
  photoError?: string;
  removePhoto: (id: string) => void;
  updateCaption: (id: string, caption: string) => void;
}) {
  return (
    <section aria-label="Hike photos" className="space-y-2.5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold text-[#52675a] dark:text-white/70">Photos</p>
        <p className="text-[10px] text-[#879189] dark:text-white/40">
          Add up to {hikePhotoLimit} · JPG, PNG, or WebP · 10 MB each
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((photo) => (
          <div key={photo.id} className="min-w-0 space-y-2">
            <div className="relative aspect-square overflow-hidden rounded-[8px] bg-[#edf1ec] dark:bg-white/[0.06]">
              <Image
                src={photo.previewUrl}
                alt={photo.file.name}
                fill
                unoptimized
                sizes="(max-width: 640px) 50vw, 260px"
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => removePhoto(photo.id)}
                aria-label={`Remove ${photo.file.name}`}
                className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-black/65 text-white transition-colors hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
            <input
              value={photo.caption}
              onChange={(event) => updateCaption(photo.id, event.target.value)}
              placeholder="Add a photo caption"
              maxLength={500}
              aria-label={`Caption for ${photo.file.name}`}
              className="h-9 w-full rounded-[7px] border border-[#e1e9e1] bg-white px-2.5 text-xs text-[#354b3e] outline-none focus:border-[#1d604c] dark:border-white/10 dark:bg-white/[0.04] dark:text-white/80"
            />
          </div>
        ))}
        {photos.length < hikePhotoLimit && (
          <label className="grid aspect-square cursor-pointer place-items-center rounded-[8px] border border-dashed border-[#cddacf] bg-[#f7f9f6] text-center transition-colors hover:border-[#1d604c]/50 hover:bg-[#f0f6f0] focus-within:ring-2 focus-within:ring-[#1d604c]/25 dark:border-white/15 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="sr-only"
              onChange={(event) => {
                if (event.currentTarget.files) addPhotos(Array.from(event.currentTarget.files));
                event.currentTarget.value = '';
              }}
            />
            <span className="flex flex-col items-center gap-2 px-3">
              <span className="grid size-10 place-items-center rounded-full bg-white text-[#1d604c] shadow-sm dark:bg-white/[0.08] dark:text-[#b9d8c2]">
                <ImagePlus className="size-5" aria-hidden="true" />
              </span>
              <span className="text-xs font-semibold text-[#52675a] dark:text-white/70">
                Attach image
              </span>
              <span className="text-[10px] text-[#879189] dark:text-white/40">Square preview</span>
            </span>
          </label>
        )}
      </div>
      {photoError && (
        <p role="alert" className="text-xs font-medium text-[#a43f2d] dark:text-[#ffb7a8]">
          {photoError}
        </p>
      )}
    </section>
  );
}
