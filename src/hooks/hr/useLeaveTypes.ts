
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LeaveType {
  id: string;
  name: string;
  description: string | null;
  max_days_per_year: number | null;
  is_paid: boolean;
  color: string | null;
}

export function useLeaveTypes() {
  return useQuery({
    queryKey: ['leave-types'],
    queryFn: async (): Promise<LeaveType[]> => {
      const { data, error } = await supabase
        .from('hr_leave_types')
        .select('*')
        .eq('is_active', true)
        .order('name');
        
      if (error) {
        console.error('Error fetching leave types:', error);
        throw error;
      }
      
      return data;
    }
  });
}
