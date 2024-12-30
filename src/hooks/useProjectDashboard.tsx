import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useProjectDashboard = (projectId: string) => {
  // Fetch project details
  const { data: projectData, isLoading: isProjectLoading } = useQuery({
    queryKey: ['project-details', projectId],
    queryFn: async () => {
      console.log("Fetching project details for:", projectId);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) {
        console.error("Error fetching project details:", error);
        throw error;
      }
      return data;
    },
    enabled: !!projectId,
  });

  // Fetch project registrations with their attendance records
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
  });

  // Fetch project activities with their attendance records
  const { data: projectActivities = [], refetch: refetchActivities } = useQuery({
    queryKey: ['project-activities', projectId],
    queryFn: async () => {
      console.log('Fetching project activities:', projectId);
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          attendance_records!attendance_records_activity_id_fkey(*)
        `)
        .eq('project_id', projectId)
        .eq('is_project_activity', true)
        .order('date', { ascending: true });

      if (error) throw error;
      console.log('Fetched activities with attendance:', data);
      return data || [];
    },
  });

  // Calculate completed activities and attendance statistics
  const completedActivities = projectActivities.filter(activity => {
    const activityDate = new Date(activity.date);
    return activityDate < new Date();
  });

  const calculateAverageAttendance = () => {
    console.log('Calculating average attendance for project:', projectId);
    
    if (!completedActivities.length) {
      console.log('No completed activities found');
      return 0;
    }

    if (!registrations.length) {
      console.log('No registrations found');
      return 0;
    }

    // Calculate total attendance percentage across all completed activities
    const totalAttendancePercentage = completedActivities.reduce((sum, activity) => {
      const presentCount = activity.attendance_records?.filter(
        (record: { status: string }) => record.status === 'present'
      ).length || 0;
      
      const attendancePercentage = (presentCount / registrations.length) * 100;
      
      console.log('Activity attendance calculation:', {
        activityTitle: activity.title,
        presentCount,
        totalRegistrations: registrations.length,
        attendancePercentage
      });
      
      return sum + attendancePercentage;
    }, 0);

    const average = totalAttendancePercentage / completedActivities.length;
    
    console.log('Final average attendance calculation:', {
      totalAttendancePercentage,
      completedActivitiesCount: completedActivities.length,
      average: Math.round(average)
    });
    
    return Math.round(average);
  };

  const averageAttendance = calculateAverageAttendance();

  // Calculate dashboard metrics
  const registrationCount = registrations.length;
  const remainingSeats = projectData?.max_attendees ? projectData.max_attendees - registrationCount : 0;
  const occupancyRate = projectData?.max_attendees ? (registrationCount / projectData.max_attendees) * 100 : 0;

  console.log("Final dashboard metrics:", {
    registrationCount,
    remainingSeats,
    occupancyRate,
    activitiesStats: {
      total: projectActivities.length,
      completed: completedActivities.length,
      averageAttendance
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
        completed: completedActivities.length,
        averageAttendance
      }
    },
    isLoading: isProjectLoading || isRegistrationsLoading
  };
};