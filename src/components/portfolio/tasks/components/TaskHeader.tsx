import { ListChecks } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TaskHeaderProps {
  title: string;
  status: string;
  priority: string;
}

export const TaskHeader = ({ title, status, priority }: TaskHeaderProps) => {
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'مكتمل';
      case 'in_progress':
        return 'قيد التنفيذ';
      case 'pending':
        return 'معلق';
      default:
        return status;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'عالي';
      case 'medium':
        return 'متوسط';
      case 'low':
        return 'منخفض';
      default:
        return priority;
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <ListChecks className="h-5 w-5 text-primary" />
        <div>
          <span className="text-sm text-gray-500">اسم المهمة:</span>
          <span className="font-medium mr-1">{title}</span>
        </div>
      </div>
      <div className="flex gap-2">
        <div>
          <span className="text-sm text-gray-500 ml-1">الحالة:</span>
          <Badge className={getStatusColor(status)}>
            {getStatusLabel(status)}
          </Badge>
        </div>
        <div>
          <span className="text-sm text-gray-500 ml-1">الأولوية:</span>
          <Badge className={getPriorityColor(priority)}>
            {getPriorityLabel(priority)}
          </Badge>
        </div>
      </div>
    </div>
  );
};