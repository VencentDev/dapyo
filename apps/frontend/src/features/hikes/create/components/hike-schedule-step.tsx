'use client';

import type { HikeDraft, HikeDraftErrors } from '../lib/hike-draft';

function localTomorrow() {
  const now = new Date();
  now.setDate(now.getDate() + 1);
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
          When is the hike?
        </h2>
        <p className="mt-1 text-sm text-[#65776c] dark:text-white/60">
          Choose a future date for your hike.
        </p>
      </div>

      <div className="grid gap-4">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[#354b3e] dark:text-white/80">Date</span>
          <input
            type="date"
            min={localTomorrow()}
            value={draft.date}
            onChange={(event) => update('date', event.target.value)}
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
    </div>
  );
}
