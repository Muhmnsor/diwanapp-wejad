
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Project } from "@/types/workspace";

export const useProjectDetails = (projectId: string | undefined) => {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!projectId) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        console.log("Fetching project details for ID:", projectId);
        
        const { data, error } = await supabase
          .from('project_tasks')
          .select('*')
          .eq('id', projectId)
          .single();
        
        if (error) {
          console.error("Error fetching project:", error);
          throw error;
        }
        
        console.log("Project data:", data);
        setProject(data);
      } catch (err) {
        console.error("Error fetching project details:", err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProjectDetails();
  }, [projectId]);
  
  return {
    project,
    isLoading,
    error
  };
};
