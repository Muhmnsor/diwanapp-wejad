import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useRatingStatsQuery = ({ projectId, isEvent = false }: { projectId: string, isEvent?: boolean }) => {
  return useQuery({
    queryKey: ['rating-stats', projectId, isEvent],
    queryFn: async () => {
      console.log('Fetching rating stats for:', { projectId, isEvent });
      
      const { data: events, error } = await supabase
        .from('events')
        .select(`
          id,
          title,
          date,
          event_feedback(overall_rating),
          activity_feedback(overall_rating)
        `)
        .eq(isEvent ? 'id' : 'project_id', projectId);

      if (error) {
        console.error('Error fetching rating stats:', error);
        throw error;
      }

      // Calculate average rating for each event
      const eventRatings = events?.map(event => {
        const allRatings = [
          ...event.event_feedback?.map((f: any) => f.overall_rating) || [],
          ...event.activity_feedback?.map((f: any) => f.overall_rating) || []
        ].filter(r => r !== null);

        const average = allRatings.length > 0
          ? allRatings.reduce((a: number, b: number) => a + b, 0) / allRatings.length
          : 0;

        return {
          eventId: event.id,
          title: event.title,
          date: event.date,
          averageRating: average,
          ratingsCount: allRatings.length
        };
      });

      // Sort by average rating
      const sortedEvents = eventRatings?.sort((a, b) => b.averageRating - a.averageRating);

      const highest = sortedEvents?.[0] || null;
      const lowest = sortedEvents?.[sortedEvents.length - 1] || null;

      console.log('Rating stats calculated:', { highest, lowest });
      
      return {
        highest,
        lowest
      };
    },
    enabled: !!projectId
  });
};