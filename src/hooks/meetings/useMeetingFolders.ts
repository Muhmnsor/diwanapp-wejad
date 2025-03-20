
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface MeetingFolder {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  creator: {
    display_name: string;
  };
  _count: {
    meetings: number;
    members: number;
  };
}

export const useMeetingFolders = (refreshTrigger: number = 0) => {
  return useQuery({
    queryKey: ['meetingFolders', refreshTrigger],
    queryFn: async () => {
      console.log("Fetching meeting folders...");
      
      // Use a single optimized query with counts
      const { data, error } = await supabase
        .from('meeting_folders')
        .select(`
          *,
          creator:profiles!meeting_folders_created_by_fkey(display_name),
          meetings:meetings(id),
          members:meeting_folder_members(id)
        `);

      if (error) {
        console.error("Error fetching meeting folders:", error);
        throw error;
      }

      console.log("Folders data retrieved:", data);
      
      // Process data to format the required output with counts
      return data.map(folder => ({
        ...folder,
        _count: {
          meetings: (folder.meetings || []).length,
          members: (folder.members || []).length
        }
      })) as MeetingFolder[];
    }
  });
};
