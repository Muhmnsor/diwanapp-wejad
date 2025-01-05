import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardData, EventStats, ChartData } from "@/types/dashboard";

export const useDashboardData = () => {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async (): Promise<DashboardData> => {
      console.log("🔄 جاري تحميل إحصائيات لوحة المعلومات...");

      try {
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
              attendance_records (status)
            )
          `)
          .eq('is_visible', true);

        if (projectsError) {
          console.error("Error fetching projects:", projectsError);
          throw projectsError;
        }

        console.log("Raw events data:", events);
        console.log("Raw projects data:", projects);

        // Calculate attendance and ratings for events
        const eventsWithStats = (events || []).map(event => ({
          ...event,
          attendanceCount: event.attendance_records?.filter(r => r.status === 'present').length || 0,
          totalRegistrations: event.registrations[0]?.count || 0,
          averageRating: event.event_feedback?.reduce((acc: number, f: any) => acc + (f.overall_rating || 0), 0) / 
                        (event.event_feedback?.length || 1) || 0
        }));

        // Calculate attendance and ratings for projects
        const projectsWithStats = (projects || []).map(project => {
          const projectEvents = project.events || [];
          const totalAttendance = projectEvents.reduce((acc, event) => 
            acc + (event.attendance_records?.filter(r => r.status === 'present').length || 0), 0);
          const totalRatings = projectEvents.reduce((acc, event) => 
            acc + (event.event_feedback?.reduce((sum: number, f: any) => sum + (f.overall_rating || 0), 0) || 0), 0);
          const totalFeedback = projectEvents.reduce((acc, event) => 
            acc + (event.event_feedback?.length || 0), 0);

          return {
            ...project,
            attendanceCount: totalAttendance,
            totalRegistrations: project.registrations[0]?.count || 0,
            averageRating: totalFeedback > 0 ? totalRatings / totalFeedback : 0
          };
        });

        // Combine all items for statistics
        const allItems = [...eventsWithStats, ...projectsWithStats];

        // Sort by attendance
        const sortedByAttendance = [...allItems].sort((a, b) => 
          (b.attendanceCount / (b.totalRegistrations || 1)) - (a.attendanceCount / (a.totalRegistrations || 1)));

        // Sort by rating
        const sortedByRating = [...allItems].sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));

        // Calculate total attendance and average rating
        const totalAttendance = allItems.reduce((acc, item) => acc + (item.attendanceCount || 0), 0);
        const totalRatings = allItems.reduce((acc, item) => acc + (item.averageRating || 0), 0);
        const averageRating = allItems.length > 0 ? totalRatings / allItems.length : 0;

        // Calculate attendance percentage
        const totalRegistrations = allItems.reduce((acc, item) => acc + (item.totalRegistrations || 0), 0);
        const averageAttendance = totalRegistrations > 0 ? (totalAttendance / totalRegistrations) * 100 : 0;

        const now = new Date();
        const upcomingEvents = allItems.filter(event => new Date(event.date || event.start_date) >= now);
        const pastEvents = allItems.filter(event => new Date(event.date || event.start_date) < now);

        // Calculate total revenue
        const totalRevenue = allItems.reduce((acc, item) => acc + (Number(item.price || 0) * (item.totalRegistrations || 0)), 0);

        // Group events by type
        const eventsByType: ChartData[] = Object.entries(
          allItems.reduce((acc: Record<string, number>, event) => {
            const type = event.event_type === 'online' ? 'عن بعد' : 'حضوري';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
          }, {})
        ).map(([name, value]): ChartData => ({ name, value: Number(value) }));

        // Group by beneficiary (event_path)
        const eventsByBeneficiary: ChartData[] = [
          { name: 'البيئة', value: allItems.filter(event => event.event_path === 'environment').length },
          { name: 'المجتمع', value: allItems.filter(event => event.event_path === 'community').length },
          { name: 'المحتوى', value: allItems.filter(event => event.event_path === 'content').length }
        ];

        // Group by beneficiary type
        const eventsByBeneficiaryType: ChartData[] = Object.entries(
          allItems.reduce((acc: Record<string, number>, event) => {
            const type = event.beneficiary_type === 'men' ? 'رجال' : 
                        event.beneficiary_type === 'women' ? 'نساء' : 'رجال ونساء';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
          }, {})
        ).map(([name, value]): ChartData => ({ name, value: Number(value) }));

        // Group by price
        const eventsByPrice: ChartData[] = Object.entries(
          allItems.reduce((acc: Record<string, number>, event) => {
            const type = event.price === 0 || event.price === null ? 'مجاني' : 'مدفوع';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
          }, {})
        ).map(([name, value]): ChartData => ({ name, value: Number(value) }));

        const defaultStats = {
          title: 'لا يوجد',
          registrations: 0,
          rating: 0,
          attendanceCount: 0,
          percentage: 0
        };

        return {
          totalEvents: allItems.length,
          eventsCount: events?.length || 0,
          projectsCount: projects?.length || 0,
          upcomingEvents: upcomingEvents.length,
          pastEvents: pastEvents.length,
          totalRegistrations,
          totalRevenue,
          mostRegisteredEvent: sortedByAttendance[0] ? {
            title: sortedByAttendance[0].title || 'لا يوجد',
            registrations: sortedByAttendance[0].totalRegistrations || 0,
            rating: sortedByAttendance[0].averageRating || 0
          } : defaultStats,
          leastRegisteredEvent: sortedByAttendance[sortedByAttendance.length - 1] ? {
            title: sortedByAttendance[sortedByAttendance.length - 1].title || 'لا يوجد',
            registrations: sortedByAttendance[sortedByAttendance.length - 1].totalRegistrations || 0,
            rating: sortedByAttendance[sortedByAttendance.length - 1].averageRating || 0
          } : defaultStats,
          highestRatedEvent: sortedByRating[0] ? {
            title: sortedByRating[0].title || 'لا يوجد',
            registrations: sortedByRating[0].totalRegistrations || 0,
            rating: sortedByRating[0].averageRating || 0
          } : defaultStats,
          lowestRatedEvent: sortedByRating[sortedByRating.length - 1] ? {
            title: sortedByRating[sortedByRating.length - 1].title || 'لا يوجد',
            registrations: sortedByRating[sortedByRating.length - 1].totalRegistrations || 0,
            rating: sortedByRating[sortedByRating.length - 1].averageRating || 0
          } : defaultStats,
          mostAttendedEvent: sortedByAttendance[0] ? {
            title: sortedByAttendance[0].title || 'لا يوجد',
            attendanceCount: sortedByAttendance[0].attendanceCount || 0,
            percentage: sortedByAttendance[0].totalRegistrations ? 
              (sortedByAttendance[0].attendanceCount / sortedByAttendance[0].totalRegistrations) * 100 : 0
          } : defaultStats,
          leastAttendedEvent: sortedByAttendance[sortedByAttendance.length - 1] ? {
            title: sortedByAttendance[sortedByAttendance.length - 1].title || 'لا يوجد',
            attendanceCount: sortedByAttendance[sortedByAttendance.length - 1].attendanceCount || 0,
            percentage: sortedByAttendance[sortedByAttendance.length - 1].totalRegistrations ?
              (sortedByAttendance[sortedByAttendance.length - 1].attendanceCount / 
               sortedByAttendance[sortedByAttendance.length - 1].totalRegistrations) * 100 : 0
          } : defaultStats,
          averageAttendance,
          averageRating,
          eventsByType,
          eventsByBeneficiary,
          eventsByBeneficiaryType,
          eventsByPrice
        };
      } catch (error) {
        console.error("Error in dashboard data fetch:", error);
        throw error;
      }
    }
  });
};