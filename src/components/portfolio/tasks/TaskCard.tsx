import { Calendar, ListChecks, User } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    due_date: string | null;
    assigned_to: {
      email: string;
    } | null;
  };
}

export const TaskCard = ({ task }: TaskCardProps) => {
  return (
    <Card key={task.id} className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListChecks className="h-5 w-5 text-primary" />
          <span className="font-medium">{task.title}</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          {task.due_date && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(task.due_date).toLocaleDateString('ar-SA')}</span>
            </div>
          )}
          {task.assigned_to && (
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{task.assigned_to.email}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};