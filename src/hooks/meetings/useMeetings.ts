
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Meeting } from "@/types/meeting";

export const useMeetings = (folderId?: string, refreshTrigger: number = 0) => {
  return useQuery({
    queryKey: ['meetings', folderId, refreshTrigger],
    queryFn: async () => {
      let query = supabase
        .from('meetings')
        .select(`
          *,
          creator:profiles!meetings_creator_id_fkey(display_name),
          folder:meeting_folders!meetings_folder_id_fkey(name)
        `)
        .order('date', { ascending: false });
        
      // If folder ID is provided, filter by folder
      if (folderId) {
        query = query.eq('folder_id', folderId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching meetings:", error);
        throw error;
      }
      
      return data as Meeting[];
    }
  });
};
