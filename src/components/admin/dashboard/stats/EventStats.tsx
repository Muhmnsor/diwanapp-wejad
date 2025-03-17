
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface EventStatsProps {
  eventId: string;
  maxAttendees: number;
}

export const useEventStats = ({ eventId, maxAttendees }: EventStatsProps) => {
  return useQuery({
    queryKey: ['eventStats', eventId],
    queryFn: async () => {
      console.log('Fetching event stats for:', eventId);
      
      const { data: registrations, error: regError } = await supabase
        .from('registrations')
        .select('*', { count: 'exact' })
        .eq('event_id', eventId);

      if (regError) {
        console.error('Error fetching registrations:', regError);
        throw regError;
      }

      const { data: feedback, error: feedbackError } = await supabase
        .from('event_feedback')
        .select('overall_rating')
        .eq('event_id', eventId);

      if (feedbackError) {
        console.error('Error fetching feedback:', feedbackError);
        throw feedbackError;
      }

      const registrationCount = registrations?.length || 0;
      const remainingSeats = maxAttendees - registrationCount;
      const occupancyRate = (registrationCount / maxAttendees) * 100;

      // Calculate average rating only from valid ratings (not null)
      const validRatings = feedback?.filter(f => f.overall_rating !== null) || [];
      const averageRating = validRatings.length > 0
        ? validRatings.reduce((acc, curr) => acc + curr.overall_rating!, 0) / validRatings.length
        : 0;

      console.log('Event stats calculated:', {
        registrationCount,
        remainingSeats,
        occupancyRate,
        averageRating,
        feedbackCount: validRatings.length
      });

      return {
        registrationCount,
        remainingSeats,
        occupancyRate,
        averageRating
      };
    }
  });
};
