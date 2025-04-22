
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "../types/task";
import { TaskItem } from "./TaskItem";
import { TableRow } from "@/components/ui/table";

interface SortableTaskItemProps {
  task: Task;
  getStatusBadge: (status: string) => JSX.Element;
  getPriorityBadge: (priority: string | null) => JSX.Element | null;
  formatDate: (date: string | null) => string;
  onStatusChange?: (taskId: string, newStatus: string) => void;
  projectId?: string;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

export const SortableTaskItem = ({
  task,
  getStatusBadge,
  getPriorityBadge,
  formatDate,
  onStatusChange,
  projectId,
  onEdit,
  onDelete
}: SortableTaskItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'move'
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="hover:bg-muted/50 transition-colors"
    >
      <TaskItem
        task={task}
        getStatusBadge={getStatusBadge}
        getPriorityBadge={getPriorityBadge}
        formatDate={formatDate}
        onStatusChange={onStatusChange}
        projectId={projectId}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </TableRow>
  );
};
