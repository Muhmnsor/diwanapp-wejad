
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
      // Fetch folders with proper join to profiles table for creator information
      const { data: folderData, error: folderError } = await supabase
        .from('meeting_folders')
        .select(`
          *,
          creator:profiles!meeting_folders_created_by_fkey(display_name)
        `);

      if (folderError) throw folderError;

      // For each folder, count meetings and members
      const folderIds = folderData.map(folder => folder.id);
      
      // Count meetings in each folder - properly call the function using rpc
      const { data: meetingCounts, error: meetingError } = await supabase
        .rpc('count_meetings_by_folder');
      
      if (meetingError) throw meetingError;
      
      // Get meeting counts by folder
      const meetingCountMap = new Map();
      meetingCounts?.forEach(item => {
        meetingCountMap.set(item.folder_id, item.count);
      });
      
      // Count members in each folder
      const { data: memberCounts, error: memberError } = await supabase
        .from('meeting_folder_members')
        .select('folder_id')
        .in('folder_id', folderIds);
      
      if (memberError) throw memberError;
      
      // Process member counts to create a map
      const memberCountMap = new Map();
      if (memberCounts) {
        // Group by folder_id and count
        const folderMemberCounts = {};
        memberCounts.forEach(item => {
          if (!folderMemberCounts[item.folder_id]) {
            folderMemberCounts[item.folder_id] = 0;
          }
          folderMemberCounts[item.folder_id]++;
        });
        
        // Convert to map
        Object.entries(folderMemberCounts).forEach(([folderId, count]) => {
          memberCountMap.set(folderId, count);
        });
      }
      
      // Combine data
      return folderData.map(folder => ({
        ...folder,
        _count: {
          meetings: meetingCountMap.get(folder.id) || 0,
          members: memberCountMap.get(folder.id) || 0
        }
      })) as MeetingFolder[];
    }
  });
};
