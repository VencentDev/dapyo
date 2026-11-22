export type ExperienceLevel = 'NEW_TO_HIKING' | 'SOME_EXPERIENCE' | 'HIKE_REGULARLY';

export type TrailDifficulty = 'EASY' | 'MODERATE' | 'CHALLENGING';

export type AgeRange =
  | 'AGE_13_17'
  | 'AGE_18_24'
  | 'AGE_25_34'
  | 'AGE_35_44'
  | 'AGE_45_54'
  | 'AGE_55_PLUS';

export type HikingInterest =
  | 'NATURE'
  | 'PHOTOGRAPHY'
  | 'CAMPING'
  | 'BIRDWATCHING'
  | 'FITNESS'
  | 'COMMUNITY'
  | 'OTHER';

export type ReferralSource = 'FRIEND' | 'SOCIAL_MEDIA' | 'SEARCH' | 'EVENT' | 'OTHER';

export type OnboardingProfile = {
  completed: boolean;
  completedAt: string | null;
  experienceLevel: ExperienceLevel | null;
  preferredDifficulty: TrailDifficulty | null;
  analyticsConsent: boolean | null;
  ageRange: AgeRange | null;
  interests: HikingInterest[];
  referralSource: ReferralSource | null;
};

export type SaveOnboardingRequest = {
  experienceLevel: ExperienceLevel;
  preferredDifficulty: TrailDifficulty;
  analyticsConsent?: boolean;
  ageRange?: AgeRange;
  interests?: HikingInterest[];
  referralSource?: ReferralSource;
};
