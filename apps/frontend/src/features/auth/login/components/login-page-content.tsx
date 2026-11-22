import { redirect } from 'next/navigation';

import { LoginPageForm } from '@/features/auth/login/components/login-page-form';
import { auth } from '@/lib/auth';

export async function LoginPageContent({
  searchParams,
}: {
  searchParams: Promise<{ reauth?: string | string[] }>;
}) {
  const params = await searchParams;
  const reauthValue = Array.isArray(params.reauth) ? params.reauth[0] : params.reauth;
  const session = await auth();

  if (session?.user && reauthValue !== '1') redirect('/home');

  return <LoginPageForm />;
}
