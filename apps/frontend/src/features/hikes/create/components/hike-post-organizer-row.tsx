'use client';

import { ChevronDown, Settings2 } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import type { HikeDraft } from '../lib/hike-draft';
import { getInitials } from '../lib/hike-post-composer-utils';

export function HikePostOrganizerRow({
  displayName,
  admissionMode,
  update,
}: {
  displayName: string;
  admissionMode: HikeDraft['admissionMode'];
  update: <K extends keyof HikeDraft>(field: K, value: HikeDraft[K]) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#a17e69] text-xs font-bold text-white dark:bg-[#557b69]">
        {getInitials(displayName)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[#263f34] dark:text-[#edf4ef]">
          {displayName || 'You'}
        </p>
        <p className="text-[11px] text-[#758078] dark:text-white/50">Organizing this hike</p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`Privacy settings: ${admissionMode === 'OPEN' ? 'anyone can join' : 'approval required'}`}
            className="inline-flex h-9 items-center gap-2 rounded-full border border-[#d8e2d9] bg-white px-3 text-xs font-semibold text-[#52675a] transition-colors hover:border-[#1d604c]/30 hover:bg-[#f4f8f4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d604c]/25 dark:border-white/15 dark:bg-white/[0.04] dark:text-white/75 dark:hover:bg-white/[0.08]"
          >
            <Settings2 className="size-3.5 text-[#9a7548] dark:text-[#e8bd78]" aria-hidden="true" />
            {admissionMode === 'OPEN' ? 'Anyone can join' : 'Approval required'}
            <ChevronDown className="size-3.5" aria-hidden="true" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72 border-[#dce5dc] dark:border-white/10">
          <DropdownMenuLabel className="text-xs text-[#718176] dark:text-white/55">
            Who can join this hike?
          </DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={admissionMode}
            onValueChange={(value) => update('admissionMode', value as HikeDraft['admissionMode'])}
          >
            <DropdownMenuRadioItem value="OPEN" className="py-2.5">
              <span>
                <span className="block font-semibold">Anyone can join</span>
                <span className="mt-0.5 block text-[11px] text-[#718176] dark:text-white/55">
                  Hikers can join directly while space remains.
                </span>
              </span>
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="APPROVAL" className="py-2.5">
              <span>
                <span className="block font-semibold">Approval required</span>
                <span className="mt-0.5 block text-[11px] text-[#718176] dark:text-white/55">
                  You accept each join request.
                </span>
              </span>
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
