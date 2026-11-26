'use client';

import { Button, Tooltip } from '@heroui/react';
import { LocationPin } from '@boxicons/react';

export function HikeLocationBadge({
  locationName,
  onClick,
  portalContainer,
}: {
  locationName: string;
  onClick: () => void;
  portalContainer?: HTMLElement | null;
}) {
  return (
    <Tooltip delay={0}>
      <Button
        type="button"
        variant="tertiary"
        aria-label={`Choose meeting place. Current meeting place: ${locationName}`}
        onPress={onClick}
        className="!grid !size-8 !min-w-8 !shrink-0 !place-items-center !rounded-full !border-0 !bg-[#e8ece9] !p-0 !text-[#5b6b60] transition-colors hover:!bg-[#1d604c] hover:!text-white dark:!bg-white/10 dark:!text-white/70 dark:hover:!bg-[#1d604c] dark:hover:!text-white"
      >
        <LocationPin pack="filled" className="size-4" aria-hidden="true" />
      </Button>
      <Tooltip.Content
        className="z-[100] whitespace-nowrap"
        UNSTABLE_portalContainer={portalContainer ?? undefined}
        showArrow
        placement="top"
        offset={8}
      >
        <Tooltip.Arrow />
        <p>Meeting place</p>
      </Tooltip.Content>
    </Tooltip>
  );
}
