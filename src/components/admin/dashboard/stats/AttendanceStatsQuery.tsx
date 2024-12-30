import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AttendanceStatsQueryProps {
  projectId: string;
  isEvent?: boolean;
}

export const useAttendanceStatsQuery = ({ projectId, isEvent = false }: AttendanceStatsQueryProps) => {
  return useQuery({
    queryKey: ['project-activities-attendance', projectId],
    queryFn: async () => {
      // Get all activities for this project
      const { data: projectActivities } = await supabase
        .from('events')
        .select(`
          id,
          title,
          date,
          attendance_records!attendance_records_activity_id_fkey(*)
        `)
        .eq('project_id', projectId)
        .eq('is_project_activity', true)
        .order('date', { ascending: true });

      if (!projectActivities?.length) return { highest: null, lowest: null };

      // Get total registrations for the project
      const { data: registrations } = await supabase
        .from('registrations')
        .select('id')
        .eq('project_id', projectId);

      const totalRegistrations = registrations?.length || 0;

      // Calculate attendance percentage for each activity
      const activitiesWithStats = projectActivities.map(activity => ({
        title: activity.title,
        date: activity.date,
        attendanceCount: activity.attendance_records.filter(record => record.status === 'present').length,
        totalRegistrations,
        percentage: totalRegistrations > 0 
          ? (activity.attendance_records.filter(record => record.status === 'present').length / totalRegistrations) * 100
          : 0
      }));

      // Sort by percentage and date
      const sortedActivities = activitiesWithStats.sort((a, b) => {
        if (a.percentage === b.percentage) {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        return b.percentage - a.percentage;
      });

      return {
        highest: sortedActivities[0] || null,
        lowest: sortedActivities[sortedActivities.length - 1] || null
      };
    },
    enabled: !isEvent && !!projectId
  });
};