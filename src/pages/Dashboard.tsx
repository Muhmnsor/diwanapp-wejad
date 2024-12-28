import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { DashboardOverview } from "@/components/admin/DashboardOverview";
import { useDashboardData } from "@/hooks/useDashboardData";

const Dashboard = () => {
  const { data, isLoading, error } = useDashboardData();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col" dir="rtl">
        <TopHeader />
        <div className="container mx-auto px-4 py-8 flex-grow">
          <h1 className="text-3xl font-bold mb-8">لوحة المعلومات</h1>
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col" dir="rtl">
        <TopHeader />
        <div className="container mx-auto px-4 py-8 flex-grow">
          <h1 className="text-3xl font-bold mb-8">لوحة المعلومات</h1>
          <div className="text-red-500">حدث خطأ في تحميل البيانات</div>
        </div>
        <Footer />
      </div>
    );
  }

  const totalRegistrations = data?.totalRegistrations || 0;
  const remainingSeats = data?.upcomingEvents || 0;
  const occupancyRate = data?.totalEvents ? (totalRegistrations / data.totalEvents) * 100 : 0;

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <TopHeader />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-3xl font-bold mb-8">لوحة المعلومات</h1>
        <DashboardOverview
          registrationCount={totalRegistrations}
          remainingSeats={remainingSeats}
          occupancyRate={occupancyRate}
          eventDate=""
          eventTime=""
        />
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;