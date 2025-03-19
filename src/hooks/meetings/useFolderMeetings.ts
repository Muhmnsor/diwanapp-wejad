
import { useSmartQuery } from "@/hooks/useSmartQuery";
import { supabase } from "@/integrations/supabase/client";
import { Meeting } from "@/types/meeting";
import { useDeveloperStore } from "@/store/developerStore";

export const useFolderMeetings = (folderId: string | undefined, filters?: { status?: string; type?: string }) => {
  const { settings } = useDeveloperStore();
  
  return useSmartQuery<Meeting[]>(
    ['folder-meetings', folderId, filters],
    async () => {
      if (!folderId) return [];
      
      let query = supabase
        .from('meetings')
        .select('*')
        .eq('folder_id', folderId);
      
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
        console.error('Error fetching folder meetings:', error);
        throw error;
      }
      
      return data as Meeting[];
    },
    {
      category: 'dynamic',
      useLocalCache: true,
      localCacheTime: settings?.cache_time_minutes || 5,
      enabled: !!folderId
    }
  );
};
