'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { useSaveOnboarding } from '../api/onboarding.hooks';
import type {
  AgeRange,
  ExperienceLevel,
  HikingInterest,
  OnboardingProfile,
  ReferralSource,
  SaveOnboardingRequest,
  TrailDifficulty,
} from '../types/onboarding';
import { HikingStyleStep } from './hiking-style-step';
import { OptionalInsightsStep } from './optional-insights-step';

type OnboardingFormProps = {
  initialProfile: OnboardingProfile;
  callbackUrl: string;
};

export function OnboardingForm({ initialProfile, callbackUrl }: OnboardingFormProps) {
  const router = useRouter();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [step, setStep] = useState<1 | 2>(1);
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
  const save = useSaveOnboarding();

  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  async function continueToInsights(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (!experienceLevel || !preferredDifficulty) {
      setError('Choose your hiking experience and preferred difficulty to continue.');
      return;
    }

    try {
      await save.mutateAsync({ experienceLevel, preferredDifficulty });
      setStep(2);
    } catch {
      setError('We could not save your preferences. Please try again.');
    }
  }

  async function completeOnboarding(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (consent === null) {
      setError('Choose whether to share optional insights or skip those questions.');
      return;
    }
    if (!experienceLevel || !preferredDifficulty) {
      setStep(1);
      setError('Choose your hiking experience and preferred difficulty to continue.');
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
      router.replace(callbackUrl);
      router.refresh();
    } catch {
      setError('We could not finish your profile. Please try again.');
    }
  }

  const isPending = save.isPending;
  const stepTitle = step === 1 ? 'Your hiking style' : 'Optional insights';

  return (
    <form onSubmit={step === 1 ? continueToInsights : completeOnboarding} className="space-y-6">
      <div>
        <div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-[#668077] dark:text-[#b5c9bd]">
          <span>Step {step} of 2</span>
          <span>{step === 1 ? 'Required' : 'Optional'}</span>
        </div>
        <div className="mb-5 h-1 overflow-hidden rounded-full bg-[#e5ebe6] dark:bg-white/10">
          <div
            className={`h-full rounded-full bg-[#1d604c] transition-[width] duration-300 dark:bg-[#a8cbb9] ${
              step === 1 ? 'w-1/2' : 'w-full'
            }`}
          />
        </div>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="text-2xl font-semibold tracking-[-0.035em] outline-none"
        >
          {stepTitle}
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#66766f] dark:text-[#b5c9bd]">
          {step === 1
            ? 'Tell us what feels comfortable for your next trail.'
            : 'These questions are optional. Your choice will not affect your account.'}
        </p>
      </div>

      {step === 1 ? (
        <HikingStyleStep
          experienceLevel={experienceLevel}
          preferredDifficulty={preferredDifficulty}
          onExperienceChange={setExperienceLevel}
          onDifficultyChange={setPreferredDifficulty}
        />
      ) : (
        <OptionalInsightsStep
          consent={consent}
          ageRange={ageRange}
          interests={interests}
          referralSource={referralSource}
          onConsentChange={setConsent}
          onAgeRangeChange={setAgeRange}
          onInterestsChange={setInterests}
          onReferralSourceChange={setReferralSource}
        />
      )}

      {error && (
        <p
          role="alert"
          className="rounded-[8px] bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200"
        >
          {error}
        </p>
      )}

      <div className="flex items-center justify-between gap-3 border-t border-[#e5ebe6] pt-5 dark:border-white/10">
        {step === 2 ? (
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => {
              setError('');
              setStep(1);
            }}
          >
            Back
          </Button>
        ) : (
          <span className="text-xs text-[#66766f] dark:text-[#b5c9bd]">About 1 minute</span>
        )}
        <Button
          type="submit"
          disabled={
            isPending ||
            (step === 1 && (!experienceLevel || !preferredDifficulty)) ||
            (step === 2 && consent === null)
          }
          className="min-w-36 bg-[#1d604c] text-white hover:bg-[#174c3c] dark:bg-[#dfece3] dark:text-[#10231f] dark:hover:bg-white"
        >
          {isPending ? 'Saving…' : step === 1 ? 'Continue' : 'Finish setup'}
        </Button>
      </div>
    </form>
  );
}
