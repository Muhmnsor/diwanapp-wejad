
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MeetingFolder } from "./useMeetingFolders";

export const useMeetingFolder = (folderId: string | undefined) => {
  return useQuery({
    queryKey: ['meeting-folder', folderId],
    queryFn: async () => {
      if (!folderId) throw new Error("Folder ID is required");
      
      const { data, error } = await supabase
        .from('meeting_folders')
        .select('*')
        .eq('id', folderId)
        .single();
      
      if (error) {
        console.error('Error fetching meeting folder:', error);
        throw error;
      }
      
      return data as MeetingFolder;
    },
    enabled: !!folderId
  });
};
