'use client';

type OptionalInsightsConsentStepProps = {
  consent: boolean | null;
  onConsentChange: (value: boolean) => void;
};

export function OptionalInsightsConsentStep({
  consent,
  onConsentChange,
}: OptionalInsightsConsentStepProps) {
  return (
    <div className="space-y-5">
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
    </div>
  );
}
