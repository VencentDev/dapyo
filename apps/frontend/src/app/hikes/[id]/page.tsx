import { HikeDetailPageContent } from '@/features/hikes/detail/components/hike-detail-page-content';
import { HikePageShell } from '@/features/hikes/components/hike-page-shell';

export default async function HikeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <HikePageShell>
      <HikeDetailPageContent hikeId={id} />
    </HikePageShell>
  );
}
