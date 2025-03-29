
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RecurringTaskFormFields } from "./RecurringTaskFormFields";
import { TaskFormActions } from "../../components/TaskFormActions";
import { ProjectMember } from "../../types/projectMember";
import { useAuthStore } from "@/store/authStore";
import { uploadAttachment, saveAttachmentReference } from "@/components/tasks/services/uploadService";

interface RecurringTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string | undefined;
  projectMembers?: ProjectMember[];
  onTaskCreated?: () => void;
  onRecurringTaskAdded?: () => void;
}

export const RecurringTaskDialog = ({
  open,
  onOpenChange,
  projectId,
  projectMembers = [],
  onTaskCreated,
  onRecurringTaskAdded
}: RecurringTaskDialogProps) => {
  const { user } = useAuthStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState("weekly");
  const [interval, setInterval] = useState(1);
  const [dueDate, setDueDate] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState(0); // 0 = الأحد
  const [dayOfMonth, setDayOfMonth] = useState(1); // اليوم الأول من الشهر
  const [priority, setPriority] = useState("medium");
  const [assignedTo, setAssignedTo] = useState<string | null>(null);
  const [requiresDeliverable, setRequiresDeliverable] = useState(false);
  const [templates, setTemplates] = useState<File[] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("يرجى إدخال عنوان المهمة");
      return;
    }
    
    setIsSubmitting(true);
    try {
      console.log("Submitting recurring task:", {
        title,
        description,
        recurrence_type: frequency,
        interval,
        day_of_week: dayOfWeek,
        day_of_month: dayOfMonth,
        priority,
        assignedTo,
        requiresDeliverable
      });
      
      // Calculate next occurrence date
      const startDate = dueDate ? new Date(dueDate) : new Date();
      
      // تجهيز المعلومات بناءً على نوع التكرار
      const recurringTaskData: any = {
        title,
        description,
        recurrence_type: frequency,
        interval,
        next_generation_date: startDate.toISOString(),
        project_id: projectId || null,
        is_active: true,
        priority,
        assign_to: assignedTo,
        requires_deliverable: requiresDeliverable,
        created_by: user?.id
      };
      
      // إضافة يوم الأسبوع أو الشهر حسب نوع التكرار
      if (frequency === 'weekly') {
        recurringTaskData.day_of_week = dayOfWeek;
      } else if (frequency === 'monthly') {
        recurringTaskData.day_of_month = dayOfMonth;
      }
      
      // إنشاء المهمة المتكررة
      const { data, error } = await supabase
        .from('recurring_tasks')
        .insert(recurringTaskData)
        .select()
        .single();
        
      if (error) {
        console.error("Error creating recurring task:", error);
        throw error;
      }
      
      console.log("Created recurring task:", data);
      
      // رفع النماذج المرفقة إذا وجدت
      if (templates && templates.length > 0 && data) {
        const taskId = data.id;
        
        for (const template of templates) {
          const uploadResult = await uploadAttachment(template, 'template');
          
          if (uploadResult.error) {
            toast.error(`فشل رفع الملف: ${template.name}`);
            continue;
          }
          
          if (uploadResult.url) {
            await saveAttachmentReference(
              taskId,
              uploadResult.url,
              template.name,
              template.type,
              'template'
            );
          }
        }
      }
      
      toast.success("تم إضافة المهمة المتكررة بنجاح");
      
      // إعادة تعيين النموذج
      setTitle("");
      setDescription("");
      setFrequency("weekly");
      setInterval(1);
      setDueDate("");
      setDayOfWeek(0);
      setDayOfMonth(1);
      setPriority("medium");
      setAssignedTo(null);
      setRequiresDeliverable(false);
      setTemplates(null);
      
      // إغلاق النافذة
      onOpenChange(false);
      
      // تحديث قائمة المهام
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>إضافة مهمة متكررة</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4 max-h-[70vh] overflow-y-auto rtl">
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
            priority={priority}
            setPriority={setPriority}
            assignedTo={assignedTo}
            setAssignedTo={setAssignedTo}
            requiresDeliverable={requiresDeliverable}
            setRequiresDeliverable={setRequiresDeliverable}
            templates={templates}
            setTemplates={setTemplates}
            projectMembers={projectMembers}
            dayOfWeek={dayOfWeek}
            setDayOfWeek={setDayOfWeek}
            dayOfMonth={dayOfMonth}
            setDayOfMonth={setDayOfMonth}
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
