import { HikeDiscoveryPageContent } from '@/features/hikes/discover/components/hike-discovery-page-content';
import { HikePageShell } from '@/features/hikes/components/hike-page-shell';

export default function DiscoverPage() {
  return (
    <HikePageShell>
      <HikeDiscoveryPageContent />
    </HikePageShell>
  );
}
