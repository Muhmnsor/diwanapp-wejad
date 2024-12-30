import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardOverview } from "@/components/admin/DashboardOverview";

interface DashboardOverviewTabProps {
  registrationCount: number;
  remainingSeats: number;
  occupancyRate: number;
  project: {
    start_date: string;
    end_date: string;
    event_path?: string;
    event_category?: string;
    id: string;
  };
}

export const DashboardOverviewTab = ({
  registrationCount,
  remainingSeats,
  occupancyRate,
  project,
}: DashboardOverviewTabProps) => {
  const { data: projectActivities = [] } = useQuery({
    queryKey: ['project-activities-stats', project.id],
    queryFn: async () => {
      console.log('Fetching project activities stats for project:', project.id);
      
      const { data: activities, error: activitiesError } = await supabase
        .from('events')
        .select(`
          id,
          title,
          date,
          attendance_records(status)
        `)
        .eq('project_id', project.id)
        .eq('is_project_activity', true);

      if (activitiesError) {
        console.error('Error fetching activities:', activitiesError);
        throw activitiesError;
      }

      console.log('Raw activities data:', activities);

      const currentDate = new Date().toISOString().split('T')[0];
      const completedActivities = activities?.filter(
        (activity: any) => activity.date <= currentDate
      ) || [];

      // Calculate average attendance rate
      const attendanceRates = activities?.map((activity: any) => {
        const totalAttendees = activity.attendance_records?.length || 0;
        const presentAttendees = activity.attendance_records?.filter(
          (record: any) => record.status === 'present'
        ).length || 0;
        
        return totalAttendees > 0 ? (presentAttendees / totalAttendees) * 100 : 0;
      }) || [];

      const averageAttendanceRate = attendanceRates.length > 0
        ? attendanceRates.reduce((sum: number, rate: number) => sum + rate, 0) / attendanceRates.length
        : 0;

      console.log('Calculated stats:', {
        totalActivities: activities?.length || 0,
        completedActivities: completedActivities.length,
        averageAttendanceRate
      });

      return {
        activities: activities || [],
        totalActivities: activities?.length || 0,
        completedActivities: completedActivities.length,
        averageAttendanceRate
      };
    }
  });

  return (
    <DashboardOverview
      registrationCount={registrationCount}
      remainingSeats={remainingSeats}
      occupancyRate={occupancyRate}
      eventDate={project.start_date}
      eventTime={project.end_date}
      eventPath={project.event_path}
      eventCategory={project.event_category}
      projectId={project.id}
      projectActivities={projectActivities?.activities || []}
      totalActivities={projectActivities?.totalActivities || 0}
      completedActivities={projectActivities?.completedActivities || 0}
      averageAttendanceRate={projectActivities?.averageAttendanceRate || 0}
    />
  );
};