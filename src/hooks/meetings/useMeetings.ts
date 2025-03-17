
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Meeting } from "@/types/meeting";

export const useMeetings = (filters?: { status?: string; type?: string }) => {
  return useQuery({
    queryKey: ['meetings', filters],
    queryFn: async () => {
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
    }
  });
};
