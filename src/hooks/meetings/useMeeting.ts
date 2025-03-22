
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
          folder:meeting_folders(name)
        `)
        .eq('id', meetingId)
        .single();
        
      if (error) {
        console.error("Error fetching meeting details:", error);
        throw error;
      }

      console.log(`Retrieved meeting details:`, data);
      return data as Meeting;
    },
    enabled: !!meetingId,
  });
};
