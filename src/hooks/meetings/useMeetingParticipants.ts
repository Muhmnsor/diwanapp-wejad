
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MeetingParticipant {
  id: string;
  meeting_id: string;
  user_id: string;
  user_email: string;
  user_display_name: string;
  role: string;
  attendance_status: string;
  created_at: string;
}

export const useMeetingParticipants = (meetingId: string) => {
  return useQuery({
    queryKey: ['meeting-participants', meetingId],
    queryFn: async () => {
      if (!meetingId) {
        throw new Error('Meeting ID is required to fetch participants');
      }
      
      const { data, error } = await supabase
        .from('meeting_participants')
        .select('*')
        .eq('meeting_id', meetingId);
        
      if (error) {
        console.error('Error fetching meeting participants:', error);
        throw error;
      }
      
      return data as MeetingParticipant[];
    },
    enabled: !!meetingId,
  });
};
