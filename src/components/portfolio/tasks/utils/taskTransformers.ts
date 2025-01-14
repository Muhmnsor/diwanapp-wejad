interface AsanaTask {
  name: string;
  notes?: string;
  completed: boolean;
  priority?: string;
  due_date?: string;
  gid: string;
  assignee?: {
    gid: string;
  };
}

export const transformAsanaTask = (task: AsanaTask, workspaceId: string) => ({
  workspace_id: workspaceId,
  title: task.name,
  description: task.notes || null,
  status: task.completed ? 'completed' : 'pending',
  priority: task.priority || 'medium',
  due_date: task.due_date ? new Date(task.due_date).toISOString() : null,
  asana_gid: task.gid,
  assigned_to: task.assignee?.gid || null,
  updated_at: new Date().toISOString()
});

export const transformAsanaTasks = (tasks: AsanaTask[], workspaceId: string) => {
  return tasks.map(task => transformAsanaTask(task, workspaceId));
};