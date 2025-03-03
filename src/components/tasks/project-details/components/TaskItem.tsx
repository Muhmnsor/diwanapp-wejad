
import { Calendar, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TableRow, TableCell } from "@/components/ui/table";
import { Task } from "../TasksList";

interface TaskItemProps {
  task: Task;
  getStatusBadge: (status: string) => JSX.Element;
  getPriorityBadge: (priority: string | null) => JSX.Element | null;
  formatDate: (date: string | null) => string;
}

export const TaskItem = ({ 
  task, 
  getStatusBadge, 
  getPriorityBadge, 
  formatDate 
}: TaskItemProps) => {
  return (
    <TableRow key={task.id}>
      <TableCell className="font-medium">{task.title}</TableCell>
      <TableCell>{getStatusBadge(task.status)}</TableCell>
      <TableCell>{getPriorityBadge(task.priority)}</TableCell>
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
          {formatDate(task.due_date)}
        </div>
      </TableCell>
    </TableRow>
  );
};
