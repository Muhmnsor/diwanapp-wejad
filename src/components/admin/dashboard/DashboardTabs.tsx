import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ProjectTabsList } from "./tabs/ProjectTabsList";
import { DashboardOverviewTab } from "./tabs/DashboardOverviewTab";
import { DashboardRegistrationsTab } from "./tabs/DashboardRegistrationsTab";
import { DashboardActivitiesTab } from "./tabs/DashboardActivitiesTab";
import { DashboardFeedbackTab } from "./tabs/DashboardFeedbackTab";
import { EventFeedbackTab } from "./feedback/EventFeedbackTab";
import { ProjectPreparationTab } from "./preparation/ProjectPreparationTab";
import { DashboardReportsTab } from "./tabs/DashboardReportsTab";

interface DashboardTabsProps {
  projectId: string;
  isEvent?: boolean;
}

export const DashboardTabs = ({ projectId, isEvent = false }: DashboardTabsProps) => {
  console.log('DashboardTabs - Rendering with:', { projectId, isEvent });

  return (
    <Tabs defaultValue="overview" className="w-full space-y-6">
      <ProjectTabsList />
      
      <TabsContent value="overview" className="space-y-6">
        <DashboardOverviewTab 
          eventId={projectId} 
          isEvent={isEvent} 
        />
      </TabsContent>

      <TabsContent value="registrations" className="space-y-6">
        <DashboardRegistrationsTab 
          projectId={projectId} 
          isEvent={isEvent} 
        />
      </TabsContent>

      <TabsContent value="activities" className="space-y-6">
        <DashboardActivitiesTab projectId={projectId} />
      </TabsContent>

      <TabsContent value="feedback" className="space-y-6">
        {isEvent ? (
          <EventFeedbackTab eventId={projectId} />
        ) : (
          <DashboardFeedbackTab projectId={projectId} />
        )}
      </TabsContent>

      <TabsContent value="preparation" className="space-y-6">
        <ProjectPreparationTab 
          projectId={projectId}
          activities={[]} 
        />
      </TabsContent>

      <TabsContent value="reports" className="space-y-6">
        <DashboardReportsTab 
          projectId={projectId} 
          isEvent={isEvent} 
        />
      </TabsContent>
    </Tabs>
  );
};