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
          attendance_records (
            status,
            registration_id
          )
        `)
        .eq('project_id', project.id)
        .eq('is_project_activity', true)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Calculate attendance rates for each activity
      const activitiesWithStats = data?.map(activity => ({
        ...activity,
        attendanceRate: activity.attendance_records?.length > 0
          ? (activity.attendance_records.filter(record => record.status === 'present').length / activity.attendance_records.length) * 100
          : 0
      })) || [];

      console.log("Activities with attendance stats:", activitiesWithStats);
      return activitiesWithStats;
    },
  });

  // Calculate dashboard metrics
  const registrationCount = registrations.length;
  const remainingSeats = project.max_attendees - registrationCount;
  const occupancyRate = (registrationCount / project.max_attendees) * 100;

  // Calculate activities metrics
  const totalActivities = projectActivities.length;
  const completedActivities = projectActivities.filter(activity => 
    activity.attendance_records?.some(record => record.status === 'present')
  ).length;

  // Calculate average attendance rate
  const averageAttendanceRate = projectActivities.length > 0
    ? projectActivities.reduce((sum, activity) => sum + (activity.attendanceRate || 0), 0) / projectActivities.length
    : 0;

  console.log("Activities metrics:", {
    totalActivities,
    completedActivities,
    averageAttendanceRate
  });

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
          eventDate={project.start_date}
          eventTime={project.end_date}
          eventPath={project.event_path}
          eventCategory={project.event_category}
          projectId={project.id}
          projectActivities={projectActivities}
          totalActivities={totalActivities}
          completedActivities={completedActivities}
          averageAttendanceRate={averageAttendanceRate}
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