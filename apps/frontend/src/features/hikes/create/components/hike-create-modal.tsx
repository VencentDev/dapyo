'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AlertDialog, Button as HeroButton, Tooltip } from '@heroui/react';
import type { DateValue } from '@heroui/react';
import { AlertCircle, X } from '@boxicons/react';
import { toast } from 'sonner';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ActivityFeedPost } from '@/features/home/feed/components/activity-feed-post';
import { sampleActivities } from '@/features/home/feed/lib/home-feed-preview';
import { Button } from '@/components/ui/button';
import {
  useCreateHike,
  useUploadHikeImage,
  type HikeCreateRequest,
} from '@/features/hikes/api/hikes.hooks';
import { useTrailmates } from '@/features/trailmates/api/trailmates.hooks';
import { ApiError } from '@/lib/api';

import { LocationPickerDialog } from './location-picker-dialog';
import { type HikeAdmissionMode } from './hike-admission-menu';
import { HikeImageCropDialog } from './hike-image-crop-dialog';
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
  const router = useRouter();
  const createHike = useCreateHike();
  const uploadHikeImage = useUploadHikeImage();
  const trailmatesQuery = useTrailmates(open);
  const [location, setLocation] = useState<HikeLocationSelection | null>(null);
  const [caption, setCaption] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [isImageCropOpen, setIsImageCropOpen] = useState(false);
  const [mountainName, setMountainName] = useState('');
  const [hikersLookingFor, setHikersLookingFor] = useState(10);
  const [selectedHikers, setSelectedHikers] = useState<HikeJoinedHiker[]>([]);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false);
  const [admissionMode, setAdmissionMode] = useState<HikeAdmissionMode>('OPEN');
  const [difficultyRating, setDifficultyRating] = useState(3);
  const [scheduledDate, setScheduledDate] = useState<DateValue | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [overlayPortalContainer, setOverlayPortalContainer] = useState<HTMLDivElement | null>(null);
  const displayName = session?.user?.name?.trim() || 'You';
  const hasUnsavedChanges = Boolean(
    location ||
    caption.trim() ||
    imageFile ||
    pendingImageFile ||
    mountainName.trim() ||
    hikersLookingFor !== 10 ||
    selectedHikers.length ||
    admissionMode !== 'OPEN' ||
    difficultyRating !== 3 ||
    scheduledDate,
  );

  const requestClose = () => {
    if (isSubmitting) return;
    if (hasUnsavedChanges) {
      setIsDiscardDialogOpen(true);
      return;
    }

    onOpenChange(false);
  };

  const discardChanges = () => {
    setLocation(null);
    setCaption('');
    setImageFile(null);
    setPendingImageFile(null);
    setIsImageCropOpen(false);
    setMountainName('');
    setHikersLookingFor(10);
    setSelectedHikers([]);
    setIsLocationPickerOpen(false);
    setAdmissionMode('OPEN');
    setDifficultyRating(3);
    setScheduledDate(null);
    setIsDiscardDialogOpen(false);
    onOpenChange(false);
  };

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (nextOpen) onOpenChange(true);
    else if (!isSubmitting) requestClose();
  };

  const handlePost = async (rating: number) => {
    const errors: string[] = [];
    if (!location?.displayName.trim()) errors.push('meeting place');
    if (!mountainName.trim()) errors.push('mountain or trail name');
    if (!caption.trim()) errors.push('hike description');
    if (!scheduledDate) errors.push('schedule date');

    if (errors.length) {
      toast.error(`Complete these details before posting: ${errors.join(', ')}.`);
      return false;
    }
    if (!location || !scheduledDate) return false;
    if (!session?.accessToken) {
      toast.error('Sign in again before posting your hike.');
      return false;
    }

    const selectedDay = new Date(scheduledDate.year, scheduledDate.month - 1, scheduledDate.day);
    selectedDay.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDay.getTime() <= today.getTime()) {
      toast.error('Choose a future hike date.');
      return false;
    }
    const formattedDate = `${scheduledDate.year}-${String(scheduledDate.month).padStart(2, '0')}-${String(scheduledDate.day).padStart(2, '0')}`;

    const selectedProfileIds = selectedHikers
      .filter((hiker) => hiker.kind === 'profile')
      .map((hiker) => hiker.id);
    setIsSubmitting(true);
    try {
      const selectedGuestNames = selectedHikers
        .filter((hiker) => hiker.kind === 'guest')
        .map((hiker) => hiker.name.trim());
      const selectedGuestCount = selectedGuestNames.length;
      let trailmates = trailmatesQuery.data;
      if (selectedProfileIds.length && !trailmates) {
        const result = await trailmatesQuery.refetch();
        if (result.isError || !result.data) {
          toast.error('Could not verify your selected Trailmates. Please try again.');
          return false;
        }
        trailmates = result.data;
      }
      const acceptedTrailmateIds = new Set((trailmates ?? []).map((hiker) => hiker.userId));
      if (selectedProfileIds.some((id) => !acceptedTrailmateIds.has(id))) {
        toast.error(
          'Only accepted Trailmates can be added as hikers. Add others by name as guests.',
        );
        return false;
      }
      if (!Number.isInteger(hikersLookingFor) || hikersLookingFor < 0) {
        toast.error('The number of additional hikers must be zero or more.');
        return false;
      }

      const request: HikeCreateRequest = {
        locationName: location.displayName.trim(),
        mountainName: mountainName.trim(),
        latitude: location.latitude,
        longitude: location.longitude,
        scheduledDate: formattedDate,
        difficulty: difficultyFromRating(rating),
        difficultyRating: rating,
        maxParticipants: 1 + selectedHikers.length + hikersLookingFor,
        initialMemberIds: selectedProfileIds,
        externalGuestCount: selectedGuestCount,
        externalGuestNames: selectedGuestNames,
        admissionMode,
        description: caption.trim(),
        distanceKm: null,
        requirements: null,
      };

      const hike = await createHike.mutateAsync(request);
      let imageUploadFailed = false;
      if (imageFile) {
        try {
          await uploadHikeImage.mutateAsync({
            hikeId: hike.id,
            file: imageFile,
            caption: caption.trim(),
          });
        } catch {
          imageUploadFailed = true;
        }
      }

      if (imageUploadFailed) {
        toast.warning(
          'Your hike was posted, but its photo could not be uploaded. You can add it from the hike page.',
        );
      } else {
        toast.success('Your hike has been posted.');
      }
      discardChanges();
      router.push(`/hikes/${hike.id}`);
      return true;
    } catch (error) {
      toast.error(messageForCreateError(error));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

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
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent
        ref={setOverlayPortalContainer}
        overlayClassName="bg-black/20 backdrop-blur-0 dark:bg-black/45"
        showCloseButton={false}
        className="flex max-h-[94svh] w-[calc(100%-1rem)] max-w-3xl flex-col gap-0 overflow-visible rounded-lg border border-border/60 bg-transparent p-0 text-foreground shadow-[0_32px_100px_-28px_rgba(9,34,24,0.32)] ring-1 ring-black/[0.04] dark:shadow-[0_32px_100px_-28px_rgba(0,0,0,0.56)] dark:ring-white/[0.06]"
      >
        <DialogHeader className="relative z-10 shrink-0 rounded-t-lg border-b border-border/45 bg-background/60 px-5 py-3 pr-14 text-left shadow-[0_8px_32px_rgba(12,24,18,0.1)] backdrop-blur-2xl supports-[backdrop-filter]:bg-background/45 sm:px-7">
          <DialogTitle className="text-base font-semibold text-card-foreground">
            Organize a hike
          </DialogTitle>
          <Tooltip delay={0}>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Close preview"
              disabled={isSubmitting}
              onClick={requestClose}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-transparent text-foreground/70 hover:bg-foreground/10 hover:text-foreground"
            >
              <X pack="filled" className="size-4" aria-hidden="true" />
            </Button>
            <Tooltip.Content className="z-[100]" showArrow placement="top" offset={8}>
              <Tooltip.Arrow />
              <p>Close and review unsaved changes</p>
            </Tooltip.Content>
          </Tooltip>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <ActivityFeedPost
            post={sampleActivities[0]}
            embedded
            locationName={location?.displayName ?? 'Pick a meeting place'}
            selectedMeetingPlace={location?.displayName}
            onLocationClick={() => setIsLocationPickerOpen(true)}
            selectedHikers={selectedHikers}
            onSelectedHikersChange={setSelectedHikers}
            attachedImageUrl={imagePreviewUrl}
            onImageChange={(file) => {
              if (!file) return;
              setPendingImageFile(file);
              setIsImageCropOpen(true);
            }}
            difficultyRating={difficultyRating}
            onDifficultyRatingChange={setDifficultyRating}
            authorName={displayName}
            authorAvatarUrl={session?.user?.image}
            caption={caption}
            onCaptionChange={setCaption}
            mountainName={mountainName}
            onMountainNameChange={setMountainName}
            hikersLookingFor={hikersLookingFor}
            onHikersLookingForChange={setHikersLookingFor}
            admissionMode={admissionMode}
            onAdmissionModeChange={setAdmissionMode}
            scheduledDate={scheduledDate}
            onScheduledDateChange={setScheduledDate}
            onPost={handlePost}
            isSubmitting={isSubmitting}
            overlayPortalContainer={overlayPortalContainer}
          />
        </div>

        <footer
          aria-hidden="true"
          className="relative z-10 h-5 shrink-0 rounded-b-lg border-t border-border/45 bg-background/60 shadow-[0_-8px_32px_rgba(12,24,18,0.1)] backdrop-blur-2xl supports-[backdrop-filter]:bg-background/45"
        />
      </DialogContent>
      <LocationPickerDialog
        open={isLocationPickerOpen}
        onOpenChange={setIsLocationPickerOpen}
        initialLocation={location}
        onSelect={setLocation}
      />
      <HikeImageCropDialog
        open={isImageCropOpen}
        imageFile={pendingImageFile}
        onOpenChange={(open) => {
          setIsImageCropOpen(open);
          if (!open) setPendingImageFile(null);
        }}
        onApply={(file) => {
          setImageFile(file);
          setPendingImageFile(null);
        }}
      />
      <AlertDialog isOpen={isDiscardDialogOpen} onOpenChange={setIsDiscardDialogOpen}>
        <HeroButton
          type="button"
          aria-label="Discard confirmation"
          aria-hidden="true"
          className="hidden"
        />
        <AlertDialog.Backdrop>
          <AlertDialog.Container>
            <AlertDialog.Dialog className="sm:max-w-[400px]">
              <AlertDialog.CloseTrigger aria-label="Close discard confirmation">
                <X pack="filled" className="size-4" aria-hidden="true" />
              </AlertDialog.CloseTrigger>
              <AlertDialog.Header>
                <AlertDialog.Icon status="warning">
                  <AlertCircle pack="filled" aria-hidden="true" />
                </AlertDialog.Icon>
                <AlertDialog.Heading>Discard unsaved changes?</AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body>
                <p>Your hike draft will be cleared if you discard it.</p>
              </AlertDialog.Body>
              <AlertDialog.Footer>
                <HeroButton slot="close" variant="tertiary">
                  Keep Editing
                </HeroButton>
                <HeroButton slot="close" variant="danger" onPress={discardChanges}>
                  Discard
                </HeroButton>
              </AlertDialog.Footer>
            </AlertDialog.Dialog>
          </AlertDialog.Container>
        </AlertDialog.Backdrop>
      </AlertDialog>
    </Dialog>
  );
}

