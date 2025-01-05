import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface RatingStatsQueryProps {
  projectId: string;
  isEvent?: boolean;
}

export const useRatingStatsQuery = ({ projectId, isEvent = false }: RatingStatsQueryProps) => {
  return useQuery({
    queryKey: ['project-activities-ratings', projectId],
    queryFn: async () => {
      console.log('Fetching activity ratings for project:', projectId);
      
      // Get all activities with their feedback
      const { data: activitiesWithFeedback } = await supabase
        .from('events')
        .select(`
          id,
          title,
          date,
          event_feedback(
            overall_rating
          )
        `)
        .eq('project_id', projectId)
        .eq('is_project_activity', true);

      if (!activitiesWithFeedback?.length) {
        console.log('No activities found with feedback');
        return { highest: null, lowest: null, average: 0 };
      }

      // Calculate average rating for each activity
      const activitiesWithRatings = activitiesWithFeedback
        .map(activity => ({
          title: activity.title,
          date: activity.date,
          rating: activity.event_feedback.length > 0
            ? activity.event_feedback.reduce((sum: number, feedback: any) => sum + (feedback.overall_rating || 0), 0) / activity.event_feedback.length
            : 0
        }))
        .filter(activity => activity.rating > 0);

      if (!activitiesWithRatings.length) {
        console.log('No activities found with ratings');
        return { highest: null, lowest: null, average: 0 };
      }

      // Calculate overall average rating
      const totalRating = activitiesWithRatings.reduce((sum, activity) => sum + activity.rating, 0);
      const averageRating = activitiesWithRatings.length > 0 ? totalRating / activitiesWithRatings.length : 0;

      // Sort by rating and get highest and lowest
      const sortedActivities = [...activitiesWithRatings].sort((a, b) => {
        if (a.rating === b.rating) {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        return b.rating - a.rating;
      });

      console.log('Activities with ratings:', sortedActivities);

      return {
        highest: sortedActivities[0] || null,
        lowest: sortedActivities[sortedActivities.length - 1] || null,
        average: averageRating
      };
    },
    enabled: !isEvent && !!projectId
  });
};