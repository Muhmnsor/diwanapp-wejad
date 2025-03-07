import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Task } from "@/types/workspace";

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

  // Ensure we're using a valid Task status and priority
  const status: Task['status'] = 'pending';
  const priority: Task['priority'] = ensureValidPriority(taskData.priority);

  console.log('Creating new portfolio task:', {
    workspace_id: workspace.id,
    title: taskData.title,
    description: taskData.description,
    due_date: taskData.dueDate,
    priority,
    asana_gid: asanaResponse.gid,
    assigned_to: taskData.assignedTo
  });

  // Create task in our database
  const { data: newTask, error: createError } = await supabase
    .from('portfolio_tasks')
    .insert([
      {
        workspace_id: workspace.id,
        title: taskData.title,
        description: taskData.description,
        due_date: taskData.dueDate,
        priority,
        status,
        asana_gid: asanaResponse.gid,
        assigned_to: taskData.assignedTo
      }
    ])
    .select()
    .single();

  if (createError) {
    console.error('Error creating task:', createError);
    toast.error('حدث خطأ أثناء إنشاء المهمة في قاعدة البيانات');
    throw createError;
  }

  toast.success('تم إنشاء المهمة بنجاح');

  // Helper function for task notification
  const sendNotification = async () => {
    // Get current user info
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Get user's display name or email
      const { data: creatorProfile } = await supabase
        .from('profiles')
        .select('display_name, email')
        .eq('id', user.id)
        .single();
        
      const creatorName = creatorProfile?.display_name || creatorProfile?.email || user.email || 'مستخدم';
      
      // Import the hook and use it directly
      const { useTaskAssignmentNotifications } = await import('@/hooks/useTaskAssignmentNotifications');
      const { sendTaskAssignmentNotification } = useTaskAssignmentNotifications();
      
      // Send the notification
      await sendTaskAssignmentNotification({
        taskId: newTask.id,
        taskTitle: taskData.title,
        assignedUserId: taskData.assignedTo,
        assignedByUserId: user.id,
        assignedByUserName: creatorName
      });
      
      console.log('Task assignment notification sent to:', taskData.assignedTo);
    }
  };

  // Send notification to assigned user
  if (taskData.assignedTo) {
    try {
      await sendNotification();
    } catch (notifyError) {
      console.error('Error sending task assignment notification:', notifyError);
      // Don't throw error here to avoid failing the task creation process
    }
  }

  return asanaResponse;
};

// Helper function to ensure priority is one of the valid values
const ensureValidPriority = (priority: string): Task['priority'] => {
  const validPriorities: Task['priority'][] = ['low', 'medium', 'high'];
  if (!priority || !validPriorities.includes(priority as Task['priority'])) {
    return 'medium';
  }
  return priority as Task['priority'];
};
