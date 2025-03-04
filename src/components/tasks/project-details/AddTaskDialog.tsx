
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { TaskForm } from "./components/TaskForm";
import { TaskFormData } from "./types/addTask";

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
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("low");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [stageId, setStageId] = useState(projectStages[0]?.id || "");
  const [assignedTo, setAssignedTo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleFormSubmit = async (formData: TaskFormData) => {
    if (!projectId) {
      toast.error("معرف المشروع غير موجود");
      return;
    }

    try {
      setIsSubmitting(true);

      // Create the task
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          title: formData.title,
          description: formData.description,
          status: "pending",
          priority: formData.priority,
          due_date: formData.dueDate,
          project_id: projectId,
          stage_id: formData.stageId,
          assigned_to: formData.assignedTo === "none" ? null : formData.assignedTo,
          workspace_id: null
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating task:", error);
        toast.error("حدث خطأ أثناء إنشاء المهمة");
        return;
      }

      toast.success("تم إنشاء المهمة بنجاح");
      
      // Update project status to in_progress if it was previously completed
      // since adding a new task means the project is no longer complete
      const { data: projectData, error: projectError } = await supabase
        .from('project_tasks')
        .select('status')
        .eq('id', projectId)
        .single();
        
      if (!projectError && projectData && projectData.status === 'completed') {
        const { error: updateError } = await supabase
          .from('project_tasks')
          .update({ status: 'in_progress' })
          .eq('id', projectId);
          
        if (updateError) {
          console.error("Error updating project status:", updateError);
        }
      }
      
      // Reset the form and close the dialog
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error in handleFormSubmit:", error);
      toast.error("حدث خطأ أثناء إنشاء المهمة");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>
        
      </AlertDialogTrigger>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle>إضافة مهمة جديدة</AlertDialogTitle>
          <AlertDialogDescription>
            أدخل تفاصيل المهمة لإنشائها في المشروع الحالي.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <TaskForm 
          title={title}
          setTitle={setTitle}
          description={description}
          setDescription={setDescription}
          priority={priority}
          setPriority={setPriority}
          dueDate={dueDate}
          setDueDate={setDueDate}
          stageId={stageId}
          setStageId={setStageId}
          assignedTo={assignedTo}
          setAssignedTo={setAssignedTo}
          projectStages={projectStages}
        />
        
        <AlertDialogFooter>
          <AlertDialogCancel>إلغاء</AlertDialogCancel>
          <Button 
            type="submit" 
            onClick={() => handleFormSubmit({
              title,
              description,
              status: "pending",
              priority,
              dueDate,
              stageId,
              assignedTo
            })}
            disabled={isSubmitting}
          >
            {isSubmitting ? "جاري الإنشاء..." : "إنشاء"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
