'use client';

import Image from 'next/image';
import { useState } from 'react';
import {
  ChartTrend,
  Calendar as CalendarIcon,
  Clock,
  Footsteps,
  Heart,
  ImagePlus,
  LocationPin,
  MessageCircle,
  Minus,
  Mountain,
  Plus,
  Pulse,
  User as UserIcon,
  UserPlus,
  X,
} from '@boxicons/react';
import { AlertDialog, Button as HeroButton, Label, NumberField, Tooltip } from '@heroui/react';
import type { DateValue } from '@heroui/react';

import {
  HikeAdmissionMenu,
  type HikeAdmissionMode,
} from '@/features/hikes/create/components/hike-admission-menu';
import { HikeDatePicker } from '@/features/hikes/create/components/hike-date-picker';
import { HikeLocationBadge } from '@/features/hikes/create/components/hike-location-badge';
import { HikeJoinedHikerPicker } from '@/features/hikes/create/components/hike-joined-hiker-picker';
import { HikeMountainNameField } from '@/features/hikes/create/components/hike-mountain-name-field';
import type { HikeJoinedHiker } from '@/features/hikes/create/lib/hike-joined-hiker';
import type { sampleActivities } from '@/features/home/feed/lib/home-feed-preview';

type ActivityPreview = (typeof sampleActivities)[number];

