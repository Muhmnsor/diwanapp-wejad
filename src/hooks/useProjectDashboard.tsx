import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useProjectDashboard = (projectId: string) => {
  const { data: registrations = [], isLoading: isRegistrationsLoading } = useQuery({
    queryKey: ['project-registrations', projectId],
    queryFn: async () => {
      console.log("Fetching project registrations for:", projectId);
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          *,
          attendance_records(*)
        `)
        .eq('project_id', projectId);

      if (error) throw error;
      console.log("Fetched registrations:", data);
      return data || [];
    },
    enabled: !!projectId,
  });

  const { data: projectActivities = [], refetch: refetchActivities } = useQuery({
    queryKey: ['project-activities', projectId],
    queryFn: async () => {
      console.log('Fetching project activities:', projectId);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('project_id', projectId)
        .eq('is_project_activity', true)
        .order('date', { ascending: true });

      if (error) throw error;
      console.log('Fetched activities:', data);
      return data || [];
    },
  });

  const { data: attendanceStats } = useQuery({
    queryKey: ['project-activities-attendance', projectId],
    queryFn: async () => {
      console.log('Fetching activities attendance stats:', projectId);
      
      // فقط سجلات الحضور المرتبطة بالأنشطة وليس الفعاليات
      const { data: records, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('project_id', projectId)
        .is('event_id', null) // تجاهل سجلات الفعاليات
        .not('activity_id', 'is', null) // فقط سجلات الأنشطة
        .eq('status', 'present');

      if (error) throw error;

      const totalPresent = records?.length || 0;
      const totalActivities = projectActivities.length;
      const totalRegistrations = registrations.length;

      // حساب متوسط الحضور للأنشطة فقط
      const averageAttendance = totalRegistrations > 0 && totalActivities > 0
        ? (totalPresent / (totalRegistrations * totalActivities)) * 100
        : 0;

      console.log('Activities attendance stats:', {
        totalPresent,
        totalActivities,
        totalRegistrations,
        averageAttendance
      });
      
      return {
        totalPresent,
        averageAttendance: Math.round(averageAttendance)
      };
    },
    enabled: !!projectId && projectActivities.length > 0 && registrations.length > 0,
  });

  // حساب مقاييس لوحة التحكم
  const registrationCount = registrations.length;
  const project = registrations[0]?.project || {};
  const remainingSeats = project.max_attendees ? project.max_attendees - registrationCount : 0;
  const occupancyRate = project.max_attendees ? (registrationCount / project.max_attendees) * 100 : 0;

  // حساب إحصائيات الأنشطة
  const completedActivities = projectActivities.filter(activity => {
    const activityDate = new Date(activity.date);
    return activityDate < new Date();
  }).length;

  console.log("Dashboard metrics:", {
    registrationCount,
    remainingSeats,
    occupancyRate,
    activitiesStats: {
      total: projectActivities.length,
      completed: completedActivities,
      averageAttendance: attendanceStats?.averageAttendance || 0
    }
  });

  return {
    projectActivities,
    refetchActivities,
    metrics: {
      registrationCount,
      remainingSeats,
      occupancyRate,
      activitiesStats: {
        total: projectActivities.length,
        completed: completedActivities,
        averageAttendance: attendanceStats?.averageAttendance || 0
      }
    },
    isLoading: isRegistrationsLoading
  };
};