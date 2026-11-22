import { HomePageClientContent } from '@/features/home/landing/components/home-page-client-content';
import { auth } from '@/lib/auth';

export async function HomePageContent() {
  const session = await auth();

  return (
    <HomePageClientContent
      isAuthenticated={Boolean(session?.user)}
      displayName={session?.user?.name}
    />
  );
}
