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
          events!project_id (
            id,
            title,
            event_feedback (overall_rating),
            attendance_records (status)
          )
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
          attendanceCount: event.attendance_records?.filter(record => record.status === 'present').length || 0,
          averageRating: event.event_feedback.length > 0
            ? event.event_feedback.reduce((sum: number, feedback: any) => sum + (feedback.overall_rating || 0), 0) / event.event_feedback.length
            : 0,
          date: new Date(event.date)
        })),
        ...projects.map(project => ({
          ...project,
          type: 'project',
          registrationCount: project.registrations[0]?.count || 0,
          attendanceCount: project.events?.reduce((sum: number, event: any) => 
            sum + (event.attendance_records?.filter((record: any) => record.status === 'present').length || 0), 0) || 0,
          averageRating: project.events?.reduce((sum: number, event: any) => {
            const eventRating = event.event_feedback.length > 0
              ? event.event_feedback.reduce((rSum: number, feedback: any) => rSum + (feedback.overall_rating || 0), 0) / event.event_feedback.length
              : 0;
            return sum + eventRating;
          }, 0) / (project.events?.length || 1),
          date: new Date(project.start_date)
        }))
      ];

      console.log("Combined events and projects:", allEvents);

      const now = new Date();
      const upcomingEvents = allEvents.filter(event => event.date >= now);
      const pastEvents = allEvents.filter(event => event.date < now);

      // Calculate total registrations and attendance
      const totalRegistrations = allEvents.reduce((sum, event) => sum + event.registrationCount, 0);
      const totalAttendance = allEvents.reduce((sum, event) => sum + event.attendanceCount, 0);
      const averageAttendanceRate = totalRegistrations > 0 ? (totalAttendance / totalRegistrations) * 100 : 0;

      // Calculate total revenue
      const totalRevenue = allEvents.reduce((sum, event) => {
        return sum + (event.price || 0) * event.registrationCount;
      }, 0);

      // Find events with most and least registrations
      const sortedByRegistrations = [...allEvents].sort(
        (a, b) => b.registrationCount - a.registrationCount
      );

      // Find events with highest and lowest attendance rates
      const eventsWithAttendanceRates = allEvents.map(event => ({
        ...event,
        attendanceRate: event.registrationCount > 0 
          ? (event.attendanceCount / event.registrationCount) * 100 
          : 0
      }));

      const sortedByAttendance = [...eventsWithAttendanceRates]
        .sort((a, b) => b.attendanceRate - a.attendanceRate);

      // Calculate average ratings and find highest/lowest rated events
      const eventsWithRatings = allEvents.filter(event => event.averageRating > 0);
      const averageRating = eventsWithRatings.length > 0
        ? eventsWithRatings.reduce((sum, event) => sum + event.averageRating, 0) / eventsWithRatings.length
        : 0;

      const sortedByRating = [...eventsWithRatings].sort((a, b) => b.averageRating - a.averageRating);

      // Group events by various categories
      const eventsByType = Object.entries(
        allEvents.reduce((acc: Record<string, number>, event) => {
          const type = event.event_type === 'online' ? 'عن بعد' : 'حضوري';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {})
      ).map(([name, value]) => ({ name, value }));

      const eventsByBeneficiary = [
        { name: 'البيئة', value: allEvents.filter(event => event.event_path === 'environment').length },
        { name: 'المجتمع', value: allEvents.filter(event => event.event_path === 'community').length },
        { name: 'المحتوى', value: allEvents.filter(event => event.event_path === 'content').length }
      ];

      const eventsByBeneficiaryType = Object.entries(
        allEvents.reduce((acc: Record<string, number>, event) => {
          const type = event.beneficiary_type === 'men' ? 'رجال' : 
                      event.beneficiary_type === 'women' ? 'نساء' : 'رجال ونساء';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {})
      ).map(([name, value]) => ({ name, value }));

      const eventsByPrice = Object.entries(
        allEvents.reduce((acc: Record<string, number>, event) => {
          const type = event.price === 0 || event.price === null ? 'مجاني' : 'مدفوع';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {})
      ).map(([name, value]) => ({ name, value }));

      return {
        totalEvents: allEvents.length,
        eventsCount: events.length,
        projectsCount: projects.length,
        upcomingEvents: upcomingEvents.length,
        pastEvents: pastEvents.length,
        totalRegistrations,
        totalRevenue,
        totalAttendance,
        averageAttendanceRate,
        averageRating,
        mostRegisteredEvent: {
          title: sortedByRegistrations[0]?.title || 'لا يوجد',
          registrations: sortedByRegistrations[0]?.registrationCount || 0
        },
        leastRegisteredEvent: {
          title: sortedByRegistrations[sortedByRegistrations.length - 1]?.title || 'لا يوجد',
          registrations: sortedByRegistrations[sortedByRegistrations.length - 1]?.registrationCount || 0
        },
        highestRatedEvent: {
          title: sortedByRating[0]?.title || 'لا يوجد',
          rating: sortedByRating[0]?.averageRating || 0,
          registrations: sortedByRating[0]?.registrationCount || 0
        },
        lowestRatedEvent: {
          title: sortedByRating[sortedByRating.length - 1]?.title || 'لا يوجد',
          rating: sortedByRating[sortedByRating.length - 1]?.averageRating || 0,
          registrations: sortedByRating[sortedByRating.length - 1]?.registrationCount || 0
        },
        highestAttendanceEvent: {
          title: sortedByAttendance[0]?.title || 'لا يوجد',
          attendanceRate: sortedByAttendance[0]?.attendanceRate || 0,
          registrations: sortedByAttendance[0]?.registrationCount || 0
        },
        lowestAttendanceEvent: {
          title: sortedByAttendance[sortedByAttendance.length - 1]?.title || 'لا يوجد',
          attendanceRate: sortedByAttendance[sortedByAttendance.length - 1]?.attendanceRate || 0,
          registrations: sortedByAttendance[sortedByAttendance.length - 1]?.registrationCount || 0
        },
        eventsByType,
        eventsByBeneficiary,
        eventsByBeneficiaryType,
        eventsByPrice
      };
    }
  });
};