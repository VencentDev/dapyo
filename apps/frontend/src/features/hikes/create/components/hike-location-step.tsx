'use client';

import { MapPin } from 'lucide-react';

import type { HikeDraft, HikeDraftErrors } from '../lib/hike-draft';

export function HikeLocationStep({
  draft,
  errors,
  update,
}: {
  draft: HikeDraft;
  errors: HikeDraftErrors;
  update: <K extends keyof HikeDraft>(field: K, value: HikeDraft[K]) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-[#1d382c] dark:text-[#edf4ef]">
          Where are you heading?
        </h2>
        <p className="mt-1 text-sm text-[#65776c] dark:text-white/60">
          Add the trail or destination and the meeting point coordinates.
        </p>
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-[#354b3e] dark:text-white/80">
          Trail or location
        </span>
        <input
          value={draft.locationName}
          onChange={(event) => update('locationName', event.target.value)}
          placeholder="e.g. Mount Pulag, Ambangeg Trail"
          maxLength={500}
          aria-invalid={!!errors.locationName}
          className="h-11 w-full rounded-[8px] border border-[#d8e2d9] bg-white px-3 text-sm text-[#203a2e] outline-none transition focus:border-[#1d604c] focus:ring-2 focus:ring-[#1d604c]/15 aria-invalid:border-[#b64e34] dark:border-white/15 dark:bg-[#10231f] dark:text-white"
        />
        {errors.locationName && <FieldError>{errors.locationName}</FieldError>}
      </label>

      <div className="rounded-[8px] border border-[#e1e9e1] bg-[#f6f8f5] p-4 dark:border-white/10 dark:bg-white/[0.04]">
        <div className="flex items-start gap-2.5">
          <MapPin
            className="mt-0.5 size-4 shrink-0 text-[#a77845] dark:text-[#e8bd78]"
            aria-hidden="true"
          />
          <div>
            <p className="text-sm font-semibold text-[#354b3e] dark:text-white/85">
              Meeting point coordinates
            </p>
            <p className="mt-1 text-xs leading-5 text-[#718176] dark:text-white/55">
              Enter decimal degrees for the spot where your group will meet.
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-[#52675a] dark:text-white/70">Latitude</span>
            <input
              type="number"
              inputMode="decimal"
              step="any"
              min="-90"
              max="90"
              value={draft.latitude}
              onChange={(event) => update('latitude', event.target.value)}
              placeholder="14.5995"
              aria-invalid={!!errors.latitude}
              className="h-10 w-full rounded-[8px] border border-[#d8e2d9] bg-white px-3 text-sm text-[#203a2e] outline-none focus:border-[#1d604c] focus:ring-2 focus:ring-[#1d604c]/15 aria-invalid:border-[#b64e34] dark:border-white/15 dark:bg-[#10231f] dark:text-white"
            />
            {errors.latitude && <FieldError>{errors.latitude}</FieldError>}
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-[#52675a] dark:text-white/70">Longitude</span>
            <input
              type="number"
              inputMode="decimal"
              step="any"
              min="-180"
              max="180"
              value={draft.longitude}
              onChange={(event) => update('longitude', event.target.value)}
              placeholder="120.9842"
              aria-invalid={!!errors.longitude}
              className="h-10 w-full rounded-[8px] border border-[#d8e2d9] bg-white px-3 text-sm text-[#203a2e] outline-none focus:border-[#1d604c] focus:ring-2 focus:ring-[#1d604c]/15 aria-invalid:border-[#b64e34] dark:border-white/15 dark:bg-[#10231f] dark:text-white"
            />
            {errors.longitude && <FieldError>{errors.longitude}</FieldError>}
          </label>
        </div>
      </div>
    </div>
  );
}

function FieldError({ children }: { children: string }) {
  return (
    <span className="block text-xs font-medium text-[#a43f2d] dark:text-[#ffb7a8]">{children}</span>
  );
}
