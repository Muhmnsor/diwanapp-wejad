
import { useSmartQuery } from "@/hooks/useSmartQuery";
import { supabase } from "@/integrations/supabase/client";
import { Meeting } from "@/types/meeting";
import { useDeveloperStore } from "@/store/developerStore";

export const useMeetingDetails = (meetingId: string | undefined) => {
  const { settings } = useDeveloperStore();
  
  return useSmartQuery<Meeting>(
    ['meeting-details', meetingId],
    async () => {
      if (!meetingId) throw new Error('Meeting ID is required');
      
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('id', meetingId)
        .single();
      
      if (error) {
        console.error('Error fetching meeting details:', error);
        throw error;
      }
      
      return data as Meeting;
    },
    {
      category: 'dynamic',
      useLocalCache: true,
      localCacheTime: settings?.cache_time_minutes || 5,
      enabled: !!meetingId
    }
  );
};
