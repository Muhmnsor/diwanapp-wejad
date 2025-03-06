
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TaskProject {
  id: string;
  project_manager?: string | null;
  project_manager_name?: string | null;
}

export const useProjectOwner = (project: TaskProject) => {
  const [projectOwner, setProjectOwner] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjectOwner = async () => {
      try {
        // If project_manager_name is already provided, use it
        if (project.project_manager_name) {
          setProjectOwner(project.project_manager_name);
          return;
        }
        
        // If project_manager ID is provided, fetch the profile
        if (project.project_manager) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('display_name, email')
            .eq('id', project.project_manager)
            .single();
            
          if (profileError) {
            console.error("Error fetching profile:", profileError);
            setProjectOwner("غير محدد");
            return;
          }
          
          setProjectOwner(profile?.display_name || profile?.email || "غير محدد");
          return;
        }
        
        // Fallback: try to find from latest task assignee
        const { data: tasks, error } = await supabase
          .from('tasks')
          .select('assigned_to')
          .eq('project_id', project.id)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (error) {
          console.error("Error fetching tasks for project owner:", error);
          setProjectOwner("غير محدد");
          return;
        }

        if (tasks && tasks.length > 0 && tasks[0].assigned_to) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('display_name, email')
            .eq('id', tasks[0].assigned_to)
            .single();
            
          if (profileError) {
            console.error("Error fetching profile:", profileError);
            setProjectOwner("غير محدد");
            return;
          }
          
          setProjectOwner(profile?.display_name || profile?.email || "مدير المشروع");
        } else {
          setProjectOwner("غير محدد");
        }
      } catch (err) {
        console.error("Error in fetchProjectOwner:", err);
        setProjectOwner("غير محدد");
      }
    };

    fetchProjectOwner();
  }, [project.id, project.project_manager, project.project_manager_name]);

  return { projectOwner };
};
