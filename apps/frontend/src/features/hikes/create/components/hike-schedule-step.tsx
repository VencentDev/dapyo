'use client';

import { CalendarClock } from 'lucide-react';

import type { HikeDraft, HikeDraftErrors } from '../lib/hike-draft';

function localToday() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function HikeScheduleStep({
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
          When should everyone meet?
        </h2>
        <p className="mt-1 text-sm text-[#65776c] dark:text-white/60">
          Choose a future date and local start time. Hikers will see it in their own time zone.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[#354b3e] dark:text-white/80">Date</span>
          <input
            type="date"
            min={localToday()}
            value={draft.date}
            onChange={(event) => update('date', event.target.value)}
            aria-invalid={!!errors.date}
            className="h-11 w-full rounded-[8px] border border-[#d8e2d9] bg-white px-3 text-sm text-[#203a2e] outline-none focus:border-[#1d604c] focus:ring-2 focus:ring-[#1d604c]/15 aria-invalid:border-[#b64e34] dark:border-white/15 dark:bg-[#10231f] dark:text-white"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[#354b3e] dark:text-white/80">Start time</span>
          <input
            type="time"
            value={draft.time}
            onChange={(event) => update('time', event.target.value)}
            aria-invalid={!!errors.date}
            className="h-11 w-full rounded-[8px] border border-[#d8e2d9] bg-white px-3 text-sm text-[#203a2e] outline-none focus:border-[#1d604c] focus:ring-2 focus:ring-[#1d604c]/15 aria-invalid:border-[#b64e34] dark:border-white/15 dark:bg-[#10231f] dark:text-white"
          />
        </label>
      </div>
      {errors.date && (
        <p role="alert" className="text-xs font-medium text-[#a43f2d] dark:text-[#ffb7a8]">
          {errors.date}
        </p>
      )}

      <div className="flex items-start gap-3 rounded-[8px] border border-[#e1e9e1] bg-[#f6f8f5] p-4 dark:border-white/10 dark:bg-white/[0.04]">
        <CalendarClock
          className="mt-0.5 size-4 shrink-0 text-[#a77845] dark:text-[#e8bd78]"
          aria-hidden="true"
        />
        <p className="text-xs leading-5 text-[#68796e] dark:text-white/60">
          The time you choose is interpreted on this device, then saved as a shared date and time.
        </p>
      </div>
    </div>
  );
}
