
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MeetingMinutes {
  id: string;
  meeting_id: string;
  content?: string;
  attendees?: string[];
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export const useMeetingMinutes = (meetingId: string) => {
  return useQuery({
    queryKey: ['meeting-minutes', meetingId],
    queryFn: async () => {
      console.log('Fetching minutes for meeting:', meetingId);
      
      if (!meetingId) {
        console.error('No meeting ID provided to useMeetingMinutes');
        throw new Error('Meeting ID is required');
      }
      
      const { data, error } = await supabase
        .from('meeting_minutes')
        .select('*')
        .eq('meeting_id', meetingId)
        .maybeSingle();
        
      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
        console.error('Error fetching meeting minutes:', error);
        throw error;
      }
      
      console.log('Fetched minutes:', data);
      return data as MeetingMinutes;
    },
    enabled: !!meetingId,
  });
};
