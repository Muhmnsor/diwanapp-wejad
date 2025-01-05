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
          events!events_project_id_fkey (
            event_feedback (overall_rating),
            attendance_records (status)
          )
        `)
        .eq('is_visible', true);

      if (projectsError) throw projectsError;

      console.log("Raw events data:", events);
      console.log("Raw projects data:", projects);

      // Calculate attendance and ratings for all events
      const eventsWithStats = events.map(event => ({
        ...event,
        attendanceCount: event.attendance_records?.filter(record => record.status === 'present').length || 0,
        averageRating: event.event_feedback?.length > 0
          ? event.event_feedback.reduce((sum: number, feedback: any) => sum + (feedback.overall_rating || 0), 0) / event.event_feedback.length
          : 0
      }));

      // Calculate attendance and ratings for all projects
      const projectsWithStats = projects.map(project => {
        const projectFeedback = project.events?.flatMap(event => event.event_feedback || []) || [];
        const projectAttendance = project.events?.flatMap(event => event.attendance_records || []) || [];
        
        return {
          ...project,
          attendanceCount: projectAttendance.filter(record => record.status === 'present').length,
          averageRating: projectFeedback.length > 0
            ? projectFeedback.reduce((sum: number, feedback: any) => sum + (feedback.overall_rating || 0), 0) / projectFeedback.length
            : 0
        };
      });

      // Combine all events and projects for unified stats
      const allItems = [...eventsWithStats, ...projectsWithStats];

      // Sort by attendance
      const sortedByAttendance = [...allItems].sort((a, b) => 
        (b.attendanceCount || 0) - (a.attendanceCount || 0)
      );

      // Sort by rating
      const sortedByRating = [...allItems].sort((a, b) => 
        (b.averageRating || 0) - (a.averageRating || 0)
      );

      // Calculate total attendance
      const totalAttendance = allItems.reduce((sum, item) => 
        sum + (item.attendanceCount || 0), 0
      );

      // Calculate overall average rating
      const overallAverageRating = allItems.reduce((sum, item) => 
        sum + (item.averageRating || 0), 0
      ) / allItems.filter(item => item.averageRating > 0).length;

      const now = new Date();
      const upcomingEvents = allItems.filter(event => new Date(event.date || event.start_date) >= now);
      const pastEvents = allItems.filter(event => new Date(event.date || event.start_date) < now);

      // Calculate total registrations
      const totalRegistrations = allItems.reduce((sum, event) => 
        sum + (event.registrations?.[0]?.count || 0), 0
      );

      // Calculate total revenue
      const totalRevenue = allItems.reduce((sum, event) => {
        return sum + (event.price || 0) * (event.registrations?.[0]?.count || 0);
      }, 0);

      // Group events by type
      const eventTypeCount = allItems.reduce((acc: Record<string, number>, event) => {
        const type = event.event_type === 'online' ? 'عن بعد' : 'حضوري';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      const eventsByType: ChartData[] = Object.entries(eventTypeCount).map(([name, value]) => ({
        name,
        value: Number(value)
      }));

      // Count events by path
      const eventsByBeneficiary: ChartData[] = [
        { name: 'البيئة', value: allItems.filter(event => event.event_path === 'environment').length },
        { name: 'المجتمع', value: allItems.filter(event => event.event_path === 'community').length },
        { name: 'المحتوى', value: allItems.filter(event => event.event_path === 'content').length }
      ];

      // Group events by beneficiary type
      const eventsByBeneficiaryType: ChartData[] = Object.entries(
        allItems.reduce((acc: Record<string, number>, event) => {
          const type = event.beneficiary_type === 'men' ? 'رجال' : 
                      event.beneficiary_type === 'women' ? 'نساء' : 'رجال ونساء';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {})
      ).map(([name, value]) => ({ name, value: Number(value) }));

      // Group events by price type
      const eventsByPrice: ChartData[] = Object.entries(
        allItems.reduce((acc: Record<string, number>, event) => {
          const type = event.price === 0 || event.price === null ? 'مجاني' : 'مدفوع';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {})
      ).map(([name, value]) => ({ name, value: Number(value) }));

      return {
        totalEvents: allItems.length,
        eventsCount: events.length,
        projectsCount: projects.length,
        upcomingEvents: upcomingEvents.length,
        pastEvents: pastEvents.length,
        totalRegistrations,
        totalRevenue,
        totalAttendance,
        overallAverageRating: Number(overallAverageRating.toFixed(1)),
        mostRegisteredEvent: {
          title: sortedByAttendance[0]?.title || 'لا يوجد',
          registrations: sortedByAttendance[0]?.registrations?.[0]?.count || 0,
          rating: 0
        },
        leastRegisteredEvent: {
          title: sortedByAttendance[sortedByAttendance.length - 1]?.title || 'لا يوجد',
          registrations: sortedByAttendance[sortedByAttendance.length - 1]?.registrations?.[0]?.count || 0,
          rating: 0
        },
        highestRatedEvent: {
          title: sortedByRating[0]?.title || 'لا يوجد',
          registrations: 0,
          rating: sortedByRating[0]?.averageRating || 0
        },
        lowestRatedEvent: {
          title: sortedByRating[sortedByRating.length - 1]?.title || 'لا يوجد',
          registrations: 0,
          rating: sortedByRating[sortedByRating.length - 1]?.averageRating || 0
        },
        mostAttendedEvent: {
          title: sortedByAttendance[0]?.title || 'لا يوجد',
          attendanceCount: sortedByAttendance[0]?.attendanceCount || 0,
          totalRegistrations: sortedByAttendance[0]?.registrations?.[0]?.count || 0
        },
        leastAttendedEvent: {
          title: sortedByAttendance[sortedByAttendance.length - 1]?.title || 'لا يوجد',
          attendanceCount: sortedByAttendance[sortedByAttendance.length - 1]?.attendanceCount || 0,
          totalRegistrations: sortedByAttendance[sortedByAttendance.length - 1]?.registrations?.[0]?.count || 0
        },
        eventsByType,
        eventsByBeneficiary,
        eventsByBeneficiaryType,
        eventsByPrice
      };
    }
  });
};