import { DashboardTabs } from "./dashboard/DashboardTabs";
import { useDashboardData } from "./dashboard/useDashboardData";

export const EventDashboard = ({ eventId }: { eventId: string }) => {
  const { data, isLoading, error } = useDashboardData(eventId);

  if (isLoading) {
    return <div className="text-center p-8">جاري التحميل...</div>;
  }

  if (error || !data?.event) {
    return <div className="text-center p-8 text-red-500">لم يتم العثور على الفعالية</div>;
  }

  return (
    <div className="space-y-6">
      <DashboardTabs
        registrationCount={data.registrationCount}
        remainingSeats={data.remainingSeats}
        occupancyRate={data.occupancyRate}
        eventDate={data.event.date}
        eventTime={data.event.time}
        registrations={data.registrations}
        eventTitle={data.event.title}
        eventId={eventId}
        eventPath={data.event.event_path}
        eventCategory={data.event.event_category}
      />
    </div>
  );
};