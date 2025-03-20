
import { useSmartQuery } from "@/hooks/useSmartQuery";
import { supabase } from "@/integrations/supabase/client";
import { Meeting } from "@/types/meeting";
import { useDeveloperStore } from "@/store/developerStore";

interface MeetingsFilters {
  status?: string;
  type?: string;
}

export const useMeetings = (filters?: MeetingsFilters) => {
  const { settings } = useDeveloperStore();
  
  return useSmartQuery<Meeting[]>(
    ['meetings', filters],
    async () => {
      let query = supabase
        .from('meetings')
        .select('*');
      
      // Apply filters if provided
      if (filters?.status) {
        query = query.eq('meeting_status', filters.status);
      }
      
      if (filters?.type) {
        query = query.eq('meeting_type', filters.type);
      }
      
      // Order by date descending (newest first)
      query = query.order('date', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching meetings:', error);
        throw error;
      }
      
      return data as Meeting[];
    },
    {
      category: 'dynamic',
      useLocalCache: true,
      localCacheTime: settings?.cache_time_minutes || 5
    }
  );
};
