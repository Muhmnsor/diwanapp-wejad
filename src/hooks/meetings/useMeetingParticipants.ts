
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MeetingParticipant } from "@/types/meeting";

export const useMeetingParticipants = (meetingId: string, refreshTrigger: number = 0) => {
  return useQuery({
    queryKey: ['meeting-participants', meetingId, refreshTrigger],
    queryFn: async (): Promise<MeetingParticipant[]> => {
      console.log(`Fetching participants for meeting: ${meetingId}`);
      
      if (!meetingId) {
        return [];
      }
      
      const { data, error } = await supabase
        .from('meeting_participants')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error("Error fetching meeting participants:", error);
        throw error;
      }

      console.log(`Retrieved ${data.length} participants`);
      return data as MeetingParticipant[];
    },
    enabled: Boolean(meetingId)
  });
};
