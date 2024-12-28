import { DashboardStats } from "./DashboardStats";

interface DashboardOverviewProps {
  registrationCount: number;
  remainingSeats: number;
  occupancyRate: number;
  eventDate: string;
  eventTime: string;
  eventPath?: string;
  eventCategory?: string;
}

export const DashboardOverview = ({
  registrationCount,
  remainingSeats,
  occupancyRate,
  eventDate,
  eventTime,
  eventPath,
  eventCategory,
}: DashboardOverviewProps) => {
  console.log("DashboardOverview rendering with props:", {
    registrationCount,
    remainingSeats,
    occupancyRate,
    eventDate,
    eventTime,
    eventPath,
    eventCategory,
  });

  return (
    <div className="grid grid-cols-1 gap-8">
      {/* Overall Statistics Section */}
      <section className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-6 text-right">الإحصائيات الكلية</h2>
        <DashboardStats
          registrationCount={registrationCount}
          remainingSeats={remainingSeats}
          occupancyRate={occupancyRate}
          showFilters={false}
          eventCount={0}
        />
      </section>

      {/* Filtered Statistics Section */}
      <section className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-6 text-right">الإحصائيات المصفاة</h2>
        <DashboardStats
          registrationCount={0}
          remainingSeats={0}
          occupancyRate={0}
          showFilters={true}
          eventCount={0}
        />
      </section>
    </div>
  );
};