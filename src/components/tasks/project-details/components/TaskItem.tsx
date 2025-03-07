
import { useState } from "react";
import { Task } from "../types/task";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useConfirm } from "@/hooks/useConfirm";
import { useNavigate } from "react-router-dom";
import { TableRow, TableCell } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface TaskItemProps {
  task: Task;
  getStatusBadge: (status: string) => JSX.Element;
  getPriorityBadge: (priority: string | null) => JSX.Element | null;
  formatDate: (date: string | null) => string;
  onStatusChange: (taskId: string, newStatus: string) => void;
  projectId: string;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => Promise<void>;
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
  const [isUpdating, setIsUpdating] = useState(false);
  const { confirm } = useConfirm();
  const navigate = useNavigate();
  
  const handleStatusUpdate = async (status: string) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      await onStatusChange(task.id, status);
      toast.success("تم تحديث حالة المهمة");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("فشل تحديث حالة المهمة");
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleDelete = async () => {
    if (!onDelete) return;
    
    const confirmed = await confirm({
      title: "حذف المهمة",
      description: "هل أنت متأكد من رغبتك في حذف هذه المهمة؟ لا يمكن التراجع عن هذا الإجراء.",
      confirmText: "حذف",
      cancelText: "إلغاء"
    });
    
    if (confirmed) {
      try {
        await onDelete(task.id);
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    }
  };
  
  const handleEdit = () => {
    if (onEdit) {
      onEdit(task);
    }
  };
  
  return (
    <TableRow className="hover:bg-gray-50">
      <TableCell className="font-medium">{task.title}</TableCell>
      <TableCell>{getStatusBadge(task.status)}</TableCell>
      <TableCell>{getPriorityBadge(task.priority)}</TableCell>
      <TableCell>{task.assigned_user_name || 'غير محدد'}</TableCell>
      <TableCell>{formatDate(task.due_date)}</TableCell>
      <TableCell>
        <div className="flex justify-end items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {task.status !== 'completed' && (
                <DropdownMenuItem onClick={() => handleStatusUpdate('completed')}>
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  <span>إكمال المهمة</span>
                </DropdownMenuItem>
              )}
              
              {task.status === 'completed' && (
                <DropdownMenuItem onClick={() => handleStatusUpdate('in_progress')}>
                  <Clock className="mr-2 h-4 w-4 text-amber-500" />
                  <span>إعادة فتح المهمة</span>
                </DropdownMenuItem>
              )}
              
              {task.status !== 'delayed' && task.status !== 'completed' && (
                <DropdownMenuItem onClick={() => handleStatusUpdate('delayed')}>
                  <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
                  <span>تعليق المهمة</span>
                </DropdownMenuItem>
              )}
              
              <DropdownMenuItem onClick={handleEdit}>
                <Pencil className="mr-2 h-4 w-4" />
                <span>تعديل</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>حذف</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
};
