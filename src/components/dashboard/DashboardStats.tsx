import { EventStatsSection } from "./stats/EventStatsSection";
import { DashboardData } from "@/types/dashboard";

interface DashboardStatsProps {
  data: DashboardData;
}

export const DashboardStats = ({ data }: DashboardStatsProps) => {
  console.log("DashboardStats data:", data);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <EventStatsSection data={data} />
    </div>
  );
};