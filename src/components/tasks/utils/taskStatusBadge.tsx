
import React from 'react';
import { Badge } from '@/components/ui/badge';

export type TaskStatus = 'completed' | 'pending' | 'delayed' | 'upcoming' | 'cancelled' | 'in_progress';

interface TaskStatusBadgeProps {
  status: TaskStatus;
}

export const TaskStatusBadge: React.FC<TaskStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'completed':
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          مكتملة
        </Badge>
      );
    case 'pending':
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          قيد التنفيذ
        </Badge>
      );
    case 'delayed':
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          متأخرة
        </Badge>
      );
    case 'upcoming':
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          قادمة
        </Badge>
      );
    case 'in_progress':
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          جارية
        </Badge>
      );
    case 'cancelled':
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
          ملغية
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
          غير محددة
        </Badge>
      );
  }
};
