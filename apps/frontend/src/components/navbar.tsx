import { ResponsiveNav } from '@/components/responsive-nav';
import { auth } from '@/lib/auth';

export async function Navbar() {
  const session = await auth();

  return <ResponsiveNav isAuthenticated={Boolean(session)} />;
}
