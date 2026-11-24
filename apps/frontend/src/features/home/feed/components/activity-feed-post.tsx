'use client';

import Image from 'next/image';
import {
  Activity,
  Clock3,
  Heart,
  MapPin,
  MessageCircle,
  Mountain,
  TrendingUp,
  UsersRound,
} from 'lucide-react';
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
  onLocationClick,
  authorName,
  authorAvatarUrl,
  admissionMode,
  onAdmissionModeChange,
  scheduledDate,
  onScheduledDateChange,
  datePickerPortalContainer,
  caption,
  onCaptionChange,
  mountainName,
  onMountainNameChange,
  mountainNameError,
  maxParticipants,
  onMaxParticipantsChange,
  selectedHikers,
  onSelectedHikersChange,
}: {
  post: ActivityPreview;
  embedded?: boolean;
  locationName?: string;
  onLocationClick?: () => void;
  authorName?: string;
  authorAvatarUrl?: string | null;
  admissionMode?: HikeAdmissionMode;
  onAdmissionModeChange?: (mode: HikeAdmissionMode) => void;
  scheduledDate?: DateValue | null;
  onScheduledDateChange?: (date: DateValue | null) => void;
  datePickerPortalContainer?: HTMLElement | null;
  caption?: string;
  onCaptionChange?: (caption: string) => void;
  mountainName?: string;
  onMountainNameChange?: (mountainName: string) => void;
  mountainNameError?: string;
  maxParticipants?: string;
  onMaxParticipantsChange?: (value: string) => void;
  selectedHikers?: HikeJoinedHiker[];
  onSelectedHikersChange?: (hikers: HikeJoinedHiker[]) => void;
}) {
  const displayAuthorName = authorName?.trim() || post.author;
  const authorInitials = displayAuthorName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
  const capacityNumber = Number(maxParticipants);
  const spotsTaken = 1 + (selectedHikers?.length ?? 0);
  const hasCapacity = Number.isInteger(capacityNumber) && capacityNumber > 0;
  const isOverCapacity = hasCapacity && spotsTaken > capacityNumber;

  return (
    <article
      className={
        embedded
          ? 'overflow-hidden bg-card text-card-foreground'
          : 'dapyo-card-elevation overflow-hidden rounded-lg bg-card text-card-foreground ring-1 ring-border/40'
      }
    >
      <div className="flex items-start gap-3 px-4 pb-3 pt-4 sm:px-5 sm:pt-5">
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
        <div className="-mt-1 min-w-0 flex-1">
          <div className="flex min-w-0 flex-nowrap items-end gap-x-1">
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
          <div className="mt-1 flex min-w-0 flex-wrap items-center gap-1.5 text-[11px] text-[#8a968e] dark:text-white/55">
            {onLocationClick ? (
              <>
                <HikeLocationBadge
                  locationName={locationName ?? post.location}
                  onClick={onLocationClick}
                />
                {onSelectedHikersChange && (
                  <HikeJoinedHikerPicker
                    selectedHikers={selectedHikers ?? []}
                    onChange={onSelectedHikersChange}
                  />
                )}
              </>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3 shrink-0" aria-hidden="true" />
                {post.location}
              </span>
            )}
            {!onScheduledDateChange && (
              <>
                <span aria-hidden="true">·</span> {post.time}
              </>
            )}
          </div>
        </div>
        {onScheduledDateChange ? (
          <HikeDatePicker
            value={scheduledDate ?? null}
            onChange={onScheduledDateChange}
            portalContainer={datePickerPortalContainer}
          />
        ) : (
          <span className="rounded-full bg-[#edf3ee] px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.1em] text-[#5e796a] dark:bg-white/[0.08] dark:text-[#d1e2d6]">
            Completed hike
          </span>
        )}
      </div>

      <div className="px-4 pb-4 sm:px-5">
        {onCaptionChange ? (
          <label className="block">
            <span className="sr-only">Hike caption</span>
            <textarea
              value={caption ?? ''}
              onChange={(event) => onCaptionChange(event.target.value)}
              placeholder="A slow start, a steady climb, and a sunrise that made every step worth it. First time hiking with this crew, definitely not the last."
              rows={3}
              maxLength={4000}
              className="w-full resize-y rounded-[8px] border border-[#e1e9e1] bg-transparent px-3 py-2 text-sm leading-6 text-[#53645b] outline-none placeholder:text-[#87948c] focus:border-[#1d604c] focus:ring-2 focus:ring-[#1d604c]/15 dark:border-white/10 dark:text-white/70 dark:placeholder:text-white/40"
            />
          </label>
        ) : (
          <p className="text-sm leading-6 text-[#53645b] dark:text-white/70">{post.note}</p>
        )}
        {onMountainNameChange ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_108px_140px] sm:items-start">
            <HikeMountainNameField
              value={mountainName ?? ''}
              onChange={onMountainNameChange}
              error={mountainNameError}
            />
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-[#354b3e] dark:text-white/80">
                Capacity
              </span>
              <span className="relative block">
                <UsersRound
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#a77845] dark:text-[#e8bd78]"
                  aria-hidden="true"
                />
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={maxParticipants ?? ''}
                  onChange={(event) => onMaxParticipantsChange?.(event.target.value)}
                  aria-label="Hike capacity in people"
                  className="h-10 w-full rounded-[8px] border border-[#e1e9e1] bg-[#f8faf7] pl-9 pr-2 text-sm font-semibold text-[#354b3e] outline-none focus:border-[#1d604c] focus:ring-2 focus:ring-[#1d604c]/15 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/80"
                />
              </span>
            </label>
            <div className="min-w-0 space-y-1.5">
              <span className="block text-sm font-medium text-[#354b3e] dark:text-white/80">
                Already taken
              </span>
              <p
                aria-live="polite"
                className={`flex h-10 items-center whitespace-nowrap rounded-[8px] border px-3 text-sm font-semibold ${isOverCapacity ? 'border-[#e8c3b8] bg-[#fff5f1] text-[#a43f2d] dark:border-[#8e5144] dark:bg-[#4a3328] dark:text-[#ffb7a8]' : 'border-[#e1e9e1] bg-[#f8faf7] text-[#31533f] dark:border-white/10 dark:bg-white/[0.04] dark:text-[#cde5d3]'}`}
              >
                {spotsTaken} / {hasCapacity ? capacityNumber : '—'} spots
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-[#2e4e40] dark:text-[#dfece3]">
            <Mountain className="size-3.5 text-[#b17e43]" aria-hidden="true" />
            {post.title}
          </div>
        )}
      </div>

      <div className="relative aspect-[16/9] max-h-[410px] w-full overflow-hidden bg-[#dce5dc] dark:bg-[#10231f] sm:aspect-[2/1]">
        <Image
          src={post.image}
          alt={post.imageAlt}
          fill
          sizes="(min-width: 1280px) 620px, (min-width: 768px) 70vw, 100vw"
          className="object-cover"
        />
      </div>

      <div className="grid grid-cols-3 border-b border-[#edf0ec] px-4 py-3 text-center dark:border-white/10 sm:px-5">
        <FeedMetric icon={TrendingUp} value={post.distance} label="Distance" />
        <FeedMetric icon={Clock3} value={post.duration} label="Moving time" />
        <FeedMetric icon={Activity} value={post.elevation} label="Elevation" />
      </div>

      <div className="flex items-center justify-between px-4 py-3 text-xs text-[#819087] dark:text-white/55 sm:px-5">
        <span className="inline-flex items-center gap-1.5">
          <Heart className="size-3.5 fill-[#d99a6a] text-[#d99a6a]" aria-hidden="true" />
          {post.likes} hikers appreciated this
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MessageCircle className="size-3.5" aria-hidden="true" />
          {post.comments} comments
        </span>
      </div>
    </article>
  );
}

function FeedMetric({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof TrendingUp;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center justify-center gap-2 text-left">
      <Icon className="hidden size-4 text-[#b17e43] sm:block" aria-hidden="true" />
      <div>
        <p className="text-xs font-semibold text-[#3e5748] dark:text-[#dfece3]">{value}</p>
        <p className="mt-0.5 text-[9px] text-[#98a39c] dark:text-white/45">{label}</p>
      </div>
    </div>
  );
}
