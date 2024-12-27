import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardData } from "@/types/dashboard";

export const useDashboardData = () => {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async (): Promise<DashboardData> => {
      console.log("🔄 جاري تحميل إحصائيات لوحة المعلومات...");

      // Get all events
      const { data: events, error: eventsError } = await supabase
        .from("events")
        .select(`
          *,
          registrations (count),
          event_feedback (overall_rating)
        `);

      if (eventsError) throw eventsError;

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

      // Group events by type and beneficiary
      const eventsByType = Object.entries(
        events.reduce((acc: {[key: string]: number}, event) => {
          acc[event.event_type] = (acc[event.event_type] || 0) + 1;
          return acc;
        }, {})
      ).map(([name, value]) => ({ name, value }));

      const eventsByBeneficiary = Object.entries(
        events.reduce((acc: {[key: string]: number}, event) => {
          acc[event.beneficiary_type] = (acc[event.beneficiary_type] || 0) + 1;
          return acc;
        }, {})
      ).map(([name, value]) => ({ name, value }));

      console.log("✅ تم تحميل إحصائيات لوحة المعلومات بنجاح");

      return {
        totalEvents: events.length,
        upcomingEvents: upcomingEvents.length,
        pastEvents: pastEvents.length,
        totalRegistrations,
        totalRevenue,
        mostRegisteredEvent: {
          title: sortedByRegistrations[0]?.title || 'لا يوجد',
          registrations: sortedByRegistrations[0]?.registrations[0].count || 0
        },
        leastRegisteredEvent: {
          title: sortedByRegistrations[sortedByRegistrations.length - 1]?.title || 'لا يوجد',
          registrations: sortedByRegistrations[sortedByRegistrations.length - 1]?.registrations[0].count || 0
        },
        highestRatedEvent: {
          title: sortedByRating[0]?.title || 'لا يوجد',
          rating: sortedByRating[0]?.avgRating || 0
        },
        eventsByType,
        eventsByBeneficiary
      };
    }
  });
};