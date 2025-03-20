
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Meeting } from "@/types/meeting";

export const useMeetings = (folderId?: string, refreshTrigger: number = 0) => {
  return useQuery({
    queryKey: ['meetings', folderId, refreshTrigger],
    queryFn: async (): Promise<Meeting[]> => {
      console.log(`Fetching meetings for folder: ${folderId || 'all'}`);
      
      let query = supabase
        .from('meetings')
        .select(`
          *,
          creator:profiles(display_name),
          folder:meeting_folders(name)
        `)
        .order('date', { ascending: false });
      
      // If a folderId is provided, filter by folder
      if (folderId) {
        query = query.eq('folder_id', folderId);
      }
      
      const { data, error } = await query;

      if (error) {
        console.error("Error fetching meetings:", error);
        throw error;
      }

      console.log(`Retrieved ${data.length} meetings`);
      return data as Meeting[];
    },
    enabled: true
  });
};
