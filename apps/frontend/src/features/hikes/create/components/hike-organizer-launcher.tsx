'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';

import { HikeCreateModal } from './hike-create-modal';

export function HikeOrganizerLauncher() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Organize a hike"
        className="grid size-9 shrink-0 place-items-center rounded-full bg-[#1d604c] text-white transition-colors hover:bg-[#174c3d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8bd78] focus-visible:ring-offset-2 dark:ring-offset-[#17342e]"
      >
        <Plus className="size-4" aria-hidden="true" />
      </button>
      <HikeCreateModal open={open} onOpenChange={setOpen} />
    </>
  );
}
