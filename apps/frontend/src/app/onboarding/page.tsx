import { OnboardingPageContent } from '@/features/auth/onboarding/components/onboarding-page-content';

type OnboardingPageProps = {
  searchParams: Promise<{ callbackUrl?: string | string[] }>;
};

export default function OnboardingPage({ searchParams }: OnboardingPageProps) {
  return <OnboardingPageContent searchParams={searchParams} />;
}
