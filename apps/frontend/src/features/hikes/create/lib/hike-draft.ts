import type { HikeCreateRequest } from '@/features/hikes/api/hikes.hooks';

export type HikeDraftPhoto = {
  id: string;
  file: File;
  caption: string;
  previewUrl: string;
};

export type HikeDraft = {
  locationName: string;
  mountainName: string;
  distanceKm: string;
  latitude: string;
  longitude: string;
  date: string;
  time: string;
  difficulty: 'EASY' | 'MODERATE' | 'CHALLENGING';
  maxParticipants: string;
  selectedMemberIds: string[];
  externalGuestCount: string;
  admissionMode: 'OPEN' | 'APPROVAL';
  description: string;
  requirements: string;
  photos: HikeDraftPhoto[];
};

export type HikeDraftErrors = Partial<Record<keyof HikeDraft, string>>;

export function createInitialHikeDraft(): HikeDraft {
  return {
    locationName: '',
    mountainName: '',
    distanceKm: '',
    latitude: '',
    longitude: '',
    date: '',
    time: '',
    difficulty: 'MODERATE',
    maxParticipants: '10',
    selectedMemberIds: [],
    externalGuestCount: '0',
    admissionMode: 'OPEN',
    description: '',
    requirements: '',
    photos: [],
  };
}

export function parseLocalStart(date: string, time: string) {
  if (!date || !time) return null;
  const parsed = new Date(`${date}T${time}`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function validateHikeDraft(draft: HikeDraft): HikeDraftErrors {
  const errors: HikeDraftErrors = {};

  if (!draft.locationName.trim()) errors.locationName = 'Add a location name.';
  if (!draft.mountainName.trim()) errors.mountainName = 'Add the mountain or trail name.';
  const latitude = Number(draft.latitude);
  if (!draft.latitude.trim() || !Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    errors.latitude = 'Enter a latitude between -90 and 90.';
  }
  const longitude = Number(draft.longitude);
  if (
    !draft.longitude.trim() ||
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180
  ) {
    errors.longitude = 'Enter a longitude between -180 and 180.';
  }

  const start = parseLocalStart(draft.date, draft.time);
  if (!start) errors.date = 'Choose a date and start time.';
  else if (start.getTime() <= Date.now()) errors.date = 'Choose a future date and time.';

  const capacity = Number(draft.maxParticipants);
  const guests = Number(draft.externalGuestCount);
  if (!Number.isInteger(capacity) || capacity < 1) {
    errors.maxParticipants = 'Group size must be at least 1.';
  }
  if (!Number.isInteger(guests) || guests < 0) {
    errors.externalGuestCount = 'Guest count cannot be negative.';
  }
  if (
    Number.isInteger(capacity) &&
    capacity > 0 &&
    Number.isInteger(guests) &&
    guests >= 0 &&
    1 + draft.selectedMemberIds.length + guests > capacity
  ) {
    errors.maxParticipants =
      'The organizer, selected Trailmates, and guests exceed the group size.';
  }

  if (!draft.description.trim()) errors.description = 'Add a short hike description.';
  if (draft.distanceKm.trim()) {
    const distance = Number(draft.distanceKm);
    if (!Number.isFinite(distance) || distance < 0.1 || distance > 99999.99) {
      errors.distanceKm = 'Enter a distance from 0.1 to 99,999.99 km.';
    }
  }

  return errors;
}

export function hikeDraftToRequest(draft: HikeDraft): HikeCreateRequest {
  const start = parseLocalStart(draft.date, draft.time);
  if (!start) throw new Error('Choose a valid date and time before publishing.');

  return {
    locationName: draft.locationName.trim(),
    mountainName: draft.mountainName.trim(),
    distanceKm: draft.distanceKm.trim() ? Number(draft.distanceKm) : null,
    latitude: Number(draft.latitude),
    longitude: Number(draft.longitude),
    scheduledStartAt: start.toISOString(),
    difficulty: draft.difficulty,
    maxParticipants: Number(draft.maxParticipants),
    initialMemberIds: Array.from(new Set(draft.selectedMemberIds)),
    externalGuestCount: Number(draft.externalGuestCount),
    admissionMode: draft.admissionMode,
    description: draft.description.trim(),
    requirements: draft.requirements.trim() || null,
  };
}

export function getRemainingPlaces(draft: HikeDraft) {
  const capacity = Number(draft.maxParticipants);
  const guests = Number(draft.externalGuestCount);
  if (!Number.isInteger(capacity) || !Number.isInteger(guests)) return null;
  return capacity - 1 - draft.selectedMemberIds.length - guests;
}
