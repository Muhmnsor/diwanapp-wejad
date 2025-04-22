
import { Card } from '@/components/ui/card';
import { TaskHeader } from './components/TaskHeader';
import { TaskDescription } from './components/TaskDescription';
import { TaskMetadata } from './components/TaskMetadata';

// إضافة الخصائص في interface TaskCardProps
interface TaskCardProps {
  task: Task;
  onStatusChange: (taskId: string, newStatus: string) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  getStatusBadge: (status: string) => JSX.Element;
  getPriorityBadge: (priority: string | null) => JSX.Element | null;
  formatDate: (date: string | null) => string;
}


export const TaskCard = ({ task }: TaskCardProps) => {
  console.log('📋 Rendering task card with data:', task);

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
          updatedAt={task.updated_at}
          taskId={task.id}
        />
      </div>
    </Card>
  );
};
