'use client';

import { useState } from 'react';
import { Plus } from '@boxicons/react';
import { Tooltip } from '@heroui/react';

import { HikeCreateModal } from './hike-create-modal';

export function HikeOrganizerLauncher() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip delay={0}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Organize a hike"
          className="grid size-9 shrink-0 place-items-center rounded-full bg-[#1d604c] text-white transition-colors hover:bg-[#174c3d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8bd78] focus-visible:ring-offset-2 dark:ring-offset-[#17342e]"
        >
          <Plus pack="filled" className="size-4" aria-hidden="true" />
        </button>
        <Tooltip.Content showArrow placement="top" offset={8}>
          <Tooltip.Arrow />
          <p>Organize a hike</p>
        </Tooltip.Content>
      </Tooltip>
      <HikeCreateModal open={open} onOpenChange={setOpen} />
    </>
  );
}
