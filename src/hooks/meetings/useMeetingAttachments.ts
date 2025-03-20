
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MeetingAttachment } from "@/types/meeting";

export const useMeetingAttachments = (meetingId?: string, refreshTrigger: number = 0) => {
  return useQuery({
    queryKey: ['meeting-attachments', meetingId, refreshTrigger],
    queryFn: async (): Promise<MeetingAttachment[]> => {
      if (!meetingId) return [];
      
      const { data, error } = await supabase
        .from('meeting_attachments')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('created_at', { ascending: true });
        
      if (error) {
        console.error("Error fetching meeting attachments:", error);
        throw error;
      }
      
      return data as MeetingAttachment[];
    },
    enabled: !!meetingId
  });
};
