import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useProjectDashboard = (projectId: string) => {
  const { data: registrations = [], isLoading } = useQuery({
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
        .order('created_at', { ascending: true });

      if (error) throw error;
      console.log('Fetched activities:', data);
      return data || [];
    },
  });

  // Calculate dashboard metrics
  const registrationCount = registrations.length;
  const remainingSeats = projectId ? (registrations[0]?.max_attendees || 0) - registrationCount : 0;
  const occupancyRate = registrationCount > 0 ? (registrationCount / (registrations[0]?.max_attendees || 1)) * 100 : 0;

  return {
    registrations,
    projectActivities,
    refetchActivities,
    metrics: {
      registrationCount,
      remainingSeats,
      occupancyRate
    },
    isLoading
  };
};