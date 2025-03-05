
import { supabase } from '@/integrations/supabase/client';

// Define an interface for the task project that includes all properties we need
interface TaskProject {
  id: string;
  title: string;
  description: string | null;
  status: string;
  start_date: string | null;
  due_date: string | null;
  workspace_id: string | null;
  priority: string;
  assigned_to: string | null;
  created_at?: string | null; // Add created_at property
  // Add the properties that will be populated dynamically
  workspace_name?: string;
  assigned_user_name?: string;
}

// جلب مشاريع المهام مع التفاصيل
export const fetchTaskProjects = async (): Promise<TaskProject[]> => {
  try {
    // جلب مشاريع المهام
    const { data: projects, error } = await supabase
      .from('project_tasks')
      .select(`
        id,
        title,
        description,
        status,
        due_date,
        workspace_id,
        priority,
        assigned_to,
        created_at
      `);

    if (error) {
      console.error('Error fetching task projects:', error);
      throw error;
    }

    // Process the data to include start_date (using created_at as a fallback)
    const processedProjects = projects.map(project => ({
      ...project,
      start_date: project.created_at || new Date().toISOString().split('T')[0] // Use created_at as start_date or today
    })) as TaskProject[];

    // Get workspace names for each project
    for (let project of processedProjects) {
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

    return processedProjects || [];
  } catch (error) {
    console.error('Error in fetchTaskProjects:', error);
    throw error;
  }
};
