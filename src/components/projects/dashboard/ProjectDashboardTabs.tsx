import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ReportsTab } from "@/components/admin/dashboard/ReportsTab";
import { ProjectActivitiesTab } from "@/components/projects/dashboard/ProjectActivitiesTab";
import { DashboardOverviewTab } from "./tabs/DashboardOverviewTab";
import { DashboardRegistrationsTab } from "./tabs/DashboardRegistrationsTab";

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

  const { data: registrations = [] } = useQuery({
    queryKey: ['project-registrations', project.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('project_id', project.id);

      if (error) throw error;
      return data || [];
    },
  });

  const { data: projectActivities = [], refetch: refetchActivities } = useQuery({
    queryKey: ['project-activities', project.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('project_id', project.id)
        .eq('is_project_activity', true)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  // Calculate dashboard metrics
  const registrationCount = registrations.length;
  const remainingSeats = project.max_attendees - registrationCount;
  const occupancyRate = (registrationCount / project.max_attendees) * 100;

  return (
    <Tabs defaultValue="overview" dir="rtl" className="w-full space-y-6">
      <TabsList className="w-full grid grid-cols-4 bg-secondary/20 p-1 rounded-xl">
        <TabsTrigger value="overview" className="data-[state=active]:bg-white">
          نظرة عامة
        </TabsTrigger>
        <TabsTrigger value="registrations" className="data-[state=active]:bg-white">
          المسجلين
        </TabsTrigger>
        <TabsTrigger value="activities" className="data-[state=active]:bg-white">
          الأنشطة
        </TabsTrigger>
        <TabsTrigger value="reports" className="data-[state=active]:bg-white">
          التقارير
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="mt-6">
        <DashboardOverviewTab
          registrationCount={registrationCount}
          remainingSeats={remainingSeats}
          occupancyRate={occupancyRate}
          project={project}
        />
      </TabsContent>

      <TabsContent value="registrations" className="mt-6">
        <DashboardRegistrationsTab projectId={project.id} />
      </TabsContent>

      <TabsContent value="activities" className="mt-6">
        <ProjectActivitiesTab
          project={project}
          projectActivities={projectActivities}
          refetchActivities={refetchActivities}
        />
      </TabsContent>

      <TabsContent value="reports" className="mt-6">
        <ReportsTab eventId={project.id} />
      </TabsContent>
    </Tabs>
  );
};