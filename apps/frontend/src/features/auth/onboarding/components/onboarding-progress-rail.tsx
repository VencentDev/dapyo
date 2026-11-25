import Link from 'next/link';
import { ArrowLeft, Check } from 'lucide-react';

import { DapyoLogo } from '@/components/dapyo-logo';
import { ThemeToggle } from '@/components/theme-toggle';

import { onboardingSteps, type OnboardingStep } from '../lib/onboarding-steps';

export function OnboardingProgressRail({ activeStep }: { activeStep: OnboardingStep }) {
  const currentStep = onboardingSteps[activeStep - 1];

  return (
    <>
      <aside className="sticky top-0 hidden h-[100svh] min-h-[100svh] flex-col border-r border-[#dce4de] bg-[#edf2ed] px-7 py-8 text-[#17342e] lg:flex dark:border-white/10 dark:bg-[#17342e] dark:text-white">
        <div className="flex items-center justify-between gap-2">
          <Link
            href="/"
            className="flex w-fit items-center gap-2.5 font-mono text-sm font-semibold tracking-[0.18em]"
          >
            <DapyoLogo className="size-7" />
            <span style={{ color: 'var(--dapyo-color-foreground)' }}>DAPYO</span>
          </Link>
          <ThemeToggle className="text-[#17342e] hover:bg-[#17342e]/10 hover:text-[#17342e] dark:text-[#dfece3] dark:hover:bg-white/10 dark:hover:text-white" />
        </div>

        <div className="mt-16">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#8b6935] dark:text-[#d8a75f]">
            Your trail profile
          </p>
          <nav aria-label="Onboarding progress" className="mt-7">
            <ol className="space-y-4">
              {onboardingSteps.map(({ id, label }) => {
                const isActive = id === activeStep;
                const isComplete = id < activeStep;

                return (
                  <li
                    key={id}
                    aria-current={isActive ? 'step' : undefined}
                    className={`flex items-start gap-3 rounded-[8px] px-3 py-3 transition-colors ${
                      isActive ? 'bg-white/80 dark:bg-white/10' : ''
                    }`}
                  >
                    <span
                      className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border font-mono text-[10px] ${
                        isComplete
                          ? 'border-[#1d604c] bg-[#1d604c] text-white dark:border-[#d8a75f] dark:bg-[#d8a75f] dark:text-[#17342e]'
                          : isActive
                            ? 'border-[#1d604c] text-[#1d604c] dark:border-[#d8a75f] dark:text-[#f0c784]'
                            : 'border-[#bdcbc2] text-[#7a8980] dark:border-white/25 dark:text-white/55'
                      }`}
                    >
                      {isComplete ? <Check className="size-3.5" aria-hidden="true" /> : id}
                    </span>
                    <span className="min-w-0">
                      <span
                        className={`block text-sm font-semibold ${isActive ? 'text-[#17342e] dark:text-white' : isComplete ? 'text-[#52645f] dark:text-white/80' : 'text-[#8a9890] dark:text-white/55'}`}
                      >
                        {label}
                      </span>
                      <span className="mt-1 block text-[10px] text-[#89968e] dark:text-white/45">
                        {isComplete ? 'Complete' : isActive ? 'In progress' : 'Up next'}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>

        <Link
          href="/"
          className="mt-auto inline-flex w-fit items-center gap-2 text-xs text-[#66766f] transition-colors hover:text-[#17342e] dark:text-white/65 dark:hover:text-white"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Back to DAPYO
        </Link>
      </aside>

      <div className="border-b border-[#dce4de] bg-white px-5 py-4 dark:border-white/10 dark:bg-[#17342e] sm:px-8 lg:hidden">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 font-mono text-xs font-semibold tracking-[0.16em] text-[#17342e] dark:text-[#dfece3]"
          >
            <DapyoLogo className="size-6" />
            <span style={{ color: 'var(--dapyo-color-foreground)' }}>DAPYO</span>
          </Link>
          <ThemeToggle className="text-[#17342e] hover:bg-[#17342e]/10 hover:text-[#17342e] dark:text-[#dfece3] dark:hover:bg-white/10 dark:hover:text-white" />
        </div>
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="font-semibold text-[#17342e] dark:text-[#edf4ef]">
            Step {activeStep} · {currentStep.label}
          </span>
          <span className="shrink-0 text-[#668077] dark:text-[#b5c9bd]">
            {Math.round((activeStep / onboardingSteps.length) * 100)}%
          </span>
        </div>
        <div
          role="progressbar"
          aria-label="Onboarding progress"
          aria-valuemin={1}
          aria-valuemax={onboardingSteps.length}
          aria-valuenow={activeStep}
          aria-valuetext={`Step ${activeStep} of ${onboardingSteps.length}: ${currentStep.label}`}
          className="mt-2 h-1 overflow-hidden rounded-full bg-[#e5ebe6] dark:bg-white/10"
        >
          <div
            className="h-full rounded-full bg-[#1d604c] transition-[width] duration-300 ease-out dark:bg-[#a8cbb9]"
            style={{ width: `${(activeStep / onboardingSteps.length) * 100}%` }}
          />
        </div>
      </div>
    </>
  );
}
