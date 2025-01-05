import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface RatingStats {
  eventId: string;
  title: string;
  date: string;
  averageRating: number;
  ratingsCount: number;
}

export const useRatingStatsQuery = ({ projectId, isEvent = false }: { projectId: string, isEvent?: boolean }) => {
  return useQuery({
    queryKey: ['rating-stats', projectId, isEvent],
    queryFn: async () => {
      console.log('Fetching rating stats for:', { projectId, isEvent });

      // Get all activities with their feedback
      const { data: activities, error } = await supabase
        .from('events')
        .select(`
          id,
          title,
          date,
          activity_feedback (
            overall_rating
          )
        `)
        .eq('project_id', projectId)
        .eq('is_project_activity', true);

      if (error) {
        console.error('Error fetching rating stats:', error);
        throw error;
      }

      // Calculate average ratings for each activity
      const activityRatings: RatingStats[] = activities?.map(activity => ({
        eventId: activity.id,
        title: activity.title,
        date: activity.date,
        ratingsCount: activity.activity_feedback?.length || 0,
        averageRating: activity.activity_feedback?.length 
          ? activity.activity_feedback.reduce((sum: number, feedback: any) => 
              sum + (feedback.overall_rating || 0), 0) / activity.activity_feedback.length
          : 0
      })) || [];

      // Sort by average rating
      const sortedActivities = activityRatings
        .filter(activity => activity.ratingsCount > 0)
        .sort((a, b) => b.averageRating - a.averageRating);

      console.log('Rating stats calculated:', {
        highest: sortedActivities[0],
        lowest: sortedActivities[sortedActivities.length - 1]
      });

      return {
        highest: sortedActivities[0] || null,
        lowest: sortedActivities[sortedActivities.length - 1] || null
      };
    },
    enabled: !!projectId
  });
};