
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MeetingMinutes } from "@/types/meeting";

export const useMeetingMinutes = (meetingId: string | undefined) => {
  return useQuery({
    queryKey: ['meeting-minutes', meetingId],
    queryFn: async () => {
      if (!meetingId) throw new Error("Meeting ID is required");
      
      const { data, error } = await supabase
        .from('meeting_minutes')
        .select('*')
        .eq('meeting_id', meetingId)
        .single();
      
      if (error) {
        // If no minutes found, return null instead of throwing an error
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('Error fetching meeting minutes:', error);
        throw error;
      }
      
      return data as MeetingMinutes;
    },
    enabled: !!meetingId
  });
};
