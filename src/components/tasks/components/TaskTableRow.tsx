import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Task } from '../types/task';
import { TaskStatusBadge } from './status/TaskStatusBadge';
import { TaskPriorityBadge } from './priority/TaskPriorityBadge';
import { Users, Calendar, MessageCircle, Download, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TableRow, TableCell } from "@/components/ui/table";

interface TaskTableRowProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

export const TaskTableRow = ({ task, onEdit, onDelete }: TaskTableRowProps) => {
  const formattedDueDate = task.due_date
    ? formatDistanceToNow(new Date(task.due_date), {
        addSuffix: true,
        locale: ar
      })
    : 'غير محدد';

  return (
    <TableRow>
      <TableCell className="font-medium">
        {task.title}
      </TableCell>
      <TableCell>
        <TaskStatusBadge status={task.status || 'pending'} />
      </TableCell>
      <TableCell>
        <TaskPriorityBadge priority={task.priority || 'medium'} />
      </TableCell>
      <TableCell>
        {task.assigned_user_name ? (
          <div className="flex items-center">
            <Users className="h-3.5 w-3.5 ml-1.5 text-gray-500" />
            {task.assigned_user_name}
          </div>
        ) : (
          <span className="text-gray-400">غير محدد</span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center">
          <Calendar className="h-3.5 w-3.5 ml-1.5 text-gray-500" />
          {formattedDueDate}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-7 w-7 text-muted-foreground hover:text-foreground"
            title="مناقشة المهمة"
          >
            <MessageCircle className="h-4 w-4" />
          </Button>

          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-7 w-7"
              onClick={() => onEdit(task)}
              title="تعديل المهمة"
            >
              <Edit className="h-4 w-4 text-amber-500 hover:text-amber-700" />
            </Button>
          )}

          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-7 w-7"
              onClick={() => onDelete(task.id)}
              title="حذف المهمة"
            >
              <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};
