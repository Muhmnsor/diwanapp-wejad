
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MeetingParticipant } from "@/types/meeting";

export const useMeetingParticipants = (meetingId: string | undefined) => {
  return useQuery({
    queryKey: ['meeting-participants', meetingId],
    queryFn: async () => {
      if (!meetingId) throw new Error("Meeting ID is required");
      
      const { data, error } = await supabase
        .from('meeting_participants')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('role', { ascending: true });
      
      if (error) {
        console.error('Error fetching meeting participants:', error);
        throw error;
      }
      
      return data as MeetingParticipant[];
    },
    enabled: !!meetingId
  });
};
