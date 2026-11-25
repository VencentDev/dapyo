import { redirect } from 'next/navigation';

import { HomeFeedNavigation } from '@/features/home/feed/components/home-feed-navigation';
import type { OnboardingProfile } from '@/features/auth/onboarding/types/onboarding';
import { ApiError, serverApi } from '@/lib/api';
import { auth } from '@/lib/auth';
import { getOnboardingPath } from '@/lib/auth-routes';

import { TrailmatesManager } from './trailmates-manager';

export async function TrailmatesPageContent() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login?callbackUrl=%2Ftrailmates');
  }

  let onboarding: OnboardingProfile;
  try {
    onboarding = await serverApi<OnboardingProfile>('/api/v1/users/me/onboarding');
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect('/login?reauth=1&callbackUrl=%2Ftrailmates');
    }
    throw error;
  }

  if (!onboarding.completed) redirect(getOnboardingPath('/trailmates'));

  const displayName = session.user.name || 'Hiker';
  const initials =
    displayName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'H';

  return (
    <main
      data-social-home
      className="full-bleed -my-6 min-h-[100svh] bg-[#f2f4f0] pb-24 text-[#172a24] dark:bg-[#10231f] dark:text-[#edf4ef] lg:pb-8"
    >
      <HomeFeedNavigation displayName={displayName} initials={initials}>
        <section className="min-w-0 space-y-5 xl:col-span-2" aria-labelledby="trailmates-heading">
          <header className="dapyo-card-elevation rounded-[8px] bg-white p-6 ring-1 ring-[#17342e]/[0.06] dark:bg-[#17342e] dark:ring-white/[0.08] sm:p-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#9a7548] dark:text-[#e8bd78]">
              Your hiking circle
            </p>
            <h1
              id="trailmates-heading"
              className="mt-2 text-2xl font-semibold tracking-tight text-[#17342e] dark:text-[#edf4ef]"
            >
              Trailmates
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#586b60] dark:text-white/70">
              Find people to hike with. Connections become mutual when they accept your request. You
              can add accepted Trailmates directly when you organize a hike.
            </p>
          </header>
          <TrailmatesManager />
        </section>
      </HomeFeedNavigation>
    </main>
  );
}
