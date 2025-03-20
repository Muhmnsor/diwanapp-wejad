
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface MeetingParticipant {
  id: string;
  meeting_id: string;
  user_id: string;
  user_email: string;
  user_display_name: string;
  role: string;
  attendance_status: string;
  created_at: string;
  updated_at: string;
}

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
