
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useProjectOverallRating = (projectId: string) => {
  return useQuery({
    queryKey: ['project-overall-rating', projectId],
    queryFn: async () => {
      console.log('Fetching overall project rating:', projectId);
      
      // Get ratings for the project's main events and activities
      const { data, error } = await supabase
        .from('events')
        .select(`
          id,
          title,
          is_project_activity,
          event_feedback (
            overall_rating,
            content_rating,
            organization_rating,
            presenter_rating
          )
        `)
        .eq('project_id', projectId);

      if (error) {
        console.error('Error fetching project ratings:', error);
        throw error;
      }

      console.log('Found events and activities:', data?.length);

      if (!data?.length) {
        console.log('No events or activities found for project');
        return {
          totalRating: 0,
          activitiesCount: 0,
          highestRated: null,
          lowestRated: null
        };
      }

      let totalRating = 0;
      let ratedEventsCount = 0;
      let highestRated = { rating: 0, title: '', count: 0 };
      let lowestRated = { rating: 5, title: '', count: 0 };

      data.forEach(event => {
        if (!event.event_feedback?.length) {
          return;
        }

        let eventTotalRating = 0;
        let eventRatingsCount = 0;

        event.event_feedback.forEach(feedback => {
          const ratings = [
            feedback.overall_rating,
            feedback.content_rating,
            feedback.organization_rating,
            feedback.presenter_rating
          ].filter(Boolean);

          if (ratings.length > 0) {
            const avgRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
            eventTotalRating += avgRating;
            eventRatingsCount++;
          }
        });

        if (eventRatingsCount > 0) {
          const eventAverageRating = eventTotalRating / eventRatingsCount;
          totalRating += eventAverageRating;
          ratedEventsCount++;

          // Track highest and lowest rated events
          if (eventAverageRating > highestRated.rating) {
            highestRated = {
              rating: eventAverageRating,
              title: event.title,
              count: eventRatingsCount
            };
          }
          if (eventAverageRating < lowestRated.rating) {
            lowestRated = {
              rating: eventAverageRating,
              title: event.title,
              count: eventRatingsCount
            };
          }
        }
      });

      const finalRating = ratedEventsCount > 0 ? totalRating / ratedEventsCount : 0;
      
      return {
        totalRating: finalRating,
        activitiesCount: ratedEventsCount,
        highestRated: highestRated.title ? highestRated : null,
        lowestRated: lowestRated.title ? lowestRated : null
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!projectId
  });
};
