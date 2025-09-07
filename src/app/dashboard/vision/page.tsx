import { requireAuth } from '@/lib/auth/server';
import { fetchVisionPlans } from '@/lib/supabase/vision';
import { VisionView } from '@/components/vision/vision-view';

export default async function VisionPage() {
  const { user } = await requireAuth();
  const visionPlans = await fetchVisionPlans(user.id);

  return <VisionView initialVisionPlans={visionPlans} user={user} />;
}
