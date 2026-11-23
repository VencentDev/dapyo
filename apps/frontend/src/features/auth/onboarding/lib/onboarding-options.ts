import type {
  AgeRange,
  ExperienceLevel,
  HikingInterest,
  ReferralSource,
  TrailDifficulty,
} from '../types/onboarding';

export const experienceOptions: { value: ExperienceLevel; label: string; description: string }[] = [
  {
    value: 'NEW_TO_HIKING',
    label: 'New to hiking',
    description: 'I’m getting ready for my first few trails.',
  },
  {
    value: 'SOME_EXPERIENCE',
    label: 'Some experience',
    description: 'I’ve been out on a few hikes already.',
  },
  {
    value: 'HIKE_REGULARLY',
    label: 'I hike regularly',
    description: 'Hiking is already part of my routine.',
  },
];

export const difficultyOptions: { value: TrailDifficulty; label: string; description: string }[] = [
  { value: 'EASY', label: 'Easy', description: 'Gentler paths and a relaxed pace.' },
  { value: 'MODERATE', label: 'Moderate', description: 'A steady effort with some climbing.' },
  {
    value: 'CHALLENGING',
    label: 'Challenging',
    description: 'Longer or steeper trails with a bigger effort.',
  },
];

export const ageRangeOptions: { value: AgeRange; label: string }[] = [
  { value: 'AGE_13_17', label: '13–17' },
  { value: 'AGE_18_24', label: '18–24' },
  { value: 'AGE_25_34', label: '25–34' },
  { value: 'AGE_35_44', label: '35–44' },
  { value: 'AGE_45_54', label: '45–54' },
  { value: 'AGE_55_PLUS', label: '55+' },
];

export const interestOptions: { value: HikingInterest; label: string }[] = [
  { value: 'NATURE', label: 'Nature' },
  { value: 'PHOTOGRAPHY', label: 'Photography' },
  { value: 'CAMPING', label: 'Camping' },
  { value: 'BIRDWATCHING', label: 'Birdwatching' },
  { value: 'FITNESS', label: 'Fitness' },
  { value: 'COMMUNITY', label: 'Meeting people' },
  { value: 'OTHER', label: 'Something else' },
];

export const referralOptions: { value: ReferralSource; label: string }[] = [
  { value: 'FRIEND', label: 'A friend or family member' },
  { value: 'SOCIAL_MEDIA', label: 'Social media' },
  { value: 'SEARCH', label: 'Online search' },
  { value: 'EVENT', label: 'An event or group' },
  { value: 'OTHER', label: 'Somewhere else' },
];
