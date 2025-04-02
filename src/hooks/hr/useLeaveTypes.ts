
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface LeaveType {
  id: string;
  name: string;
  code: string;
  description?: string;
  is_active: boolean;
}

export function useLeaveTypes() {
  return useQuery({
    queryKey: ["leave-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hr_leave_types")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) {
        console.error("Error fetching leave types:", error);
        throw error;
      }

      return data as LeaveType[];
    },
  });
}
