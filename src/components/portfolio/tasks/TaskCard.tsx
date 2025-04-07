
import { Card } from '@/components/ui/card';
import { TaskHeader } from './components/TaskHeader';
import { TaskDescription } from './components/TaskDescription';
import { TaskMetadata } from './components/TaskMetadata';

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    description: string | null;
    due_date: string | null;
    assigned_to: string | null;
    status: string;
    priority: string;
    updated_at: string;
    assigned_user_name?: string;
    assignee_name?: string;
  };
}

export const TaskCard = ({ task }: TaskCardProps) => {
  console.log('📋 Rendering task card with data:', task);

  // Get the assigned username, checking both fields that might contain it
  const assignedUserName = task.assigned_user_name || task.assignee_name;

  return (
    <Card className="p-4 hover:shadow-md transition-all duration-200">
      <div className="space-y-3">
        <TaskHeader 
          title={task.title}
          status={task.status}
          priority={task.priority}
        />

        <TaskDescription description={task.description} />

        <TaskMetadata 
          dueDate={task.due_date}
          assignedTo={task.assigned_to}
          assignedName={assignedUserName}
          updatedAt={task.updated_at}
          taskId={task.id}
        />
      </div>
    </Card>
  );
};
