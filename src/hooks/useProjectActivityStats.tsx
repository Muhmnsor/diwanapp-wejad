
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useProjectActivityStats = (projectId: string) => {
  return useQuery({
    queryKey: ['project-activity-stats', projectId],
    queryFn: async () => {
      const { data: activities, error } = await supabase
        .from('events')
        .select(`
          *,
          event_feedback (
            overall_rating,
            content_rating,
            organization_rating,
            presenter_rating
          )
        `)
        .eq('project_id', projectId)
        .eq('is_project_activity', true);

      if (error) throw error;

      let totalRating = 0;
      let ratedActivitiesCount = 0;
      
      activities?.forEach(activity => {
        const feedbacks = activity.event_feedback || [];
        if (feedbacks.length > 0) {
          const avgActivityRating = feedbacks.reduce((sum, feedback) => {
            const ratings = [
              feedback.overall_rating,
              feedback.content_rating,
              feedback.organization_rating,
              feedback.presenter_rating
            ].filter(Boolean);
            
            return sum + (ratings.reduce((a, b) => a + b, 0) / ratings.length);
          }, 0) / feedbacks.length;

          totalRating += avgActivityRating;
          ratedActivitiesCount++;
        }
      });

      return {
        averageRating: ratedActivitiesCount > 0 ? totalRating / ratedActivitiesCount : 0,
        totalActivities: activities?.length || 0,
        ratedActivities: ratedActivitiesCount
      };
    }
  });
};
