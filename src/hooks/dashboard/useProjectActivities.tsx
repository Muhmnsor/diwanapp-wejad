import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useProjectActivities = (projectId: string) => {
  const { data: projectActivities = [], refetch: refetchActivities } = useQuery({
    queryKey: ['project-activities', projectId],
    queryFn: async () => {
      console.log('Fetching project activities:', projectId);
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          attendance_records!attendance_records_activity_id_fkey(*),
          activity_feedback(*)
        `)
        .eq('project_id', projectId)
        .eq('is_project_activity', true)
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching project activities:', error);
        throw error;
      }
      
      console.log('Fetched activities with attendance:', data);
      return data || [];
    },
  });

  return { projectActivities, refetchActivities };
};