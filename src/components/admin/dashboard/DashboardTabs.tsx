import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardOverview } from "../DashboardOverview";
import { DashboardRegistrations } from "../DashboardRegistrations";
import { DashboardPreparation } from "./DashboardPreparation";
import { ReportsTab } from "./ReportsTab";
import { FeedbackTab } from "./FeedbackTab";

interface DashboardTabsProps {
  event: {
    id: string;
    title: string;
    max_attendees: number;
    event_path: string;
    event_category: string;
    start_date: string;
    end_date: string;
  };
}

export const DashboardTabs = ({ event }: DashboardTabsProps) => {
  // Calculate stats
  const registrationCount = 0; // This should be calculated from actual data
  const remainingSeats = event.max_attendees - registrationCount;
  const occupancyRate = (registrationCount / event.max_attendees) * 100;

  const projectData = {
    id: event.id,
    start_date: event.start_date || '',
    end_date: event.end_date || '',
    event_path: event.event_path,
    event_category: event.event_category
  };

  return (
    <Tabs defaultValue="overview" className="w-full space-y-6">
      <TabsList className="w-full justify-start h-auto p-0 bg-transparent" dir="rtl">
        <TabsTrigger
          value="overview"
          className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-2"
        >
          نظرة عامة
        </TabsTrigger>
        <TabsTrigger
          value="registrations"
          className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-2"
        >
          المسجلون
        </TabsTrigger>
        <TabsTrigger
          value="preparation"
          className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-2"
        >
          التحضير
        </TabsTrigger>
        <TabsTrigger
          value="reports"
          className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-2"
        >
          التقارير
        </TabsTrigger>
        <TabsTrigger
          value="feedback"
          className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-2"
        >
          التقييمات
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-6">
        <DashboardOverview
          registrationCount={registrationCount}
          remainingSeats={remainingSeats}
          occupancyRate={occupancyRate}
          project={projectData}
          isEvent={true}
        />
      </TabsContent>

      <TabsContent value="registrations" className="mt-6">
        <DashboardRegistrations eventId={event.id} />
      </TabsContent>

      <TabsContent value="preparation" className="mt-6">
        <DashboardPreparation eventId={event.id} />
      </TabsContent>

      <TabsContent value="reports" className="mt-6">
        <ReportsTab eventId={event.id} />
      </TabsContent>

      <TabsContent value="feedback" className="mt-6">
        <FeedbackTab eventId={event.id} />
      </TabsContent>
    </Tabs>
  );
};