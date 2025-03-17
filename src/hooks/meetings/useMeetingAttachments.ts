
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MeetingAttachment } from "@/types/meeting";

export const useMeetingAttachments = (meetingId: string | undefined) => {
  return useQuery({
    queryKey: ['meeting-attachments', meetingId],
    queryFn: async () => {
      if (!meetingId) throw new Error("Meeting ID is required");
      
      const { data, error } = await supabase
        .from('meeting_attachments')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching meeting attachments:', error);
        throw error;
      }
      
      return data as MeetingAttachment[];
    },
    enabled: !!meetingId
  });
};
