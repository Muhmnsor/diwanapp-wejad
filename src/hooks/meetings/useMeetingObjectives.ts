
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MeetingObjective {
  id: string;
  meeting_id: string;
  content: string;
  order_number: number;
  created_at: string;
  updated_at: string;
}

export const useMeetingObjectives = (meetingId: string) => {
  return useQuery({
    queryKey: ['meeting-objectives', meetingId],
    queryFn: async () => {
      console.log('Fetching objectives for meeting:', meetingId);
      
      if (!meetingId) {
        console.error('No meeting ID provided to useMeetingObjectives');
        throw new Error('Meeting ID is required');
      }
      
      const { data, error } = await supabase
        .from('meeting_objectives')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('order_number', { ascending: true });
        
      if (error) {
        console.error('Error fetching meeting objectives:', error);
        throw error;
      }
      
      console.log('Fetched objectives:', data);
      return data as MeetingObjective[];
    },
    enabled: !!meetingId,
  });
};
