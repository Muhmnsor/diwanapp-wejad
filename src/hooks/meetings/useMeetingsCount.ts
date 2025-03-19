
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface MeetingCount {
  folder_id: string;
  count: number;
}

export const useMeetingsCount = () => {
  return useQuery({
    queryKey: ['meetings-count'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('count_meetings_by_folder');
      
      if (error) {
        console.error('Error counting meetings by folder:', error);
        // Return empty array instead of throwing to avoid breaking the UI
        return [] as MeetingCount[];
      }
      
      return data as MeetingCount[];
    }
  });
};
