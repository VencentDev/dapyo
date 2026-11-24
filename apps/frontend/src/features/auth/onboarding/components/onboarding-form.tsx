'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api';
import { getOnboardingPath } from '@/lib/auth-routes';

import { useSaveOnboarding } from '../api/onboarding.hooks';
import { onboardingSteps, type OnboardingStep } from '../lib/onboarding-steps';
import type {
  AgeRange,
  ExperienceLevel,
  HikingInterest,
  OnboardingProfile,
  ReferralSource,
  SaveOnboardingRequest,
  TrailDifficulty,
} from '../types/onboarding';
import { HikingExperienceStep } from './hiking-experience-step';
import { OnboardingProgressRail } from './onboarding-progress-rail';
import { OptionalInsightsConsentStep } from './optional-insights-consent-step';
import { OptionalInsightsDetailsStep } from './optional-insights-details-step';
import { TrailDifficultyStep } from './trail-difficulty-step';

type OnboardingFormProps = {
  initialProfile: OnboardingProfile;
  callbackUrl: string;
};

export function OnboardingForm({ initialProfile, callbackUrl }: OnboardingFormProps) {
  const router = useRouter();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [step, setStep] = useState<OnboardingStep>(1);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | ''>(
    initialProfile.experienceLevel ?? '',
  );
  const [preferredDifficulty, setPreferredDifficulty] = useState<TrailDifficulty | ''>(
    initialProfile.preferredDifficulty ?? '',
  );
  const [consent, setConsent] = useState<boolean | null>(initialProfile.analyticsConsent);
  const [ageRange, setAgeRange] = useState<AgeRange | ''>(initialProfile.ageRange ?? '');
  const [interests, setInterests] = useState<HikingInterest[]>(initialProfile.interests ?? []);
  const [referralSource, setReferralSource] = useState<ReferralSource | ''>(
    initialProfile.referralSource ?? '',
  );
  const [error, setError] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const save = useSaveOnboarding();

  function handleSaveFailure(error: unknown, message: string) {
    if (error instanceof ApiError && error.status === 401) {
      const onboardingUrl = getOnboardingPath(callbackUrl);
      router.replace(`/login?reauth=1&callbackUrl=${encodeURIComponent(onboardingUrl)}`);
      return;
    }
    setError(message);
  }

  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  function continueToDifficulty(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (!experienceLevel) {
      setError('Choose your hiking experience to continue.');
      return;
    }
    setStep(2);
  }

  async function saveRequiredPreferences(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (!experienceLevel || !preferredDifficulty) {
      setError('Choose your hiking experience and preferred difficulty to continue.');
      return;
    }

    try {
      await save.mutateAsync({ experienceLevel, preferredDifficulty });
      setStep(3);
    } catch (error) {
      handleSaveFailure(error, 'We could not save your preferences. Please try again.');
    }
  }

  function continueToProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (consent === null) {
      setError('Choose whether to share optional insights or skip those questions.');
      return;
    }
    setStep(4);
  }

  async function completeOnboarding(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (!experienceLevel) {
      setStep(1);
      setError('Choose your hiking experience to continue.');
      return;
    }
    if (!preferredDifficulty) {
      setStep(2);
      setError('Choose your preferred difficulty to continue.');
      return;
    }
    if (consent === null) {
      setStep(3);
      setError('Choose whether to share optional insights or skip those questions.');
      return;
    }

    const request: SaveOnboardingRequest = {
      experienceLevel,
      preferredDifficulty,
      analyticsConsent: consent,
    };
    if (consent) {
      if (ageRange) request.ageRange = ageRange;
      if (interests.length > 0) request.interests = interests;
      if (referralSource) request.referralSource = referralSource;
    }

    try {
      await save.mutateAsync(request);
      setIsComplete(true);
    } catch (error) {
      handleSaveFailure(error, 'We could not finish your profile. Please try again.');
    }
  }

  function exploreTrails() {
    router.replace(callbackUrl);
    router.refresh();
  }

  function goBack() {
    setError('');
    setStep((currentStep) => (currentStep === 4 ? 3 : currentStep === 3 ? 2 : 1));
  }

  const isPending = save.isPending;
  const stepTitle =
    step === 1
      ? 'Your hiking experience'
      : step === 2
        ? 'Choose your trail difficulty'
        : step === 3
          ? 'Optional insights'
          : consent
            ? 'A few optional details'
            : 'You’re ready to explore';
  const stepDescription =
    step === 1
      ? 'Tell us how much hiking you have done so we can tailor your trail discovery.'
      : step === 2
        ? 'Choose the level that feels comfortable for your next hike.'
        : step === 3
          ? 'Choose whether you would like to share a few private details about the hiking community.'
          : consent
            ? 'Share only what you are comfortable with. Every answer is optional.'
            : 'Your hiking preferences are set. No optional details will be saved.';

  if (isComplete) {
    return (
      <main
        data-auth-page
        className="full-bleed -my-6 grid min-h-[100svh] place-items-center bg-[#f5f6f2] text-[#10231f] dark:bg-[#10231f] dark:text-[#edf4ef]"
      >
        <section className="flex min-h-[100svh] w-full max-w-xl flex-col items-center justify-center gap-4 px-5 py-8 text-center sm:px-8">
          <Image
            src="/images/on-boarding.png"
            alt="Onboarding complete. You’re all set to explore and join hikes."
            width={1024}
            height={1536}
            priority
            className="h-auto w-[min(76vw,20rem)] object-contain"
          />
          <Button
            type="button"
            onClick={exploreTrails}
            className="min-w-48 bg-[#f5a900] text-[#17342e] hover:bg-[#dc9200]"
          >
            Explore trails
          </Button>
        </section>
      </main>
    );
  }

  return (
    <main
      data-auth-page
      className="full-bleed -my-6 min-h-[100svh] bg-[#f5f6f2] text-[#10231f] selection:bg-[#d8a75f]/30 dark:bg-[#10231f] dark:text-[#edf4ef]"
    >
      <div className="grid min-h-[100svh] lg:grid-cols-[280px_minmax(0,1fr)]">
        <OnboardingProgressRail activeStep={step} />

        <div className="relative flex min-h-[100svh] flex-col px-5 py-5 sm:px-8 sm:py-7 lg:px-12 lg:py-8">
          <section className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center py-8 sm:py-12">
            <form
              onSubmit={
                step === 1
                  ? continueToDifficulty
                  : step === 2
                    ? saveRequiredPreferences
                    : step === 3
                      ? continueToProfile
                      : completeOnboarding
              }
              className="space-y-7"
            >
              <div>
                <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-[#668077] dark:text-[#b5c9bd]">
                  <span>
                    Step {step} of {onboardingSteps.length}
                  </span>
                  <span>
                    {step <= 2 ? 'Required' : step === 3 || consent ? 'Optional' : 'Ready'}
                  </span>
                </div>
                <h1
                  ref={headingRef}
                  tabIndex={-1}
                  className="text-3xl font-semibold tracking-[-0.04em] outline-none sm:text-4xl"
                >
                  {stepTitle}
                </h1>
                <p className="mt-3 max-w-lg text-sm leading-6 text-[#66766f] dark:text-[#b5c9bd]">
                  {stepDescription}
                </p>
              </div>

              {step === 1 && (
                <HikingExperienceStep
                  experienceLevel={experienceLevel}
                  onExperienceChange={setExperienceLevel}
                />
              )}
              {step === 2 && (
                <div className="space-y-5">
                  <TrailDifficultyStep
                    preferredDifficulty={preferredDifficulty}
                    onDifficultyChange={setPreferredDifficulty}
                  />
                  <p className="text-xs text-[#66766f] dark:text-[#b5c9bd]">
                    You can update your preferences later.
                  </p>
                </div>
              )}
              {step === 3 && (
                <OptionalInsightsConsentStep consent={consent} onConsentChange={setConsent} />
              )}
              {step === 4 &&
                (consent ? (
                  <OptionalInsightsDetailsStep
                    ageRange={ageRange}
                    interests={interests}
                    referralSource={referralSource}
                    onAgeRangeChange={setAgeRange}
                    onInterestsChange={setInterests}
                    onReferralSourceChange={setReferralSource}
                  />
                ) : (
                  <div className="rounded-[8px] border border-[#dce4de] bg-white/70 p-4 text-sm leading-6 text-[#52645f] dark:border-white/10 dark:bg-white/[0.04] dark:text-[#c3d5cb]">
                    You chose to skip optional insights. You can finish setup now and start
                    exploring upcoming hikes.
                  </div>
                ))}

              {error && (
                <p
                  role="alert"
                  className="rounded-[8px] bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200"
                >
                  {error}
                </p>
              )}

              <div className="flex items-center justify-between gap-3 border-t border-[#e5ebe6] pt-5 dark:border-white/10">
                {step > 1 ? (
                  <Button type="button" variant="outline" disabled={isPending} onClick={goBack}>
                    Back
                  </Button>
                ) : (
                  <span className="text-xs text-[#66766f] dark:text-[#b5c9bd]">About 1 minute</span>
                )}
                <Button
                  type="submit"
                  disabled={
                    isPending ||
                    (step === 1 && !experienceLevel) ||
                    (step === 2 && (!experienceLevel || !preferredDifficulty)) ||
                    (step === 3 && consent === null)
                  }
                  className="min-w-36 bg-[#1d604c] text-white hover:bg-[#174c3c] dark:bg-[#dfece3] dark:text-[#10231f] dark:hover:bg-white"
                >
                  {isPending ? 'Saving…' : step === 4 ? 'Finish setup' : 'Continue'}
                </Button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
