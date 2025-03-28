
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Meeting } from "@/types/meeting";

export const useMeeting = (meetingId: string) => {
  return useQuery({
    queryKey: ['meeting', meetingId],
    queryFn: async (): Promise<Meeting> => {
      console.log(`Fetching meeting details for ID: ${meetingId}`);
      
      const { data, error } = await supabase
        .from('meetings')
        .select(`
          *,
          folder:meeting_folders(id, name)
        `)
        .eq('id', meetingId)
        .single();
        
      if (error) {
        console.error("Error fetching meeting details:", error);
        throw error;
      }

      // Transform folder data for easy access
      const meeting = {
        ...data,
        folder_name: data.folder ? 
          (typeof data.folder === 'object' ? data.folder.name : null) 
          : null
      };

      console.log(`Retrieved meeting details:`, meeting);
      return meeting as Meeting;
    },
    enabled: !!meetingId,
  });
};
