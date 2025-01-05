import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ProjectTabsList } from "./tabs/ProjectTabsList";
import { DashboardOverviewTab } from "./tabs/DashboardOverviewTab";
import { DashboardActivitiesTab } from "./tabs/DashboardActivitiesTab";
import { DashboardFeedbackTab } from "./tabs/DashboardFeedbackTab";
import { EventFeedbackTab } from "./feedback/EventFeedbackTab";
import { ProjectPreparationTab } from "./preparation/ProjectPreparationTab";
import { DashboardRegistrations } from "@/components/admin/DashboardRegistrations";
import { DashboardReportsTab } from "./tabs/DashboardReportsTab";

interface DashboardTabsProps {
  eventId: string;
  isEvent?: boolean;
}

export const DashboardTabs = ({ eventId, isEvent = false }: DashboardTabsProps) => {
  console.log('DashboardTabs - Rendering with:', { eventId, isEvent });

  return (
    <Tabs defaultValue="overview" className="w-full space-y-6">
      <ProjectTabsList />
      
      <TabsContent value="overview" className="space-y-6">
        <DashboardOverviewTab eventId={eventId} isEvent={isEvent} />
      </TabsContent>

      <TabsContent value="registrations" className="space-y-6">
        <DashboardRegistrations eventId={eventId} />
      </TabsContent>

      <TabsContent value="activities" className="space-y-6">
        <DashboardActivitiesTab projectId={eventId} />
      </TabsContent>

      <TabsContent value="feedback" className="space-y-6">
        {isEvent ? (
          <EventFeedbackTab eventId={eventId} />
        ) : (
          <DashboardFeedbackTab projectId={eventId} />
        )}
      </TabsContent>

      <TabsContent value="preparation" className="space-y-6">
        <ProjectPreparationTab 
          projectId={eventId}
          activities={[]} 
        />
      </TabsContent>

      <TabsContent value="reports" className="space-y-6">
        <DashboardReportsTab projectId={eventId} isEvent={isEvent} />
      </TabsContent>
    </Tabs>
  );
};