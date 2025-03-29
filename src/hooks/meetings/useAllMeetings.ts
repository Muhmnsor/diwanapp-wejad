
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Meeting } from "@/types/meeting";

export const useAllMeetings = (refreshTrigger: number = 0) => {
  return useQuery({
    queryKey: ['all-meetings', refreshTrigger],
    queryFn: async (): Promise<Meeting[]> => {
      console.log('Fetching all meetings for admin view');
      
      const { data, error } = await supabase
        .from('meetings')
        .select(`
          *,
          folder:meeting_folders(id, name),
          creator:profiles(display_name, email)
        `)
        .order('date', { ascending: false });
      
      if (error) {
        console.error("Error fetching all meetings:", error);
        throw error;
      }

      console.log(`Retrieved ${data.length} meetings for admin view`);
      return data as Meeting[];
    },
    enabled: true
  });
};
