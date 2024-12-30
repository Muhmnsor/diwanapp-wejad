import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ReportsTab } from "@/components/admin/dashboard/ReportsTab";
import { ProjectActivitiesTab } from "@/components/projects/dashboard/ProjectActivitiesTab";
import { DashboardOverview } from "@/components/admin/DashboardOverview";
import { DashboardRegistrations } from "@/components/admin/DashboardRegistrations";
import { ProjectPreparationTab } from "@/components/admin/dashboard/preparation/ProjectPreparationTab";

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
        .select(`
          *,
          attendance_records!attendance_records_activity_id_fkey(status)
        `)
        .eq('project_id', project.id)
        .eq('is_project_activity', true)
        .order('created_at', { ascending: true });

      if (error) throw error;
      console.log("Fetched activities with attendance:", data);
      return data || [];
    },
  });

  // Calculate dashboard metrics
  const registrationCount = registrations.length;
  const remainingSeats = project.max_attendees - registrationCount;
  const occupancyRate = (registrationCount / project.max_attendees) * 100;

  // Calculate completed activities and average attendance
  const completedActivities = projectActivities.filter(activity => {
    const activityDate = new Date(activity.date);
    return activityDate < new Date();
  });

  const calculateAverageAttendance = () => {
    if (!completedActivities.length || !registrations.length) return 0;

    const totalAttendance = completedActivities.reduce((sum, activity) => {
      const presentCount = activity.attendance_records?.filter(
        (record: { status: string }) => record.status === 'present'
      ).length || 0;
      return sum + (presentCount / registrations.length) * 100;
    }, 0);

    const average = totalAttendance / completedActivities.length;
    console.log("Average attendance calculation:", {
      totalAttendance,
      completedActivities: completedActivities.length,
      registrations: registrations.length,
      average
    });
    return Math.round(average);
  };

  const averageAttendance = calculateAverageAttendance();

  return (
    <Tabs defaultValue="overview" dir="rtl" className="w-full space-y-6">
      <TabsList className="w-full grid grid-cols-5 bg-secondary/20 p-1 rounded-xl">
        <TabsTrigger value="overview" className="data-[state=active]:bg-white">
          نظرة عامة
        </TabsTrigger>
        <TabsTrigger value="registrations" className="data-[state=active]:bg-white">
          المسجلين
        </TabsTrigger>
        <TabsTrigger value="activities" className="data-[state=active]:bg-white">
          الأنشطة
        </TabsTrigger>
        <TabsTrigger value="preparation" className="data-[state=active]:bg-white">
          التحضير
        </TabsTrigger>
        <TabsTrigger value="reports" className="data-[state=active]:bg-white">
          التقارير
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="mt-6">
        <DashboardOverview
          registrationCount={registrationCount}
          remainingSeats={remainingSeats}
          occupancyRate={occupancyRate}
          project={project}
          activities={{
            total: projectActivities.length,
            completed: completedActivities.length,
            averageAttendance
          }}
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