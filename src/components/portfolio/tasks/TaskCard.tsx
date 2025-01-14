import { Calendar, ListChecks, User, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    due_date: string | null;
    assigned_to: {
      email: string;
    } | null;
    status: string;
    priority: string;
  };
}

export const TaskCard = ({ task }: TaskCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card key={task.id} className="p-4 hover:shadow-md transition-all duration-200">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-primary" />
            <span className="font-medium">{task.title}</span>
          </div>
          <div className="flex gap-2">
            <Badge className={getStatusColor(task.status)}>
              {task.status === 'completed' ? 'مكتمل' : 'قيد التنفيذ'}
            </Badge>
            <Badge className={getPriorityColor(task.priority)}>
              {task.priority === 'high' ? 'عالي' : task.priority === 'medium' ? 'متوسط' : 'منخفض'}
            </Badge>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
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
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>تم التحديث {new Date(task.updated_at).toLocaleDateString('ar-SA')}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};