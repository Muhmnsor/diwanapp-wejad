
import { useSmartQuery } from "@/hooks/useSmartQuery";
import { supabase } from "@/integrations/supabase/client";
import { MeetingFolder } from "@/types/meetingFolders";
import { useDeveloperStore } from "@/store/developerStore";

export const useMeetingFolder = (folderId: string | undefined) => {
  const { settings } = useDeveloperStore();
  
  return useSmartQuery<MeetingFolder>(
    ['meeting-folder', folderId],
    async () => {
      if (!folderId) throw new Error('Folder ID is required');
      
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
    {
      category: 'reference',
      useLocalCache: true,
      localCacheTime: settings?.cache_time_minutes || 60,
      enabled: !!folderId
    }
  );
};
