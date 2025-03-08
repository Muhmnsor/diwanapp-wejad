
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RecurringTaskFormFields, RecurringTaskFormValues } from "./RecurringTaskFormFields";
import { TaskForm } from "../../TaskForm";
import { ProjectMember } from "../../types/projectMember";

// Define the correct props interface for RecurringTaskDialog
export interface RecurringTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectMembers: ProjectMember[];
  onRecurringTaskAdded?: () => void;
  onTaskCreated?: () => void;
}

export const RecurringTaskDialog = ({
  open,
  onOpenChange,
  projectId,
  projectMembers,
  onRecurringTaskAdded,
  onTaskCreated
}: RecurringTaskDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recurringValues, setRecurringValues] = useState<RecurringTaskFormValues>({
    frequency: 'weekly',
    interval: 1,
    endType: 'never',
    daysOfWeek: ['mon'],
  });
  
  const handleRecurringChange = (values: RecurringTaskFormValues) => {
    setRecurringValues(values);
  };
  
  const handleSubmitTask = async (formData: {
    title: string;
    description: string;
    dueDate: string;
    priority: string;
    stageId: string;
    assignedTo: string | null;
    templates?: File[] | null;
    category?: string;
    requiresDeliverable?: boolean;
  }) => {
    setIsSubmitting(true);
    try {
      console.log("Creating recurring task with data:", { ...formData, ...recurringValues });
      
      // Calculate the next occurrence date based on the due date
      const nextOccurrence = formData.dueDate;
      
      // Convert form data to recurring task data structure
      const recurringTaskData = {
        title: formData.title,
        description: formData.description,
        project_id: projectId,
        frequency: recurringValues.frequency,
        interval: recurringValues.interval,
        next_occurrence: nextOccurrence,
        assigned_to: formData.assignedTo,
        priority: formData.priority,
        status: 'active',
        requires_deliverable: formData.requiresDeliverable,
        // Conditional fields based on frequency
        days_of_week: recurringValues.frequency === 'weekly' ? recurringValues.daysOfWeek : null,
        day_of_month: recurringValues.frequency === 'monthly' ? recurringValues.dayOfMonth : null,
        // End parameters
        end_date: recurringValues.endType === 'date' ? recurringValues.endDate : null,
        end_after: recurringValues.endType === 'count' ? recurringValues.endAfter : null,
      };
      
      // Save to database
      const { error } = await supabase
        .from('recurring_tasks')
        .insert(recurringTaskData);
        
      if (error) throw error;
      
      toast.success("تم إنشاء المهمة المتكررة بنجاح");
      
      // Call the appropriate callback
      if (onRecurringTaskAdded) onRecurringTaskAdded();
      if (onTaskCreated) onTaskCreated();
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating recurring task:", error);
      toast.error("حدث خطأ أثناء إنشاء المهمة المتكررة");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>إنشاء مهمة متكررة</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-4">تفاصيل المهمة</h3>
            <TaskForm
              onSubmit={handleSubmitTask}
              isSubmitting={isSubmitting}
              projectStages={[]} // Replace with actual project stages
              projectMembers={projectMembers}
              initialValues={{
                title: "",
                description: "",
                dueDate: "",
                priority: "medium",
                stageId: "",
                assignedTo: null,
                requiresDeliverable: false
              }}
            />
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">إعدادات التكرار</h3>
            <RecurringTaskFormFields
              values={recurringValues}
              onChange={handleRecurringChange}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
