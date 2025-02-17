
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProjectActivity } from "@/types/activity";

export const useProjectActivities = (projectId: string) => {
  const { data: projectActivities = [], refetch: refetchActivities } = useQuery({
    queryKey: ['project-activities', projectId],
    queryFn: async () => {
      console.log('Fetching project activities:', projectId);
      const { data, error } = await supabase
        .from('project_activities')
        .select(`
          *,
          attendance_records (
            id,
            status,
            registration_id,
            created_at
          ),
          events!event_id (
            activity_feedback (
              id,
              overall_rating,
              content_rating,
              organization_rating,
              presenter_rating,
              feedback_text,
              name,
              phone
            )
          )
        `)
        .eq('project_id', projectId)
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching project activities:', error);
        throw error;
      }
      
      // Transform the data to match the expected structure
      const transformedData = data?.map(activity => ({
        ...activity,
        activity_feedback: activity.events?.activity_feedback || []
      }));
      
      console.log('Fetched activities:', transformedData);
      return (transformedData || []) as ProjectActivity[];
    },
  });

  return { projectActivities, refetchActivities };
};
