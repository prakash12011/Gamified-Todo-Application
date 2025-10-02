import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { requireAuth } from "@/lib/auth/server";
import DashboardStats from "@/components/dashboard/dashboard-stats";
import { PWADebugPanel } from "@/components/pwa/pwa-debug-panel";

// Force dynamic rendering for this page since it uses authentication
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // Use the helper function to get authenticated user and supabase client
  const { user } = await requireAuth();

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold">Welcome back, {user.email?.split('@')[0] || 'User'}!</h1>
          <p className="text-muted-foreground">Ready to conquer your day?</p>
        </div>
        <Button asChild className="hover:scale-105 transition-all cursor-pointer self-end">
          <Link href="/dashboard/todos">
            <Plus className="mr-2 h-4 w-4" />
            Add Todo
          </Link>
        </Button>
      </div>

      {/* Dynamic Stats Component - Client Side */}
      <DashboardStats userId={user.id} />

      {/* PWA Debug Panel - Only show in development */}
      {process.env.NODE_ENV === 'development' && <PWADebugPanel />}
    </div>
  );
}
