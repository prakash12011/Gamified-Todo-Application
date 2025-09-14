import { requireAuth } from '@/lib/auth/server'
import CalendarView from '@/components/calendar/calendar-view'

// Force dynamic rendering for this page since it uses authentication
export const dynamic = 'force-dynamic';

export default async function CalendarPage() {
  // Use the helper function to get authenticated user
  const { user } = await requireAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
        <p className="text-muted-foreground">
          View and manage your todos in a calendar layout.
        </p>
      </div>
      
      <CalendarView />
    </div>
  );
}