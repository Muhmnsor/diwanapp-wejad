
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MeetingDecision } from "@/types/meeting";

export const useMeetingDecisions = (meetingId: string | undefined) => {
  return useQuery({
    queryKey: ['meeting-decisions', meetingId],
    queryFn: async () => {
      if (!meetingId) throw new Error("Meeting ID is required");
      
      const { data, error } = await supabase
        .from('meeting_decisions')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('order_number', { ascending: true });
      
      if (error) {
        console.error('Error fetching meeting decisions:', error);
        throw error;
      }
      
      return data as MeetingDecision[];
    },
    enabled: !!meetingId
  });
};