function difficultyFromRating(rating: number): HikeCreateRequest['difficulty'] {
  if (rating <= 2) return 'EASY';
  if (rating >= 4) return 'CHALLENGING';
  return 'MODERATE';
}

function messageForCreateError(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) return 'Please sign in again before posting your hike.';

    if (
      error.payload &&
      typeof error.payload === 'object' &&
      'errors' in error.payload &&
      Array.isArray(error.payload.errors)
    ) {
      const validationErrors = error.payload.errors.flatMap((item) => {
        if (
          item &&
          typeof item === 'object' &&
          'field' in item &&
          typeof item.field === 'string' &&
          'message' in item &&
          typeof item.message === 'string'
        ) {
          return [`${hikeFieldLabel(item.field)}: ${item.message}`];
        }
        return [];
      });
      if (validationErrors.length)
        return `Please fix these hike details: ${validationErrors.join('; ')}.`;
    }

    if (
      error.payload &&
      typeof error.payload === 'object' &&
      'message' in error.payload &&
      typeof error.payload.message === 'string'
    ) {
      if (error.payload.message === 'Validation failed') {
        return 'The backend rejected a hike field but did not return its validation details. Refresh the app and try again.';
      }
      return error.payload.message;
    }
  }

  return 'Could not post your hike. Please check your details and try again.';
}

function hikeFieldLabel(field: string) {
  const labels: Record<string, string> = {
    locationName: 'Meeting place',
    mountainName: 'Mountain or trail',
    distanceKm: 'Distance',
    latitude: 'Meeting place latitude',
    longitude: 'Meeting place longitude',
    scheduledDate: 'Schedule date',
    scheduledStartAt: 'Schedule date',
    difficulty: 'Trail difficulty',
    maxParticipants: 'Group size',
    initialMemberIds: 'Tagged Trailmates',
    externalGuestCount: 'Guest count',
    externalGuestNames: 'Guest names',
    admissionMode: 'Join setting',
    description: 'Hike description',
    requirements: 'Hike requirements',
  };
  return labels[field] ?? field;
}
