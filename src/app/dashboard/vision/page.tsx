import { requireAuth } from '@/lib/auth/server';
import { fetchVisionPlans } from '@/lib/supabase/vision';
import { VisionView } from '@/components/vision/vision-view';

// Force dynamic rendering for this page since it uses authentication
export const dynamic = 'force-dynamic';

export default async function VisionPage() {
  const { user } = await requireAuth();
  const visionPlans = await fetchVisionPlans(user.id);

  return <VisionView initialVisionPlans={visionPlans} user={user} />;
}
