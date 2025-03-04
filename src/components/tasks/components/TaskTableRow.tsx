
import { TableCell, TableRow } from "@/components/ui/table";
import { Task } from "../hooks/useAssignedTasks";
import { TaskDetailPopover } from "./TaskDetailPopover";
import { 
  getStatusIcon, 
  getStatusText, 
  getPriorityBadge, 
  formatDueDate 
} from "../utils/taskFormatters";

interface TaskTableRowProps {
  task: Task;
}

export const TaskTableRow = ({ task }: TaskTableRowProps) => {
  return (
    <TableRow key={task.id}>
      <TableCell>
        <TaskDetailPopover task={task} />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {getStatusIcon(task.status)}
          <span>{getStatusText(task.status)}</span>
        </div>
      </TableCell>
      <TableCell>{getPriorityBadge(task.priority)}</TableCell>
      <TableCell>{formatDueDate(task.due_date)}</TableCell>
      <TableCell>{task.project_name}</TableCell>
      <TableCell>{task.workspace_name}</TableCell>
    </TableRow>
  );
};
