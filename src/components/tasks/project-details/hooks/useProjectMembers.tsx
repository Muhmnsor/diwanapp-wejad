
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ProjectMember {
  id: string;
  name?: string;
  email?: string;
}

export const useProjectMembers = (projectId?: string) => {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMembers = async () => {
      if (!projectId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch all profiles for now since we don't have a project-specific members table
        const { data, error } = await supabase
          .from('profiles')
          .select('id, display_name, email');

        if (error) throw error;

        // Format the data to match ProjectMember interface
        const formattedMembers = data.map((user: any) => ({
          id: user.id,
          name: user.display_name || user.email,
          email: user.email
        }));

        setMembers(formattedMembers);
        console.log("Fetched members:", formattedMembers);
      } catch (error) {
        console.error("Error fetching project members:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, [projectId]);

  return { members, isLoading };
};
