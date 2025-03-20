
import { useSmartQuery } from "@/hooks/useSmartQuery";
import { supabase } from "@/integrations/supabase/client";
import { useDeveloperStore } from "@/store/developerStore";

interface MeetingCount {
  folder_id: string;
  count: number;
}

export const useMeetingsCount = () => {
  const { settings } = useDeveloperStore();
  
  return useSmartQuery<MeetingCount[]>(
    ['meetings-count'],
    async () => {
      const { data, error } = await supabase
        .rpc('count_meetings_by_folder');
      
      if (error) {
        console.error('Error fetching meetings count:', error);
        throw error;
      }
      
      return data as MeetingCount[];
    },
    {
      category: 'dynamic',
      useLocalCache: true,
      localCacheTime: settings?.cache_time_minutes || 5
    }
  );
};
