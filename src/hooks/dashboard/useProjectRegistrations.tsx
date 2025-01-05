import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useProjectRegistrations = (projectId: string) => {
  const { data: registrations = [], isLoading: isRegistrationsLoading } = useQuery({
    queryKey: ['project-registrations', projectId],
    queryFn: async () => {
      console.log("Fetching project registrations for:", projectId);
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          *,
          attendance_records(*)
        `)
        .eq('project_id', projectId);

      if (error) throw error;
      console.log("Fetched registrations:", data);
      return data || [];
    },
  });

  return { registrations, isRegistrationsLoading };
};