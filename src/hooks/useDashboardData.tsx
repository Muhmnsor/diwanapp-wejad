import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardData, EventStats, ChartData } from "@/types/dashboard";

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
          attendance_records (status)
        `)
        .eq('is_project_activity', false)
        .eq('is_visible', true);

      if (eventsError) throw eventsError;

      // Get projects
      const { data: projects, error: projectsError } = await supabase
        .from("projects")
        .select(`
          *,
          registrations (count),
          attendance_records (status)
        `)
        .eq('is_visible', true);

      if (projectsError) throw projectsError;

      console.log("Raw events data:", events);
      console.log("Raw projects data:", projects);

      // Combine events and projects for unified stats
      const allEvents = [
        ...events.map(event => ({
          ...event,
          type: 'event',
          registrationCount: event.registrations[0]?.count || 0,
          attendanceCount: event.attendance_records?.filter((record: any) => record.status === 'present').length || 0,
          date: new Date(event.date)
        })),
        ...projects.map(project => ({
          ...project,
          type: 'project',
          registrationCount: project.registrations[0]?.count || 0,
          attendanceCount: project.attendance_records?.filter((record: any) => record.status === 'present').length || 0,
          date: new Date(project.start_date)
        }))
      ];

      console.log("Total number of events:", events.length);
      console.log("Total number of projects:", projects.length);
      console.log("Combined events and projects:", allEvents);

      const now = new Date();
      const upcomingEvents = allEvents.filter(event => event.date >= now);
      const pastEvents = allEvents.filter(event => event.date < now);

      // Calculate total registrations
      const totalRegistrations = allEvents.reduce((sum, event) => sum + event.registrationCount, 0);

      // Calculate total revenue
      const totalRevenue = allEvents.reduce((sum, event) => {
        return sum + (event.price || 0) * event.registrationCount;
      }, 0);

      // Find events with most and least registrations
      const sortedByRegistrations = [...allEvents].sort(
        (a, b) => b.registrationCount - a.registrationCount
      );

      // Find events with most and least attendance
      const sortedByAttendance = [...allEvents].sort(
        (a, b) => b.attendanceCount - a.attendanceCount
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

      // Group all events by type with Arabic labels
      const eventTypeCount = allEvents.reduce((acc: Record<string, number>, event) => {
        const type = event.event_type === 'online' ? 'عن بعد' : 'حضوري';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      const eventsByType: ChartData[] = Object.entries(eventTypeCount).map(([name, value]) => ({
        name,
        value: value as number
      }));

      // Count events by path with Arabic labels
      const eventsByBeneficiary: ChartData[] = [
        { name: 'البيئة', value: allEvents.filter(event => event.event_path === 'environment').length },
        { name: 'المجتمع', value: allEvents.filter(event => event.event_path === 'community').length },
        { name: 'المحتوى', value: allEvents.filter(event => event.event_path === 'content').length }
      ];

      // Group events by beneficiary type with Arabic labels
      const eventsByBeneficiaryType: ChartData[] = Object.entries(
        allEvents.reduce((acc: Record<string, number>, event) => {
          const type = event.beneficiary_type === 'men' ? 'رجال' : 
                      event.beneficiary_type === 'women' ? 'نساء' : 'رجال ونساء';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {})
      ).map(([name, value]) => ({ name, value: value as number }));

      // Group events by price type with Arabic labels
      const eventsByPrice: ChartData[] = Object.entries(
        allEvents.reduce((acc: Record<string, number>, event) => {
          const type = event.price === 0 || event.price === null ? 'مجاني' : 'مدفوع';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {})
      ).map(([name, value]) => ({ name, value: value as number }));

      return {
        totalEvents: allEvents.length,
        eventsCount: events.length,
        projectsCount: projects.length,
        upcomingEvents: upcomingEvents.length,
        pastEvents: pastEvents.length,
        totalRegistrations,
        totalRevenue,
        mostRegisteredEvent: {
          title: sortedByRegistrations[0]?.title || 'لا يوجد',
          registrations: sortedByRegistrations[0]?.registrationCount || 0,
          rating: 0
        },
        leastRegisteredEvent: {
          title: sortedByRegistrations[sortedByRegistrations.length - 1]?.title || 'لا يوجد',
          registrations: sortedByRegistrations[sortedByRegistrations.length - 1]?.registrationCount || 0,
          rating: 0
        },
        highestRatedEvent: {
          title: sortedByRating[0]?.title || 'لا يوجد',
          registrations: 0,
          rating: sortedByRating[0]?.avgRating || 0
        },
        mostAttendedEvent: {
          title: sortedByAttendance[0]?.title || 'لا يوجد',
          registrations: sortedByAttendance[0]?.registrationCount || 0,
          attendance: sortedByAttendance[0]?.attendanceCount || 0
        },
        leastAttendedEvent: {
          title: sortedByAttendance[sortedByAttendance.length - 1]?.title || 'لا يوجد',
          registrations: sortedByAttendance[sortedByAttendance.length - 1]?.registrationCount || 0,
          attendance: sortedByAttendance[sortedByAttendance.length - 1]?.attendanceCount || 0
        },
        eventsByType,
        eventsByBeneficiary,
        eventsByBeneficiaryType,
        eventsByPrice
      };
    }
  });
};