'use client';

import { difficultyOptions, experienceOptions } from '../lib/onboarding-options';
import type { ExperienceLevel, TrailDifficulty } from '../types/onboarding';

type HikingStyleStepProps = {
  experienceLevel: ExperienceLevel | '';
  preferredDifficulty: TrailDifficulty | '';
  onExperienceChange: (value: ExperienceLevel) => void;
  onDifficultyChange: (value: TrailDifficulty) => void;
};

export function HikingStyleStep({
  experienceLevel,
  preferredDifficulty,
  onExperienceChange,
  onDifficultyChange,
}: HikingStyleStepProps) {
  return (
    <div className="space-y-7">
      <fieldset>
        <legend className="mb-3 text-sm font-semibold">How much hiking have you done?</legend>
        <div className="grid gap-2.5">
          {experienceOptions.map((option) => {
            const selected = experienceLevel === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={selected}
                onClick={() => onExperienceChange(option.value)}
                className={`rounded-[8px] border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d604c] ${
                  selected
                    ? 'border-[#1d604c] bg-[#1d604c]/[0.07] dark:border-[#a8cbb9] dark:bg-white/[0.08]'
                    : 'border-[#dce4de] bg-white hover:bg-[#f5f6f2] dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.07]'
                }`}
              >
                <span className="block text-sm font-semibold">{option.label}</span>
                <span className="mt-1 block text-xs leading-5 text-[#66766f] dark:text-[#b5c9bd]">
                  {option.description}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-sm font-semibold">Which trail difficulty feels right?</legend>
        <div className="grid gap-2.5 sm:grid-cols-3">
          {difficultyOptions.map((option) => {
            const selected = preferredDifficulty === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={selected}
                onClick={() => onDifficultyChange(option.value)}
                className={`min-h-24 rounded-[8px] border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d604c] ${
                  selected
                    ? 'border-[#1d604c] bg-[#1d604c]/[0.07] dark:border-[#a8cbb9] dark:bg-white/[0.08]'
                    : 'border-[#dce4de] bg-white hover:bg-[#f5f6f2] dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.07]'
                }`}
              >
                <span className="block text-sm font-semibold">{option.label}</span>
                <span className="mt-1 block text-xs leading-5 text-[#66766f] dark:text-[#b5c9bd]">
                  {option.description}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <p className="text-xs text-[#66766f] dark:text-[#b5c9bd]">
        <span className="font-medium text-inherit">Both choices are required.</span> You can update
        your preferences later.
      </p>
    </div>
  );
}
