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

  // Fetch project activities with their attendance records and feedback
  const { data: projectActivities = [], refetch: refetchActivities } = useQuery({
    queryKey: ['project-activities', projectId],
    queryFn: async () => {
      console.log('Fetching project activities:', projectId);
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          attendance_records(*),
          activity_feedback(*)
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

  const calculateActivityStats = () => {
    const stats = {
      total: projectActivities.length,
      completed: completedActivities.length,
      averageAttendance: calculateAverageAttendance(),
      highestAttendance: null as any,
      lowestAttendance: null as any,
      highestRated: null as any,
      lowestRated: null as any
    };

    if (completedActivities.length > 0) {
      // Calculate attendance rates for each activity
      const activitiesWithStats = completedActivities.map(activity => {
        const presentCount = activity.attendance_records?.filter(
          (record: { status: string }) => record.status === 'present'
        ).length || 0;
        
        const attendanceRate = registrations.length ? (presentCount / registrations.length) * 100 : 0;
        
        // Calculate average rating
        const ratings = activity.activity_feedback?.map((f: any) => f.overall_rating).filter(Boolean) || [];
        const averageRating = ratings.length ? 
          ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length : 0;

        return {
          ...activity,
          attendanceRate,
          presentCount,
          averageRating,
          ratingsCount: ratings.length
        };
      });

      // Sort by attendance rate
      const sortedByAttendance = [...activitiesWithStats].sort((a, b) => b.attendanceRate - a.attendanceRate);
      stats.highestAttendance = sortedByAttendance[0];
      stats.lowestAttendance = sortedByAttendance[sortedByAttendance.length - 1];

      // Sort by rating
      const sortedByRating = [...activitiesWithStats]
        .filter(a => a.ratingsCount > 0)
        .sort((a, b) => b.averageRating - a.averageRating);
      
      stats.highestRated = sortedByRating[0] || null;
      stats.lowestRated = sortedByRating[sortedByRating.length - 1] || null;
    }

    return stats;
  };

  const activityStats = calculateActivityStats();

  // Calculate dashboard metrics
  const registrationCount = registrations.length;
  const remainingSeats = projectData?.max_attendees ? projectData.max_attendees - registrationCount : 0;
  const occupancyRate = projectData?.max_attendees ? (registrationCount / projectData.max_attendees) * 100 : 0;

  console.log("Final dashboard metrics:", {
    registrationCount,
    remainingSeats,
    occupancyRate,
    activityStats
  });

  return {
    projectActivities,
    refetchActivities,
    metrics: {
      registrationCount,
      remainingSeats,
      occupancyRate,
      activitiesStats: {
        total: activityStats.total,
        completed: activityStats.completed,
        averageAttendance: activityStats.averageAttendance,
        highestAttendance: activityStats.highestAttendance ? {
          title: activityStats.highestAttendance.title,
          attendanceRate: activityStats.highestAttendance.attendanceRate,
          registrations: registrationCount
        } : null,
        lowestAttendance: activityStats.lowestAttendance ? {
          title: activityStats.lowestAttendance.title,
          attendanceRate: activityStats.lowestAttendance.attendanceRate,
          registrations: registrationCount
        } : null,
        highestRated: activityStats.highestRated ? {
          title: activityStats.highestRated.title,
          rating: activityStats.highestRated.averageRating,
          registrations: registrationCount
        } : null,
        lowestRated: activityStats.lowestRated ? {
          title: activityStats.lowestRated.title,
          rating: activityStats.lowestRated.averageRating,
          registrations: registrationCount
        } : null
      }
    },
    isLoading: isProjectLoading || isRegistrationsLoading
  };
};