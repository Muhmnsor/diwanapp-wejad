
import { Card } from '@/components/ui/card';
import { TaskHeader } from './components/TaskHeader';
import { TaskDescription } from './components/TaskDescription';
import { TaskMetadata } from './components/TaskMetadata';
import { Task } from '@/types/workspace';

interface TaskCardProps {
  task: Task;
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
