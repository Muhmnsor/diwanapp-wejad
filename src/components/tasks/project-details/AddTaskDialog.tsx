
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { TaskForm } from "./TaskForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string | undefined;
  projectStages: { id: string; name: string }[];
  onSuccess: () => void;
}

export const AddTaskDialog = ({ 
  open, 
  onOpenChange,
  projectId,
  projectStages,
  onSuccess 
}: AddTaskDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: {
    title: string;
    description: string;
    dueDate: string;
    priority: string;
    stageId: string;
    assignedTo: string | null;
  }) => {
    if (!projectId) return;
    
    // إذا كانت البيانات فارغة، نغلق الحوار فقط (لأن هذا يحدث عند الضغط على زر الإلغاء)
    if (!formData.title) {
      onOpenChange(false);
      return;
    }
    
    setIsSubmitting(true);
    try {
      console.log("Submitting task with data:", { ...formData, project_id: projectId });
      
      // Create the task record in Supabase
      const { data, error } = await supabase
        .from('tasks')
        .insert([
          {
            title: formData.title,
            description: formData.description,
            due_date: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
            priority: formData.priority || 'medium',
            project_id: projectId,
            stage_id: formData.stageId || null,
            assigned_to: formData.assignedTo,
            status: 'pending'
          }
        ])
        .select();
      
      if (error) {
        console.error("Error details:", error);
        throw error;
      }
      
      toast.success("تم إضافة المهمة بنجاح");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding task:", error);
      toast.error("حدث خطأ أثناء إضافة المهمة");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl">إضافة مهمة جديدة</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <TaskForm 
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            projectStages={projectStages}
            projectId={projectId}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
