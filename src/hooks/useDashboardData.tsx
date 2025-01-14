import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardData } from "@/types/dashboard";
import { calculateEventStats } from "@/utils/dashboard/eventProcessing";
import { calculateTotalStats, calculateEventRankings } from "@/utils/dashboard/statsCalculation";
import { calculateChartData } from "@/utils/dashboard/chartData";

export const useDashboardData = () => {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async (): Promise<DashboardData> => {
      console.log("🔄 جاري تحميل إحصائيات لوحة المعلومات...");

      // Get standalone events (not project activities)
      const { data: events, error: eventsError } = await supabase
        .from("events")
        .select(`
          *,
          registrations (count),
          event_feedback (overall_rating),
          attendance_records!attendance_records_event_id_fkey (status)
        `)
        .eq('is_project_activity', false)
        .eq('is_visible', true);

      if (eventsError) {
        console.error("Error fetching events:", eventsError);
        throw eventsError;
      }

      // Get projects
      const { data: projects, error: projectsError } = await supabase
        .from("projects")
        .select(`
          *,
          registrations (count),
          events!project_id (
            id,
            title,
            event_feedback (overall_rating),
            attendance_records!attendance_records_event_id_fkey (status)
          )
        `)
        .eq('is_visible', true);

      if (projectsError) {
        console.error("Error fetching projects:", projectsError);
        throw projectsError;
      }

      console.log("Raw events data:", events);
      console.log("Raw projects data:", projects);

      const allEvents = calculateEventStats(events, projects);
      const totalStats = calculateTotalStats(allEvents);
      const rankings = calculateEventRankings(allEvents);
      const chartData = calculateChartData(allEvents);

      return {
        totalEvents: allEvents.length,
        eventsCount: events?.length || 0,
        projectsCount: projects?.length || 0,
        ...totalStats,
        ...rankings,
        ...chartData
      };
    }
  });
};