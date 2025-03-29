
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Meeting } from "@/types/meeting";

export const useAllMeetings = (refreshTrigger: number = 0) => {
  return useQuery({
    queryKey: ['all-meetings', refreshTrigger],
    queryFn: async (): Promise<Meeting[]> => {
      console.log('Fetching all meetings for admin view');
      
      try {
        // Modified query to fetch meetings without attempting to join with profiles
        // Instead, we'll just get the creator_id and handle display separately
        const { data, error } = await supabase
          .from('meetings')
          .select(`
            *,
            folder:meeting_folders(id, name)
          `)
          .order('date', { ascending: false });
        
        if (error) {
          console.error("Error fetching all meetings:", error);
          throw error;
        }

        console.log(`Retrieved ${data.length} meetings for admin view`);
        
        // Transform the data to match the expected Meeting type
        const transformedData = data.map(meeting => ({
          ...meeting,
          creator: {
            display_name: "Unknown", // Default value
            email: ""
          }
        }));
        
        return transformedData as Meeting[];
      } catch (error) {
        console.error("Error fetching all meetings:", error);
        throw error;
      }
    },
    enabled: true
  });
};
