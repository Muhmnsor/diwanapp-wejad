
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MeetingMinutes {
  id: string;
  meeting_id: string;
  agenda_item_id?: string | null;
  content: string | null;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  attendees?: string[];
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
        .eq('meeting_id', meetingId);
        
      if (error) {
        console.error('Error fetching meeting minutes:', error);
        throw error;
      }
      
      console.log('Fetched minutes:', data);
      
      // Convert the data to our expected format
      const minutesArray = data as MeetingMinutes[];
      
      // Find the general meeting minutes (not associated with an agenda item)
      const generalMinutes = minutesArray.find(m => !m.agenda_item_id || m.agenda_item_id === null);
      
      // If no general minutes exist, create a placeholder with default values
      const processedData = generalMinutes || {
        id: '',
        meeting_id: meetingId,
        content: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        attendees: []
      };
      
      // Also provide the full array for finding agenda-specific minutes
      return {
        minutes: processedData,
        minutesItems: minutesArray
      };
    },
    enabled: !!meetingId,
  });
};
