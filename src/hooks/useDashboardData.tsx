import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardData, EventStats, ChartData } from "@/types/dashboard";

export const useDashboardData = () => {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async (): Promise<DashboardData> => {
      console.log("🔄 جاري تحميل إحصائيات لوحة المعلومات...");

      // Get all events with their registrations and feedback
      const { data: events, error: eventsError } = await supabase
        .from("events")
        .select(`
          *,
          registrations (count),
          event_feedback (overall_rating)
        `);

      if (eventsError) throw eventsError;

      console.log("Raw events data:", events);

      const now = new Date();
      const upcomingEvents = events.filter(event => new Date(event.date) >= now);
      const pastEvents = events.filter(event => new Date(event.date) < now);

      // Calculate total registrations
      const totalRegistrations = events.reduce((sum, event) => sum + event.registrations[0].count, 0);

      // Calculate total revenue
      const totalRevenue = events.reduce((sum, event) => {
        return sum + (event.price || 0) * event.registrations[0].count;
      }, 0);

      // Find events with most and least registrations
      const sortedByRegistrations = [...events].sort(
        (a, b) => b.registrations[0].count - a.registrations[0].count
      );

      // Calculate average ratings and find highest rated event
      const eventsWithRatings = events.map(event => ({
        ...event,
        avgRating: event.event_feedback.length > 0
          ? event.event_feedback.reduce((sum: number, feedback: any) => 
              sum + (feedback.overall_rating || 0), 0) / event.event_feedback.length
          : 0
      }));

      const sortedByRating = [...eventsWithRatings]
        .filter(event => event.avgRating > 0)
        .sort((a, b) => b.avgRating - a.avgRating);

      // Group events by type with Arabic labels
      const eventsByType: ChartData[] = Object.entries(
        events.reduce((acc: Record<string, number>, event) => {
          const type = event.event_type === 'online' ? 'عن بعد' : 'حضوري';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {})
      ).map(([name, value]): ChartData => ({ name, value }));

      console.log("Events by type:", eventsByType);

      // Count events by path with Arabic labels
      const eventsByBeneficiary: ChartData[] = [
        { name: 'البيئة', value: events.filter(event => event.event_path === 'environment').length },
        { name: 'المجتمع', value: events.filter(event => event.event_path === 'community').length },
        { name: 'المحتوى', value: events.filter(event => event.event_path === 'content').length }
      ];

      console.log("Events by path:", eventsByBeneficiary);

      return {
        totalEvents: events.length,
        upcomingEvents: upcomingEvents.length,
        pastEvents: pastEvents.length,
        totalRegistrations,
        totalRevenue,
        mostRegisteredEvent: {
          title: sortedByRegistrations[0]?.title || 'لا يوجد',
          registrations: sortedByRegistrations[0]?.registrations[0].count || 0,
          rating: 0
        },
        leastRegisteredEvent: {
          title: sortedByRegistrations[sortedByRegistrations.length - 1]?.title || 'لا يوجد',
          registrations: sortedByRegistrations[sortedByRegistrations.length - 1]?.registrations[0].count || 0,
          rating: 0
        },
        highestRatedEvent: {
          title: sortedByRating[0]?.title || 'لا يوجد',
          registrations: 0,
          rating: sortedByRating[0]?.avgRating || 0
        },
        eventsByType,
        eventsByBeneficiary
      };
    }
  });
};