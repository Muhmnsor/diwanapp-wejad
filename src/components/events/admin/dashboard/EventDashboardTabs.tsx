
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { DashboardOverview } from "@/components/admin/DashboardOverview";
import { DashboardRegistrations } from "@/components/admin/DashboardRegistrations";
import { DashboardPreparation } from "@/components/admin/dashboard/DashboardPreparation";
import { FeedbackTab } from "@/components/admin/dashboard/FeedbackTab";
import { EventTabsList } from "@/components/admin/dashboard/tabs/EventTabsList";
import { useEventStats } from "@/components/admin/dashboard/stats/EventStats";
import { DashboardReportsTab } from "./tabs/DashboardReportsTab";

interface EventDashboardTabsProps {
  event: {
    id: string;
    title: string;
    max_attendees: number;
    event_path: string;
    event_category: string;
    date: string;
  };
}

export const EventDashboardTabs = ({ event }: EventDashboardTabsProps) => {
  console.log('EventDashboardTabs - Rendering for event:', event);

  const { data: eventStats } = useEventStats({
    eventId: event.id,
    maxAttendees: event.max_attendees
  });

  const eventData = {
    id: event.id,
    start_date: event.date,
    end_date: event.date,
    event_path: event.event_path,
    event_category: event.event_category,
    averageRating: eventStats?.averageRating
  };

  return (
    <Tabs defaultValue="overview" className="w-full space-y-6" dir="rtl">
      <EventTabsList />

      <TabsContent value="overview" className="mt-6">
        <DashboardOverview
          registrationCount={eventStats?.registrationCount || 0}
          remainingSeats={eventStats?.remainingSeats || 0}
          occupancyRate={eventStats?.occupancyRate || 0}
          event={eventData}
          isEvent={true}
        />
      </TabsContent>

      <TabsContent value="registrations" className="mt-6">
        <DashboardRegistrations eventId={event.id} />
      </TabsContent>

      <TabsContent value="preparation" className="mt-6">
        <DashboardPreparation eventId={event.id} />
      </TabsContent>

      <TabsContent value="feedback" className="mt-6">
        <FeedbackTab eventId={event.id} />
      </TabsContent>

      <TabsContent value="reports" className="mt-6">
        <DashboardReportsTab eventId={event.id} />
      </TabsContent>
    </Tabs>
  );
};
