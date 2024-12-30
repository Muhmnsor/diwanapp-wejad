import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useProjectDashboard = (projectId: string) => {
  const { data: registrations = [], isLoading: isRegistrationsLoading } = useQuery({
    queryKey: ['project-registrations', projectId],
    queryFn: async () => {
      console.log("Fetching project registrations for:", projectId);
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          *,
          attendance_records(*)
        `)
        .eq('project_id', projectId);

      if (error) throw error;
      console.log("Fetched registrations:", data);
      return data || [];
    },
    enabled: !!projectId,
  });

  const { data: projectActivities = [], refetch: refetchActivities } = useQuery({
    queryKey: ['project-activities', projectId],
    queryFn: async () => {
      console.log('Fetching project activities:', projectId);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('project_id', projectId)
        .eq('is_project_activity', true)
        .order('date', { ascending: true });

      if (error) throw error;
      console.log('Fetched activities:', data);
      return data || [];
    },
  });

  const { data: attendanceStats } = useQuery({
    queryKey: ['project-attendance-stats', projectId],
    queryFn: async () => {
      console.log('Fetching attendance stats:', projectId);
      const { data: records, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('project_id', projectId)
        .eq('status', 'present');

      if (error) throw error;

      const totalPresent = records?.length || 0;
      const totalActivities = projectActivities.length;
      const averageAttendance = totalActivities > 0 
        ? Math.round((totalPresent / totalActivities) / registrations.length) 
        : 0;

      console.log('Attendance stats:', { totalPresent, totalActivities, averageAttendance });
      
      return {
        totalPresent,
        averageAttendance
      };
    },
    enabled: !!projectId && projectActivities.length > 0 && registrations.length > 0,
  });

  // Calculate dashboard metrics
  const registrationCount = registrations.length;
  const project = registrations[0]?.project || {};
  const remainingSeats = project.max_attendees ? project.max_attendees - registrationCount : 0;
  const occupancyRate = project.max_attendees ? (registrationCount / project.max_attendees) * 100 : 0;

  // Calculate activities stats
  const completedActivities = projectActivities.filter(activity => {
    const activityDate = new Date(activity.date);
    return activityDate < new Date();
  }).length;

  return {
    registrations,
    projectActivities,
    attendanceStats,
    refetchActivities,
    metrics: {
      registrationCount,
      remainingSeats,
      occupancyRate,
      activitiesStats: {
        total: projectActivities.length,
        completed: completedActivities,
        averageAttendance: attendanceStats?.averageAttendance || 0
      }
    },
    isLoading: isRegistrationsLoading
  };
};