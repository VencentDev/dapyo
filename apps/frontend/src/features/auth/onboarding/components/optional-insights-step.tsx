'use client';

import { ageRangeOptions, interestOptions, referralOptions } from '../lib/onboarding-options';
import type { AgeRange, HikingInterest, ReferralSource } from '../types/onboarding';

type OptionalInsightsStepProps = {
  consent: boolean | null;
  ageRange: AgeRange | '';
  interests: HikingInterest[];
  referralSource: ReferralSource | '';
  onConsentChange: (value: boolean) => void;
  onAgeRangeChange: (value: AgeRange | '') => void;
  onInterestsChange: (value: HikingInterest[]) => void;
  onReferralSourceChange: (value: ReferralSource | '') => void;
};

export function OptionalInsightsStep({
  consent,
  ageRange,
  interests,
  referralSource,
  onConsentChange,
  onAgeRangeChange,
  onInterestsChange,
  onReferralSourceChange,
}: OptionalInsightsStepProps) {
  return (
    <div className="space-y-6">
      <p className="text-sm leading-6 text-[#52645f] dark:text-[#c3d5cb]">
        These optional details help DAPYO understand its hiking community in aggregate. They stay
        private, won’t appear on your public profile, and can be skipped.
      </p>

      <fieldset className="space-y-2.5">
        <legend className="mb-3 text-sm font-semibold">
          Would you like to share optional insights?
        </legend>
        <label className="flex cursor-pointer items-start gap-3 rounded-[8px] border border-[#dce4de] bg-white p-3 transition-colors hover:bg-[#f5f6f2] dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.07]">
          <input
            type="radio"
            name="analytics-consent"
            checked={consent === true}
            onChange={() => onConsentChange(true)}
            className="mt-1 accent-[#1d604c]"
          />
          <span>
            <span className="block text-sm font-semibold">Share optional insights</span>
            <span className="mt-1 block text-xs leading-5 text-[#66766f] dark:text-[#b5c9bd]">
              I agree to share these details for aggregate product analysis.
            </span>
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-3 rounded-[8px] border border-[#dce4de] bg-white p-3 transition-colors hover:bg-[#f5f6f2] dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.07]">
          <input
            type="radio"
            name="analytics-consent"
            checked={consent === false}
            onChange={() => onConsentChange(false)}
            className="mt-1 accent-[#1d604c]"
          />
          <span>
            <span className="block text-sm font-semibold">Skip optional questions</span>
            <span className="mt-1 block text-xs leading-5 text-[#66766f] dark:text-[#b5c9bd]">
              I’ll finish onboarding without sharing demographic insights.
            </span>
          </span>
        </label>
      </fieldset>

      {consent === true && (
        <div className="space-y-5 border-t border-[#dce4de] pt-5 dark:border-white/10">
          <div className="space-y-2">
            <label htmlFor="onboarding-age" className="text-sm font-semibold">
              Age range{' '}
              <span className="font-normal text-[#66766f] dark:text-[#b5c9bd]">· optional</span>
            </label>
            <select
              id="onboarding-age"
              value={ageRange}
              onChange={(event) => onAgeRangeChange(event.target.value as AgeRange | '')}
              className="h-10 w-full rounded-[8px] border border-[#dce4de] bg-white px-3 text-sm text-[#10231f] outline-none focus-visible:ring-2 focus-visible:ring-[#1d604c] dark:border-white/10 dark:bg-[#10231f] dark:text-[#edf4ef]"
            >
              <option value="">Prefer not to say</option>
              {ageRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-semibold">
              What else do you enjoy?{' '}
              <span className="font-normal text-[#66766f] dark:text-[#b5c9bd]">· optional</span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {interestOptions.map((option) => {
                const selected = interests.includes(option.value);
                return (
                  <label
                    key={option.value}
                    className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-within:ring-2 focus-within:ring-[#1d604c] ${
                      selected
                        ? 'border-[#1d604c] bg-[#1d604c] text-white dark:border-[#a8cbb9] dark:bg-[#dfece3] dark:text-[#10231f]'
                        : 'border-[#dce4de] bg-white text-[#52645f] hover:bg-[#f5f6f2] dark:border-white/10 dark:bg-white/[0.03] dark:text-[#c3d5cb] dark:hover:bg-white/[0.07]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() =>
                        onInterestsChange(
                          selected
                            ? interests.filter((interest) => interest !== option.value)
                            : [...interests, option.value],
                        )
                      }
                      className="sr-only"
                    />
                    {option.label}
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="space-y-2">
            <label htmlFor="onboarding-referral" className="text-sm font-semibold">
              How did you find DAPYO?{' '}
              <span className="font-normal text-[#66766f] dark:text-[#b5c9bd]">· optional</span>
            </label>
            <select
              id="onboarding-referral"
              value={referralSource}
              onChange={(event) =>
                onReferralSourceChange(event.target.value as ReferralSource | '')
              }
              className="h-10 w-full rounded-[8px] border border-[#dce4de] bg-white px-3 text-sm text-[#10231f] outline-none focus-visible:ring-2 focus-visible:ring-[#1d604c] dark:border-white/10 dark:bg-[#10231f] dark:text-[#edf4ef]"
            >
              <option value="">Choose an option</option>
              {referralOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {consent === false && (
        <p className="rounded-[8px] bg-[#f5f6f2] px-3 py-3 text-xs leading-5 text-[#52645f] dark:bg-white/[0.05] dark:text-[#c3d5cb]">
          No optional answers will be saved. You can continue with your hiking preferences only.
        </p>
      )}
    </div>
  );
}
