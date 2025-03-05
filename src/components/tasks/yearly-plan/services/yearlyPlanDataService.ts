
import { supabase } from '@/integrations/supabase/client';

// جلب مشاريع المهام مع التفاصيل
export const fetchTaskProjects = async () => {
  try {
    // جلب مشاريع المهام
    const { data: projects, error } = await supabase
      .from('project_tasks')
      .select(`
        id,
        title,
        description,
        status,
        start_date,
        due_date,
        workspace_id,
        priority,
        assigned_to
      `);

    if (error) {
      console.error('Error fetching task projects:', error);
      throw error;
    }

    // Get workspace names for each project
    for (let project of projects || []) {
      if (project.workspace_id) {
        const { data: workspace, error: workspaceError } = await supabase
          .from('workspaces')
          .select('name')
          .eq('id', project.workspace_id)
          .single();

        if (!workspaceError && workspace) {
          project.workspace_name = workspace.name;
        }
      }

      // Get assignee names if assigned
      if (project.assigned_to) {
        const { data: user, error: userError } = await supabase
          .from('profiles')
          .select('display_name, email')
          .eq('id', project.assigned_to)
          .single();

        if (!userError && user) {
          project.assigned_user_name = user.display_name || user.email;
        }
      }
    }

    return projects || [];
  } catch (error) {
    console.error('Error in fetchTaskProjects:', error);
    throw error;
  }
};
