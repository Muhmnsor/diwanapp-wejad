import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TaskData {
  workspaceId: string;
  title: string;
  description: string;
  dueDate: string;
  priority: string;
  assignedTo: string;
}

export const submitTask = async (taskData: TaskData) => {
  console.log('Creating task in Asana with data:', taskData);

  // First create task in Asana
  const { data: asanaResponse, error: asanaError } = await supabase.functions.invoke('create-asana-task', {
    body: taskData
  });

  if (asanaError) {
    console.error('Error creating task in Asana:', asanaError);
    toast.error('حدث خطأ أثناء إنشاء المهمة في Asana');
    throw asanaError;
  }

  console.log('Successfully created task in Asana:', asanaResponse);

  // Then get the workspace UUID from Asana GID
  const { data: workspace, error: workspaceError } = await supabase
    .from('portfolio_workspaces')
    .select('id')
    .eq('asana_gid', taskData.workspaceId)
    .maybeSingle();

  if (workspaceError) {
    console.error('Error fetching workspace:', workspaceError);
    toast.error('حدث خطأ أثناء إنشاء المهمة');
    throw workspaceError;
  }

  if (!workspace) {
    console.error('Workspace not found');
    toast.error('لم يتم العثور على مساحة العمل');
    return;
  }

  console.log('Creating new portfolio task:', {
    workspace_id: workspace.id,
    title: taskData.title,
    description: taskData.description,
    due_date: taskData.dueDate,
    priority: taskData.priority,
    assigned_to: taskData.assignedTo,
    asana_gid: asanaResponse.gid
  });

  // Create task in our database
  const { error: createError } = await supabase
    .from('portfolio_tasks')
    .insert([
      {
        workspace_id: workspace.id,
        title: taskData.title,
        description: taskData.description,
        due_date: taskData.dueDate,
        priority: taskData.priority,
        status: 'pending',
        assigned_to: taskData.assignedTo || null,
        asana_gid: asanaResponse.gid
      }
    ]);

  if (createError) {
    console.error('Error creating task:', createError);
    toast.error('حدث خطأ أثناء إنشاء المهمة في قاعدة البيانات');
    throw createError;
  }

  toast.success('تم إنشاء المهمة بنجاح');
  return asanaResponse;
};