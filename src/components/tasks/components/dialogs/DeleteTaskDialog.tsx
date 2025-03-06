
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

interface DeleteTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  taskTitle: string;
  onSuccess?: () => void;
  isGeneral?: boolean;
}

export const DeleteTaskDialog = ({
  isOpen,
  onClose,
  taskId,
  taskTitle,
  onSuccess,
  isGeneral,
}: DeleteTaskDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      // First check if there are any subtasks
      const { data: subtasks, error: subtasksError } = await supabase
        .from("subtasks")
        .select("id")
        .eq("task_id", taskId);
      
      if (subtasksError) {
        throw subtasksError;
      }
      
      // If there are subtasks, delete them first
      if (subtasks && subtasks.length > 0) {
        const subtaskIds = subtasks.map(subtask => subtask.id);
        
        const { error: deleteSubtasksError } = await supabase
          .from("subtasks")
          .delete()
          .in("id", subtaskIds);
        
        if (deleteSubtasksError) {
          throw deleteSubtasksError;
        }
      }
      
      // Delete task attachments
      const { error: attachmentsError } = await supabase
        .from("task_attachments")
        .delete()
        .eq("task_id", taskId);
      
      if (attachmentsError) {
        console.error("Error deleting task attachments:", attachmentsError);
        // Continue with task deletion even if attachment deletion failed
      }
      
      // Delete task templates
      const { error: templatesError } = await supabase
        .from("task_templates")
        .delete()
        .eq("task_id", taskId);
      
      if (templatesError) {
        console.error("Error deleting task templates:", templatesError);
        // Continue with task deletion even if template deletion failed
      }
      
      // Delete task comments
      const { error: commentsError } = await supabase
        .from("task_comments")
        .delete()
        .eq("task_id", taskId);
      
      if (commentsError) {
        console.error("Error deleting task comments:", commentsError);
        // Continue with task deletion even if comment deletion failed
      }
      
      // Delete unified comments if any
      const { error: unifiedCommentsError } = await supabase
        .from("unified_task_comments")
        .delete()
        .eq("task_id", taskId)
        .eq("task_table", "tasks");
      
      if (unifiedCommentsError) {
        console.error("Error deleting unified comments:", unifiedCommentsError);
        // Continue with task deletion even if unified comment deletion failed
      }
      
      // Finally delete the task
      const { error: deleteTaskError } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId);
      
      if (deleteTaskError) {
        throw deleteTaskError;
      }
      
      toast.success("تم حذف المهمة بنجاح");
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("حدث خطأ أثناء حذف المهمة");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[450px]" dir="rtl">
        <DialogHeader className="flex flex-col items-center gap-2">
          <div className="p-3 rounded-full bg-red-100">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <DialogTitle>تأكيد حذف المهمة</DialogTitle>
          <DialogDescription className="text-center">
            هل أنت متأكد من رغبتك في حذف المهمة "{taskTitle}"؟ 
            سيتم حذف كافة المستلمات والمناقشات المرتبطة بها.
            لا يمكن التراجع عن هذا الإجراء.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-6 sm:justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
          >
            إلغاء
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "جارٍ الحذف..." : "حذف المهمة"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
