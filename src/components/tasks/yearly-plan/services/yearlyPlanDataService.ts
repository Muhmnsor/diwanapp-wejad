
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
  project_manager: string | null;
  created_at?: string | null;
  // Add the properties that will be populated dynamically
  workspace_name?: string;
  assigned_user_name?: string;
  project_manager_name?: string;
}

// جلب مشاريع المهام مع التفاصيل
export const fetchTaskProjects = async (): Promise<TaskProject[]> => {
  try {
    // 1. جلب مشاريع المهام مع البيانات الأساسية
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
        assigned_to,
        project_manager,
        created_at
      `);

    if (error) {
      console.error('Error fetching task projects:', error);
      throw error;
    }

    // 2. Process the data to include default start_date if not available
    const processedProjects = projects.map(project => ({
      ...project,
      start_date: project.start_date || project.created_at || new Date().toISOString().split('T')[0] // Use start_date if available, otherwise created_at or today
    })) as TaskProject[];

    // Early return if no projects found
    if (!processedProjects.length) {
      return [];
    }

    // 3. Collect unique workspace IDs and user IDs for batch queries
    const workspaceIds = [...new Set(processedProjects.filter(p => p.workspace_id).map(p => p.workspace_id))] as string[];
    const userIds = [...new Set([
      ...processedProjects.filter(p => p.assigned_to).map(p => p.assigned_to),
      ...processedProjects.filter(p => p.project_manager).map(p => p.project_manager)
    ].filter(Boolean))] as string[];

    // 4. Batch fetch workspaces data
    let workspacesData: Record<string, string> = {};
    if (workspaceIds.length > 0) {
      const { data: workspaces, error: workspacesError } = await supabase
        .from('workspaces')
        .select('id, name')
        .in('id', workspaceIds);

      if (workspacesError) {
        console.error('Error fetching workspaces:', workspacesError);
      } else if (workspaces) {
        workspacesData = workspaces.reduce((acc, workspace) => {
          acc[workspace.id] = workspace.name;
          return acc;
        }, {} as Record<string, string>);
      }
    }

    // 5. Batch fetch user data
    let usersData: Record<string, string> = {};
    if (userIds.length > 0) {
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, display_name, email')
        .in('id', userIds);

      if (usersError) {
        console.error('Error fetching users:', usersError);
      } else if (users) {
        usersData = users.reduce((acc, user) => {
          acc[user.id] = user.display_name || user.email;
          return acc;
        }, {} as Record<string, string>);
      }
    }

    // 6. Enrich projects with workspace and user data
    const enrichedProjects = processedProjects.map(project => {
      const enriched = { ...project };
      
      if (project.workspace_id && workspacesData[project.workspace_id]) {
        enriched.workspace_name = workspacesData[project.workspace_id];
      }
      
      if (project.assigned_to && usersData[project.assigned_to]) {
        enriched.assigned_user_name = usersData[project.assigned_to];
      }
      
      if (project.project_manager && usersData[project.project_manager]) {
        enriched.project_manager_name = usersData[project.project_manager];
      }
      
      return enriched;
    });

    return enrichedProjects;
  } catch (error) {
    console.error('Error in fetchTaskProjects:', error);
    throw error;
  }
};
