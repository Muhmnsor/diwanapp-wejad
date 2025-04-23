
import { useEffect, useState } from "react";
import { Task } from "../types/task";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { TaskStatusDropdown } from "./dropdowns/TaskStatusDropdown";

interface TaskItemProps {
  task: Task;
  getStatusBadge: (status: string) => JSX.Element;
  getPriorityBadge: (priority: string | null) => JSX.Element | null;
  formatDate: (date: string | null) => string;
  onStatusChange: (taskId: string, newStatus: string) => void;
  projectId: string;
  isDraggable: boolean;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  stageId?: string; // New prop to track which stage this task belongs to
}

export const TaskItem = ({
  task,
  getStatusBadge,
  getPriorityBadge,
  formatDate,
  onStatusChange,
  projectId,
  isDraggable = true,
  onEdit,
  onDelete,
  stageId
}: TaskItemProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    disabled: !isDraggable,
    data: {
      ...task,
      stageId // Pass the stageId with the drag data
    }
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  const handleDelete = async () => {
    if (onDelete) {
      setIsDeleting(true);
      try {
        await onDelete(task.id);
      } finally {
        setIsDeleting(false);
        setShowDeleteDialog(false);
      }
    }
  };

  return (
    <>
      <TableRow 
        ref={setNodeRef} 
        style={style}
        {...attributes} 
        className={`relative ${isDragging ? 'bg-muted' : ''} ${task.stage_id ? '' : 'border-l-4 border-primary-500'}`}
      >
        <TableCell className="cursor-grab" {...listeners}>
          <div className="flex items-center gap-2">
            <div className={`w-1 h-5 rounded-full ${task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`} />
            <span>{task.title}</span>
          </div>
        </TableCell>
        
        <TableCell>
          <TaskStatusDropdown 
            currentStatus={task.status} 
            onStatusChange={(newStatus) => onStatusChange(task.id, newStatus)} 
          />
        </TableCell>
        
        <TableCell>
          {getPriorityBadge(task.priority)}
        </TableCell>
        
        <TableCell>
          {task.assigned_user_name || (task.assigned_to ? <Skeleton className="h-4 w-20" /> : 'غير محدد')}
        </TableCell>
        
        <TableCell>
          {formatDate(task.due_date)}
        </TableCell>
        
        <TableCell>
          <div className="flex space-x-2 justify-end">
            {onEdit && (
              <Button variant="ghost" size="sm" onClick={() => onEdit(task)}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
            
            {onDelete && (
              <Button variant="ghost" size="sm" onClick={() => setShowDeleteDialog(true)}>
                <Trash className="h-4 w-4" />
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>
      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف هذه المهمة نهائياً.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={isDeleting} 
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? 'جاري الحذف...' : 'حذف'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
