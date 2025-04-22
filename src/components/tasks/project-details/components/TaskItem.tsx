
import { Task } from "../types/task";
import { TableRow } from "@/components/ui/table";
import { TaskTableRow } from "../../components/TaskTableRow";

interface TaskItemProps {
  task: Task;
  getStatusBadge: (status: string) => JSX.Element;
  getPriorityBadge: (priority: string | null) => JSX.Element | null;
  formatDate: (date: string | null) => string;
  onStatusChange: (taskId: string, newStatus: string) => void;
  projectId: string;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

export const TaskItem = ({ 
  task,
  getStatusBadge,
  getPriorityBadge,
  formatDate,
  onStatusChange,
  projectId,
  onEdit,
  onDelete
}: TaskItemProps) => {
  return (
    <TableRow className="hover:bg-muted/30">
      <TaskTableRow task={task} />
    </TableRow>
  );
};
