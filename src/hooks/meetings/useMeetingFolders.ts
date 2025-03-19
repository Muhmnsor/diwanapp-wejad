
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  return useQuery({
    queryKey: ['meeting-folders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meeting_folders')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching meeting folders:', error);
        throw error;
      }
      
      return data as MeetingFolder[];
    }
  });
};
