
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Task } from '../types/task';
import { TaskStatusBadge } from './status/TaskStatusBadge';
import { TaskPriorityBadge } from './priority/TaskPriorityBadge';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TableCell } from '@/components/ui/table';

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
    <>
      <TableCell className="w-[30%]">
        <div className="font-medium">{task.title}</div>
        <div className="text-xs text-muted-foreground mt-1">{task.project_name || 'مشروع غير محدد'}</div>
      </TableCell>
      <TableCell className="w-[12%]">
        <TaskStatusBadge status={task.status || 'pending'} />
      </TableCell>
      <TableCell className="w-[12%]">
        <TaskPriorityBadge priority={task.priority || 'medium'} />
      </TableCell>
      <TableCell className="w-[15%] text-sm">{formattedDueDate}</TableCell>
      <TableCell className="w-[15%] text-sm">{formattedCreatedAt}</TableCell>
      <TableCell className="w-[10%]">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </TableCell>
    </>
  );
};
