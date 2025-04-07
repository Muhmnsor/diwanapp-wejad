
import { TableCell, TableRow } from "@/components/ui/table";
import { Task } from "../types/task";
import { Button } from "@/components/ui/button";
import { Check, Clock, Edit, MoreHorizontal, Play, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Get the assigned username, checking both fields that might contain it
  const assignedUserName = task.assigned_user_name || task.assignee_name || '';
  
  return (
    <>
      <TableRow>
        <TableCell>
          <div className="font-medium">{task.title}</div>
          {task.description && (
            <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
              {task.description}
            </div>
          )}
        </TableCell>
        <TableCell>{getStatusBadge(task.status)}</TableCell>
        <TableCell>{getPriorityBadge(task.priority)}</TableCell>
        <TableCell>{assignedUserName || "غير محدد"}</TableCell>
        <TableCell>{formatDate(task.due_date)}</TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              {task.status === 'pending' && (
                <DropdownMenuItem onClick={() => onStatusChange(task.id, 'in_progress')}>
                  <Play className="h-4 w-4 mr-2" />
                  بدء العمل
                </DropdownMenuItem>
              )}
              {task.status !== 'completed' && (
                <DropdownMenuItem onClick={() => onStatusChange(task.id, 'completed')}>
                  <Check className="h-4 w-4 mr-2" />
                  إكمال المهمة
                </DropdownMenuItem>
              )}
              {task.status === 'completed' && (
                <DropdownMenuItem onClick={() => onStatusChange(task.id, 'in_progress')}>
                  <Clock className="h-4 w-4 mr-2" />
                  إعادة فتح المهمة
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  <Edit className="h-4 w-4 mr-2" />
                  تعديل المهمة
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  حذف المهمة
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
      
      {/* Confirmation Dialog for Deletion */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذه المهمة؟</AlertDialogTitle>
            <AlertDialogDescription>
              هذا الإجراء لا يمكن التراجع عنه. سيؤدي إلى حذف المهمة نهائيًا.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (onDelete) {
                  onDelete(task.id);
                }
              }}
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
