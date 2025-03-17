
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AgendaItem } from "@/types/meeting";

export const useMeetingAgenda = (meetingId: string | undefined) => {
  return useQuery({
    queryKey: ['meeting-agenda', meetingId],
    queryFn: async () => {
      if (!meetingId) throw new Error("Meeting ID is required");
      
      const { data, error } = await supabase
        .from('meeting_agenda_items')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('order_number', { ascending: true });
      
      if (error) {
        console.error('Error fetching meeting agenda:', error);
        throw error;
      }
      
      return data as AgendaItem[];
    },
    enabled: !!meetingId
  });
};
