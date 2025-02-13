
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useProjectRating = (projectId: string) => {
  return useQuery({
    queryKey: ['project-rating', projectId],
    queryFn: async () => {
      console.log('Fetching ratings for project:', projectId);
      
      // Get all activities for this project
      const { data: activities, error: activitiesError } = await supabase
        .from('events')
        .select(`
          id,
          title,
          activity_feedback (
            overall_rating,
            content_rating,
            organization_rating,
            presenter_rating
          )
        `)
        .eq('project_id', projectId)
        .eq('is_project_activity', true);

      if (activitiesError) {
        console.error('Error fetching activities:', activitiesError);
        throw activitiesError;
      }

      console.log('Found activities:', activities?.length);

      if (!activities?.length) {
        console.log('No activities found for project');
        return 0;
      }

      let totalRating = 0;
      let totalFeedbackCount = 0;

      activities.forEach(activity => {
        if (!activity.activity_feedback?.length) {
          console.log(`No feedback for activity: ${activity.title}`);
          return;
        }

        activity.activity_feedback.forEach(feedback => {
          const ratings = [
            feedback.overall_rating,
            feedback.content_rating,
            feedback.organization_rating,
            feedback.presenter_rating
          ].filter(Boolean);

          if (ratings.length > 0) {
            const avgRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
            totalRating += avgRating;
            totalFeedbackCount++;
            
            console.log(`Activity: ${activity.title}, Average Rating: ${avgRating}`);
          }
        });
      });

      const finalRating = totalFeedbackCount > 0 ? totalRating / totalFeedbackCount : 0;
      
      console.log('Final project rating:', {
        totalRating,
        totalFeedbackCount,
        finalRating: finalRating.toFixed(1)
      });

      return finalRating;
    }
  });
};
