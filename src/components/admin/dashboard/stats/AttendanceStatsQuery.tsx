import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAttendanceStatsQuery = ({ projectId, isEvent = false }: { projectId: string, isEvent?: boolean }) => {
  return useQuery({
    queryKey: ['attendance-stats', projectId, isEvent],
    queryFn: async () => {
      console.log('Fetching attendance stats for:', { projectId, isEvent });
      
      const { data: records, error } = await supabase
        .from('attendance_records')
        .select(`
          *,
          event:events!attendance_records_event_id_fkey(
            title,
            date
          )
        `)
        .eq(isEvent ? 'event_id' : 'project_id', projectId)
        .eq('status', 'present');

      if (error) {
        console.error('Error fetching attendance stats:', error);
        throw error;
      }

      // Group by event and count attendance
      const eventAttendance = records?.reduce((acc: Record<string, number>, record) => {
        const eventId = record.event_id;
        if (eventId) {
          acc[eventId] = (acc[eventId] || 0) + 1;
        }
        return acc;
      }, {});

      // Find highest and lowest attendance
      let highest = null;
      let lowest = null;

      if (records && records.length > 0) {
        const sortedEvents = Object.entries(eventAttendance)
          .map(([eventId, count]) => ({
            eventId,
            count,
            event: records.find(r => r.event_id === eventId)?.event
          }))
          .sort((a, b) => b.count - a.count);

        highest = sortedEvents[0];
        lowest = sortedEvents[sortedEvents.length - 1];
      }

      console.log('Attendance stats calculated:', { highest, lowest });
      
      return {
        highest,
        lowest
      };
    },
    enabled: !!projectId
  });
};