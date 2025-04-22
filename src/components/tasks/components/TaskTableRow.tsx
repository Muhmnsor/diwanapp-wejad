
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Task } from '../types/task';
import { TaskStatusBadge } from './status/TaskStatusBadge';
import { TaskPriorityBadge } from './priority/TaskPriorityBadge';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TaskTableRowProps {
  task: Task;
}

export const TaskTableRow = ({ task }: TaskTableRowProps) => {
  // تنسيق التاريخ المستحق، إذا كان موجودًا
  const formattedDueDate = task.due_date 
    ? formatDistanceToNow(new Date(task.due_date), { 
        addSuffix: true, 
        locale: ar 
      })
    : 'غير محدد';
    
  // تنسيق تاريخ الإنشاء
  const formattedCreatedAt = task.created_at 
    ? formatDistanceToNow(new Date(task.created_at), { 
        addSuffix: true, 
        locale: ar 
      })
    : 'غير معروف';
  
  return (
    <tr>
      <td className="px-4 py-3">
        <div className="font-medium">{task.title}</div>
        <div className="text-xs text-muted-foreground mt-1">{task.project_name || 'مشروع غير محدد'}</div>
      </td>
      <td className="px-4 py-3">
        <TaskStatusBadge status={task.status || 'pending'} />
      </td>
      <td className="px-4 py-3">
        <TaskPriorityBadge priority={task.priority || 'medium'} />
      </td>
      <td className="px-4 py-3">
        {task.assigned_user_name || 'غير محدد'}
      </td>
      <td className="px-4 py-3 text-sm">{formattedDueDate}</td>
      <td className="px-4 py-3">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </td>
    </tr>
);
};
