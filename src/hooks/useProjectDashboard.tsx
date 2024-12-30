import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useProjectDashboard = (projectId: string) => {
  // Fetch project registrations
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

  // Fetch project details
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

  // Fetch project activities
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

  // Calculate attendance statistics for activities only
  const { data: attendanceStats } = useQuery({
    queryKey: ['project-activities-attendance', projectId],
    queryFn: async () => {
      console.log('Calculating attendance stats for project:', projectId);
      
      // Get completed activities
      const completedActivities = projectActivities.filter(activity => {
        const activityDate = new Date(activity.date);
        return activityDate < new Date();
      });

      console.log('Number of completed activities:', completedActivities.length);
      
      if (completedActivities.length === 0 || registrations.length === 0) {
        console.log('No completed activities or registrations found');
        return { totalPresent: 0, averageAttendance: 0 };
      }

      // Get attendance records for completed activities only
      const { data: records, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('project_id', projectId)
        .eq('status', 'present')
        .in('activity_id', completedActivities.map(a => a.id));

      if (error) {
        console.error('Error fetching attendance records:', error);
        throw error;
      }

      console.log('Attendance records found:', records?.length);

      // Calculate attendance statistics
      const totalPresent = records?.length || 0;
      const totalPossibleAttendance = completedActivities.length * registrations.length;
      const averageAttendance = totalPossibleAttendance > 0
        ? Math.round((totalPresent / totalPossibleAttendance) * 100)
        : 0;

      console.log('Attendance statistics:', {
        totalPresent,
        completedActivities: completedActivities.length,
        totalPossibleAttendance,
        averageAttendance,
        registrationsCount: registrations.length
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

  // Get completed activities count
  const completedActivities = projectActivities.filter(activity => {
    const activityDate = new Date(activity.date);
    return activityDate < new Date();
  }).length;

  console.log("Final dashboard metrics:", {
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