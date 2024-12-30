import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ReportsTab } from "@/components/admin/dashboard/ReportsTab";
import { DashboardRegistrations } from "@/components/admin/DashboardRegistrations";
import { ProjectPreparationTab } from "@/components/admin/dashboard/preparation/ProjectPreparationTab";
import { ProjectTabsList } from "./tabs/ProjectTabsList";
import { DashboardOverviewTab } from "./tabs/DashboardOverviewTab";
import { DashboardActivitiesTab } from "./tabs/DashboardActivitiesTab";
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
    attendanceStats,
    refetchActivities,
    metrics,
    isLoading 
  } = useProjectDashboard(project.id);

  if (isLoading) {
    return <div>جاري التحميل...</div>;
  }

  // Calculate activities stats
  const activitiesStats = {
    total: projectActivities.length,
    completed: projectActivities.filter(activity => {
      const activityDate = new Date(activity.date);
      return activityDate < new Date();
    }).length,
    averageAttendance: attendanceStats?.averageAttendance || 0
  };

  console.log("Activities stats:", activitiesStats);

  return (
    <Tabs defaultValue="overview" dir="rtl" className="w-full space-y-6">
      <ProjectTabsList />
      
      <TabsContent value="overview" className="mt-6">
        <DashboardOverviewTab
          registrationCount={metrics.registrationCount}
          remainingSeats={metrics.remainingSeats}
          occupancyRate={metrics.occupancyRate}
          project={project}
          activities={activitiesStats}
        />
      </TabsContent>

      <TabsContent value="registrations" className="mt-6">
        <DashboardRegistrations eventId={project.id} />
      </TabsContent>

      <TabsContent value="activities" className="mt-6">
        <DashboardActivitiesTab project={project} />
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