import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardOverview } from "../DashboardOverview";
import { useDashboardData } from "./useDashboardData";

interface DashboardTabsProps {
  event: any;
  showRegistrants?: boolean;
}

export const DashboardTabs = ({ event, showRegistrants = true }: DashboardTabsProps) => {
  const { data, isLoading, error } = useDashboardData(event.id);

  if (isLoading) {
    return <div className="p-4">جاري التحميل...</div>;
  }

  if (error || !data) {
    return <div className="p-4 text-red-500">حدث خطأ في تحميل البيانات</div>;
  }

  return (
    <Tabs defaultValue="overview" dir="rtl" className="w-full space-y-6">
      <div className="bg-white border-b">
        <div className="container mx-auto">
          <TabsList className="w-full justify-start rounded-none bg-transparent h-auto py-2">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-primary data-[state=active]:border-b-2 rounded-none px-4 pb-2"
            >
              نظرة عامة
            </TabsTrigger>
          </TabsList>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <TabsContent value="overview" className="mt-0">
          <DashboardOverview
            registrationCount={data.registrationCount}
            remainingSeats={data.remainingSeats}
            occupancyRate={data.occupancyRate}
            project={event}
            activities={{
              total: 0,
              completed: 0,
              averageAttendance: 0
            }}
            showRegistrants={showRegistrants}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
};