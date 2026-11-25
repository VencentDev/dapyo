'use client';

import { Button } from '@heroui/react';
import { MapPin } from 'lucide-react';

export function HikeLocationBadge({
  locationName,
  onClick,
}: {
  locationName: string;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="tertiary"
      aria-label={`Choose meeting place. Current meeting place: ${locationName}`}
      onPress={onClick}
      className="onboarding-theme-hover -ml-1 inline-flex h-auto min-h-0 max-w-full min-w-0 items-center gap-1.5 rounded-md px-1 py-0 text-[11px] font-normal leading-4 text-muted-foreground"
    >
      <MapPin className="size-3 shrink-0" aria-hidden="true" />
      <span className="truncate">{locationName}</span>
    </Button>
  );
}
