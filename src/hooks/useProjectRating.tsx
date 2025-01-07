import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useProjectRating = (projectId: string) => {
  return useQuery({
    queryKey: ['project-activities-rating', projectId],
    queryFn: async () => {
      console.log('Fetching project activities rating for:', projectId);
      
      const { data: activities } = await supabase
        .from('events')
        .select(`
          id,
          title,
          event_feedback (
            overall_rating,
            content_rating,
            organization_rating,
            presenter_rating
          )
        `)
        .eq('project_id', projectId)
        .eq('is_project_activity', true);

      if (!activities?.length) {
        console.log('No project activities found');
        return 0;
      }

      console.log('Found activities:', activities);

      let totalRating = 0;
      let totalFeedbackCount = 0;

      activities.forEach(activity => {
        if (!activity.event_feedback?.length) {
          console.log(`No feedback for activity: ${activity.title}`);
          return;
        }

        console.log(`Processing feedback for activity: ${activity.title}`);

        activity.event_feedback.forEach((feedback: any) => {
          const ratings = [
            feedback.overall_rating,
            feedback.content_rating,
            feedback.organization_rating,
            feedback.presenter_rating
          ].filter(rating => rating !== null && rating !== undefined);

          if (ratings.length > 0) {
            const feedbackAverage = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
            totalRating += feedbackAverage;
            totalFeedbackCount++;
            
            console.log('Feedback ratings:', {
              ratings,
              feedbackAverage
            });
          }
        });
      });

      const finalAverage = totalFeedbackCount > 0 ? totalRating / totalFeedbackCount : 0;
      
      console.log('Final project rating calculation:', {
        totalRating,
        totalFeedbackCount,
        finalAverage: finalAverage.toFixed(1)
      });

      return finalAverage;
    },
  });
};