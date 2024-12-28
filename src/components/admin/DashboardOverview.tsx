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
  return (
    <div className="grid gap-8">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-6">الإحصائيات الكلية</h2>
        <DashboardStats
          registrationCount={registrationCount}
          remainingSeats={remainingSeats}
          occupancyRate={occupancyRate}
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-6">الإحصائيات المصفاة</h2>
        <DashboardStats
          registrationCount={registrationCount}
          remainingSeats={remainingSeats}
          occupancyRate={occupancyRate}
        />
      </div>
    </div>
  );
};