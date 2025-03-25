
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MeetingParticipant } from "@/types/meeting";

export const useMeetingParticipants = (meetingId: string) => {
  return useQuery({
    queryKey: ['meeting-participants', meetingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meeting_participants')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      return data as MeetingParticipant[];
    },
    enabled: !!meetingId,
  });
};
