import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { DapyoLogo } from '@/components/dapyo-logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { ApiError, serverApi } from '@/lib/api';
import { auth } from '@/lib/auth';
import { getOnboardingPath, getSafeInternalRedirect, protectedHomePath } from '@/lib/auth-routes';

import { OnboardingForm } from './onboarding-form';
import type { OnboardingProfile } from '../types/onboarding';

type OnboardingSearchParams = Promise<{ callbackUrl?: string | string[] }>;

export async function OnboardingPageContent({
  searchParams,
}: {
  searchParams: OnboardingSearchParams;
}) {
  const params = await searchParams;
  const callbackValue = Array.isArray(params.callbackUrl)
    ? params.callbackUrl[0]
    : params.callbackUrl;
  const callbackUrl = getSafeInternalRedirect(callbackValue, protectedHomePath);
  const loginCallback = getOnboardingPath(callbackUrl);
  const session = await auth();

  if (!session?.user) {
    redirect(`/login?callbackUrl=${encodeURIComponent(loginCallback)}`);
  }

  let profile: OnboardingProfile;
  try {
    profile = await serverApi<OnboardingProfile>('/api/v1/users/me/onboarding');
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect(`/login?callbackUrl=${encodeURIComponent(loginCallback)}`);
    }
    throw error;
  }

  if (profile.completed) redirect(callbackUrl);

  return (
    <main
      data-auth-page
      className="full-bleed -my-6 min-h-[100svh] bg-[#f5f6f2] text-[#10231f] selection:bg-[#d8a75f]/30 dark:bg-[#10231f] dark:text-[#edf4ef]"
    >
      <div className="absolute right-5 top-5 z-20">
        <ThemeToggle className="text-[#17342e] hover:bg-[#17342e]/10 hover:text-[#17342e] dark:text-[#dfece3] dark:hover:bg-white/10 dark:hover:text-white" />
      </div>
      <div className="mx-auto flex min-h-[100svh] max-w-6xl flex-col px-5 py-7 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between pr-14">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-mono text-sm font-semibold tracking-[0.18em]"
          >
            <DapyoLogo className="size-7" />
            DAPYO
          </Link>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#668077] dark:text-[#b5c9bd]">
            Your trail profile
          </span>
        </header>

        <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <aside className="max-w-md">
            <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.24em] text-[#8b6935] dark:text-[#d8a75f]">
              Before your first hike
            </p>
            <h1 className="text-4xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-5xl">
              Let’s find the trails that fit you.
            </h1>
            <p className="mt-5 max-w-sm text-sm leading-6 text-[#52645f] dark:text-[#b5c9bd]">
              A few quick choices help us shape a better trail experience around your pace.
            </p>
            <div className="relative mt-8 hidden h-44 overflow-hidden rounded-[12px] lg:block">
              <Image
                src="/images/hero-section-2.png"
                alt="Hikers following a mountain trail"
                fill
                sizes="40vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#10231f]/60 to-transparent" />
            </div>
          </aside>

          <section className="rounded-[12px] border border-[#dce4de] bg-white/90 p-5 shadow-[0_16px_48px_rgba(16,35,31,0.08)] backdrop-blur-sm sm:p-8 dark:border-white/10 dark:bg-[#17342e] dark:shadow-black/20">
            <OnboardingForm initialProfile={profile} callbackUrl={callbackUrl} />
          </section>
        </div>
      </div>
    </main>
  );
}
