
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useProjectOwner = (projectId: string, initialOwnerName: string | null) => {
  const [projectOwner, setProjectOwner] = useState<string | null>(initialOwnerName || "غير محدد");

  const fetchProjectOwner = async () => {
    try {
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('assigned_to')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) {
        console.error("Error fetching tasks for project owner:", error);
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

  return {
    projectOwner,
    fetchProjectOwner
  };
};
