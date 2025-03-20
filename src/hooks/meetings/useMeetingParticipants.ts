
import { useSmartQuery } from "@/hooks/useSmartQuery";
import { supabase } from "@/integrations/supabase/client";
import { MeetingParticipant } from "@/types/meeting";
import { useDeveloperStore } from "@/store/developerStore";

export const useMeetingParticipants = (meetingId: string | undefined) => {
  const { settings } = useDeveloperStore();
  
  return useSmartQuery<MeetingParticipant[]>(
    ['meeting-participants', meetingId],
    async () => {
      if (!meetingId) return [];
      
      const { data, error } = await supabase
        .from('meeting_participants')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('created_at');
      
      if (error) {
        console.error('Error fetching meeting participants:', error);
        throw error;
      }
      
      return data as MeetingParticipant[];
    },
    {
      category: 'dynamic',
      useLocalCache: true,
      localCacheTime: settings?.cache_time_minutes || 5,
      enabled: !!meetingId
    }
  );
};
