
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useMeetingFolder = (folderId: string, refreshTrigger: number = 0) => {
  return useQuery({
    queryKey: ['meetingFolder', folderId, refreshTrigger],
    queryFn: async () => {
      if (!folderId) {
        throw new Error("Folder ID is required");
      }
      
      console.log(`Fetching meeting folder details for: ${folderId}`);
      
      const { data, error } = await supabase
        .from('meeting_folders')
        .select(`
          *,
          creator:profiles!meeting_folders_created_by_fkey(display_name),
          meetings:meetings(id),
          members:meeting_folder_members(id)
        `)
        .eq('id', folderId)
        .single();

      if (error) {
        console.error("Error fetching meeting folder:", error);
        throw error;
      }

      console.log("Folder details retrieved:", data);
      
      return {
        ...data,
        _count: {
          meetings: (data.meetings || []).length,
          members: (data.members || []).length
        }
      };
    },
    enabled: Boolean(folderId)
  });
};
