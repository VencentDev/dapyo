'use client';

import { Globe, Lock, Settings2 } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type HikeAdmissionMode = 'OPEN' | 'APPROVAL';

export function HikeAdmissionMenu({
  mode,
  onChange,
}: {
  mode: HikeAdmissionMode;
  onChange: (mode: HikeAdmissionMode) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Join settings: ${mode === 'OPEN' ? 'anyone can join' : 'approval required'}`}
          className="grid size-7 shrink-0 place-items-center rounded-full text-[#17342e] transition-colors hover:bg-[#edf5ee] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d604c]/30 dark:text-[#b9d8c2] dark:hover:bg-white/[0.08]"
        >
          <Settings2 className="size-3.5" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72 border-[#dce5dc] dark:border-white/10">
        <DropdownMenuLabel className="text-xs text-[#718176] dark:text-white/55">
          Who can join this hike?
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={mode}
          onValueChange={(value) => {
            if (value === 'OPEN' || value === 'APPROVAL') onChange(value);
          }}
        >
          <DropdownMenuRadioItem
            value="OPEN"
            className="gap-2 py-2.5 transition-colors hover:bg-[#edf5ee] focus:bg-[#edf5ee] dark:hover:bg-white/[0.08] dark:focus:bg-white/[0.08]"
          >
            <Globe
              className="size-4 shrink-0 text-[#1d604c] dark:text-[#b9d8c2]"
              aria-hidden="true"
            />
            <span>
              <span className="block font-semibold">Anyone can join</span>
              <span className="mt-0.5 block text-[11px] text-[#718176] dark:text-white/55">
                Hikers can join directly while space remains.
              </span>
            </span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            value="APPROVAL"
            className="gap-2 py-2.5 transition-colors hover:bg-[#edf5ee] focus:bg-[#edf5ee] dark:hover:bg-white/[0.08] dark:focus:bg-white/[0.08]"
          >
            <Lock
              className="size-4 shrink-0 text-[#1d604c] dark:text-[#b9d8c2]"
              aria-hidden="true"
            />
            <span>
              <span className="block font-semibold">Only approved hikers</span>
              <span className="mt-0.5 block text-[11px] text-[#718176] dark:text-white/55">
                You review each join request.
              </span>
            </span>
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
