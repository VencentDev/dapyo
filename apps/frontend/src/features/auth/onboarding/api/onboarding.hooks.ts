'use client';

import { useMutation } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import { clientApi } from '@/lib/api';

import type { OnboardingProfile, SaveOnboardingRequest } from '../types/onboarding';

export function useSaveOnboarding() {
  const { data: session } = useSession();

  return useMutation({
    mutationFn: (request: SaveOnboardingRequest) =>
      clientApi<OnboardingProfile>(session?.accessToken, '/api/v1/users/me/onboarding', {
        method: 'PUT',
        body: JSON.stringify(request),
      }),
  });
}
