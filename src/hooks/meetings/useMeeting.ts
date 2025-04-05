
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Meeting } from "@/types/meeting";

export const useMeeting = (meetingId: string) => {
  return useQuery({
    queryKey: ['meeting', meetingId],
    queryFn: async (): Promise<Meeting> => {
      console.log(`Fetching meeting details for ID: ${meetingId}`);
      
      // First fetch the meeting data
      const { data: meetingData, error: meetingError } = await supabase
        .from('meetings')
        .select(`
          *,
          folder:meeting_folders(id, name)
        `)
        .eq('id', meetingId)
        .single();
        
      if (meetingError) {
        console.error("Error fetching meeting details:", meetingError);
        throw meetingError;
      }

      // Then fetch the agenda items
      const { data: agendaItems, error: agendaError } = await supabase
        .from('meeting_agenda_items')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('order', { ascending: true });
        
      if (agendaError) {
        console.error("Error fetching meeting agenda items:", agendaError);
        // Don't throw error here, just log it and continue with the meeting data
      }

      // Transform folder data for easy access and add agenda items
      const meeting = {
        ...meetingData,
        folder_name: meetingData.folder ? 
          (typeof meetingData.folder === 'object' ? meetingData.folder.name : null) 
          : null,
        agenda_items: agendaItems || []
      };

      console.log(`Retrieved meeting details:`, meeting);
      return meeting as Meeting;
    },
    enabled: !!meetingId,
  });
};
