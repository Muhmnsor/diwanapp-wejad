import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useProjects = () => {
  const fetchProjects = async () => {
    console.log("Fetching projects from Supabase");
    const { data, error } = await supabase
      .from("projects")
      .select("*");

    if (error) {
      console.error("Error fetching projects:", error);
      throw error;
    }

    console.log("Projects fetched successfully:", data);
    return data;
  };

  return useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });
};

export const useProject = (id: string) => {
  const fetchProject = async () => {
    console.log("Fetching project with ID:", id);
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching project:", error);
      throw error;
    }

    console.log("Project fetched successfully:", data);
    return data;
  };

  return useQuery({
    queryKey: ["project", id],
    queryFn: fetchProject,
    enabled: !!id,
  });
};