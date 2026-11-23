import type { Metadata } from 'next';

import { siteConfig } from '@/config/site';
import { LoginPageContent } from '@/features/auth/login/components/login-page-content';

export const metadata: Metadata = {
  title: `Sign in - ${siteConfig.name}`,
  description: siteConfig.loginDescription,
  openGraph: {
    title: `Sign in - ${siteConfig.name}`,
    description: siteConfig.loginDescription,
  },
};

type LoginPageProps = {
  searchParams: Promise<{ reauth?: string | string[] }>;
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  return <LoginPageContent searchParams={searchParams} />;
}
