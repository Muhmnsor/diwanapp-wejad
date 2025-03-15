
interface Task {
  name?: string;
  title: string;
  notes?: string;
  description?: string;
  completed?: boolean;
  status?: string;
  priority?: string;
  due_date?: string;
  id: string;
  assignee?: {
    id?: string;
  };
  assigned_to?: string;
}

export const transformTask = (task: Task, workspaceId: string) => ({
  workspace_id: workspaceId,
  title: task.title || task.name || '',
  description: task.description || task.notes || null,
  status: task.status || (task.completed ? 'completed' : 'pending'),
  priority: task.priority || 'medium',
  due_date: task.due_date ? new Date(task.due_date).toISOString() : null,
  assigned_to: task.assigned_to || task.assignee?.id || null,
  updated_at: new Date().toISOString()
});

export const transformTasks = (tasks: Task[], workspaceId: string) => {
  return tasks.map(task => transformTask(task, workspaceId));
};
