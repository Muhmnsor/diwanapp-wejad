import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ReportsTab } from "@/components/admin/dashboard/ReportsTab";
import { ProjectActivitiesTab } from "@/components/projects/dashboard/ProjectActivitiesTab";
import { DashboardOverview } from "@/components/admin/DashboardOverview";
import { DashboardRegistrations } from "@/components/admin/DashboardRegistrations";
import { ProjectPreparationTab } from "@/components/admin/dashboard/preparation/ProjectPreparationTab";
import { ProjectTabsList } from "./ProjectTabsList";
import { useProjectDashboard } from "@/hooks/useProjectDashboard";

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
    registrations,
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
        <DashboardOverview
          registrationCount={metrics.registrationCount}
          remainingSeats={metrics.remainingSeats}
          occupancyRate={metrics.occupancyRate}
          eventDate={project.start_date}
          eventTime={project.end_date}
          eventPath={project.event_path}
          eventCategory={project.event_category}
        />
      </TabsContent>

      <TabsContent value="registrations" className="mt-6">
        <DashboardRegistrations eventId={project.id} />
      </TabsContent>

      <TabsContent value="activities" className="mt-6">
        <ProjectActivitiesTab
          project={project}
          projectActivities={projectActivities}
          refetchActivities={refetchActivities}
        />
      </TabsContent>

      <TabsContent value="preparation" className="mt-6">
        <ProjectPreparationTab 
          projectId={project.id}
          activities={projectActivities}
        />
      </TabsContent>

      <TabsContent value="reports" className="mt-6">
        <ReportsTab eventId={project.id} />
      </TabsContent>
    </Tabs>
  );
};