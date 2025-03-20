
import { useSmartQuery } from "@/hooks/useSmartQuery";
import { supabase } from "@/integrations/supabase/client";
import { MeetingFolder } from "@/types/meetingFolders";
import { useDeveloperStore } from "@/store/developerStore";

export interface MeetingFolder {
  id: string;
  name: string;
  type: string;
  description?: string;
  icon?: string;
  created_at: string;
  updated_at: string;
}

export const useMeetingFolders = () => {
  const { settings } = useDeveloperStore();
  
  return useSmartQuery<MeetingFolder[]>(
    ['meeting-folders'],
    async () => {
      const { data, error } = await supabase
        .from('meeting_folders')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching meeting folders:', error);
        throw error;
      }
      
      return data as MeetingFolder[];
    },
    {
      category: 'reference',
      useLocalCache: true,
      localCacheTime: settings?.cache_time_minutes || 60
    }
  );
};
