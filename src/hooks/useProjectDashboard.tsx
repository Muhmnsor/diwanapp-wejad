import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useProjectDashboard = (projectId: string) => {
  // Fetch project details along with registrations and activities
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

  // Fetch project activities
  const { data: projectActivities = [], refetch: refetchActivities } = useQuery({
    queryKey: ['project-activities', projectId],
    queryFn: async () => {
      console.log('Fetching project activities:', projectId);
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          attendance_records(*)
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
    
    if (!completedActivities.length || !registrations.length) {
      console.log('No completed activities or registrations found');
      return 0;
    }

    const totalAttendance = completedActivities.reduce((sum, activity) => {
      const presentCount = activity.attendance_records?.filter(
        (record: { status: string }) => record.status === 'present'
      ).length || 0;
      
      return sum + (presentCount / registrations.length) * 100;
    }, 0);

    const average = totalAttendance / completedActivities.length;
    
    console.log('Average attendance calculation:', {
      totalAttendance,
      completedActivities: completedActivities.length,
      registrations: registrations.length,
      average: Math.round(average)
    });
    
    return Math.round(average);
  };

  // Calculate dashboard metrics
  const registrationCount = registrations.length;
  const remainingSeats = projectData?.max_attendees ? projectData.max_attendees - registrationCount : 0;
  const occupancyRate = projectData?.max_attendees ? (registrationCount / projectData.max_attendees) * 100 : 0;

  const averageAttendance = calculateAverageAttendance();

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