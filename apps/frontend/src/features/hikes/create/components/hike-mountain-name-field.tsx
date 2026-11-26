'use client';

import { useRef, useState } from 'react';
import { ChevronDown, Mountain } from '@boxicons/react';
import { ComboBox, Description, FieldError, Input, Label, ListBox } from '@heroui/react';

import { popularTrails } from '../lib/mountain-suggestions';

export function HikeMountainNameField({
  value,
  onChange,
  error,
  portalContainer,
  compact = false,
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  portalContainer?: HTMLElement | null;
  compact?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = useRef<string | null>(null);

  const handleOpenChange = (nextIsOpen: boolean) => {
    if (nextIsOpen && selectedOption.current !== null) return;
    setIsOpen(nextIsOpen);
  };

  const handleInputChange = (nextValue: string) => {
    onChange(nextValue);

    if (nextValue === selectedOption.current) {
      setIsOpen(false);
      return;
    }

    selectedOption.current = null;
    setIsOpen(true);
  };

  const selectOption = (nextValue: string) => {
    selectedOption.current = nextValue;
    onChange(nextValue);
    setIsOpen(false);
    window.setTimeout(() => {
      if (selectedOption.current === nextValue) selectedOption.current = null;
      setIsOpen(false);
    }, 0);
  };

  return (
    <ComboBox
      inputValue={value}
      onOpenChange={handleOpenChange}
      onInputChange={handleInputChange}
      onSelectionChange={(selectedKey) => {
        if (typeof selectedKey === 'string') selectOption(selectedKey);
      }}
      allowsCustomValue
      isRequired
      isInvalid={!!error}
      validationBehavior="aria"
      menuTrigger="manual"
      fullWidth={!compact}
      className={compact ? 'w-40 min-w-28' : 'grid w-full grid-rows-[20px_40px] gap-y-1.5'}
    >
      <Label
        className={
          compact
            ? 'sr-only'
            : 'h-5 leading-5 text-sm font-medium text-[#354b3e] dark:text-white/80'
        }
      >
        Mountain or trail name
      </Label>
      <ComboBox.InputGroup className={`relative ${compact ? 'h-8 w-full' : 'h-10 w-full'}`}>
        <Mountain
          pack="filled"
          className={`pointer-events-none absolute top-1/2 z-10 -translate-y-1/2 text-[#a77845] dark:text-[#e8bd78] ${compact ? 'left-2 size-3.5' : 'left-3 size-4'}`}
          aria-hidden="true"
        />
        <Input
          title={compact && value ? value : undefined}
          placeholder={compact ? 'Mountain or trail' : 'Search or enter a mountain or trail'}
          maxLength={200}
          className={`w-full rounded-[8px] border border-[#e1e9e1] bg-[#f8faf7] font-medium text-[#354b3e] outline-none transition focus-visible:border-[#1d604c] focus-visible:ring-2 focus-visible:ring-[#1d604c]/15 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/80 ${compact ? '!h-8 !min-h-8 pl-7 pr-8 text-xs' : '!h-10 !min-h-10 pl-9 pr-9 text-sm'}`}
        />
        <ComboBox.Trigger
          aria-label="Show mountain and trail suggestions"
          className={`absolute top-1/2 !grid !-translate-y-1/2 !place-items-center !p-0 text-[#718176] transition-colors hover:bg-[#edf2ed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d604c] dark:text-white/55 dark:hover:bg-white/10 ${compact ? 'right-1 !size-6 !rounded-full' : 'right-2 !size-7 !rounded-md'}`}
        >
          <ChevronDown
            pack="filled"
            className={compact ? 'size-3.5' : 'size-4'}
            aria-hidden="true"
          />
        </ComboBox.Trigger>
      </ComboBox.InputGroup>
      {error && (
        <FieldError className="text-xs text-[#a43f2d] dark:text-[#ffb7a8]">{error}</FieldError>
      )}
      <ComboBox.Popover
        isOpen={isOpen}
        placement="bottom start"
        UNSTABLE_portalContainer={portalContainer ?? undefined}
        className="z-[100] min-w-64 rounded-[8px] border border-[#e1e9e1] bg-white p-1.5 text-[#203a2e] shadow-xl dark:border-white/10 dark:bg-[#17342e] dark:text-white"
      >
        <ListBox
          aria-label="Popular mountains and trails"
          className="max-h-60 overflow-y-auto outline-none"
        >
          {popularTrails.map((trail) => (
            <ListBox.Item
              key={trail.name}
              textValue={trail.name}
              onAction={() => selectOption(trail.name)}
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
