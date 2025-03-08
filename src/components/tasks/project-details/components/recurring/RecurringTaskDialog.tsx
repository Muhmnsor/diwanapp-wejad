
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RecurringTaskFormFields } from "./RecurringTaskFormFields";
import { TaskFormActions } from "../../components/TaskFormActions";
import { ProjectMember } from "../../types/projectMember";

interface RecurringTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectMembers: ProjectMember[];
  onTaskCreated?: () => void;
  onRecurringTaskAdded?: () => void;
}

export const RecurringTaskDialog = ({
  open,
  onOpenChange,
  projectId,
  projectMembers,
  onTaskCreated,
  onRecurringTaskAdded
}: RecurringTaskDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState("weekly");
  const [interval, setInterval] = useState(1);
  const [dueDate, setDueDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("يرجى إدخال عنوان المهمة");
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Calculate next occurrence date
      const startDate = dueDate ? new Date(dueDate) : new Date();
      
      const { data, error } = await supabase
        .from('recurring_tasks')
        .insert({
          title,
          description,
          frequency,
          interval,
          start_date: startDate.toISOString(),
          next_occurrence: startDate.toISOString(),
          project_id: projectId,
          status: 'active'
        })
        .select()
        .single();
        
      if (error) throw error;
      
      toast.success("تم إضافة المهمة المتكررة بنجاح");
      
      // Reset form
      setTitle("");
      setDescription("");
      setFrequency("weekly");
      setInterval(1);
      setDueDate("");
      
      // Close dialog
      onOpenChange(false);
      
      // Refresh tasks list
      if (onTaskCreated) onTaskCreated();
      if (onRecurringTaskAdded) onRecurringTaskAdded();
    } catch (error) {
      console.error("Error creating recurring task:", error);
      toast.error("حدث خطأ أثناء إنشاء المهمة المتكررة");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>إضافة مهمة متكررة</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <RecurringTaskFormFields
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            frequency={frequency}
            setFrequency={setFrequency}
            interval={interval}
            setInterval={setInterval}
            dueDate={dueDate}
            setDueDate={setDueDate}
          />
          
          <TaskFormActions
            isSubmitting={isSubmitting}
            onCancel={() => onOpenChange(false)}
            submitLabel="إضافة المهمة المتكررة"
          />
        </form>
      </DialogContent>
    </Dialog>
  );
};
