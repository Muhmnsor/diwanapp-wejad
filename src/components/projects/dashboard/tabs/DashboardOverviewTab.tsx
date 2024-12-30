import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardOverview } from "@/components/admin/DashboardOverview";

interface DashboardOverviewTabProps {
  registrationCount: number;
  remainingSeats: number;
  occupancyRate: number;
  project: {
    id: string;
    start_date: string;
    end_date: string;
    event_path?: string;
    event_category?: string;
  };
}

interface ActivityStats {
  activities: Array<{
    id: string;
    title: string;
    date: string;
    attendance_records: Array<{
      status: string;
    }>;
  }>;
  totalActivities: number;
  completedActivities: number;
  averageAttendanceRate: number;
}

export const DashboardOverviewTab = ({
  registrationCount,
  remainingSeats,
  occupancyRate,
  project,
}: DashboardOverviewTabProps) => {
  const { data: projectActivities } = useQuery<ActivityStats>({
    queryKey: ['project-activities-stats', project.id],
    queryFn: async () => {
      console.log('Fetching project activities stats for project:', project.id);
      
      // Fetch activities with their attendance records
      const { data: activities, error } = await supabase
        .from('events')
        .select(`
          id,
          title,
          date,
          attendance_records (
            status
          )
        `)
        .eq('project_id', project.id)
        .eq('is_project_activity', true);

      if (error) {
        console.error('Error fetching project activities:', error);
        throw error;
      }

      console.log('Raw activities data:', activities);

      const currentDate = new Date().toISOString().split('T')[0];
      
      // Calculate completed activities (activities with past dates)
      const completedActivities = activities?.filter(
        (activity: any) => activity.date <= currentDate
      ).length || 0;

      // Calculate attendance rates for each activity
      const attendanceRates = activities?.map((activity: any) => {
        const totalAttendees = activity.attendance_records?.length || 0;
        const presentAttendees = activity.attendance_records?.filter(
          (record: any) => record.status === 'present'
        ).length || 0;
        
        return totalAttendees > 0 ? (presentAttendees / totalAttendees) * 100 : 0;
      }) || [];

      // Calculate average attendance rate
      const averageAttendanceRate = attendanceRates.length > 0
        ? attendanceRates.reduce((sum: number, rate: number) => sum + rate, 0) / attendanceRates.length
        : 0;

      const result = {
        activities: activities || [],
        totalActivities: activities?.length || 0,
        completedActivities,
        averageAttendanceRate
      };

      console.log('Processed activities data:', result);
      return result;
    },
    initialData: {
      activities: [],
      totalActivities: 0,
      completedActivities: 0,
      averageAttendanceRate: 0
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