
import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TableRow, TableCell } from "@/components/ui/table";
import { Task } from "../types/task";
import { MoreHorizontal, GripVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TaskItemProps {
  task: Task;
  getStatusBadge: (status: string) => JSX.Element;
  getPriorityBadge: (priority: string | null) => JSX.Element | null;
  formatDate: (date: string | null) => string;
  onStatusChange: (taskId: string, newStatus: string) => void;
  projectId: string;
  isDraggable?: boolean;
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
  isDraggable = false,
  onEdit,
  onDelete
}: TaskItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    disabled: !isDraggable
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleStatusChange = (status: string) => {
    onStatusChange(task.id, status);
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(task);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(task.id);
    }
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={cn(
        "transition-colors",
        isDragging && "opacity-50 bg-muted",
      )}
    >
      <TableCell className="flex items-center gap-2">
        {isDraggable && (
          <span
            className="cursor-grab hover:bg-gray-100 p-1 rounded"
            {...attributes}
            {...listeners}
          >
            <GripVertical size={16} className="text-gray-400" />
          </span>
        )}
        <span>{task.title}</span>
      </TableCell>
      <TableCell>{getStatusBadge(task.status || "pending")}</TableCell>
      <TableCell>{getPriorityBadge(task.priority)}</TableCell>
      <TableCell>{task.assigned_to_name || "غير مكلف"}</TableCell>
      <TableCell>{formatDate(task.due_date)}</TableCell>
      <TableCell>
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">فتح القائمة</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleStatusChange("pending")}>
                معلقة
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("in_progress")}>
                قيد التنفيذ
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("completed")}>
                مكتملة
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("cancelled")}>
                ملغاة
              </DropdownMenuItem>
              {onEdit && (
                <DropdownMenuItem onClick={handleEdit}>تعديل</DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="text-red-600"
                >
                  حذف
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
};
