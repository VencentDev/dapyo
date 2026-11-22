import { redirect } from 'next/navigation';

import { SignupPageForm } from '@/features/auth/signup/components/signup-page-form';
import { auth } from '@/lib/auth';

export async function SignupPageContent() {
  const session = await auth();

  if (session?.user) redirect('/home');

  return <SignupPageForm />;
}
