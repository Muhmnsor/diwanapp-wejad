
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types/workspace";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TaskForm } from "./components/TaskForm";
import { toast } from "sonner";
import { useTaskDependencies } from "./hooks/useTaskDependencies";

export interface EditTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  projectStages: {id: string; name: string}[];
  projectMembers: {id: string; name: string}[];
  onStatusChange: (newStatus: string) => void;
  onTaskUpdated: () => void;
}

export const EditTaskDialog = ({
  open,
  onOpenChange,
  task,
  projectStages,
  projectMembers,
  onStatusChange,
  onTaskUpdated
}: EditTaskDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { isBlockedByDependencies, checkDependencyStatus } = useTaskDependencies(task?.id);

  useEffect(() => {
    if (open) {
      setError(null);
      setSuccess(null);
    }
  }, [open]);

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Check if status is being changed to completed
      if (formData.status === 'completed' && task.status !== 'completed') {
        // Check dependencies
        const dependencyStatus = await checkDependencyStatus();
        if (!dependencyStatus.canComplete) {
          setError(dependencyStatus.message || "لا يمكن إكمال المهمة بسبب تبعيات غير مكتملة");
          toast.error("لا يمكن إكمال المهمة بسبب تبعيات غير مكتملة");
          setIsSubmitting(false);
          return;
        }
        
        // Check for incomplete subtasks
        const { data: subtasks, error: subtasksError } = await supabase
          .from('subtasks')
          .select('id, status')
          .eq('task_id', task.id);
          
        if (subtasksError) throw subtasksError;
        
        const incompleteSubtasks = subtasks?.filter(st => st.status !== 'completed') || [];
        if (incompleteSubtasks.length > 0) {
          setError("لا يمكن إكمال المهمة لأن لديها مهام فرعية غير مكتملة");
          toast.error("يجب إكمال جميع المهام الفرعية أولاً");
          setIsSubmitting(false);
          return;
        }
      }
      
      // Prepare data for update
      const updateData = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        due_date: formData.due_date || null,
        assigned_to: formData.assigned_to || null,
        stage_id: formData.stage_id || null
      };
      
      // Update the task
      const { error: updateError } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', task.id);
        
      if (updateError) throw updateError;
      
      setSuccess("تم تحديث المهمة بنجاح");
      toast.success("تم تحديث المهمة بنجاح");
      
      // If status changed, notify parent
      if (formData.status !== task.status) {
        onStatusChange(formData.status);
      }
      
      // Notify parent component that task was updated
      onTaskUpdated();
      
      // Close dialog after a short delay
      setTimeout(() => {
        onOpenChange(false);
      }, 1500);
    } catch (err) {
      console.error('Error updating task:', err);
      setError("حدث خطأ أثناء تحديث المهمة");
      toast.error("حدث خطأ أثناء تحديث المهمة");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rtl sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>تعديل المهمة</DialogTitle>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        
        <TaskForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          initialTask={task}
          projectStages={projectStages}
          projectMembers={projectMembers}
        />
      </DialogContent>
    </Dialog>
  );
};
