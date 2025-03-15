
interface Task {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  due_date?: string;
  id: string;
  assigned_to?: string;
}

export const transformTask = (task: Task, workspaceId: string) => ({
  workspace_id: workspaceId,
  title: task.title || '',
  description: task.description || null,
  status: task.status || 'pending',
  priority: task.priority || 'medium',
  due_date: task.due_date ? new Date(task.due_date).toISOString() : null,
  assigned_to: task.assigned_to || null,
  updated_at: new Date().toISOString()
});

export const transformTasks = (tasks: Task[], workspaceId: string) => {
  return tasks.map(task => transformTask(task, workspaceId));
};
