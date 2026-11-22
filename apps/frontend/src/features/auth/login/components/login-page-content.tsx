import { redirect } from 'next/navigation';

import { LoginPageForm } from '@/features/auth/login/components/login-page-form';
import { auth } from '@/lib/auth';

export async function LoginPageContent() {
  const session = await auth();

  if (session?.user) redirect('/home');

  return <LoginPageForm />;
}
