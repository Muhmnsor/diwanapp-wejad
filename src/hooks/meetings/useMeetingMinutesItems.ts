
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MeetingMinutesItem {
  id: string;
  meeting_id: string;
  agenda_item_id: string | null;
  content: string | null;
  order_number: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export const useMeetingMinutesItems = (meetingId: string) => {
  return useQuery({
    queryKey: ['meeting-minutes-items', meetingId],
    queryFn: async () => {
      console.log('Fetching minutes items for meeting:', meetingId);
      
      if (!meetingId) {
        console.error('No meeting ID provided to useMeetingMinutesItems');
        throw new Error('Meeting ID is required');
      }
      
      const { data, error } = await supabase
        .from('meeting_minutes_items')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('order_number', { ascending: true });
        
      if (error) {
        console.error('Error fetching meeting minutes items:', error);
        throw error;
      }
      
      console.log('Fetched minutes items:', data);
      return data as MeetingMinutesItem[];
    },
    enabled: !!meetingId,
  });
};
