
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { DashboardRegistrations } from "@/components/admin/DashboardRegistrations";
import { ProjectPreparationTab } from "@/components/admin/dashboard/preparation/ProjectPreparationTab";
import { ProjectTabsList } from "@/components/admin/dashboard/tabs/ProjectTabsList";
import { DashboardOverviewTab } from "@/components/admin/dashboard/tabs/DashboardOverviewTab";
import { DashboardActivitiesTab } from "@/components/admin/dashboard/tabs/DashboardActivitiesTab";
import { DashboardFeedbackTab } from "@/components/admin/dashboard/tabs/DashboardFeedbackTab";
import { DashboardReportsTab } from "@/components/projects/dashboard/reports/tabs/DashboardReportsTab";
import { useProjectDashboard } from "@/hooks/useProjectDashboard";
import { ProjectActivitiesRatingCard } from "./stats/ProjectActivitiesRatingCard";
import { ProjectRatingCard } from "./stats/ProjectRatingCard";

interface ProjectDashboardTabsProps {
  project: {
    id: string;
    max_attendees: number;
    start_date: string;
    end_date: string;
    event_path: string;
    event_category: string;
  };
}

export const ProjectDashboardTabs = ({ project }: ProjectDashboardTabsProps) => {
  console.log("ProjectDashboardTabs - project:", project);
  
  const { 
    projectActivities,
    refetchActivities,
    metrics,
    isLoading 
  } = useProjectDashboard(project.id);

  if (isLoading) {
    return <div>جاري التحميل...</div>;
  }

  return (
    <Tabs defaultValue="overview" dir="rtl" className="w-full space-y-6">
      <ProjectTabsList />
      
      <TabsContent value="overview" className="mt-6">
        <DashboardOverviewTab
          registrationCount={metrics.registrationCount}
          remainingSeats={metrics.remainingSeats}
          occupancyRate={metrics.occupancyRate}
          project={project}
          activities={metrics.activitiesStats}
        />
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <ProjectActivitiesRatingCard projectId={project.id} />
          <ProjectRatingCard projectId={project.id} />
        </div>
      </TabsContent>

      <TabsContent value="registrations" className="mt-6">
        <DashboardRegistrations eventId={project.id} />
      </TabsContent>

      <TabsContent value="activities" className="mt-6">
        <DashboardActivitiesTab projectId={project.id} />
      </TabsContent>

      <TabsContent value="feedback" className="mt-6">
        <DashboardFeedbackTab projectId={project.id} />
      </TabsContent>

      <TabsContent value="preparation" className="mt-6">
        <ProjectPreparationTab 
          projectId={project.id}
          activities={projectActivities}
        />
      </TabsContent>

      <TabsContent value="reports" className="mt-6">
        <DashboardReportsTab projectId={project.id} />
      </TabsContent>
    </Tabs>
  );
};
