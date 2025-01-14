import { DashboardData } from "@/types/dashboard";

import { EventTypeChart } from "./charts/EventTypeChart";
import { EventPathChart } from "./charts/EventPathChart";
import { BeneficiaryTypeChart } from "./charts/BeneficiaryTypeChart";
import { PriceDistributionChart } from "./charts/PriceDistributionChart";
import { MonthlyDistributionChart } from "./charts/MonthlyDistributionChart";

interface DashboardChartsProps {
  data: DashboardData;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

export const DashboardCharts = ({ data }: DashboardChartsProps) => {
  console.log('Chart data:', {
    eventsByType: data.eventsByType,
    eventsByBeneficiary: data.eventsByBeneficiary,
    eventsByBeneficiaryType: data.eventsByBeneficiaryType,
    eventsByPrice: data.eventsByPrice,
    eventsByMonth: data.eventsByMonth
  });
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <EventTypeChart data={data.eventsByType} colors={COLORS} />
        <EventPathChart data={data.eventsByBeneficiary} colors={COLORS} />
        <BeneficiaryTypeChart data={data.eventsByBeneficiaryType} colors={COLORS} />
        <PriceDistributionChart data={data.eventsByPrice} colors={COLORS} />
      </div>
      <MonthlyDistributionChart data={data.eventsByMonth} />
    </div>
  );
};