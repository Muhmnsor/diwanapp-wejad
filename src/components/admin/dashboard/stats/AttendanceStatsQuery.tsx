import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AttendanceStats {
  eventId: string;
  title: string;
  date: string;
  count: number;
  totalRegistrations: number;
  attendanceRate: number;
}

export const useAttendanceStatsQuery = ({ projectId, isEvent = false }: { projectId: string, isEvent?: boolean }) => {
  return useQuery({
    queryKey: ['attendance-stats', projectId, isEvent],
    queryFn: async () => {
      console.log('Starting attendance stats query for:', { projectId, isEvent });
      
      // First get all registrations to calculate rates
      const { data: registrations, error: regError } = await supabase
        .from('registrations')
        .select('id')
        .eq(isEvent ? 'event_id' : 'project_id', projectId);

      if (regError) {
        console.error('Error fetching registrations:', regError);
        throw regError;
      }

      console.log('Found registrations:', registrations?.length);

      // Then get attendance records
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

      console.log('Found attendance records:', records?.length);

      // Group by event and count attendance
      const eventAttendance: Record<string, AttendanceStats> = {};
      
      records?.forEach(record => {
        const eventId = record.event_id;
        if (eventId && record.event) {
          if (!eventAttendance[eventId]) {
            eventAttendance[eventId] = {
              eventId,
              title: record.event.title,
              date: record.event.date,
              count: 0,
              totalRegistrations: registrations?.length || 0,
              attendanceRate: 0
            };
          }
          eventAttendance[eventId].count++;
          // Calculate attendance rate
          eventAttendance[eventId].attendanceRate = 
            (eventAttendance[eventId].count / eventAttendance[eventId].totalRegistrations) * 100;
        }
      });

      // Convert to array and sort
      const sortedEvents = Object.values(eventAttendance)
        .sort((a, b) => b.attendanceRate - a.attendanceRate);

      console.log('Attendance stats calculated:', { 
        highest: sortedEvents[0], 
        lowest: sortedEvents[sortedEvents.length - 1],
        totalEvents: sortedEvents.length
      });
      
      return {
        highest: sortedEvents[0] || null,
        lowest: sortedEvents[sortedEvents.length - 1] || null
      };
    },
    enabled: !!projectId
  });
};