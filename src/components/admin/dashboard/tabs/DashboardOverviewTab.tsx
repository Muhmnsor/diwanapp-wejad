import { DashboardStats } from "@/components/admin/DashboardStats";
import { RegistrantsTable } from "@/components/admin/dashboard/RegistrantsTable";
import { useRegistrantsStats } from "@/hooks/useRegistrantsStats";

interface DashboardOverviewTabProps {
  eventId: string;
  isEvent?: boolean;
}

export const DashboardOverviewTab = ({
  eventId,
  isEvent = false
}: DashboardOverviewTabProps) => {
  console.log('DashboardOverviewTab - Rendering with:', { eventId, isEvent });

  const { registrantsStats, isLoading } = useRegistrantsStats(eventId);

  return (
    <div className="space-y-8" dir="rtl">
      <DashboardStats
        registrationCount={registrantsStats.length}
        remainingSeats={0} // Replace with actual logic if needed
        occupancyRate={0} // Replace with actual logic if needed
        project={{ id: eventId }} // Replace with actual project data if needed
        activities={[]} // Replace with actual activities data if needed
        isEvent={isEvent}
      />

      {!isEvent && (
        <RegistrantsTable 
          registrantsStats={registrantsStats}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};
