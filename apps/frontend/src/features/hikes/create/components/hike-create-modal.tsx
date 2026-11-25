'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import type { DateValue } from '@heroui/react';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { ActivityFeedPost } from '@/features/home/feed/components/activity-feed-post';
import { sampleActivities } from '@/features/home/feed/lib/home-feed-preview';
import { Button } from '@/components/ui/button';

import { LocationPickerDialog } from './location-picker-dialog';
import { type HikeAdmissionMode } from './hike-admission-menu';
import type { HikeJoinedHiker } from '../lib/hike-joined-hiker';
import type { HikeLocationSelection } from '../lib/hike-location';

export function HikeCreateModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: session } = useSession();
  const [location, setLocation] = useState<HikeLocationSelection | null>(null);
  const [caption, setCaption] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [mountainName, setMountainName] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('10');
  const [selectedHikers, setSelectedHikers] = useState<HikeJoinedHiker[]>([]);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [admissionMode, setAdmissionMode] = useState<HikeAdmissionMode>('OPEN');
  const [scheduledDate, setScheduledDate] = useState<DateValue | null>(null);
  const [datePickerPortalContainer, setDatePickerPortalContainer] = useState<HTMLDivElement | null>(
    null,
  );
  const displayName = session?.user?.name?.trim() || 'You';

  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl(null);
      return;
    }

    const previewUrl = URL.createObjectURL(imageFile);
    setImagePreviewUrl(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [imageFile]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={setDatePickerPortalContainer}
        overlayClassName="bg-black/20 backdrop-blur-0 dark:bg-black/45"
        showCloseButton={false}
        className="flex max-h-[94svh] w-[calc(100%-1rem)] max-w-3xl flex-col gap-0 overflow-hidden rounded-lg border border-border/60 bg-transparent p-0 text-foreground shadow-[0_32px_100px_-28px_rgba(9,34,24,0.32)] ring-1 ring-black/[0.04] dark:shadow-[0_32px_100px_-28px_rgba(0,0,0,0.56)] dark:ring-white/[0.06]"
      >
        <DialogHeader className="relative z-10 shrink-0 border-b border-border/45 bg-background/60 px-5 py-3 pr-14 text-left shadow-[0_8px_32px_rgba(12,24,18,0.1)] backdrop-blur-2xl supports-[backdrop-filter]:bg-background/45 sm:px-7">
          <DialogTitle className="text-base font-semibold text-card-foreground">
            Organize a hike
          </DialogTitle>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Close preview"
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-transparent text-foreground/70 hover:bg-foreground/10 hover:text-foreground"
          >
            <X className="size-4" aria-hidden="true" />
          </Button>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <ActivityFeedPost
            post={sampleActivities[0]}
            embedded
            locationName={location?.displayName ?? 'Pick a meeting place'}
            onLocationClick={() => setIsLocationPickerOpen(true)}
            selectedHikers={selectedHikers}
            onSelectedHikersChange={setSelectedHikers}
            attachedImageUrl={imagePreviewUrl}
            onImageChange={setImageFile}
            authorName={displayName}
            authorAvatarUrl={session?.user?.image}
            caption={caption}
            onCaptionChange={setCaption}
            mountainName={mountainName}
            onMountainNameChange={setMountainName}
            maxParticipants={maxParticipants}
            onMaxParticipantsChange={setMaxParticipants}
            admissionMode={admissionMode}
            onAdmissionModeChange={setAdmissionMode}
            scheduledDate={scheduledDate}
            onScheduledDateChange={setScheduledDate}
            datePickerPortalContainer={datePickerPortalContainer}
          />
        </div>

        <footer
          aria-hidden="true"
          className="relative z-10 h-5 shrink-0 border-t border-border/45 bg-background/60 shadow-[0_-8px_32px_rgba(12,24,18,0.1)] backdrop-blur-2xl supports-[backdrop-filter]:bg-background/45"
        />
      </DialogContent>
      <LocationPickerDialog
        open={isLocationPickerOpen}
        onOpenChange={setIsLocationPickerOpen}
        initialLocation={location}
        onSelect={setLocation}
      />
    </Dialog>
  );
}
