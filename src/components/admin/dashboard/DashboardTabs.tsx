import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardOverview } from "../DashboardOverview";
import { DashboardRegistrations } from "../DashboardRegistrations";
import { DashboardPreparation } from "./DashboardPreparation";
import { ReportsTab } from "./ReportsTab";
import { FeedbackTab } from "./FeedbackTab";

interface DashboardTabsProps {
  event: any;
}

export const DashboardTabs = ({ event }: DashboardTabsProps) => {
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
        <DashboardOverview event={event} isEvent={true} />
      </TabsContent>

      <TabsContent value="registrations" className="mt-6">
        <DashboardRegistrations event={event} />
      </TabsContent>

      <TabsContent value="preparation" className="mt-6">
        <DashboardPreparation event={event} />
      </TabsContent>

      <TabsContent value="reports" className="mt-6">
        <ReportsTab event={event} />
      </TabsContent>

      <TabsContent value="feedback" className="mt-6">
        <FeedbackTab event={event} />
      </TabsContent>
    </Tabs>
  );
};