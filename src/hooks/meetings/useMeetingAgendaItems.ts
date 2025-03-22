
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MeetingAgendaItem {
  id: string;
  meeting_id: string;
  content: string;
  order_number: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export const useMeetingAgendaItems = (meetingId: string) => {
  return useQuery({
    queryKey: ['meeting-agenda-items', meetingId],
    queryFn: async () => {
      console.log('Fetching agenda items for meeting:', meetingId);
      
      if (!meetingId) {
        console.error('No meeting ID provided to useMeetingAgendaItems');
        throw new Error('Meeting ID is required');
      }
      
      const { data, error } = await supabase
        .from('meeting_agenda_items')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('order_number', { ascending: true });
        
      if (error) {
        console.error('Error fetching meeting agenda items:', error);
        throw error;
      }
      
      console.log('Fetched agenda items:', data);
      return data as MeetingAgendaItem[];
    },
    enabled: !!meetingId,
  });
};