export function ActivityFeedPost({
  post,
  embedded = false,
  locationName,
  selectedMeetingPlace,
  onLocationClick,
  authorName,
  authorAvatarUrl,
  admissionMode,
  onAdmissionModeChange,
  scheduledDate,
  onScheduledDateChange,
  overlayPortalContainer,
  caption,
  onCaptionChange,
  mountainName,
  onMountainNameChange,
  mountainNameError,
  hikersLookingFor,
  onHikersLookingForChange,
  selectedHikers,
  onSelectedHikersChange,
  attachedImageUrl,
  onImageChange,
  difficultyRating,
  onDifficultyRatingChange,
  onPost,
  isSubmitting = false,
}: {
  post: ActivityPreview;
  embedded?: boolean;
  locationName?: string;
  selectedMeetingPlace?: string | null;
  onLocationClick?: () => void;
  authorName?: string;
  authorAvatarUrl?: string | null;
  admissionMode?: HikeAdmissionMode;
  onAdmissionModeChange?: (mode: HikeAdmissionMode) => void;
  scheduledDate?: DateValue | null;
  onScheduledDateChange?: (date: DateValue | null) => void;
  overlayPortalContainer?: HTMLElement | null;
  caption?: string;
  onCaptionChange?: (caption: string) => void;
  mountainName?: string;
  onMountainNameChange?: (mountainName: string) => void;
  mountainNameError?: string;
  hikersLookingFor?: number;
  onHikersLookingForChange?: (value: number) => void;
  selectedHikers?: HikeJoinedHiker[];
  onSelectedHikersChange?: (hikers: HikeJoinedHiker[]) => void;
  attachedImageUrl?: string | null;
  onImageChange?: (file: File | null) => void;
  difficultyRating?: number;
  onDifficultyRatingChange?: (rating: number) => void;
  onPost?: (rating: number) => Promise<boolean>;
  isSubmitting?: boolean;
}) {
  const [hoveredDifficulty, setHoveredDifficulty] = useState<number | null>(null);
  const [pendingDifficulty, setPendingDifficulty] = useState(difficultyRating ?? 3);
  const [isDifficultyDialogOpen, setIsDifficultyDialogOpen] = useState(false);
  const displayAuthorName = authorName?.trim() || post.author;
  const authorInitials = displayAuthorName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
  const taggedHikers = selectedHikers ?? [];
  const scheduledDateLabel = scheduledDate
    ? new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(scheduledDate.year, scheduledDate.month - 1, scheduledDate.day))
    : null;
  return (
    <article
      className={
        embedded
          ? 'overflow-hidden bg-card text-card-foreground'
          : 'dapyo-card-elevation overflow-hidden rounded-lg bg-card text-card-foreground ring-1 ring-border/40'
      }
    >
      <div className="flex items-center gap-3 px-4 py-4 sm:px-5">
        <span
          className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-full text-xs font-bold text-white"
          style={{ backgroundColor: authorAvatarUrl ? undefined : post.avatar }}
          aria-hidden="true"
        >
          {authorAvatarUrl ? (
            <Image
              src={authorAvatarUrl}
              alt=""
              fill
              sizes="40px"
              unoptimized
              className="object-cover"
            />
          ) : (
            authorInitials || post.initials
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-nowrap items-center gap-x-1.5">
            <h3 className="min-w-0 max-w-full truncate text-sm font-semibold leading-5 text-[#253b32] dark:text-white">
              {displayAuthorName}
            </h3>
            {admissionMode && onAdmissionModeChange ? (
              <HikeAdmissionMenu mode={admissionMode} onChange={onAdmissionModeChange} />
            ) : (
              <span className="rounded-full bg-[#f5f1e8] px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.1em] text-[#9a7548] dark:bg-white/[0.08] dark:text-[#e8bd78]">
                Sample
              </span>
            )}
          </div>
          {!onCaptionChange && (
            <div className="mt-1 flex min-w-0 flex-wrap items-center gap-1.5 text-[11px] text-[#8a968e] dark:text-white/55">
              {onLocationClick ? (
                <>
                  <HikeLocationBadge
                    locationName={locationName ?? post.location}
                    onClick={onLocationClick}
                    portalContainer={overlayPortalContainer}
                  />
                  {onSelectedHikersChange && (
                    <HikeJoinedHikerPicker
                      selectedHikers={selectedHikers ?? []}
                      onChange={onSelectedHikersChange}
                      portalContainer={overlayPortalContainer}
                    />
                  )}
                </>
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  <LocationPin className="size-3 shrink-0" pack="filled" aria-hidden="true" />
                  {post.location}
                </span>
              )}
              {!onScheduledDateChange && (
                <>
                  <span aria-hidden="true">·</span> {post.time}
                </>
              )}
            </div>
          )}
        </div>
        {!onCaptionChange &&
          (onScheduledDateChange ? (
            <HikeDatePicker
              value={scheduledDate ?? null}
              onChange={onScheduledDateChange}
              portalContainer={overlayPortalContainer}
            />
          ) : (
            <span className="rounded-full bg-[#edf3ee] px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.1em] text-[#5e796a] dark:bg-white/[0.08] dark:text-[#d1e2d6]">
              Completed hike
            </span>
          ))}
      </div>

      <div className="px-4 pb-4 sm:px-5">
        {onCaptionChange ? (
          <div className="overflow-visible rounded-[8px] border border-[#e1e9e1] transition-colors focus-within:border-[#1d604c] focus-within:ring-2 focus-within:ring-[#1d604c]/15 dark:border-white/10 dark:focus-within:border-[#e8bd78] dark:focus-within:ring-[#e8bd78]/15">
            <label className="block">
              <span className="sr-only">Hike caption</span>
              <textarea
                value={caption ?? ''}
                onChange={(event) => onCaptionChange(event.target.value)}
                placeholder="A slow start, a steady climb, and a sunrise that made every step worth it. First time hiking with this crew, definitely not the last."
                rows={2}
                maxLength={4000}
                className="block min-h-16 w-full resize-y rounded-t-[8px] border-0 bg-transparent px-3 py-2 text-sm leading-6 text-[#53645b] outline-none placeholder:text-[#87948c] focus:ring-0 dark:text-white/70 dark:placeholder:text-white/40"
              />
            </label>
            {(selectedMeetingPlace || taggedHikers.length > 0 || scheduledDateLabel) && (
              <div
                role="list"
                aria-label="Selected hike details"
                className="flex flex-wrap gap-1.5 px-3 pb-2"
              >
                {selectedMeetingPlace && (
                  <Tooltip delay={0}>
                    <Tooltip.Trigger
                      role="listitem"
                      className="inline-flex max-w-full items-center gap-1 rounded-full bg-[#edf3ee] px-2 py-1 text-[10px] font-medium text-[#31533f] dark:bg-white/[0.08] dark:text-[#d1e2d6]"
                    >
                      <LocationPin pack="filled" className="size-3 shrink-0" aria-hidden="true" />
                      <span className="max-w-48 truncate">{selectedMeetingPlace}</span>
                    </Tooltip.Trigger>
                    <Tooltip.Content
                      className="z-[100] max-w-64 whitespace-normal break-words"
                      UNSTABLE_portalContainer={overlayPortalContainer ?? undefined}
                      showArrow
                      placement="top"
                      offset={8}
                    >
                      <Tooltip.Arrow />
                      <p>Meeting place: {selectedMeetingPlace}</p>
                    </Tooltip.Content>
                  </Tooltip>
                )}
                {taggedHikers.slice(0, 2).map((hiker) => (
                  <Tooltip key={hiker.id} delay={0}>
                    <Tooltip.Trigger
                      role="listitem"
                      className="inline-flex max-w-40 items-center gap-1 rounded-full bg-[#edf3ee] px-2 py-1 text-[10px] font-medium text-[#31533f] dark:bg-white/[0.08] dark:text-[#d1e2d6]"
                    >
                      <UserIcon pack="filled" className="size-3 shrink-0" aria-hidden="true" />
                      <span className="truncate">{hiker.name}</span>
                    </Tooltip.Trigger>
                    <Tooltip.Content
                      className="z-[100] max-w-64 whitespace-normal break-words"
                      UNSTABLE_portalContainer={overlayPortalContainer ?? undefined}
                      showArrow
                      placement="top"
                      offset={8}
                    >
                      <Tooltip.Arrow />
                      <p>{hiker.name}</p>
                    </Tooltip.Content>
                  </Tooltip>
                ))}
                {taggedHikers.length > 2 && (
                  <Tooltip delay={0}>
                    <Tooltip.Trigger
                      role="listitem"
                      aria-label={`${taggedHikers.length - 2} more joined hikers`}
                      className="inline-flex items-center rounded-full bg-[#edf3ee] px-2 py-1 text-[10px] font-medium text-[#31533f] dark:bg-white/[0.08] dark:text-[#d1e2d6]"
                    >
                      +{taggedHikers.length - 2}
                    </Tooltip.Trigger>
                    <Tooltip.Content
                      className="z-[100] max-w-64 whitespace-normal"
                      UNSTABLE_portalContainer={overlayPortalContainer ?? undefined}
                      showArrow
                      placement="top"
                      offset={8}
                    >
                      <Tooltip.Arrow />
                      <div>
                        <p className="mb-1 font-semibold">Also joined</p>
                        <ul className="space-y-0.5">
                          {taggedHikers.slice(2).map((hiker) => (
                            <li key={hiker.id} className="break-words">
                              {hiker.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Tooltip.Content>
                  </Tooltip>
                )}
                {scheduledDateLabel && (
                  <Tooltip delay={0}>
                    <Tooltip.Trigger
                      role="listitem"
                      className="inline-flex items-center gap-1 rounded-full bg-[#edf3ee] px-2 py-1 text-[10px] font-medium text-[#31533f] dark:bg-white/[0.08] dark:text-[#d1e2d6]"
                    >
                      <CalendarIcon pack="filled" className="size-3 shrink-0" aria-hidden="true" />
                      {scheduledDateLabel}
                    </Tooltip.Trigger>
                    <Tooltip.Content
                      className="z-[100] whitespace-nowrap"
                      UNSTABLE_portalContainer={overlayPortalContainer ?? undefined}
                      showArrow
                      placement="top"
                      offset={8}
                    >
                      <Tooltip.Arrow />
                      <p>Scheduled date: {scheduledDateLabel}</p>
                    </Tooltip.Content>
                  </Tooltip>
                )}
              </div>
            )}
            <div
              role="group"
              aria-label="Hike details"
              className="flex flex-wrap items-center justify-between gap-2 border-t border-[#e1e9e1] px-2 py-1.5 dark:border-white/10"
            >
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                {onMountainNameChange && (
                  <HikeMountainNameField
                    value={mountainName ?? ''}
                    onChange={onMountainNameChange}
                    error={mountainNameError}
                    portalContainer={overlayPortalContainer}
                    compact
                  />
                )}
                {onHikersLookingForChange && (
                  <div className="inline-flex items-center gap-1">
                    <Tooltip delay={0}>
                      <Tooltip.Trigger
                        role="img"
                        aria-label="How many more hikers are you looking for?"
                        title="How many more hikers are you looking for?"
                        className="grid size-6 place-items-center rounded-full text-[#1d604c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d604c]/30 dark:text-[#e8bd78]"
                      >
                        <UserPlus pack="filled" className="size-4" aria-hidden="true" />
                      </Tooltip.Trigger>
                      <Tooltip.Content
                        className="z-[100] whitespace-nowrap"
                        UNSTABLE_portalContainer={overlayPortalContainer ?? undefined}
                        showArrow
                        placement="top"
                        offset={8}
                      >
                        <Tooltip.Arrow />
                        <p>How many more hikers are you looking for?</p>
                      </Tooltip.Content>
                    </Tooltip>
                    <div className="inline-flex h-8 items-center gap-0.5 rounded-full border border-[#e1e9e1] bg-[#f8faf7] dark:border-white/10 dark:bg-white/[0.04]">
                      <button
                        type="button"
                        aria-label="Decrease hikers needed"
                        onClick={() =>
                          onHikersLookingForChange(Math.max(0, (hikersLookingFor ?? 10) - 1))
                        }
                        className="grid size-6 shrink-0 place-items-center rounded-full text-[#a77845] transition-colors hover:bg-[#edf2ed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d604c]/30 dark:text-[#e8bd78] dark:hover:bg-white/[0.08]"
                      >
                        <Minus pack="filled" className="size-3.5" aria-hidden="true" />
                      </button>
                      <NumberField
                        value={hikersLookingFor ?? 10}
                        onChange={(value) => onHikersLookingForChange(value ?? 0)}
                        minValue={0}
                        step={1}
                        name="hikersLookingFor"
                        className="w-auto"
                      >
                        <Label className="sr-only">How many more hikers are you looking for?</Label>
                        <NumberField.Group className="!flex !h-8 !items-center !border-0 !bg-transparent !shadow-none">
                          <NumberField.Input className="!w-10 !min-w-10 !px-0 bg-transparent text-center text-xs font-semibold text-[#354b3e] outline-none dark:text-white/80" />
                        </NumberField.Group>
                      </NumberField>
                      <button
                        type="button"
                        aria-label="Increase hikers needed"
                        onClick={() => onHikersLookingForChange((hikersLookingFor ?? 10) + 1)}
                        className="grid size-6 shrink-0 place-items-center rounded-full text-[#a77845] transition-colors hover:bg-[#edf2ed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d604c]/30 dark:text-[#e8bd78] dark:hover:bg-white/[0.08]"
                      >
                        <Plus pack="filled" className="size-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="ml-auto flex shrink-0 items-center gap-1">
                {onLocationClick && (
                  <HikeLocationBadge
                    locationName={locationName ?? post.location}
                    onClick={onLocationClick}
                    portalContainer={overlayPortalContainer}
                  />
                )}
                {onSelectedHikersChange && (
                  <HikeJoinedHikerPicker
                    selectedHikers={selectedHikers ?? []}
                    onChange={onSelectedHikersChange}
                    portalContainer={overlayPortalContainer}
                  />
                )}
                {onScheduledDateChange && (
                  <HikeDatePicker
                    value={scheduledDate ?? null}
                    onChange={onScheduledDateChange}
                    portalContainer={overlayPortalContainer}
                  />
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm leading-6 text-[#53645b] dark:text-white/70">{post.note}</p>
        )}
        {!onMountainNameChange && (
          <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-[#2e4e40] dark:text-[#dfece3]">
            <Mountain pack="filled" className="size-3.5 text-[#b17e43]" aria-hidden="true" />
            {post.title}
          </div>
        )}
      </div>

      <div
        className={`relative w-full overflow-hidden bg-[#dce5dc] dark:bg-[#10231f] ${
          onImageChange ? 'h-[320px] sm:h-[410px]' : 'aspect-[16/9] max-h-[410px] sm:aspect-[2/1]'
        }`}
      >
        {onImageChange ? (
          <>
            {attachedImageUrl ? (
              <Image
                src={attachedImageUrl}
                alt="Hike image preview"
                fill
                unoptimized
                sizes="(min-width: 1280px) 620px, (min-width: 768px) 70vw, 100vw"
                className="object-contain"
              />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.42),_transparent_58%),linear-gradient(145deg,_#e9f0e8,_#d9e4dc)] dark:bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_58%),linear-gradient(145deg,_#1d3a30,_#10231f)]" />
            )}
            <label
              className={`absolute inset-0 grid cursor-pointer place-items-center transition-colors focus-within:ring-2 focus-within:ring-inset focus-within:ring-[#e8bd78] ${
                attachedImageUrl
                  ? 'items-end justify-start bg-gradient-to-t from-black/55 via-transparent to-transparent p-4'
                  : 'border-2 border-dashed border-[#9fb4a2] bg-transparent hover:bg-white/15 dark:border-white/25 dark:hover:bg-white/[0.04]'
              }`}
            >
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                aria-label={attachedImageUrl ? 'Change attached hike image' : 'Attach hike image'}
                className="sr-only"
                onChange={(event) => {
                  const file = event.currentTarget.files?.[0];
                  if (file) onImageChange(file);
                  event.currentTarget.value = '';
                }}
              />
              {attachedImageUrl ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-2 text-xs font-semibold text-white backdrop-blur-sm">
                  <ImagePlus pack="filled" className="size-4" aria-hidden="true" />
                  Change image
                </span>
              ) : (
                <span className="flex flex-col items-center gap-3 text-center">
                  <span className="grid size-14 place-items-center rounded-full border border-white/80 bg-white/75 text-[#1d604c] shadow-sm backdrop-blur-sm dark:border-white/15 dark:bg-white/[0.08] dark:text-[#cde5d3]">
                    <ImagePlus pack="filled" className="size-6" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-[#31533f] dark:text-white/85">
                      Attach image
                    </span>
                    <span className="mt-1 block text-xs text-[#68796e] dark:text-white/55">
                      JPG, PNG, or WebP
                    </span>
                  </span>
                </span>
              )}
            </label>
          </>
        ) : (
          <Image
            src={post.image}
            alt={post.imageAlt}
            fill
            sizes="(min-width: 1280px) 620px, (min-width: 768px) 70vw, 100vw"
            className="object-cover"
          />
        )}
      </div>

      {onDifficultyRatingChange ? (
        <div className="flex justify-end border-b border-[#edf0ec] px-4 py-3 dark:border-white/10 sm:px-5">
          <AlertDialog
            isOpen={isDifficultyDialogOpen}
            onOpenChange={(isOpen) => {
              if (!isSubmitting) setIsDifficultyDialogOpen(isOpen);
            }}
          >
            <HeroButton
              type="button"
              onPress={() => {
                setPendingDifficulty(difficultyRating ?? 3);
                setIsDifficultyDialogOpen(true);
              }}
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-[#1d604c] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#174c3d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d9aa58]"
            >
              Post
            </HeroButton>
            <AlertDialog.Backdrop>
              <AlertDialog.Container>
                <AlertDialog.Dialog className="sm:max-w-[400px]">
                  <AlertDialog.CloseTrigger aria-label="Close difficulty dialog">
                    <X pack="filled" className="size-4" aria-hidden="true" />
                  </AlertDialog.CloseTrigger>
                  <AlertDialog.Header>
                    <AlertDialog.Icon status="accent" className="!bg-[#1d604c] !text-white">
                      <Footsteps pack="filled" className="!text-white" aria-hidden="true" />
                    </AlertDialog.Icon>
                    <AlertDialog.Heading>Choose trail difficulty</AlertDialog.Heading>
                  </AlertDialog.Header>
                  <AlertDialog.Body>
                    <div
                      className="flex items-center gap-1"
                      role="group"
                      aria-label="Trail difficulty"
                      onMouseLeave={() => setHoveredDifficulty(null)}
                      onBlur={(event) => {
                        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                          setHoveredDifficulty(null);
                        }
                      }}
                    >
                      {[1, 2, 3, 4, 5].map((level) => {
                        const isHighlighted = level <= (hoveredDifficulty ?? pendingDifficulty);

                        return (
                          <Tooltip key={level} delay={0}>
                            <button
                              type="button"
                              aria-label={`Set difficulty to ${level} out of 5`}
                              aria-pressed={pendingDifficulty === level}
                              disabled={isSubmitting}
                              onClick={() => setPendingDifficulty(level)}
                              onMouseEnter={() => setHoveredDifficulty(level)}
                              onFocus={() => setHoveredDifficulty(level)}
                              className="grid size-9 place-items-center rounded-full transition-colors hover:bg-[#edf5ee] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d604c]/30 dark:hover:bg-white/[0.08]"
                            >
                              <Footsteps
                                pack="filled"
                                className={`size-[18px] text-[#a77845] dark:text-[#e8bd78] ${isHighlighted ? '' : 'opacity-40'}`}
                                aria-hidden="true"
                              />
                            </button>
                            <Tooltip.Content
                              className="z-[100]"
                              showArrow
                              placement="top"
                              offset={8}
                            >
                              <Tooltip.Arrow />
                              <p>Difficulty {level} of 5</p>
                            </Tooltip.Content>
                          </Tooltip>
                        );
                      })}
                      <span className="ml-2 text-xs text-muted-foreground">
                        {pendingDifficulty} / 5
                      </span>
                    </div>
                  </AlertDialog.Body>
                  <AlertDialog.Footer>
                    <HeroButton slot="close" variant="tertiary" isDisabled={isSubmitting}>
                      Cancel
                    </HeroButton>
                    <HeroButton
                      variant="primary"
                      isDisabled={isSubmitting}
                      onPress={async () => {
                        if (onPost) {
                          const posted = await onPost(pendingDifficulty);
                          if (!posted) return;
                        }

                        onDifficultyRatingChange(pendingDifficulty);
                        setIsDifficultyDialogOpen(false);
                      }}
                      className="!bg-[#1d604c] !text-white hover:!bg-[#174c3d]"
                    >
                      {isSubmitting ? 'Posting…' : 'Confirm'}
                    </HeroButton>
                  </AlertDialog.Footer>
                </AlertDialog.Dialog>
              </AlertDialog.Container>
            </AlertDialog.Backdrop>
          </AlertDialog>
        </div>
      ) : (
        <div className="grid grid-cols-3 border-b border-[#edf0ec] px-4 py-3 text-center dark:border-white/10 sm:px-5">
          <FeedMetric icon={ChartTrend} value={post.distance} label="Distance" />
          <FeedMetric icon={Clock} value={post.duration} label="Moving time" />
          <FeedMetric icon={Pulse} value={post.elevation} label="Elevation" />
        </div>
      )}

      {!embedded && (
        <div className="flex items-center justify-between px-4 py-3 text-xs text-[#819087] dark:text-white/55 sm:px-5">
          <span className="inline-flex items-center gap-1.5">
            <Heart pack="filled" className="size-3.5 text-[#d99a6a]" aria-hidden="true" />
            {post.likes} hikers appreciated this
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MessageCircle pack="filled" className="size-3.5" aria-hidden="true" />
            {post.comments} comments
          </span>
        </div>
      )}
    </article>
  );
}

function FeedMetric({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof ChartTrend;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center justify-center gap-2 text-left">
      <Icon pack="filled" className="hidden size-4 text-[#b17e43] sm:block" aria-hidden="true" />
      <div>
        <p className="text-xs font-semibold text-[#3e5748] dark:text-[#dfece3]">{value}</p>
        <p className="mt-0.5 text-[9px] text-[#98a39c] dark:text-white/45">{label}</p>
      </div>
    </div>
  );
}
