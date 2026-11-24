import { redirect } from 'next/navigation';

import { ApiError, serverApi } from '@/lib/api';
import { auth } from '@/lib/auth';
import { getOnboardingPath, getSafeInternalRedirect, protectedHomePath } from '@/lib/auth-routes';

import type { OnboardingProfile } from '../types/onboarding';
import { OnboardingForm } from './onboarding-form';

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
      redirect(`/login?reauth=1&callbackUrl=${encodeURIComponent(loginCallback)}`);
    }
    throw error;
  }

  if (profile.completed) redirect(callbackUrl);

  return <OnboardingForm initialProfile={profile} callbackUrl={callbackUrl} />;
}
