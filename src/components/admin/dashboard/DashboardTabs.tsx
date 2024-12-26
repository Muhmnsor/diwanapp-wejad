import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardOverview } from "../DashboardOverview";
import { DashboardRegistrations } from "../DashboardRegistrations";
import { ReportsTab } from "./ReportsTab";
import { FeedbackTab } from "./FeedbackTab";

interface DashboardTabsProps {
  registrationCount: number;
  remainingSeats: number;
  occupancyRate: number;
  eventDate: string;
  eventTime: string;
  registrations: any[];
  eventTitle: string;
  eventId: string;
}

export const DashboardTabs = ({
  registrationCount,
  remainingSeats,
  occupancyRate,
  eventDate,
  eventTime,
  eventId,
}: DashboardTabsProps) => {
  return (
    <Tabs defaultValue="overview" dir="rtl" className="w-full space-y-6">
      <TabsList className="w-full justify-start bg-secondary/20 p-1 rounded-xl">
        <TabsTrigger 
          value="overview" 
          className="flex-1 max-w-[200px] data-[state=active]:bg-white"
        >
          نظرة عامة
        </TabsTrigger>
        <TabsTrigger 
          value="registrations"
          className="flex-1 max-w-[200px] data-[state=active]:bg-white"
        >
          المسجلين
        </TabsTrigger>
        <TabsTrigger 
          value="report"
          className="flex-1 max-w-[200px] data-[state=active]:bg-white"
        >
          التقارير
        </TabsTrigger>
        <TabsTrigger 
          value="feedback"
          className="flex-1 max-w-[200px] data-[state=active]:bg-white"
        >
          التقييمات
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="mt-6">
        <DashboardOverview
          registrationCount={registrationCount}
          remainingSeats={remainingSeats}
          occupancyRate={occupancyRate}
          eventDate={eventDate}
          eventTime={eventTime}
        />
      </TabsContent>

      <TabsContent value="registrations" className="mt-6">
        <DashboardRegistrations eventId={eventId} />
      </TabsContent>

      <TabsContent value="report" className="mt-6">
        <ReportsTab eventId={eventId} />
      </TabsContent>

      <TabsContent value="feedback" className="mt-6">
        <FeedbackTab eventId={eventId} />
      </TabsContent>
    </Tabs>
  );
};