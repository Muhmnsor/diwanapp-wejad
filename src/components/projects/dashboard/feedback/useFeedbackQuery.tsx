
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useFeedbackQuery = (projectId: string) => {
  return useQuery({
    queryKey: ['project-activities-feedback', projectId],
    queryFn: async () => {
      console.log('Fetching activities feedback for project:', projectId);
      
      const { data: activities, error } = await supabase
        .from('project_activities')
        .select(`
          id,
          title,
          date,
          activity_feedback (
            overall_rating,
            content_rating,
            organization_rating,
            presenter_rating
          )
        `)
        .eq('project_id', projectId);

      if (error) {
        console.error('Error fetching activities feedback:', error);
        throw error;
      }
      
      console.log('Fetched activities with feedback:', activities);
      
      return activities?.map(activity => ({
        id: activity.id,
        title: activity.title,
        date: activity.date,
        feedback: activity.activity_feedback || []
      })) || [];
    }
  });
};
