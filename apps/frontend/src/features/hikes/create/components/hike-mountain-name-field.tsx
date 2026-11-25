'use client';

import { ChevronDown, Mountain } from 'lucide-react';
import { ComboBox, Description, FieldError, Input, Label, ListBox } from '@heroui/react';

import { popularTrails } from '../lib/mountain-suggestions';

export function HikeMountainNameField({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <ComboBox
      inputValue={value}
      onInputChange={onChange}
      allowsCustomValue
      isRequired
      isInvalid={!!error}
      validationBehavior="aria"
      menuTrigger="focus"
      fullWidth
      className="w-full gap-1.5"
    >
      <Label className="text-sm font-medium text-[#354b3e] dark:text-white/80">
        Mountain or trail name
      </Label>
      <ComboBox.InputGroup className="relative h-10 w-full">
        <Mountain
          className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-[#a77845] dark:text-[#e8bd78]"
          aria-hidden="true"
        />
        <Input
          placeholder="Search or enter a mountain or trail"
          maxLength={200}
          className="!h-10 !min-h-10 w-full rounded-[8px] border border-[#e1e9e1] bg-[#f8faf7] pl-9 pr-9 text-sm font-medium text-[#354b3e] outline-none transition focus-visible:border-[#1d604c] focus-visible:ring-2 focus-visible:ring-[#1d604c]/15 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/80"
        />
        <ComboBox.Trigger className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-[#718176] transition-colors hover:bg-[#edf2ed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d604c] dark:text-white/55 dark:hover:bg-white/10">
          <ChevronDown className="size-4" aria-hidden="true" />
        </ComboBox.Trigger>
      </ComboBox.InputGroup>
      {error && (
        <FieldError className="text-xs text-[#a43f2d] dark:text-[#ffb7a8]">{error}</FieldError>
      )}
      <ComboBox.Popover
        placement="bottom start"
        className="min-w-64 rounded-[8px] border border-[#e1e9e1] bg-white p-1.5 text-[#203a2e] shadow-xl dark:border-white/10 dark:bg-[#17342e] dark:text-white"
      >
        <ListBox
          aria-label="Popular mountains and trails"
          className="max-h-60 overflow-y-auto outline-none"
        >
          {popularTrails.map((trail) => (
            <ListBox.Item
              key={trail.name}
              textValue={trail.name}
              className="flex cursor-default items-center justify-between gap-4 rounded-[6px] px-3 py-2 data-[focused=true]:bg-[#f1f6f1] data-[selected=true]:bg-[#edf3ee] dark:data-[focused=true]:bg-white/[0.08] dark:data-[selected=true]:bg-white/[0.1]"
            >
              <span className="min-w-0">
                <Label className="block truncate text-sm font-medium text-[#354b3e] dark:text-white/85">
                  {trail.name}
                </Label>
                <Description className="mt-0.5 block truncate text-xs text-[#718176] dark:text-white/50">
                  {trail.location}
                </Description>
              </span>
              <span className="shrink-0 text-[10px] text-[#879189] dark:text-white/40">
                {trail.length}
              </span>
            </ListBox.Item>
          ))}
        </ListBox>
      </ComboBox.Popover>
    </ComboBox>
  );
}
