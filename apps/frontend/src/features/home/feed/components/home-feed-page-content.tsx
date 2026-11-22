import { redirect } from 'next/navigation';

import { HomeFeedContent } from '@/features/home/feed/components/home-feed-content';
import type { OnboardingProfile } from '@/features/auth/onboarding/types/onboarding';
import { ApiError, serverApi } from '@/lib/api';
import { auth } from '@/lib/auth';
import { getOnboardingPath, protectedHomePath } from '@/lib/auth-routes';

export async function HomeFeedPageContent() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=%2Fhome');
  }

  let onboarding: OnboardingProfile;
  try {
    onboarding = await serverApi<OnboardingProfile>('/api/v1/users/me/onboarding');
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect(`/login?reauth=1&callbackUrl=${encodeURIComponent(protectedHomePath)}`);
    }
    throw error;
  }

  if (!onboarding.completed) redirect(getOnboardingPath(protectedHomePath));

  return <HomeFeedContent displayName={session.user?.name || 'Hiker'} />;
}
