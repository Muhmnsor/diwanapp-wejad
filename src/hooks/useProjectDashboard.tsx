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
        .order('created_at', { ascending: true });

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
      const averageAttendance = totalActivities > 0 ? Math.round(totalPresent / totalActivities) : 0;

      console.log('Attendance stats:', { totalPresent, totalActivities, averageAttendance });
      
      return {
        totalPresent,
        averageAttendance
      };
    },
    enabled: !!projectId && projectActivities.length > 0,
  });

  // Calculate dashboard metrics
  const registrationCount = registrations.length;
  const remainingSeats = projectId ? (registrations[0]?.max_attendees || 0) - registrationCount : 0;
  const occupancyRate = registrationCount > 0 ? (registrationCount / (registrations[0]?.max_attendees || 1)) * 100 : 0;

  return {
    registrations,
    projectActivities,
    attendanceStats,
    refetchActivities,
    metrics: {
      registrationCount,
      remainingSeats,
      occupancyRate
    },
    isLoading: isRegistrationsLoading
  };
};