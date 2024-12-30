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

  const { data: projectData } = useQuery({
    queryKey: ['project-details', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) throw error;
      return data;
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
    queryKey: ['project-activities-attendance', projectId],
    queryFn: async () => {
      console.log('Fetching activities attendance stats:', projectId);
      
      // Get all attendance records for activities in this project
      const { data: records, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('project_id', projectId)
        .is('event_id', null) // Ignore event records
        .not('activity_id', 'is', null) // Only activity records
        .eq('status', 'present'); // Only count present attendees

      if (error) throw error;

      // Calculate total present attendees
      const totalPresent = records?.length || 0;
      
      // Get completed activities
      const completedActivities = projectActivities.filter(activity => {
        const activityDate = new Date(activity.date);
        return activityDate < new Date();
      });

      // Calculate average attendance
      // Only consider completed activities and registered participants
      const totalPossibleAttendance = completedActivities.length * registrations.length;
      const averageAttendance = totalPossibleAttendance > 0
        ? Math.round((totalPresent / totalPossibleAttendance) * 100)
        : 0;

      console.log('Activities attendance stats:', {
        totalPresent,
        completedActivities: completedActivities.length,
        totalPossibleAttendance,
        averageAttendance
      });
      
      return {
        totalPresent,
        averageAttendance
      };
    },
    enabled: !!projectId && projectActivities.length > 0 && registrations.length > 0,
  });

  // Calculate dashboard metrics
  const registrationCount = registrations.length;
  const remainingSeats = projectData?.max_attendees ? projectData.max_attendees - registrationCount : 0;
  const occupancyRate = projectData?.max_attendees ? (registrationCount / projectData.max_attendees) * 100 : 0;

  // Calculate completed activities
  const completedActivities = projectActivities.filter(activity => {
    const activityDate = new Date(activity.date);
    return activityDate < new Date();
  }).length;

  console.log("Dashboard metrics:", {
    registrationCount,
    remainingSeats,
    occupancyRate,
    activitiesStats: {
      total: projectActivities.length,
      completed: completedActivities,
      averageAttendance: attendanceStats?.averageAttendance || 0
    }
  });

  return {
    projectActivities,
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