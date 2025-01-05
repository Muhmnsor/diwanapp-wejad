import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useProjectDetails = (projectId: string) => {
  const { data: projectData, isLoading: isProjectLoading } = useQuery({
    queryKey: ['project-details', projectId],
    queryFn: async () => {
      console.log("Fetching project details for:", projectId);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) {
        console.error("Error fetching project details:", error);
        throw error;
      }
      return data;
    },
    enabled: !!projectId,
  });

  return { projectData, isProjectLoading };
};