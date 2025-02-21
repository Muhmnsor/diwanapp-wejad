import { supabase } from '@/integrations/supabase/client';

export const getOrCreateWorkspace = async (workspaceId: string) => {
  console.log('🔍 Checking workspace:', workspaceId);
  
  try {
    // First try to get the workspace
    const { data: workspace, error: workspaceError } = await supabase
      .from('portfolio_workspaces')
      .select('*')
      .eq('asana_gid', workspaceId)
      .maybeSingle();

    if (workspaceError) {
      console.error('❌ Error fetching workspace:', workspaceError);
      throw workspaceError;
    }

    if (!workspace) {
      console.log('⚠️ Workspace not found, creating new workspace');
      const { data: newWorkspace, error: createError } = await supabase
        .from('portfolio_workspaces')
        .insert([{ 
          asana_gid: workspaceId,
          name: 'مساحة عمل جديدة'
        }])
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating workspace:', createError);
        throw createError;
      }

      console.log('✅ Created new workspace:', newWorkspace);
      return newWorkspace;
    }

    console.log('✅ Found existing workspace:', workspace);
    return workspace;
  } catch (error) {
    console.error('❌ Unexpected error in getOrCreateWorkspace:', error);
    throw error;
  }
};

export const syncTasksWithAsana = async (workspaceId: string) => {
  console.log('🔄 Syncing tasks with Asana for workspace:', workspaceId);
  try {
    const { data: syncedTasks, error: syncError } = await supabase
      .functions.invoke('get-workspace', {
        body: { workspaceId }
      });

    if (syncError) {
      console.error('❌ Error syncing with Asana:', syncError);
      return null;
    }

    console.log('✅ Successfully synced tasks from Asana:', syncedTasks);
    return syncedTasks;
  } catch (error) {
    console.error('❌ Error in syncTasksWithAsana:', error);
    return null;
  }
};

export const fetchWorkspaceTasks = async (workspaceId: string) => {
  console.log('🔍 Fetching tasks for workspace:', workspaceId);
  
  try {
    const { data: tasks, error: tasksError } = await supabase
      .from('portfolio_tasks')
      .select(`
        id,
        title,
        description,
        status,
        priority,
        due_date,
        assigned_to,
        updated_at,
        asana_gid
      `)
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (tasksError) {
      console.error('❌ Error fetching tasks:', tasksError);
      throw tasksError;
    }

    console.log('✅ Successfully fetched tasks:', tasks);
    return tasks;
  } catch (error) {
    console.error('❌ Error in fetchWorkspaceTasks:', error);
    throw error;
  }
};