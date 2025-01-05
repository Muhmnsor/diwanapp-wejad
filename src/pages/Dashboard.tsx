import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { useDashboardData } from "@/hooks/useDashboardData";

const Dashboard = () => {
  const { data, isLoading, error } = useDashboardData();

  console.log("Dashboard data:", { data, isLoading, error });

  return (
    <div className="container mx-auto px-4 py-8 space-y-8" dir="rtl">
      <h1 className="text-2xl font-bold mb-6">لوحة المعلومات</h1>
      <DashboardStats data={data} isLoading={isLoading} error={error} />
      {!isLoading && !error && <DashboardCharts data={data} />}
    </div>
  );
};

export default Dashboard;